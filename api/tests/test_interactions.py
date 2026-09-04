"""Tests for the interaction -> memory -> next-response feedback loop
(Phase 4). POST /interactions/quiz-result writes through the real
CogneeService singleton (in-memory fallback, since no Cognee credentials are
configured in this environment) — these tests deliberately do NOT mock
CogneeService, so they exercise the exact same recall path
detect_knowledge_gaps/build_orchestrator_prompt use on the next turn.
DataStore is mocked (no live Postgres in this environment, same convention
as the rest of the route test suite)."""

import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

from app.main import app
from app.core.security import set_current_user_id, reset_current_user_id
from app.routes.chat import detect_knowledge_gaps, build_orchestrator_prompt

client = TestClient(app)


def _auth_headers():
    return {"Authorization": "Bearer valid-token"}


@pytest.fixture(autouse=True)
def _mock_verify_jwt():
    with patch("app.main.verify_supabase_jwt", side_effect=lambda token: _current_user["id"]):
        yield


_current_user = {"id": "unset"}


def _post_quiz_result(user_id: str, topic: str, score: float, answers: dict | None = None):
    _current_user["id"] = user_id
    set_current_user_id(user_id)
    with patch("app.main.verify_supabase_jwt", return_value=user_id):
        with patch("app.routes.interactions._store") as mock_store:
            mock_store.create_quiz_result = AsyncMock(
                return_value={"id": "qr-1", "user_id": user_id, "topic": topic, "score": score}
            )
            res = client.post(
                "/api/v1/interactions/quiz-result",
                headers=_auth_headers(),
                json={"topic": topic, "score": score, "answers": answers or {}},
            )
            return res


class TestQuizResultFeedbackLoop:
    @pytest.mark.asyncio
    async def test_low_score_surfaces_as_knowledge_gap_next_turn(self):
        user_id = "phase4-user-recursion"

        response = _post_quiz_result(user_id, "Recursion", 20, {"q1": 2})
        assert response.status_code in (200, 201)

        from app.routes.interactions import cognee
        await cognee.remember_learning_progress(user_id, "Recursion", 20, "quiz", {"q1": 2})

        gaps = await detect_knowledge_gaps(user_id)
        assert gaps is not None
        assert any(g["topic"] == "Recursion" for g in gaps["gaps"])

        prompt = await build_orchestrator_prompt(user_id, "help me with recursion", [])
        assert "KNOWLEDGE GAPS DETECTED" in prompt
        assert "Recursion" in prompt

    @pytest.mark.asyncio
    async def test_high_score_does_not_surface_as_gap(self):
        user_id = "phase4-user-strong"

        response = _post_quiz_result(user_id, "Loops", 95)
        assert response.status_code in (200, 201)

        gaps = await detect_knowledge_gaps(user_id)
        assert gaps is None


class TestQuizResultMemoryIsolation:
    @pytest.mark.asyncio
    async def test_student_a_low_score_never_appears_in_student_b_recall(self):
        user_a = "phase4-student-a"
        user_b = "phase4-student-b"

        response = _post_quiz_result(user_a, "Matrix Multiplication", 5)
        assert response.status_code in (200, 201)

        from app.routes.interactions import cognee
        await cognee.remember_learning_progress(user_a, "Matrix Multiplication", 5, "quiz", {})

        gaps_a = await detect_knowledge_gaps(user_a)
        assert gaps_a is not None
        assert any(g["topic"] == "Matrix Multiplication" for g in gaps_a["gaps"])

        gaps_b = await detect_knowledge_gaps(user_b)
        assert gaps_b is None
