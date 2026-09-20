"""Interaction routes — records real learning interactions and feeds them
into the memory loop (Phase 4). This is the write side of the interaction ->
memory -> next-response loop: app.routes.chat.detect_knowledge_gaps and
build_orchestrator_prompt (the read side) already recall learning progress
on every turn — this is what actually populates it for real quiz attempts
instead of leaving that memory empty."""

import json
import logging
from datetime import datetime, timezone

from fastapi import APIRouter

from app.core.security import resolve_user_id
from app.models.interactions import (
    QuizResultCreate,
    ActivityAttemptCreate,
    ActivityCompleteCreate,
    ActivityAttemptResponse,
    ActivityCompleteResponse,
)
from app.routes.chat import cognee
from app.services.data_store import DataStore

logger = logging.getLogger(__name__)

interactions_router = APIRouter()
_store = DataStore()


@interactions_router.post(
    "/interactions/quiz-result",
    status_code=201,
    summary="Record a quiz result",
    description=(
        "Persist a completed quiz interaction and feed the score into the "
        "learning-progress memory loop, so the next chat turn can react to it."
    ),
)
async def record_quiz_result(data: QuizResultCreate):
    user_id = resolve_user_id()

    try:
        await cognee.remember_learning_progress(
            user_id,
            data.topic,
            data.score,
            "quiz",
            {"artifact_id": data.artifact_id, "answers": data.answers},
        )
    except Exception:
        # Never let a memory-write failure block the interaction from being
        # recorded in Postgres — but this must be loud, not silent.
        logger.warning(
            "Failed to write quiz result to memory: user=%s topic=%s",
            user_id,
            data.topic,
            exc_info=True,
        )

    try:
        from app.services.mastery_engine import MasteryEngine
        mastery = MasteryEngine()
        correct = (data.score or 0) >= 70.0
        await mastery.record_attempt(
            user_id=user_id,
            activity_id=data.artifact_id,
            concept_ids=[data.topic],
            correct=correct,
            score=data.score,
        )
    except Exception:
        logger.warning(
            "Failed to record attempt in mastery engine: user=%s topic=%s",
            user_id,
            data.topic,
            exc_info=True,
        )

    try:
        from app.services.misconception_engine import MisconceptionEngine
        misconception_engine = MisconceptionEngine()
        if (data.score or 0) < 70.0:
            await misconception_engine.record_misconception(
                user_id=user_id,
                concept_id=data.topic,
                description=f"Struggling with concept '{data.topic}' (score: {data.score}%)",
            )
    except Exception:
        logger.warning(
            "Failed to record misconception: user=%s topic=%s",
            user_id,
            data.topic,
            exc_info=True,
        )

    try:
        from app.services import spaced_repetition
        if hasattr(spaced_repetition, "SpacedRepetitionEngine"):
            sr_engine = spaced_repetition.SpacedRepetitionEngine()
            rating = 5 if (data.score or 0) >= 90 else (3 if (data.score or 0) >= 70 else 1)
            await sr_engine.record_review(
                user_id=user_id,
                concept_id=data.topic,
                quality_rating=rating,
            )
    except Exception:
        logger.warning(
            "Failed to record spaced repetition review: user=%s topic=%s",
            user_id,
            data.topic,
            exc_info=True,
        )

    res = await _store.create_quiz_result(user_id, data.model_dump())
    return res


@interactions_router.post(
    "/activities/{activity_id}/attempt",
    status_code=201,
    summary="Record an activity attempt step",
    description="Records an individual interaction step within an activity and updates mastery evidence.",
)
async def record_activity_attempt(activity_id: str, data: ActivityAttemptCreate) -> ActivityAttemptResponse:
    user_id = resolve_user_id()
    result = ActivityAttemptResponse()

    try:
        from app.services.mastery_engine import MasteryEngine
        mastery = MasteryEngine()
        difficulty_weight = {
            "beginner": 0.6, "easy": 0.8, "medium": 1.0,
            "hard": 1.3, "exam-level": 1.5, "advanced": 1.5,
        }.get(data.payload.get("difficulty", "medium"), 1.0)

        await mastery.record_attempt(
            user_id=user_id,
            activity_id=activity_id,
            concept_ids=data.concept_ids,
            correct=data.correct if data.correct is not None else (data.score or 0) >= 70,
            score=data.score,
            difficulty_weight=difficulty_weight,
        )
        result.delta_mastery = {"updated_concepts": data.concept_ids}
    except Exception:
        logger.warning("Mastery recording failed for attempt on %s", activity_id, exc_info=True)

    try:
        if data.correct is False or (data.score is not None and data.score < 70):
            from app.services.misconception_engine import MisconceptionEngine
            engine = MisconceptionEngine()
            await engine.record_misconception(
                user_id=user_id,
                concept_id=data.concept_ids[0] if data.concept_ids else "unknown",
                description=f"Wrong answer on {data.activity_type} (score: {data.score})",
            )
            result.misconception_flagged = True
    except Exception:
        logger.warning("Misconception recording failed", exc_info=True)

    try:
        if data.activity_type in ("flashcards", "recall-prompt", "free-recall"):
            from app.services.spaced_repetition import SpacedRepetitionEngine
            sr = SpacedRepetitionEngine()
            rating = data.confidence_rating or (5 if (data.score or 0) >= 90 else 3 if (data.score or 0) >= 70 else 1)
            await sr.record_review(
                user_id=user_id,
                concept_id=data.concept_ids[0] if data.concept_ids else "unknown",
                quality_rating=rating,
            )
            result.spaced_repetition_scheduled = True
    except Exception:
        logger.warning("Spaced repetition recording failed", exc_info=True)

    try:
        await cognee.remember_learning_progress(
            user_id,
            data.concept_ids[0] if data.concept_ids else "general",
            data.score or 0,
            data.activity_type,
            {"activity_id": activity_id, "step_index": data.step_index, "correct": data.correct},
        )
    except Exception:
        logger.warning("Memory write failed for attempt", exc_info=True)

    return result


@interactions_router.post(
    "/activities/{activity_id}/complete",
    status_code=200,
    summary="Mark activity as completed",
    description="Finalizes an activity session, computes mastery delta, and emits a timeline event.",
)
async def complete_activity(activity_id: str, data: ActivityCompleteCreate) -> ActivityCompleteResponse:
    user_id = resolve_user_id()

    try:
        await cognee.remember_learning_progress(
            user_id,
            data.concept_ids[0] if data.concept_ids else "general",
            data.total_score,
            "activity_complete",
            {"activity_id": activity_id, "steps": data.completed_steps, "time": data.time_spent_seconds},
        )
    except Exception:
        logger.warning("Memory write failed for activity completion", exc_info=True)

    event_id = None
    try:
        from app.services.db_pool import get_pool
        pool = await get_pool()
        if pool is not None:
            async with pool.acquire() as conn:
                event_id = await conn.fetchval(
                    """INSERT INTO summa_ai.timeline_events (id, user_id, event_type, title, description, metadata, created_at)
                       VALUES (gen_random_uuid(), $1, 'activity_completed', $2, $3, $4, $5)
                       RETURNING id""",
                    user_id,
                    f"Activity completed: {activity_id}",
                    f"Score: {data.total_score}% | Steps: {data.completed_steps} | Time: {data.time_spent_seconds}s",
                    json.dumps({"activity_id": activity_id, "score": data.total_score}),
                    datetime.now(timezone.utc),
                )
    except Exception:
        logger.warning("Timeline event creation failed", exc_info=True)
        event_id = None

    return ActivityCompleteResponse(
        activity_id=activity_id,
        total_score=data.total_score,
        timeline_event_id=str(event_id) if event_id else None,
    )
