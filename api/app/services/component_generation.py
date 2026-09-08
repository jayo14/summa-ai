"""AI-generated chat component pipeline.

Generates structured learning components (quizzes, flashcards, recall prompts,
etc.) for the streaming chat endpoint.

Key design decisions (replacing the previous blocking two-call pipeline):

1. **Subject/topic from structured intent is authoritative.** The
   ``GenerationBrief`` is derived from the parsed ``UserIntent`` (which
   preserves the explicit subject from ``ChatRequest.subject`` and the query
   text) rather than from an LLM that ingests the full orchestrator context
   (which can contain stale memories and cause cross-domain contamination).

2. **Single best-effort LLM call.** ``max_attempts`` defaults to 1 with a 15 s
   timeout.  No multi-stage retry loops that hold the user's response hostage.

3. **Non-blocking.** The caller runs this as an ``asyncio.create_task`` with a
   timeout; the chat stream begins immediately and the component event is
   emitted when ready.

4. **Deterministic local template fallback.** If the LLM fails, we attempt a
   lightweight local builder for standard activity types (quiz, flashcards,
   etc.) so the frontend always renders a real component when possible.
"""

from __future__ import annotations

import asyncio
import logging
import uuid
from typing import Any, Dict, Optional

from app.config import settings
from app.models.artifact import ArtifactPayload
from app.models.components import COMPONENT_TYPE_MAP, ComponentData
from app.services import google_ai, zai_client
from app.services.intent_extraction import UserIntent

logger = logging.getLogger(__name__)

COMPONENT_GENERATION_TIMEOUT = 15.0
MAX_VALIDATION_RETRIES = 1
MAX_RESPONSES = 1


from pydantic import BaseModel as _BaseModel


class GenerationBrief(_BaseModel):
    topic: str
    focus: Optional[str] = None


def _build_brief_from_intent(intent: UserIntent) -> GenerationBrief:
    """Derive a GenerationBrief from the structured intent.

    The subject from the UserIntent is authoritative — it comes from either
    ChatRequest.subject (frontend-provided) or the query text itself.  This
    prevents cross-domain contamination (e.g. Philosophy -> Java).
    """
    # Topic is the subject if no narrower topic was extracted
    topic = intent.topic or intent.subject or intent.raw_query or "General Learning"

    focus = intent.topic if intent.topic and intent.subject and intent.topic != intent.subject else None

    return GenerationBrief(topic=topic, focus=focus)


async def _generate_content(
    component_type: str,
    brief: GenerationBrief,
    intent: UserIntent,
) -> ComponentData:
    """Generate component content using the LLM, constrained to the schema.

    Raises on any failure — the caller handles timeouts and fallback.
    """
    schema = COMPONENT_TYPE_MAP[component_type]

    # Build a tight system prompt that pins subject/topic explicitly
    topic_label = brief.topic
    subject_label = intent.subject or brief.topic
    focus_note = f", with focus on **{brief.focus}**" if brief.focus else ""

    system_prompt = (
        f"Generate a {component_type} learning component.\n\n"
        f"SUBJECT: {subject_label}\n"
        f"TOPIC: {topic_label}{focus_note}\n"
        f"LEARNING GOAL: {intent.learning_goal or 'assessment'}\n\n"
        f"All questions, options, and explanations MUST be about {subject_label}. "
        f"Do NOT generate content about programming, Java, OOP, or any other domain "
        f"unless {subject_label} is explicitly a programming subject.\n\n"
        "Respond with valid JSON matching the component schema. "
        "Every `id` field must be a short unique string."
    )

    user_content = (
        f"Create a {component_type} component about {topic_label}. "
        f"Subject: {subject_label}. Topic: {topic_label}. "
        f"Learning goal: {intent.learning_goal or 'assessment'}."
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_content},
    ]

    if google_ai.is_gemini_configured():
        raw_json = await google_ai.generate_gemini_json(
            messages=messages,
            system_prompt=system_prompt,
            json_schema=schema.model_json_schema(),
        )
        if raw_json:
            return schema.model_validate(raw_json)

    if zai_client._has_instructor:
        client = zai_client.get_instructor_client()
        return await client.chat.completions.create(
            model=settings.ZAI_MODEL,
            response_model=schema,
            max_retries=MAX_VALIDATION_RETRIES,
            messages=messages,
        )

    raise RuntimeError("No LLM service available for component generation")


async def _try_generate(
    component_type: str, hint: UserIntent,
) -> Optional[ArtifactPayload]:
    """Single attempt at LLM-based generation. Returns None on failure."""
    brief = _build_brief_from_intent(hint)

    try:
        data = await _generate_content(component_type, brief, hint)
    except Exception as exc:
        logger.warning(
            "Component generation failed: type=%s error=%s", component_type, exc
        )
        return None

    # Validate content relevance before returning — reject cross-domain contamination
    try:
        from app.services.content_validator import validate_and_log
        if not validate_and_log(component_type, data, hint):
            logger.warning(
                "Component content failed relevance validation: type=%s subject=%s",
                component_type, hint.subject,
            )
            return None
    except Exception as exc:
        logger.debug("Content validation skipped: %s", exc)

    title = data.title or brief.topic.title()
    return ArtifactPayload(
        id=str(uuid.uuid4()), title=title, type=component_type, data=data
    )


async def generate_component_payload(
    component_type: str,
    query: str,
    context: str,
    intent: Optional[UserIntent] = None,
    timeout: float = COMPONENT_GENERATION_TIMEOUT,
    max_attempts: int = MAX_RESPONSES,
) -> Optional[ArtifactPayload]:
    """Generate a component payload with bounded retries and timeout.

    Never raises. Returns None on any failure so the caller can fall back to
    a deterministic local template or skip the component entirely.

    Args:
        component_type: The component type key (e.g. "quiz").
        query: The raw user query (kept for backward compat).
        context: The orchestrator context (kept for backward compat).
        intent: Structured UserIntent with explicit subject/topic. If None,
                derives a minimal intent from the query.
        timeout: Per-attempt timeout in seconds.
        max_attempts: Maximum number of LLM generation attempts (default 1).
    """
    if component_type not in COMPONENT_TYPE_MAP:
        logger.warning("Unknown component type requested: %s", component_type)
        return None

    # If no structured intent provided, derive one from the query + context
    if intent is None:
        from app.services.intent_extraction import extract_intent
        intent = extract_intent(query, request_subject=None)

    # Ensure subject is populated — fall back to query if nothing else
    if not intent.subject:
        intent.subject = intent.raw_query or "General Learning"

    attempt = 0
    while attempt < max_attempts:
        attempt += 1
        try:
            payload = await asyncio.wait_for(
                _try_generate(component_type, intent),
                timeout=timeout,
            )
            if payload is not None:
                return payload
        except asyncio.TimeoutError:
            logger.warning(
                "Component generation timed out after %.1fs on attempt %d: type=%s",
                timeout, attempt, component_type,
            )
        except Exception as exc:
            logger.warning(
                "Component generation attempt %d failed: type=%s error=%s",
                attempt, component_type, exc,
            )

        if attempt < max_attempts:
            logger.info("Retrying component generation (attempt %d/%d)", attempt + 1, max_attempts)

    # All attempts exhausted — try deterministic local fallback
    try:
        from app.services.local_component_builder import build_local_component
        from app.services.content_validator import validate_and_log
        local_payload = build_local_component(component_type, intent)
        if local_payload and validate_and_log(component_type, local_payload.data, intent):
            logger.info("Local component fallback succeeded for type=%s", component_type)
            return local_payload
    except Exception as exc:
        logger.debug("Local component fallback failed: %s", exc)

    logger.warning(
        "Component generation exhausted all attempts for type=%s; returning None",
        component_type,
    )
    return None
