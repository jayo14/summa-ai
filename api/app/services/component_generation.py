"""Two-call structured-output pipeline for AI-generated chat components.

Z.ai's native structured-output support (`tools` / `response_format:
json_schema`) is unconfirmed against the real API — the `.env` key on this
machine is a placeholder and no docs were found in-repo (flagged decision,
resolved: build the safe fallback). This uses `instructor.Mode.JSON`, which
validates the model's output against the Pydantic schema and re-prompts on
failure via prompt engineering rather than a provider-native mode, so it
works the same whether or not Z.ai turns out to support native JSON mode.

Call 1 turns the user's raw query + orchestrator context into a clean
generation brief (topic, focus). Call 2 generates the actual component
content constrained to the matched Pydantic schema. Up to two retries on
validation failure (instructor's `max_retries`); a final failure returns
None so the caller falls back to a plain-text response instead of crashing
or emitting a raw/garbage payload.
"""

from __future__ import annotations

import logging
import uuid
from typing import Optional

from pydantic import BaseModel, ValidationError

from app.config import settings
from app.models.artifact import ArtifactPayload
from app.models.components import COMPONENT_TYPE_MAP, ComponentData, ComponentType
from app.services import google_ai, zai_client

logger = logging.getLogger(__name__)

MAX_VALIDATION_RETRIES = 2


class GenerationBrief(BaseModel):
    topic: str
    focus: Optional[str] = None


async def _decide_brief(
    component_type: str, query: str, context: str
) -> GenerationBrief:
    system_prompt = (
        "Extract a clean generation brief for a "
        f"{component_type} learning component from the student's "
        "message and the tutoring context. `topic` is the specific "
        "subject; `focus` is an optional narrower angle (a subtopic "
        "or a weak area to emphasize). Respond with valid JSON matching GenerationBrief schema."
    )
    user_content = f"Context:\n{context}\n\nStudent said: {query}"

    if google_ai.is_gemini_configured():
        raw_json = await google_ai.generate_gemini_json(
            messages=[{"role": "user", "content": user_content}],
            system_prompt=system_prompt,
        )
        if raw_json:
            return GenerationBrief.model_validate(raw_json)

    if zai_client._has_instructor:
        client = zai_client.get_instructor_client()
        return await client.chat.completions.create(
            model=settings.ZAI_MODEL,
            response_model=GenerationBrief,
            max_retries=MAX_VALIDATION_RETRIES,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
        )

    # Fallback default brief if no LLM service is available
    return GenerationBrief(topic=query or component_type)


async def _generate_content(
    component_type: str, brief: GenerationBrief, context: str
) -> ComponentData:
    schema = COMPONENT_TYPE_MAP[component_type]
    system_prompt = (
        f"Generate a {component_type} learning component about "
        f"'{brief.topic}'"
        + (f", focused on {brief.focus}" if brief.focus else "")
        + ". Ground it in the tutoring context below where relevant. "
        "Every `id` field must be a short unique string. Respond with valid JSON matching component schema."
    )
    user_content = f"Context:\n{context}"

    if google_ai.is_gemini_configured():
        raw_json = await google_ai.generate_gemini_json(
            messages=[{"role": "user", "content": user_content}],
            system_prompt=system_prompt,
        )
        if raw_json:
            return schema.model_validate(raw_json)

    if zai_client._has_instructor:
        client = zai_client.get_instructor_client()
        return await client.chat.completions.create(
            model=settings.ZAI_MODEL,
            response_model=schema,
            max_retries=MAX_VALIDATION_RETRIES,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
        )

    raise RuntimeError("No LLM service available for component generation")


async def generate_component_payload(
    component_type: str, query: str, context: str
) -> Optional[ArtifactPayload]:
    """Runs the two-call pipeline; never raises. Returns None on any failure
    (network, schema-validation-after-retries) so the caller can fall back to
    a plain-text response instead of streaming a broken artifact."""
    if component_type not in COMPONENT_TYPE_MAP:
        logger.warning("Unknown component type requested: %s", component_type)
        return None

    try:
        brief = await _decide_brief(component_type, query, context)
        data = await _generate_content(component_type, brief, context)
    except ValidationError as exc:
        logger.warning(
            "Component generation failed schema validation after %d retries: "
            "type=%s error=%s",
            MAX_VALIDATION_RETRIES,
            component_type,
            exc,
        )
        return None
    except Exception as exc:
        logger.warning(
            "Component generation call failed: type=%s error=%s",
            component_type,
            exc,
        )
        return None

    title = data.title or brief.topic.title()
    return ArtifactPayload(
        id=str(uuid.uuid4()), title=title, type=component_type, data=data
    )
