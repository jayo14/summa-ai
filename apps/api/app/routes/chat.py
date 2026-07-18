"""Chat route — streams from Z.ai GLM + intent detection + memory-augmented orchestration."""
import asyncio
import json, logging, re
from datetime import datetime
from typing import AsyncGenerator, Optional
import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.config import settings
from app.models.chat import ChatRequest, ChatResponse, ArtifactRef
from app.core.security import resolve_user_id
from app.services.cognee_service import CogneeService
from app.services.summastudy_memory import summastudy_memory
from app.services.user_store import UserStore

logger = logging.getLogger(__name__)
router = APIRouter()
cognee = CogneeService()

INTENT_PATTERNS = {
    "quiz": [re.compile(r"\bquiz me\b", re.I), re.compile(r"\btest me\b", re.I)],
    "flashcards": [re.compile(r"\bflash ?cards?\b", re.I)],
    "study-plan": [re.compile(r"\bstudy plan\b", re.I), re.compile(r"\bexam prep\b", re.I)],
    "hexagon": [re.compile(r"\b(progress|hexagon|proficien)\b", re.I)],
    "graph": [re.compile(r"\b(knowledge )?graph\b", re.I)],
    "timeline": [re.compile(r"\b(schedule|timeline|calendar)\b", re.I)],
    "gap-analysis": [re.compile(r"\b(gap|missing|need to learn)\b", re.I)],
}

WEAK_SCORE_THRESHOLD = 40.0
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
            score = entry.get("score", 100)
            topic = entry.get("metadata", {}).get("topic") or entry.get("text", "")
            if isinstance(score, (int, float)) and score < WEAK_SCORE_THRESHOLD:
                gaps.append({"topic": topic, "score": score})
        if gaps:
            return {
                "type": "gap-analysis",
                "gaps": sorted(gaps, key=lambda g: g["score"])[:5],
                "title": "Knowledge gaps detected",
            }
    except Exception as exc:
        logger.debug("Gap detection skipped: %s", exc)
    return None


async def build_orchestrator_prompt(user_id: str, query: str, messages: list[dict]) -> str:
    memory_context = await cognee.recall_context(user_id, query)
    exams_context = await cognee.recall_exams(user_id)
    progress_context = await cognee.recall_learning_progress(user_id)
    gaps = await detect_knowledge_gaps(user_id)

    parts = [
        "You are Summa AI, an adaptive learning companion. "
        "Keep explanations concise, friendly, and well-structured with Markdown.",
    ]

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
                    _section("\nSTUDENT PROFILE (from onboarding):\n" + "\n".join(profile_parts) +
                    "\nTailor your tone, depth, and examples to match this profile.")
                )
    except Exception as exc:
        logger.debug("Onboarding data fetch skipped: %s", exc)
    memories = memory_context.get("results", [])
    if memories:
        parts.append(
            _section(f"\nRECALLED CONTEXT FROM MEMORY:\n{json.dumps(memories, indent=2)}")
        )
    exams = exams_context.get("exams", [])
    if exams:
        parts.append(
            _section(f"\nUPCOMING EXAMS:\n{json.dumps(exams, indent=2)}")
        )
    progress = progress_context.get("progress", [])
    if progress:
        parts.append(
            _section(f"\nLEARNING PROGRESS:\n{json.dumps(progress, indent=2)}")
        )
    if gaps:
        parts.append(
            _section(f"\nKNOWLEDGE GAPS DETECTED:\n{json.dumps(gaps, indent=2)}\n"
            "The student is struggling with these topics. "
            "Prioritise explanations and suggest resources.")
        )

    if settings.HYBRID_MEMORY_ENABLED:
        try:
            atomic_facts = await summastudy_memory.retrieve_relevant_memories(user_id, limit=8)
            if atomic_facts:
                parts.append(
                    _section(f"\nATOMIC FACTS (from SummaStudy shared memory):\n{json.dumps(atomic_facts, indent=2)}\n"
                    "These are persistent facts the student has told us — preferences, goals, struggles, or habits.")
                )
        except Exception as exc:
            logger.debug("Hybrid memory supplement skipped: %s", exc)

    parts.append(
        "\nIf the user asks about a concept, first explain it clearly, "
        "then check their understanding. "
        "When you spot a prerequisite they might be missing, flag it gently. "
        "If they mention an exam, help them build a study schedule and recall key topics."
    )
    return "\n".join(parts)


async def _stream_zai(messages: list[dict], enable_thinking: bool = True, context: str = "") -> AsyncGenerator[str, None]:
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(120.0, connect=10.0)) as client:
            async with client.stream(
                "POST",
                f"{settings.ZAI_API_BASE}/chat/completions",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {settings.ZAI_API_KEY}",
                    "X-Z-AI-From": "Z",
                    "X-Token": settings.ZAI_TOKEN,
                    "X-User-Id": settings.ZAI_USER_ID,
                },
                json={
                    "model": settings.ZAI_MODEL,
                    "messages": [
                        {"role": "system", "content": context},
                        *messages,
                    ],
                    "stream": True,
                    "thinking": {"type": "enabled" if enable_thinking else "disabled"},
                },
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    payload = line[6:].strip()
                    if not payload or payload == "[DONE]":
                        continue
                    try:
                        chunk = json.loads(payload)
                        delta = chunk.get("choices", [{}])[0].get("delta", {})
                        reasoning = (
                            delta.get("reasoning_content")
                            or delta.get("reasoning")
                            or delta.get("thinking")
                        )
                        content = delta.get("content")
                        if reasoning:
                            yield f"data: {json.dumps({'type': 'thinking', 'delta': reasoning})}\n\n"
                        if content:
                            yield f"data: {json.dumps({'type': 'content', 'delta': content})}\n\n"
                    except json.JSONDecodeError:
                        continue
        yield "data: [DONE]\n\n"
    except Exception as e:
        error_msg = str(e) or "Z.ai stream failed"
        logger.error(f"Z.ai stream failed: {error_msg}")
        yield f"data: {json.dumps({'type': 'error', 'message': error_msg})}\n\n"
        yield "data: [DONE]\n\n"


@router.post("/chat/stream", summary="Chat (streaming)")
async def chat_stream(request: ChatRequest):
    user_id = resolve_user_id()
    last_query = request.messages[-1].content if request.messages else ""
    messages = [{"role": m.role, "content": m.content} for m in request.messages]
    intent = detect_intent(last_query)
    orch_prompt = await build_orchestrator_prompt(user_id, last_query, messages)

    async def generate():
        if intent:
            yield f"data: {json.dumps({'type': 'artifact', 'artifact': {'id': f'pending-{intent}', 'title': intent.replace('-', ' ').title(), 'type': intent}})}\n\n"

        full_response = ""
        async for event in _stream_zai(messages, request.enable_thinking, context=orch_prompt):
            yield event
            if event.startswith("data: {"):
                try:
                    data = json.loads(event[6:])
                    if data.get("type") == "content":
                        full_response += data.get("delta", "")
                except Exception:
                    pass

        if full_response:
            await cognee.remember_conversation(
                user_id, last_query, full_response, session_id=request.conversation_id
            )

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
        [ArtifactRef(id=f"pending-{intent}", title=intent.replace("-", " ").title(), type=intent)]
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
