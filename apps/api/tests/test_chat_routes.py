"""Tests for chat routes — intent detection, streaming, and non-streaming endpoints."""

import json
import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from app.routes.chat import (
    detect_intent,
    _section,
    build_orchestrator_prompt,
    _stream_zai,
)
from app.main import app
from app.core.security import (
    current_user_id,
    set_current_user_id,
    reset_current_user_id,
)

client = TestClient(app)


def _auth_headers():
    return {"Authorization": "Bearer valid-token"}


@pytest.fixture(autouse=True)
def _mock_verify_jwt():
    with patch("app.main.verify_supabase_jwt", return_value="user-1"):
        yield


class TestDetectIntent:
    def test_quiz_intent(self):
        assert detect_intent("quiz me on loops") == "quiz"

    def test_test_me_intent(self):
        assert detect_intent("test me on algebra") == "quiz"

    def test_flashcards_intent(self):
        assert detect_intent("flash cards please") == "flashcards"

    def test_study_plan_intent(self):
        assert detect_intent("make a study plan") == "study-plan"

    def test_exam_prep_intent(self):
        assert detect_intent("exam prep for finals") == "study-plan"

    def test_hexagon_intent(self):
        assert detect_intent("show my progress") == "hexagon"

    def test_graph_intent(self):
        assert detect_intent("knowledge graph") == "graph"

    def test_timeline_intent(self):
        assert detect_intent("my schedule this week") == "timeline"

    def test_gap_analysis_intent(self):
        assert detect_intent("what gap do I have") == "gap-analysis"

    def test_no_intent(self):
        assert detect_intent("hello world") is None


class TestSectionTruncation:
    def test_short_text_not_truncated(self):
        assert _section("short") == "short"

    def test_long_text_truncated(self):
        long = "x" * 4000
        result = _section(long)
        assert len(result) == 3005
        assert result.endswith("\n...]")

    def test_exact_boundary_no_truncation(self):
        text = "x" * 3000
        assert _section(text) == text


class TestBuildOrchestratorPrompt:
    @pytest.mark.asyncio
    @patch("app.routes.chat.cognee")
    async def test_prompt_with_memory_and_exams(self, mock_cognee):
        mock_cognee.recall_context = AsyncMock(
            return_value={"results": [{"text": "memory"}]}
        )
        mock_cognee.recall_exams = AsyncMock(
            return_value={"exams": [{"title": "Math"}]}
        )
        mock_cognee.recall_learning_progress = AsyncMock(return_value={"progress": []})
        prompt = await build_orchestrator_prompt("user-1", "query", [])
        assert "RECALLED CONTEXT FROM MEMORY" in prompt
        assert "UPCOMING EXAMS" in prompt

    @pytest.mark.asyncio
    @patch("app.routes.chat.cognee")
    async def test_prompt_truncates_long_sections(self, mock_cognee):
        long_memory = [{"text": "x" * 4000}]
        mock_cognee.recall_context = AsyncMock(return_value={"results": long_memory})
        mock_cognee.recall_exams = AsyncMock(return_value={"exams": []})
        mock_cognee.recall_learning_progress = AsyncMock(return_value={"progress": []})
        prompt = await build_orchestrator_prompt("user-1", "query", [])
        assert "...]"
        assert len(prompt) < 5000

    @pytest.mark.asyncio
    @patch("app.routes.chat.UserStore")
    @patch("app.routes.chat.cognee")
    async def test_prompt_includes_onboarding_goals(self, mock_cognee, mock_user_store):
        mock_cognee.recall_context = AsyncMock(return_value={"results": []})
        mock_cognee.recall_exams = AsyncMock(return_value={"exams": []})
        mock_cognee.recall_learning_progress = AsyncMock(return_value={"progress": []})
        mock_store_instance = AsyncMock()
        mock_store_instance.get_onboarding_data = AsyncMock(
            return_value={
                "goals": "Master NLP and get an A in the final",
                "level": "intermediate",
                "personality": {"quiz_1": "visual"},
            }
        )
        mock_user_store.return_value = mock_store_instance
        prompt = await build_orchestrator_prompt("user-1", "query", [])
        assert "STUDENT PROFILE" in prompt
        assert "Master NLP" in prompt
        assert "intermediate" in prompt

    @pytest.mark.asyncio
    @patch("app.routes.chat.UserStore")
    @patch("app.routes.chat.cognee")
    async def test_prompt_handles_missing_onboarding(
        self, mock_cognee, mock_user_store
    ):
        mock_cognee.recall_context = AsyncMock(return_value={"results": []})
        mock_cognee.recall_exams = AsyncMock(return_value={"exams": []})
        mock_cognee.recall_learning_progress = AsyncMock(return_value={"progress": []})
        mock_store_instance = AsyncMock()
        mock_store_instance.get_onboarding_data = AsyncMock(return_value=None)
        mock_user_store.return_value = mock_store_instance
        prompt = await build_orchestrator_prompt("user-1", "query", [])
        assert "STUDENT PROFILE" not in prompt

    @pytest.mark.asyncio
    @patch("app.routes.chat.cognee")
    @patch("app.routes.chat.summastudy_memory")
    async def test_prompt_includes_hybrid_memory(self, mock_memory, mock_cognee):
        mock_cognee.recall_context = AsyncMock(return_value={"results": []})
        mock_cognee.recall_exams = AsyncMock(return_value={"exams": []})
        mock_cognee.recall_learning_progress = AsyncMock(return_value={"progress": []})
        mock_cognee.detect_knowledge_gaps = AsyncMock(return_value=None)
        mock_memory.retrieve_relevant_memories = AsyncMock(
            return_value=[{"content": "likes NLP"}]
        )
        with patch("app.routes.chat.settings") as mock_settings:
            mock_settings.HYBRID_MEMORY_ENABLED = True
            prompt = await build_orchestrator_prompt("user-1", "query", [])
            assert "ATOMIC FACTS" in prompt


class TestChatStreamEndpoint:
    @pytest.mark.asyncio
    @patch("app.routes.chat.cognee")
    async def test_stream_returns_content(self, mock_cognee):
        mock_cognee.recall_context = AsyncMock(return_value={"results": []})
        mock_cognee.recall_exams = AsyncMock(return_value={"exams": []})
        mock_cognee.recall_learning_progress = AsyncMock(return_value={"progress": []})
        mock_cognee.detect_knowledge_gaps = AsyncMock(return_value=None)
        mock_cognee.remember_conversation = AsyncMock()

        async def fake_stream(*args, **kwargs):
            yield 'data: {"type": "content", "delta": "Hello"}\n\n'
            yield "data: [DONE]\n\n"

        with patch("app.routes.chat._stream_zai", side_effect=fake_stream):
            token = set_current_user_id("user-1")
            try:
                response = client.post(
                    "/api/v1/chat/stream",
                    headers=_auth_headers(),
                    json={
                        "user_id": "user-1",
                        "messages": [{"role": "user", "content": "Hi"}],
                    },
                )
                assert response.status_code == 200
                assert (
                    response.headers["content-type"]
                    == "text/event-stream; charset=utf-8"
                )
            finally:
                reset_current_user_id(token)

    @pytest.mark.asyncio
    @patch("app.routes.chat.cognee")
    async def test_stream_emits_artifact_on_intent(self, mock_cognee):
        mock_cognee.recall_context = AsyncMock(return_value={"results": []})
        mock_cognee.recall_exams = AsyncMock(return_value={"exams": []})
        mock_cognee.recall_learning_progress = AsyncMock(return_value={"progress": []})
        mock_cognee.detect_knowledge_gaps = AsyncMock(return_value=None)
        mock_cognee.remember_conversation = AsyncMock()

        async def fake_stream(*args, **kwargs):
            yield 'data: {"type": "content", "delta": "Quiz ready"}\n\n'
            yield "data: [DONE]\n\n"

        with patch("app.routes.chat._stream_zai", side_effect=fake_stream):
            token = set_current_user_id("user-1")
            try:
                response = client.post(
                    "/api/v1/chat/stream",
                    headers=_auth_headers(),
                    json={
                        "user_id": "user-1",
                        "messages": [{"role": "user", "content": "quiz me"}],
                    },
                )
                assert response.status_code == 200
                body = b"".join(response.iter_bytes()).decode("utf-8")
                assert "quiz" in body
            finally:
                reset_current_user_id(token)

    @pytest.mark.asyncio
    @patch("app.routes.chat.cognee")
    async def test_stream_handles_zai_error(self, mock_cognee):
        mock_cognee.recall_context = AsyncMock(return_value={"results": []})
        mock_cognee.recall_exams = AsyncMock(return_value={"exams": []})
        mock_cognee.recall_learning_progress = AsyncMock(return_value={"progress": []})
        mock_cognee.detect_knowledge_gaps = AsyncMock(return_value=None)
        mock_cognee.remember_conversation = AsyncMock()

        async def fake_stream(*args, **kwargs):
            yield 'data: {"type": "error", "message": "Z.ai down"}\n\n'
            yield "data: [DONE]\n\n"

        with patch("app.routes.chat._stream_zai", side_effect=fake_stream):
            token = set_current_user_id("user-1")
            try:
                response = client.post(
                    "/api/v1/chat/stream",
                    headers=_auth_headers(),
                    json={
                        "user_id": "user-1",
                        "messages": [{"role": "user", "content": "Hi"}],
                    },
                )
                assert response.status_code == 200
                body = b"".join(response.iter_bytes()).decode("utf-8")
                assert "Z.ai down" in body
            finally:
                reset_current_user_id(token)


class TestChatEndpoint:
    @pytest.mark.asyncio
    @patch("app.routes.chat.cognee")
    async def test_chat_returns_response_and_artifacts(self, mock_cognee):
        mock_cognee.recall_context = AsyncMock(return_value={"results": []})
        response = client.post(
            "/api/v1/chat",
            headers=_auth_headers(),
            json={
                "user_id": "user-1",
                "messages": [{"role": "user", "content": "quiz me"}],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["response"] == "(Use /chat/stream for streaming)"
        assert len(data["artifacts"]) == 1
        assert data["artifacts"][0]["type"] == "quiz"
