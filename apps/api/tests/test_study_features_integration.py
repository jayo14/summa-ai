"""Integration tests for DataStore against a real Postgres database.

These tests exercise the DataStore CRUD paths end-to-end against a live
Postgres, verifying that the Alembic-migrated schema and the asyncpg SQL
actually work. They run in CI (where DATABASE_URL points at the postgres
service and `alembic upgrade head` has created the schema) and are skipped
locally when no real Postgres is configured.
"""
from __future__ import annotations

import os
import uuid

import asyncpg
import pytest

from app.config import settings
from app.services.data_store import DataStore

DATABASE_URL = settings.DATABASE_URL

# Only run against a real Postgres (skip sqlite / unset / mocked runs).
_REAL_PG = bool(DATABASE_URL) and DATABASE_URL.startswith("postgresql")

USER_ID = str(uuid.uuid4())

pytestmark = pytest.mark.skipif(
    not _REAL_PG,
    reason="requires a real Postgres DATABASE_URL (set in CI)",
)


def _dsn() -> str:
    return DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://", 1)


@pytest.fixture
async def store():
    pool = await asyncpg.create_pool(_dsn(), min_size=1, max_size=5)
    instance = DataStore()
    instance._pool = pool
    DataStore._instance = instance
    yield instance
    await pool.close()


@pytest.fixture(autouse=True)
async def _clean(store):
    async with store._pool.acquire() as conn:
        await conn.execute("DELETE FROM summa_ai.study_sessions")
        await conn.execute("DELETE FROM summa_ai.study_plans")
        await conn.execute("DELETE FROM summa_ai.flashcards")
        await conn.execute("DELETE FROM summa_ai.exams")
        await conn.execute("DELETE FROM summa_ai.timeline_events")
    yield


@pytest.mark.asyncio
async def test_create_and_list_study_plan(store):
    created = await store.create_study_plan(
        USER_ID,
        {
            "title": "Final Exams",
            "progress": 0.0,
            "days_left": 14,
            "streak": 0,
            "sessions": [
                {"day": "Day 1", "topic": "Calculus", "status": "upcoming"},
                {"day": "Day 2", "topic": "Physics", "status": "upcoming"},
            ],
        },
    )
    assert created["title"] == "Final Exams"
    assert len(created["sessions"]) == 2

    plans = await store.list_study_plans(USER_ID)
    assert any(p["id"] == created["id"] for p in plans)


@pytest.mark.asyncio
async def test_update_and_delete_study_plan(store):
    created = await store.create_study_plan(USER_ID, {"title": "Plan A", "sessions": []})
    pid = created["id"]

    updated = await store.update_study_plan(pid, {"progress": 0.5, "streak": 2})
    assert updated["progress"] == 0.5
    assert updated["streak"] == 2

    assert await store.delete_study_plan(pid) is True
    assert await store.list_study_plans(USER_ID) == []


@pytest.mark.asyncio
async def test_create_list_update_delete_flashcard(store):
    created = await store.create_flashcard(
        USER_ID, {"front": "What is 2+2?", "back": "4", "mastered": False}
    )
    cid = created["id"]
    assert created["front"] == "What is 2+2?"

    cards = await store.list_flashcards(USER_ID)
    assert any(c["id"] == cid for c in cards)

    updated = await store.update_flashcard(cid, {"mastered": True})
    assert updated["mastered"] is True

    assert await store.delete_flashcard(cid) is True


@pytest.mark.asyncio
async def test_create_list_delete_exam(store):
    created = await store.create_exam(
        USER_ID, {"name": "Math Final", "exam_date": "2026-09-01", "readiness": 3}
    )
    eid = created["id"]
    assert created["name"] == "Math Final"

    exams = await store.list_exams(USER_ID)
    assert any(e["id"] == eid for e in exams)

    assert await store.delete_exam(eid) is True


@pytest.mark.asyncio
async def test_timeline_event_created_on_study_plan(store):
    await store.create_study_plan(USER_ID, {"title": "Plan with timeline", "sessions": []})
    events = await store.list_timeline_events(USER_ID)
    assert any(e["type"] == "study_plan" for e in events)
