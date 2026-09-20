"""Study plan, flashcard, and exam routes — Postgres-backed."""

from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.models.study import (
    ExamCreate,
    ExamUpdate,
    FlashcardCreate,
    FlashcardsUpdate,
    StudyPlanCreate,
    StudyPlanUpdate,
    StudySessionUpdate,
)
from app.core.security import resolve_user_id
from app.services.data_store import DataStore

_store = DataStore()

study_router = APIRouter()
flashcards_router = APIRouter()
exams_router = APIRouter()
past_questions_router = APIRouter()

# ========== STUDY PLANS ==========


@study_router.get(
    "/study-plans",
    summary="List study plans",
    description="Get all study plans for the user",
)
async def list_study_plans():
    user_id = resolve_user_id()
    return await _store.list_study_plans(user_id)


@study_router.post(
    "/study-plans",
    status_code=201,
    summary="Create study plan",
    description="Create a new study plan",
)
async def create_study_plan(data: StudyPlanCreate):
    user_id = resolve_user_id()
    return await _store.create_study_plan(user_id, data.model_dump())


@study_router.get(
    "/study-plans/{pid}",
    summary="Get study plan",
    description="Get a specific study plan",
)
async def get_study_plan(pid: str):
    user_id = resolve_user_id()
    plan = await _store._get_study_plan(pid, user_id)
    if plan is None:
        raise HTTPException(404, "Not found")
    return plan


@study_router.post(
    "/study-plans/{pid}/approve",
    summary="Approve study plan",
    description="Mark a study plan as approved and active",
)
async def approve_study_plan(pid: str):
    user_id = resolve_user_id()
    plan = await _store.update_study_plan(pid, user_id, {"approved": True})
    if plan is None:
        raise HTTPException(404, "Not found")
    return plan


@study_router.patch(
    "/study-plans/{pid}",
    summary="Update study plan",
    description="Update a study plan's metadata",
)
async def update_study_plan(pid: str, data: StudyPlanUpdate):
    user_id = resolve_user_id()
    plan = await _store.update_study_plan(pid, user_id, data.model_dump(exclude_unset=True))
    if plan is None:
        raise HTTPException(404, "Not found")
    return plan


@study_router.delete(
    "/study-plans/{pid}", summary="Delete study plan", description="Delete a study plan"
)
async def delete_study_plan(pid: str):
    user_id = resolve_user_id()
    if not await _store.delete_study_plan(pid, user_id):
        raise HTTPException(404, "Not found")
    return {"status": "success"}


@study_router.patch(
    "/study-plans/sessions/{sid}",
    summary="Update session",
    description="Update a study session's status",
)
async def update_session(sid: str, data: StudySessionUpdate):
    user_id = resolve_user_id()
    session = await _store.update_session(sid, user_id, data.model_dump(exclude_unset=True))
    if session is None:
        raise HTTPException(404, "Not found")
    return session


@flashcards_router.get(
    "/flashcards",
    summary="List flashcards",
    description="Get all flashcards for the user",
)
async def list_flashcards():
    user_id = resolve_user_id()
    return await _store.list_flashcards(user_id)


@flashcards_router.get(
    "/flashcards/due",
    summary="Get due flashcards",
    description="Get all flashcards due for review",
)
async def get_due_flashcards():
    user_id = resolve_user_id()
    all_cards = await _store.list_flashcards(user_id)
    # Filter cards where next_review_at is <= now or unset
    from datetime import datetime, timezone
    now_iso = datetime.now(timezone.utc).isoformat()
    return [c for c in all_cards if not c.get("next_review_at") or c.get("next_review_at") <= now_iso]


@flashcards_router.post(
    "/flashcards/{fid}/review",
    summary="Record flashcard review",
    description="Record a performance rating for a flashcard and compute SM-2 schedule",
)
async def record_flashcard_review(fid: str, payload: dict):
    user_id = resolve_user_id()
    rating = payload.get("rating", "good")
    if rating not in ("again", "hard", "good", "easy"):
        raise HTTPException(400, "Invalid rating value")

    card = await _store.update_flashcard(fid, user_id, {})
    if card is None:
        raise HTTPException(404, "Not found")

    from app.services.spaced_repetition import next_review
    from datetime import datetime, timedelta, timezone

    ease = float(card.get("ease_factor", 2.5))
    interval = int(card.get("interval_days", 0))
    reps = int(card.get("repetitions", 0))

    new_ease, new_interval, new_reps = next_review(rating, ease, interval, reps)
    next_review_at = datetime.now(timezone.utc) + timedelta(days=new_interval)

    updated = await _store.update_flashcard(
        fid,
        user_id,
        {
            "ease_factor": new_ease,
            "interval_days": new_interval,
            "repetitions": new_reps,
            "next_review_at": next_review_at.isoformat(),
        },
    )

    from app.services.mastery_engine import MasteryEngine
    engine = MasteryEngine()
    correct = rating in ("good", "easy")
    concept_name = card.get("concept_id") or card.get("front") or "flashcard"
    await engine.record_attempt(
        user_id=user_id,
        activity_id=fid,
        concept_ids=[concept_name],
        correct=correct,
    )

    if rating in ("again", "hard"):
        try:
            from app.services.misconception_engine import MisconceptionEngine
            misconceptions = MisconceptionEngine()
            await misconceptions.record_misconception(
                user_id=user_id,
                concept_id=concept_name,
                description=f"Struggling with flashcard '{concept_name}' (rating: {rating})",
                evidence=f"Flashcard {fid} review rating '{rating}'",
            )
        except Exception:
            pass

    try:
        from app.routes.chat import cognee
        await cognee.remember_learning_progress(
            user_id,
            concept_name,
            100.0 if correct else 40.0,
            "flashcard",
            {"card_id": fid, "rating": rating},
        )
    except Exception:
        pass

    return updated


@flashcards_router.post(
    "/flashcards",
    status_code=201,
    summary="Create flashcard",
    description="Create a new flashcard",
)
async def create_flashcard(data: FlashcardCreate):
    user_id = resolve_user_id()
    return await _store.create_flashcard(user_id, data.model_dump())


@flashcards_router.patch(
    "/flashcards/{fid}",
    summary="Update flashcard",
    description="Update a flashcard's mastery status",
)
async def update_flashcard(fid: str, data: FlashcardsUpdate):
    user_id = resolve_user_id()
    card = await _store.update_flashcard(fid, user_id, data.model_dump(exclude_unset=True))
    if card is None:
        raise HTTPException(404, "Not found")
    return card


@flashcards_router.delete(
    "/flashcards/{fid}", summary="Delete flashcard", description="Delete a flashcard"
)
async def delete_flashcard(fid: str):
    user_id = resolve_user_id()
    if not await _store.delete_flashcard(fid, user_id):
        raise HTTPException(404, "Not found")
    return {"status": "success"}


# ========== EXAMS ==========


@exams_router.get(
    "/exams", summary="List exams", description="Get all upcoming exams for the user"
)
async def list_exams():
    user_id = resolve_user_id()
    return await _store.list_exams(user_id)


@exams_router.post(
    "/exams", status_code=201, summary="Create exam", description="Add an upcoming exam"
)
async def create_exam(data: ExamCreate):
    user_id = resolve_user_id()
    return await _store.create_exam(user_id, data.model_dump())


@exams_router.patch(
    "/exams/{eid}",
    summary="Update exam",
    description="Update an exam's details (readiness is computed server-side)",
)
async def update_exam(eid: str, data: ExamUpdate):
    user_id = resolve_user_id()
    payload = data.model_dump(exclude_unset=True)
    payload.pop("readiness", None)  # Prevent client from directly setting readiness score
    exam = await _store.update_exam(eid, user_id, payload)
    if exam is None:
        raise HTTPException(404, "Not found")
    return exam


@exams_router.get(
    "/exams/{eid}/readiness",
    summary="Get computed exam readiness",
    description="Returns computed readiness breakdown and topic analysis for an exam",
)
async def get_exam_readiness(eid: str):
    user_id = resolve_user_id()
    exam = await _store.update_exam(eid, user_id, {})
    if exam is None:
        raise HTTPException(404, "Not found")

    from app.services.pattern_analysis import ExamReadinessEngine
    return await ExamReadinessEngine.compute_readiness(user_id, eid)


@exams_router.post(
    "/exams/{eid}/feedback",
    status_code=201,
    summary="Submit post-exam feedback",
    description="Submit post-exam outcome feedback with privacy & recommendation consent",
)
async def submit_exam_feedback(eid: str, payload: dict):
    user_id = resolve_user_id()
    from app.services.outcome_loop import OutcomeLoopEngine, ExamFeedbackCreate
    engine = OutcomeLoopEngine()
    feedback = ExamFeedbackCreate(**payload)
    return await engine.submit_exam_feedback(user_id, eid, feedback)


@exams_router.get(
    "/exams/{eid}/feedback",
    summary="Get post-exam feedback",
    description="Get recorded post-exam outcome feedback for an exam",
)
async def get_exam_feedback(eid: str):
    user_id = resolve_user_id()
    from app.services.outcome_loop import OutcomeLoopEngine
    engine = OutcomeLoopEngine()
    res = await engine.get_exam_feedback(user_id, eid)
    if res is None:
        raise HTTPException(404, "Not found")
    return res


@exams_router.delete(
    "/exams/{eid}", summary="Delete exam", description="Remove an exam"
)
async def delete_exam(eid: str):
    user_id = resolve_user_id()
    if not await _store.delete_exam(eid, user_id):
        raise HTTPException(404, "Not found")
    return {"status": "success"}


# ========== PAST QUESTIONS ==========


class PastQuestionCreate(BaseModel):
    course_id: str
    year: str
    question_text: str
    topic: str
    marks: int = Field(default=0, ge=0)
    question_type: str = "unknown"


@past_questions_router.post(
    "/past-questions",
    status_code=201,
    summary="Add past question",
    description="Store a historical past question for pattern analysis",
)
async def create_past_question(data: PastQuestionCreate):
    user_id = resolve_user_id()
    try:
        from app.services.db_pool import get_pool
        pool = await get_pool()
        if pool is not None:
            async with pool.acquire() as conn:
                row = await conn.fetchrow(
                    """INSERT INTO summa_ai.past_questions (id, user_id, course_id, year, question_text, topic, marks, question_type, created_at)
                       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW())
                       RETURNING *""",
                    user_id, data.course_id, data.year, data.question_text,
                    data.topic, data.marks, data.question_type,
                )
                if row:
                    return dict(row)
    except Exception:
        pass
    return {"status": "created", "topic": data.topic}


@past_questions_router.post(
    "/past-questions/analyze",
    summary="Analyze past question patterns",
    description="Extract topic frequency, recurring structures, and year trends from stored past questions",
)
async def analyze_past_questions(payload: Dict[str, Any] = None) -> Dict[str, Any]:
    user_id = resolve_user_id()
    course_id = (payload or {}).get("course_id")

    questions = []
    try:
        from app.services.db_pool import get_pool
        pool = await get_pool()
        if pool is not None:
            async with pool.acquire() as conn:
                if course_id:
                    rows = await conn.fetch(
                        "SELECT * FROM summa_ai.past_questions WHERE user_id = $1 AND course_id = $2",
                        user_id, course_id,
                    )
                else:
                    rows = await conn.fetch(
                        "SELECT * FROM summa_ai.past_questions WHERE user_id = $1",
                        user_id,
                    )
                questions = [dict(r) for r in rows] if rows else []
    except Exception:
        pass

    from app.services.pattern_analysis import PatternAnalysisEngine, sanitize_certainty_phrases
    engine = PatternAnalysisEngine()
    result = engine.analyze_patterns(questions)

    # Add year trends
    year_trends = PatternAnalysisEngine._compute_year_trends(questions)

    return {
        "topic_frequencies": result.topic_frequencies,
        "recurring_structures": result.recurring_structures,
        "year_trends": year_trends,
        "total_questions": len(questions),
        "uncertainty_note": result.uncertainty_note,
    }


@past_questions_router.post(
    "/past-questions/predict",
    summary="Generate predictive practice question",
    description="Generate a practice question structurally matched to historical exam patterns",
)
async def generate_predictive_practice(payload: Dict[str, Any]) -> Dict[str, Any]:
    topic = payload.get("topic", "General")
    question_type = payload.get("question_type", "predicted")

    from app.services.pattern_analysis import PredictivePracticeGenerator
    return PredictivePracticeGenerator.generate_from_patterns(
        topic=topic,
        recurring_structures=payload.get("recurring_structures", []),
        question_type=question_type,
    )
