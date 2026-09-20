"""Tests for unified activity attempt and completion API endpoints."""

import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _auth_headers():
    return {"Authorization": "Bearer valid-token"}


@pytest.fixture(autouse=True)
def _mock_verify_jwt():
    with patch("app.main.verify_supabase_jwt", return_value="test-user"):
        yield


class TestActivityAttempt:
    @pytest.mark.asyncio
    async def test_attempt_records_mastery(self):
        with patch("app.services.mastery_engine.MasteryEngine") as MockMastery, \
             patch("app.routes.interactions.cognee") as mock_cognee:
            mock_mastery = AsyncMock()
            MockMastery.return_value = mock_mastery
            mock_cognee.remember_learning_progress = AsyncMock()

            response = client.post(
                "/api/v1/activities/act-123/attempt",
                headers=_auth_headers(),
                json={
                    "activity_id": "act-123",
                    "activity_type": "quiz",
                    "concept_ids": ["Epistemology"],
                    "interaction_type": "select_option",
                    "payload": {"question_id": "q1", "selected": 0, "difficulty": "medium"},
                    "correct": True,
                    "score": 85.0,
                    "response_time_ms": 3000,
                    "confidence_rating": 4,
                },
            )
            assert response.status_code == 201
            body = response.json()
            assert body["status"] == "recorded"
            assert body["misconception_flagged"] is False

    @pytest.mark.asyncio
    async def test_low_score_flags_misconception(self):
        with patch("app.services.mastery_engine.MasteryEngine") as MockMastery, \
             patch("app.services.misconception_engine.MisconceptionEngine") as MockMisconception, \
             patch("app.routes.interactions.cognee") as mock_cognee:
            MockMastery.return_value = AsyncMock()
            mock_misconception = AsyncMock()
            MockMisconception.return_value = mock_misconception
            mock_cognee.remember_learning_progress = AsyncMock()

            response = client.post(
                "/api/v1/activities/act-456/attempt",
                headers=_auth_headers(),
                json={
                    "activity_id": "act-456",
                    "activity_type": "quiz",
                    "concept_ids": ["Rationalism"],
                    "interaction_type": "select_option",
                    "payload": {"question_id": "q1", "selected": 2, "difficulty": "medium"},
                    "correct": False,
                    "score": 30.0,
                },
            )
            assert response.status_code == 201
            body = response.json()
            assert body["misconception_flagged"] is True

    @pytest.mark.asyncio
    async def test_flashcard_attempt_records_mastery(self):
        with patch("app.services.mastery_engine.MasteryEngine") as MockMastery, \
             patch("app.routes.interactions.cognee") as mock_cognee:
            MockMastery.return_value = AsyncMock()
            mock_cognee.remember_learning_progress = AsyncMock()

            response = client.post(
                "/api/v1/activities/fc-1/attempt",
                headers=_auth_headers(),
                json={
                    "activity_id": "fc-1",
                    "activity_type": "flashcards",
                    "concept_ids": ["Stoicism"],
                    "interaction_type": "flip_card",
                    "payload": {"card_id": "c1", "difficulty": "easy"},
                    "correct": True,
                    "score": 90.0,
                    "confidence_rating": 5,
                },
            )
            assert response.status_code == 201
            body = response.json()
            assert body["status"] == "recorded"


class TestActivityComplete:
    @pytest.mark.asyncio
    async def test_complete_records_timeline_event(self):
        with patch("app.routes.interactions.cognee") as mock_cognee:
            mock_cognee.remember_learning_progress = AsyncMock()

            with patch("app.services.db_pool.get_pool") as mock_pool_fn:
                mock_pool = AsyncMock()
                mock_conn = AsyncMock()
                mock_pool.acquire.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
                mock_pool.acquire.return_value.__aexit__ = AsyncMock(return_value=False)
                mock_conn.fetchval.return_value = "evt-123"
                mock_pool_fn.return_value = mock_pool

                response = client.post(
                    "/api/v1/activities/act-123/complete",
                    headers=_auth_headers(),
                    json={
                        "activity_id": "act-123",
                        "concept_ids": ["Epistemology"],
                        "total_score": 80.0,
                        "completed_steps": 5,
                        "time_spent_seconds": 300,
                    },
                )
                assert response.status_code == 200
                body = response.json()
                assert body["status"] == "completed"
                assert body["total_score"] == 80.0

    @pytest.mark.asyncio
    async def test_complete_without_db_graceful(self):
        with patch("app.routes.interactions.cognee") as mock_cognee:
            mock_cognee.remember_learning_progress = AsyncMock()

            with patch("app.services.db_pool.get_pool", return_value=None):
                response = client.post(
                    "/api/v1/activities/act-456/complete",
                    headers=_auth_headers(),
                    json={
                        "activity_id": "act-456",
                        "concept_ids": ["Physics"],
                        "total_score": 75.0,
                        "completed_steps": 3,
                        "time_spent_seconds": 180,
                    },
                )
                assert response.status_code == 200
                body = response.json()
                assert body["timeline_event_id"] is None
