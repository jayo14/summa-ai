"""Chat route — streams from Z.ai GLM + intent detection + memory-augmented orchestration."""

import asyncio
import json, logging, re
from datetime import datetime
from typing import Any, AsyncGenerator, Optional
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
from app.services.intent_extraction import extract_intent, UserIntent
from app.utils.timing import Timer

logger = logging.getLogger(__name__)
router = APIRouter()
cognee = CogneeService()

INTENT_PATTERNS = {
    "quiz": [
        re.compile(r"\bquiz(zes)?\b", re.I),
        re.compile(r"\btest(s|ing)? me\b", re.I),
        re.compile(r"\bmultiple choice\b", re.I),
        re.compile(r"\bmcq(s)?\b", re.I),
        re.compile(r"\bquestion(s)?\b", re.I),
    ],
    "flashcards": [
        re.compile(r"\bflash ?card(s)?\b", re.I),
        re.compile(r"\bcard(s)?\b", re.I),
    ],
    "study-plan": [
        re.compile(r"\bstudy plan\b", re.I),
        re.compile(r"\bexam prep\b", re.I),
        re.compile(r"\brevision plan\b", re.I),
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
    user_id: str,
    query: str,
    messages: list[dict],
    request: Optional[ChatRequest] = None,
    decision: Optional[Any] = None,
    intent: Optional[Any] = None,
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

    if intent:
        intent_parts = []
        if intent.subject:
            intent_parts.append(f"Subject: {intent.subject}")
        if intent.topic:
            intent_parts.append(f"Topic: {intent.topic}")
        if intent.learning_goal:
            intent_parts.append(f"Learning Goal: {intent.learning_goal}")
        if intent.difficulty_preference:
            intent_parts.append(f"Difficulty: {intent.difficulty_preference}")
        if intent_parts:
            parts.append(
                _section(
                    "\nSTRUCTURED USER INTENT:\n" + "\n".join(intent_parts) +
                    f"\nRaw Query: {intent.raw_query}\n"
                    "The subject above is AUTHORITATIVE. All content, questions, and examples "
                    "MUST be about this subject. Never switch to a different domain."
                )
            )

    if decision:
        action_directives = {
            "TEACH": "Focus on structured, step-by-step concept instruction using clear analogies.",
            "EXPLAIN": "Provide a crisp, illuminating conceptual explanation answering the student's core question.",
            "EXAMPLE": "Provide concrete, real-world case studies or code examples demonstrating the concept in action.",
            "RECALL": "Conduct an active recall check or ask a diagnostic question before giving the full answer.",
            "FLASHCARD": "Present flashcard-style key terms and definitions to test retention.",
            "QUIZ": "Include a targeted diagnostic question with multiple choices to test understanding.",
            "PRACTICE": "Pose an applied practice problem or scenario for the student to solve step-by-step.",
            "ASSESS": "Analyze the student's current proficiency level and summarize their mastery readiness.",
            "REVIEW": "Revisit previously learned concepts and highlight key takeaways to strengthen long-term memory.",
            "COMPARE": "Explicitly contrast two concepts to resolve active misconceptions or confusion.",
            "APPLY": "Ask the student to apply knowledge to a realistic problem or novel scenario.",
            "REFLECT": "Prompt the student to reflect on their confidence and metacognition.",
            "SIMULATE": "Walk through a simulation, memory layout, or stack frame execution trace.",
            "PREDICT": "Analyze exam probability and predict key assessment patterns.",
            "PLAN": "Structure a step-by-step study schedule and milestones.",
            "REST": "Recommend a short break or consolidation period to optimize cognitive load.",
        }
        directive = action_directives.get(decision.action, "Explain clearly and check understanding.")
        parts.append(
            _section(
                f"\nPEDAGOGICAL ACTION DIRECTIVE ({decision.action}):\n"
                f"Reasoning: {decision.reasoning}\n"
                f"Target Concepts: {', '.join(decision.target_concept_ids) if decision.target_concept_ids else 'General'}\n"
                f"Suggested Difficulty: {decision.suggested_difficulty}\n"
                f"Instruction: {directive}"
            )
        )

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
        from app.services.spaced_repetition import SpacedRepetitionEngine
        sr = SpacedRepetitionEngine()
        due_items = await sr.get_due_reviews(user_id)
        if due_items:
            parts.append(
                _section(
                    f"\nSPACED REPETITION REVIEWS DUE:\n{json.dumps(due_items, indent=2)}\n"
                    "These concepts are due for spaced review based on SM-2 retention decay."
                )
            )
    except Exception as exc:
        logger.debug("Spaced repetition recall skipped: %s", exc)

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

    # CRITICAL: When a component will be rendered, instruct the LLM to NOT
    # generate Markdown UI for that component. The component event handles it.
    if decision:
        from app.models.components import ACTION_TO_COMPONENT
        component_will_render = ACTION_TO_COMPONENT.get(decision.action)
        if component_will_render:
            parts.append(
                f"\n\nCRITICAL ARCHITECTURAL RULE:\n"
                f"A structured {component_will_render} component WILL be rendered by the frontend.\n"
                f"You MUST NOT generate a Markdown quiz, Markdown flashcards, or any Markdown UI "
                f"for this interaction. The frontend component owns the buttons, options, selection, "
                f"submission, and feedback.\n"
                f"Your role: produce ONLY a brief conversational intro (1-2 sentences max) "
                f"like 'Let's test your understanding.' or 'Here's a quick check.'.\n"
                f"DO NOT include questions, options (A/B/C/D), answer keys, or any interactive UI in your text.\n"
                f"The component will handle all of that."
            )

    return "\n".join(parts)


async def _stream_ai_response(
    messages: list[dict], enable_thinking: bool = True, context: str = ""
) -> AsyncGenerator[str, None]:
    """Streams completion chunks via model router with automatic failover."""
    from app.services.model_router import model_router

    async for chunk in model_router.stream_chat(messages, context, enable_thinking):
        if chunk["type"] == "done":
            yield "data: [DONE]\n\n"
        elif chunk["type"] == "error":
            yield f"data: {json.dumps({'type': 'error', 'message': chunk['message']})}\n\n"
            yield "data: [DONE]\n\n"
        else:
            yield f"data: {json.dumps(chunk)}\n\n"


@router.post("/chat/stream", summary="Chat (streaming)")
async def chat_stream(request: ChatRequest):
    timer = Timer("CHAT")
    user_id = resolve_user_id()
    last_query = request.messages[-1].content if request.messages else ""
    messages = [{"role": m.role, "content": m.content} for m in request.messages]

    timer.mark("request_received")

    # Structured intent extraction — subject/topic from ChatRequest or query
    user_intent = extract_intent(
        last_query,
        request_subject=request.subject,
        request_proficiency=request.proficiency_level,
    )
    timer.mark("intent_detection")

    from app.services.orchestrator import LearningOrchestrator
    orchestrator = LearningOrchestrator()
    decision = await orchestrator.decide_next_action(user_id, last_query, messages, intent=user_intent)
    timer.mark("learning_decision")

    intent = user_intent.activity_request or user_intent.intent or detect_intent(last_query)
    timer.mark("retrieval")
    orch_prompt = await build_orchestrator_prompt(user_id, last_query, messages, request=request, decision=decision, intent=user_intent)
    timer.mark("learner_context")

    async def generate():
        timer.mark("stream_start")

        # Emit structured intent event (new — frontend can use this)
        intent_event = {
            "type": "intent",
            "intent": user_intent.model_dump(),
        }
        yield f"data: {json.dumps(intent_event)}\n\n"

        # Emit orchestrator next_action event
        next_action_event = {
            "type": "next_action",
            "action": decision.action,
            "reasoning": decision.reasoning,
            "target_concept_ids": decision.target_concept_ids,
            "suggested_difficulty": decision.suggested_difficulty,
        }
        yield f"data: {json.dumps(next_action_event)}\n\n"

        # Determine component type: explicit user intent takes priority over
        # orchestrator decision mapping
        from app.models.components import ACTION_TO_COMPONENT
        component_type_to_deploy = intent or ACTION_TO_COMPONENT.get(decision.action)

        # COMPONENT SELECTION DECISION LOG
        logger.info(
            "[SUMMA ORCHESTRATOR] User intent=%s | Subject=%s | Topic=%s | "
            "Decision=%s | Component=%s | Reason=%s",
            intent, user_intent.subject, user_intent.topic,
            decision.action, component_type_to_deploy, decision.reasoning,
        )

        # HARD RULE: When a component is selected, the LLM MUST NOT generate
        # Markdown quiz UI. The system prompt must instruct the LLM to produce
        # only a brief conversational intro — the component owns the interaction.
        component_selected = component_type_to_deploy is not None

        # Emit "preparing_activity" state so the frontend shows a subtle
        # "Preparing a quick challenge..." indicator instead of a generic
        # "Thinking..." spinner.
        if component_type_to_deploy:
            yield f'data: {json.dumps({"type": "preparing_activity"})}\n\n'
            timer.mark("component_selection")

        # Start component generation as a NON-BLOCKING background task.
        # The AI response stream begins immediately — the user does NOT wait
        # for component generation to finish before seeing text.
        component_task: Optional[asyncio.Task] = None
        if component_type_to_deploy:
            component_task = asyncio.create_task(
                generate_component_payload(
                    component_type_to_deploy,
                    last_query,
                    orch_prompt,
                    intent=user_intent,
                )
            )
            timer.mark("component_generation")

        # P0-8: Persist user message to DataStore (non-blocking best-effort)
        if request.conversation_id and last_query:
            try:
                ds = DataStore()
                await ds.add_message(request.conversation_id, user_id, "user", last_query)
            except Exception:
                logger.warning("Failed to persist user message", exc_info=True)

        # Stream the AI response — this starts immediately, concurrently
        # with the background component generation task.
        full_response = ""
        accumulated_reasoning = ""
        first_token = True
        async for event in _stream_ai_response(
            messages, request.enable_thinking, context=orch_prompt
        ):
            if first_token and event.startswith("data: {"):
                try:
                    data = json.loads(event[6:])
                    if data.get("type") == "content" and data.get("delta"):
                        first_token = False
                        timer.mark("first_token")
                except Exception:
                    pass
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

        # After AI stream ends, wait for the component to finish (bounded).
        if component_task is not None and not component_task.done():
            try:
                payload = await asyncio.wait_for(component_task, timeout=10.0)
            except asyncio.TimeoutError:
                payload = None
                logger.warning(
                    "Component generation did not finish within 10s after stream; "
                    "cancelling. type=%s", component_type_to_deploy
                )
                component_task.cancel()
        elif component_task is not None and component_task.done():
            payload = component_task.result()
        else:
            payload = None

        # HARD GUARD: If a component was selected but generation failed,
        # detect if the LLM wrote Markdown quiz/flashcard UI anyway.
        if component_selected and payload is None:
            logger.warning(
                "[ORCHESTRATOR ERROR] Selected interactive component '%s' but "
                "no component event was emitted. LLM response may contain "
                "Markdown quiz UI which is an orchestration failure.",
                component_type_to_deploy,
            )
            # Strip Markdown quiz patterns from the response if present
            if full_response:
                # Detect Markdown quiz patterns: "A)", "A.", numbered options, etc.
                quiz_patterns = [
                    re.compile(r"(?m)^(?:###?\s*)?.*\b[A-D]\)\s*.+", re.I),
                    re.compile(r"(?m)^[\s]*[-*]\s*\b[A-D]\)\s*.+", re.I),
                    re.compile(r"(?m)^[\s]*\d+\.\s*.+", re.I),
                ]
                has_quiz_ui = any(p.search(full_response) for p in quiz_patterns)
                if has_quiz_ui:
                    logger.warning(
                        "[ORCHESTRATOR GUARD] LLM generated Markdown quiz UI "
                        "despite component selection. Truncating text response."
                    )
                    # Keep only the first sentence as a conversational intro
                    sentences = re.split(r"[.!?\n]", full_response)
                    first_sentence = next(
                        (s.strip() for s in sentences if s.strip() and len(s.strip()) > 5),
                        "",
                    )
                    if first_sentence:
                        full_response = first_sentence + "."

        # Track component data for persistence
        component_data_to_save = None

        if component_task is not None and payload is not None:
            timer.mark("component_event")
            artifact_event = {
                "id": payload.id,
                "title": payload.title,
                "type": payload.type,
                "data": payload.data.model_dump(by_alias=True, mode="json"),
                "purpose": decision.action,
                "difficulty": decision.suggested_difficulty,
            }
            component_data_to_save = artifact_event
            yield f"data: {json.dumps({'type': 'activity', 'activity': artifact_event})}\n\n"
        elif component_task is not None and payload is None:
            logger.info(
                "Component generation unavailable for type=%s; local fallback "
                "or None returned.", component_type_to_deploy
            )
            # Emit error event so frontend can show retry option
            if component_selected:
                yield f'data: {json.dumps({"type": "component_error", "component_type": component_type_to_deploy, "message": "Quiz generation failed. Please try again."})}\n\n'

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
                        components=component_data_to_save,
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
                        f"data: {json.dumps({'type': 'activity', 'activity': {'id': 'gap-analysis', 'title': gaps['title'], 'type': 'gap-analysis', 'data': gaps['gaps']}})}\n\n"
                    )

        timer.mark("response_complete")
        timer.log(logger, "CHAT")

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
