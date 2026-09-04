"""Study plan, flashcard, and exam routes — Postgres-backed."""

from fastapi import APIRouter, HTTPException
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
    await engine.record_attempt(
        user_id=user_id,
        activity_id=fid,
        concept_ids=[card.get("concept_id") or card.get("front") or "flashcard"],
        correct=correct,
    )

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
    description="Update an exam's details or readiness",
)
async def update_exam(eid: str, data: ExamUpdate):
    user_id = resolve_user_id()
    exam = await _store.update_exam(eid, user_id, data.model_dump(exclude_unset=True))
    if exam is None:
        raise HTTPException(404, "Not found")
    return exam


@exams_router.delete(
    "/exams/{eid}", summary="Delete exam", description="Remove an exam"
)
async def delete_exam(eid: str):
    user_id = resolve_user_id()
    if not await _store.delete_exam(eid, user_id):
        raise HTTPException(404, "Not found")
    return {"status": "success"}
