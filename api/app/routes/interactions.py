"""Interaction routes — records real learning interactions and feeds them
into the memory loop (Phase 4). This is the write side of the interaction ->
memory -> next-response loop: app.routes.chat.detect_knowledge_gaps and
build_orchestrator_prompt (the read side) already recall learning progress
on every turn — this is what actually populates it for real quiz attempts
instead of leaving that memory empty."""

import logging

from fastapi import APIRouter

from app.core.security import resolve_user_id
from app.models.interactions import QuizResultCreate
from app.services.cognee_service import CogneeService
from app.services.data_store import DataStore

logger = logging.getLogger(__name__)

interactions_router = APIRouter()
_store = DataStore()
_cognee = CogneeService()


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
        await _cognee.remember_learning_progress(
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

    return await _store.create_quiz_result(user_id, data.model_dump())
