"""Chat route — streams from Z.ai GLM + intent detection + memory-augmented orchestration."""

import asyncio
import json, logging, re
from datetime import datetime
from typing import AsyncGenerator, Optional
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.config import settings
from app.models.chat import ChatRequest, ChatResponse, ArtifactRef
from app.core.security import resolve_user_id
from app.services.cognee_service import CogneeService
from app.services.summastudy_memory import summastudy_memory
from app.services.user_store import UserStore
from app.services.data_store import DataStore
from app.services import zai_client, google_ai
from app.services.component_generation import generate_component_payload

logger = logging.getLogger(__name__)
router = APIRouter()
cognee = CogneeService()

INTENT_PATTERNS = {
    "quiz": [re.compile(r"\bquiz me\b", re.I), re.compile(r"\btest me\b", re.I)],
    "flashcards": [re.compile(r"\bflash ?cards?\b", re.I)],
    "study-plan": [
        re.compile(r"\bstudy plan\b", re.I),
        re.compile(r"\bexam prep\b", re.I),
    ],
    "hexagon": [re.compile(r"\b(progress|hexagon|proficien)\b", re.I)],
    "graph": [re.compile(r"\b(knowledge )?graph\b", re.I)],
    "timeline": [re.compile(r"\b(schedule|timeline|calendar)\b", re.I)],
    "gap-analysis": [re.compile(r"\b(gap|missing|need to learn)\b", re.I)],
}

WEAK_SCORE_THRESHOLD = 70.0
PROACTIVE_GAP_CHECK_INTERVAL = 5
MAX_CONTEXT_SECTION_CHARS = 3000


def detect_intent(text: str) -> str | None:
    for ct, patterns in INTENT_PATTERNS.items():
        if any(p.search(text) for p in patterns):
            return ct
    return None


def _section(text: str, max_chars: int = MAX_CONTEXT_SECTION_CHARS) -> str:
    if len(text) > max_chars:
        text = text[:max_chars] + "\n...]"
    return text


async def detect_knowledge_gaps(user_id: str) -> Optional[dict]:
    try:
        progress_data = await cognee.recall_learning_progress(user_id)
        entries = progress_data.get("progress", [])
        gaps = []
        for entry in entries:
            score = entry.get("metadata", {}).get("score", 100)
            topic = entry.get("metadata", {}).get("topic") or entry.get("text", "")
            try:
                score_num = float(score)
            except (ValueError, TypeError):
                score_num = 100.0
            if score_num < WEAK_SCORE_THRESHOLD:
                gaps.append({"topic": topic, "score": score_num})
        if gaps:
            return {
                "type": "gap-analysis",
                "gaps": sorted(gaps, key=lambda g: g["score"])[:5],
                "title": "Knowledge gaps detected",
            }
    except Exception as exc:
        logger.debug("Gap detection skipped: %s", exc)
    return None


async def build_orchestrator_prompt(
    user_id: str, query: str, messages: list[dict], request: Optional[ChatRequest] = None
) -> str:
    memory_context = await cognee.recall_context(user_id, query)
    exams_context = await cognee.recall_exams(user_id)
    progress_context = await cognee.recall_learning_progress(user_id)
    gaps = await detect_knowledge_gaps(user_id)

    parts = [
        "You are Summa AI, an expert, encouraging, and highly adaptive academic learning companion. "
        "Your mission is to help students truly master their subjects by remembering their knowledge graph across sessions, "
        "tracking gaps, and tailoring explanations to their academic level and style. "
        "Keep explanations clear, engaging, concise, and formatted with Markdown. Use analogies and step-by-step logic."
    ]

    # Injected ChatRequest personalization parameters
    if request:
        req_parts = []
        if request.subject:
            req_parts.append(f"Active Course / Subject: {request.subject}")
        if request.degree:
            req_parts.append(f"Degree / Level: {request.degree}")
        if request.field_of_study:
            req_parts.append(f"Field of Study: {request.field_of_study}")
        if request.learning_style:
            req_parts.append(f"Preferred Learning Style: {request.learning_style}")
        if request.proficiency_level:
            req_parts.append(f"Target Proficiency Level: {request.proficiency_level}")
        if request.selected_sources:
            req_parts.append(f"Grounding Materials in Scope: {', '.join(request.selected_sources)}")
        if req_parts:
            parts.append(
                _section(
                    "\nSESSION PERSONALIZATION & CONTEXT:\n" + "\n".join(req_parts) +
                    "\nCalibrate tone, depth, difficulty, and examples strictly to these student parameters."
                )
            )

    try:
        user_store = UserStore()
        onboarding = await user_store.get_onboarding_data(user_id)
        if onboarding:
            profile_parts = []
            goals = onboarding.get("goals")
            if goals:
                profile_parts.append(f"Student's learning goals: {goals}")
            personality = onboarding.get("personality", {})
            if personality:
                traits = ", ".join(f"{k}: {v}" for k, v in personality.items())
                profile_parts.append(f"Student's personality traits: {traits}")
            level = onboarding.get("level")
            if level:
                profile_parts.append(f"Student's self-reported level: {level}")
            style = onboarding.get("learningStyle")
            if style:
                profile_parts.append(f"Student's preferred learning style: {style}")
            if profile_parts:
                parts.append(
                    _section(
                        "\nSTUDENT PROFILE (from onboarding):\n"
                        + "\n".join(profile_parts)
                        + "\nTailor your tone, depth, and examples to match this profile."
                    )
                )
    except Exception as exc:
        logger.debug("Onboarding data fetch skipped: %s", exc)
    memories = memory_context.get("results", [])
    if memories:
        parts.append(
            _section(
                f"\nRECALLED CONTEXT FROM MEMORY:\n{json.dumps(memories, indent=2)}"
            )
        )
    exams = exams_context.get("exams", [])
    if exams:
        parts.append(_section(f"\nUPCOMING EXAMS:\n{json.dumps(exams, indent=2)}"))
    progress = progress_context.get("progress", [])
    if progress:
        parts.append(
            _section(f"\nLEARNING PROGRESS:\n{json.dumps(progress, indent=2)}")
        )
    if gaps:
        parts.append(
            _section(
                f"\nKNOWLEDGE GAPS DETECTED:\n{json.dumps(gaps, indent=2)}\n"
                "The student is struggling with these topics. "
                "Prioritise explanations and suggest resources."
            )
        )

    try:
        materials_mem = await cognee._recall(query, cognee._dataset(user_id, "materials"), limit=5)
        if materials_mem:
            parts.append(_section(f"\nCONNECTED STUDY MATERIALS (from Cognee memory):\n{json.dumps(materials_mem, indent=2)}"))
    except Exception as exc:
        logger.debug("Materials recall skipped: %s", exc)

    try:
        concepts_mem = await cognee._recall(query, cognee._dataset(user_id, "concepts"), limit=5)
        if concepts_mem:
            parts.append(_section(f"\nMASTERED & TARGET CONCEPTS (from Cognee memory):\n{json.dumps(concepts_mem, indent=2)}"))
    except Exception as exc:
        logger.debug("Concepts recall skipped: %s", exc)

    if settings.HYBRID_MEMORY_ENABLED:
        try:
            atomic_facts = await summastudy_memory.retrieve_relevant_memories(
                user_id, query=query, limit=8
            )
            if atomic_facts:
                parts.append(
                    _section(
                        f"\nATOMIC FACTS (from SummaStudy shared memory):\n{json.dumps(atomic_facts, indent=2)}\n"
                        "These are persistent facts the student has told us — preferences, goals, struggles, or habits."
                    )
                )
        except Exception as exc:
            logger.debug("Hybrid memory supplement skipped: %s", exc)

    parts.append(
        "\nIf the user asks about a concept, first explain it clearly, "
        "then check their understanding with a quick follow-up question. "
        "When you spot a prerequisite they might be missing, flag it gently. "
        "If they mention an exam, help them build a study schedule and recall key topics."
    )
    return "\n".join(parts)


async def _stream_ai_response(
    messages: list[dict], enable_thinking: bool = True, context: str = ""
) -> AsyncGenerator[str, None]:
    """Streams completion chunks from Google AI (Gemini) if configured, or Z.ai (GLM)."""
    if google_ai.is_gemini_configured():
        logger.info("Using Google AI (Gemini %s) for chat stream", settings.GEMINI_MODEL)
        async for chunk in google_ai.stream_gemini_completion(messages, context):
            if chunk["type"] == "done":
                yield "data: [DONE]\n\n"
            elif chunk["type"] == "error":
                yield f"data: {json.dumps({'type': 'error', 'message': chunk['message']})}\n\n"
                yield "data: [DONE]\n\n"
            else:
                yield f"data: {json.dumps(chunk)}\n\n"
    else:
        logger.info("Using Z.ai (GLM) for chat stream")
        async for chunk in zai_client.stream_completion(messages, context, enable_thinking):
            if chunk["type"] == "done":
                yield "data: [DONE]\n\n"
            elif chunk["type"] == "error":
                yield f"data: {json.dumps({'type': 'error', 'message': chunk['message']})}\n\n"
                yield "data: [DONE]\n\n"
            else:
                yield f"data: {json.dumps(chunk)}\n\n"


@router.post("/chat/stream", summary="Chat (streaming)")
async def chat_stream(request: ChatRequest):
    user_id = resolve_user_id()
    last_query = request.messages[-1].content if request.messages else ""
    messages = [{"role": m.role, "content": m.content} for m in request.messages]
    
    from app.services.orchestrator import LearningOrchestrator
    orchestrator = LearningOrchestrator()
    decision = await orchestrator.decide_next_action(user_id, last_query, messages)
    
    intent = detect_intent(last_query)
    orch_prompt = await build_orchestrator_prompt(user_id, last_query, messages, request=request)

    async def generate():
        # Emit orchestrator next_action event
        next_action_event = {
            "type": "next_action",
            "action": decision.action,
            "reasoning": decision.reasoning,
            "target_concept_ids": decision.target_concept_ids,
            "suggested_difficulty": decision.suggested_difficulty,
        }
        yield f"data: {json.dumps(next_action_event)}\n\n"

        if intent:
            payload = await generate_component_payload(intent, last_query, orch_prompt)
            if payload is not None:
                artifact_event = {
                    "id": payload.id,
                    "title": payload.title,
                    "type": payload.type,
                    "data": payload.data.model_dump(by_alias=True, mode="json"),
                }
            else:
                logger.info(
                    "Component generation unavailable for intent=%s; emitting "
                    "skeleton artifact event with no data (frontend renders "
                    "plain text only).",
                    intent,
                )
                artifact_event = {
                    "id": f"pending-{intent}",
                    "title": intent.replace("-", " ").title(),
                    "type": intent,
                }
            yield f"data: {json.dumps({'type': 'artifact', 'artifact': artifact_event})}\n\n"

        # P0-8: Persist user message to DataStore
        if request.conversation_id and last_query:
            try:
                ds = DataStore()
                await ds.add_message(request.conversation_id, user_id, "user", last_query)
            except Exception:
                logger.warning("Failed to persist user message", exc_info=True)

        full_response = ""
        accumulated_reasoning = ""
        async for event in _stream_ai_response(
            messages, request.enable_thinking, context=orch_prompt
        ):
            yield event
            if event.startswith("data: {"):
                try:
                    data = json.loads(event[6:])
                    if data.get("type") == "content":
                        full_response += data.get("delta", "")
                    elif data.get("type") == "thinking":
                        accumulated_reasoning += data.get("delta", "")
                except Exception:
                    pass

        if full_response:
            # P0-8: Persist assistant message to DataStore
            if request.conversation_id:
                try:
                    ds = DataStore()
                    await ds.add_message(
                        request.conversation_id,
                        user_id,
                        "assistant",
                        full_response,
                        reasoning=accumulated_reasoning or None,
                    )
                except Exception:
                    logger.warning("Failed to persist assistant message", exc_info=True)

            await cognee.remember_conversation(
                user_id, last_query, full_response, session_id=request.conversation_id
            )

            try:
                ds = DataStore()
                await ds.create_timeline_event(
                    user_id,
                    "chat",
                    f"Chat: {last_query[:60]}",
                    f"Assistant replied with {len(full_response)} chars",
                    {"conversation_id": request.conversation_id},
                )
            except Exception:
                logger.warning("Failed to create chat timeline event", exc_info=True)

            if settings.HYBRID_MEMORY_ENABLED:
                asyncio.ensure_future(
                    summastudy_memory.extract_and_store_memories(user_id, last_query)
                )

        if len(messages) % PROACTIVE_GAP_CHECK_INTERVAL == 0 and len(messages) > 0:
            gaps = await detect_knowledge_gaps(user_id)
            if gaps:
                yield (
                    f"data: {json.dumps({'type': 'artifact', 'artifact': {'id': 'gap-analysis', 'title': gaps['title'], 'type': 'gap-analysis', 'data': gaps['gaps']}})}\n\n"
                )

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    user_id = resolve_user_id()
    last_query = request.messages[-1].content if request.messages else ""
    intent = detect_intent(last_query)
    artifacts = (
        [
            ArtifactRef(
                id=f"pending-{intent}",
                title=intent.replace("-", " ").title(),
                type=intent,
            )
        ]
        if intent
        else []
    )
    memory_context = await cognee.recall_context(user_id, last_query)
    return ChatResponse(
        response="(Use /chat/stream for streaming)",
        artifacts=artifacts,
        conversation_id=request.conversation_id,
        reasoning=f"Intent: {intent or 'none'}",
    )
