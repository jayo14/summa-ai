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
    resolve_user_id()
    plan = await _store._get_study_plan(pid)
    if plan is None:
        raise HTTPException(404, "Not found")
    return plan


@study_router.patch(
    "/study-plans/{pid}",
    summary="Update study plan",
    description="Update a study plan's metadata",
)
async def update_study_plan(pid: str, data: StudyPlanUpdate):
    resolve_user_id()
    plan = await _store.update_study_plan(pid, data.model_dump(exclude_unset=True))
    if plan is None:
        raise HTTPException(404, "Not found")
    return plan


@study_router.delete(
    "/study-plans/{pid}", summary="Delete study plan", description="Delete a study plan"
)
async def delete_study_plan(pid: str):
    resolve_user_id()
    if not await _store.delete_study_plan(pid):
        raise HTTPException(404, "Not found")
    return {"status": "success"}


@study_router.patch(
    "/study-plans/sessions/{sid}",
    summary="Update session",
    description="Update a study session's status",
)
async def update_session(sid: str, data: StudySessionUpdate):
    resolve_user_id()
    session = await _store.update_session(sid, data.model_dump(exclude_unset=True))
    if session is None:
        raise HTTPException(404, "Not found")
    return session


# ========== FLASHCARDS ==========


@flashcards_router.get(
    "/flashcards",
    summary="List flashcards",
    description="Get all flashcards for the user",
)
async def list_flashcards():
    user_id = resolve_user_id()
    return await _store.list_flashcards(user_id)


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
    resolve_user_id()
    card = await _store.update_flashcard(fid, data.model_dump(exclude_unset=True))
    if card is None:
        raise HTTPException(404, "Not found")
    return card


@flashcards_router.delete(
    "/flashcards/{fid}", summary="Delete flashcard", description="Delete a flashcard"
)
async def delete_flashcard(fid: str):
    resolve_user_id()
    if not await _store.delete_flashcard(fid):
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
    resolve_user_id()
    exam = await _store.update_exam(eid, data.model_dump(exclude_unset=True))
    if exam is None:
        raise HTTPException(404, "Not found")
    return exam


@exams_router.delete(
    "/exams/{eid}", summary="Delete exam", description="Remove an exam"
)
async def delete_exam(eid: str):
    resolve_user_id()
    if not await _store.delete_exam(eid):
        raise HTTPException(404, "Not found")
    return {"status": "success"}
