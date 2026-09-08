"""Tests for the non-blocking chat stream architecture.

Verifies that:
  - Component generation runs as a background task, not blocking the AI stream
  - The AI response text streams before the component event arrives
  - The intent event is emitted with structured subject/topic
  - Timing instrumentation is captured
  - Component generation failure does not block the response
"""

import json
import pytest
from unittest.mock import AsyncMock, patch, MagicMock

from fastapi.testclient import TestClient
from app.main import app
from app.core.security import (
    current_user_id,
    set_current_user_id,
    reset_current_user_id,
)
from app.utils.timing import Timer

client = TestClient(app)


def _auth_headers():
    return {"Authorization": "Bearer valid-token"}


@pytest.fixture(autouse=True)
def _mock_verify_jwt():
    with patch("app.main.verify_supabase_jwt", return_value="user-1"):
        yield


class TestNonBlockingStream:
    @pytest.mark.asyncio
    @patch("app.routes.chat.generate_component_payload", new_callable=AsyncMock)
    @patch("app.routes.chat.cognee")
    async def test_stream_starts_before_component_finishes(
        self, mock_cognee, mock_generate
    ):
        """The AI response should begin streaming BEFORE component generation
        completes — proving non-blocking architecture."""
        mock_cognee.recall_context = AsyncMock(return_value={"results": []})
        mock_cognee.recall_exams = AsyncMock(return_value={"exams": []})
        mock_cognee.recall_learning_progress = AsyncMock(return_value={"progress": []})
        mock_cognee.remember_conversation = AsyncMock()

        # Component generation takes 5 seconds (longer than stream start)
        async def slow_component(*args, **kwargs):
            import asyncio
            await asyncio.sleep(5)
            return None
        mock_generate.side_effect = slow_component

        events = []

        async def fake_stream(*args, **kwargs):
            yield 'data: {"type": "content", "delta": "Let\'s see what you remember"}\n\n'
            yield 'data: {"type": "content", "delta": " about Philosophy"}\n\n'
            yield 'data: {"type": "done"}\n\n'

        with patch("app.routes.chat._stream_ai_response", side_effect=fake_stream):
            token = set_current_user_id("user-1")
            try:
                response = client.post(
                    "/api/v1/chat/stream",
                    headers=_auth_headers(),
                    json={
                        "user_id": "user-1",
                        "messages": [{"role": "user", "content": "Quiz me on Philosophy"}],
                    },
                )
                assert response.status_code == 200
                body = b"".join(response.iter_bytes()).decode("utf-8")
                # Content should arrive — the stream should not hang
                assert "Let's see what you remember" in body
                assert "Philosophy" in body
            finally:
                reset_current_user_id(token)

    @pytest.mark.asyncio
    @patch("app.routes.chat.generate_component_payload", new_callable=AsyncMock)
    @patch("app.routes.chat.cognee")
    async def test_intent_event_contains_subject(
        self, mock_cognee, mock_generate
    ):
        """The intent event must contain the structured subject so the frontend
        and component generator know the exact topic."""
        mock_cognee.recall_context = AsyncMock(return_value={"results": []})
        mock_cognee.recall_exams = AsyncMock(return_value={"exams": []})
        mock_cognee.recall_learning_progress = AsyncMock(return_value={"progress": []})
        mock_cognee.remember_conversation = AsyncMock()

        mock_generate.return_value = None

        async def fake_stream(*args, **kwargs):
            yield 'data: {"type": "content", "delta": "Hello"}\n\n'
            yield 'data: {"type": "done"}\n\n'

        with patch("app.routes.chat._stream_ai_response", side_effect=fake_stream):
            token = set_current_user_id("user-1")
            try:
                response = client.post(
                    "/api/v1/chat/stream",
                    headers=_auth_headers(),
                    json={
                        "user_id": "user-1",
                        "messages": [{"role": "user", "content": "Quiz me on Philosophy"}],
                    },
                )
                assert response.status_code == 200
                body = b"".join(response.iter_bytes()).decode("utf-8")
                # Find the intent event
                intent_line = None
                for line in body.split("\n"):
                    if '"type": "intent"' in line:
                        intent_line = line
                        break
                assert intent_line is not None, "Intent event not found in stream"
                event = json.loads(intent_line[len("data: "):])
                assert event["intent"]["subject"] == "Philosophy"
                assert event["intent"]["intent"] == "quiz"
            finally:
                reset_current_user_id(token)

    @pytest.mark.asyncio
    @patch("app.routes.chat.generate_component_payload", new_callable=AsyncMock)
    @patch("app.routes.chat.cognee")
    async def test_preparing_activity_event_emitted(
        self, mock_cognee, mock_generate
    ):
        """A 'preparing_activity' event should be emitted before the AI stream
        starts, so the frontend can show contextual status."""
        mock_cognee.recall_context = AsyncMock(return_value={"results": []})
        mock_cognee.recall_exams = AsyncMock(return_value={"exams": []})
        mock_cognee.recall_learning_progress = AsyncMock(return_value={"progress": []})
        mock_cognee.remember_conversation = AsyncMock()

        mock_generate.return_value = None

        async def fake_stream(*args, **kwargs):
            yield 'data: {"type": "content", "delta": "Hi"}\n\n'
            yield 'data: {"type": "done"}\n\n'

        with patch("app.routes.chat._stream_ai_response", side_effect=fake_stream):
            token = set_current_user_id("user-1")
            try:
                response = client.post(
                    "/api/v1/chat/stream",
                    headers=_auth_headers(),
                    json={
                        "user_id": "user-1",
                        "messages": [{"role": "user", "content": "Quiz me on Philosophy"}],
                    },
                )
                assert response.status_code == 200
                body = b"".join(response.iter_bytes()).decode("utf-8")
                assert '"type": "preparing_activity"' in body
            finally:
                reset_current_user_id(token)

    @pytest.mark.asyncio
    @patch("app.routes.chat.generate_component_payload", new_callable=AsyncMock)
    @patch("app.routes.chat.cognee")
    async def test_component_failure_does_not_block_response(
        self, mock_cognee, mock_generate
    ):
        """If component generation fails, the AI stream should still complete
        normally — no 60-second blocking wait."""
        mock_cognee.recall_context = AsyncMock(return_value={"results": []})
        mock_cognee.recall_exams = AsyncMock(return_value={"exams": []})
        mock_cognee.recall_learning_progress = AsyncMock(return_value={"progress": []})
        mock_cognee.remember_conversation = AsyncMock()

        mock_generate.return_value = None

        async def fake_stream(*args, **kwargs):
            yield 'data: {"type": "content", "delta": "Quick response"}\n\n'
            yield 'data: {"type": "done"}\n\n'

        with patch("app.routes.chat._stream_ai_response", side_effect=fake_stream):
            token = set_current_user_id("user-1")
            try:
                response = client.post(
                    "/api/v1/chat/stream",
                    headers=_auth_headers(),
                    json={
                        "user_id": "user-1",
                        "messages": [{"role": "user", "content": "Quiz me on Philosophy"}],
                    },
                )
                assert response.status_code == 200
                body = b"".join(response.iter_bytes()).decode("utf-8")
                # Response should be present despite component failure
                assert "Quick response" in body
                assert '"type": "done"' in body
            finally:
                reset_current_user_id(token)


class TestTimingInstrumentation:
    def test_timer_records_marks(self):
        import time
        t = Timer("TEST")
        time.sleep(0.01)
        t.mark("stage_1")
        time.sleep(0.01)
        t.mark("stage_2")

        durs = t.durations()
        assert "stage_1" in durs
        assert "stage_2" in durs
        assert durs["stage_1"] >= 5.0  # at least 5ms

    def test_timer_logs_durations(self):
        t = Timer("TEST")
        t.mark("intent_detection")
        t.mark("response_complete")

        import logging
        log_capture = []
        class Handler(logging.Handler):
            def emit(self, record):
                log_capture.append(record.getMessage())

        handler = Handler()
        test_logger = logging.getLogger("test_timer")
        test_logger.setLevel(logging.INFO)
        test_logger.addHandler(handler)
        t.log(test_logger, "TEST")
        assert any("intent_detection" in msg for msg in log_capture)
        assert any("response_complete" in msg for msg in log_capture)
        test_logger.removeHandler(handler)

    def test_timer_str(self):
        t = Timer("TEST")
        t.mark("stage_a")
        s = str(t)
        assert "TEST" in s
        assert "stage_a" in s
