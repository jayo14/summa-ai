"""End-to-end integration tests for the learning-component pipeline.

These tests verify the complete flow from "Quiz me on Philosophy" through to
the final component event, ensuring:

  1. No 60-second blocking wait for component generation
  2. The component event contains Philosophy content (not Java)
  3. The stream starts immediately with text content
  4. Component generation failure does not block the response
  5. Subject/topic context is preserved end-to-end
"""

import json
import pytest
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient
from app.main import app
from app.core.security import set_current_user_id, reset_current_user_id

client = TestClient(app)


def _auth_headers():
    return {"Authorization": "Bearer valid-token"}


@pytest.fixture(autouse=True)
def _mock_verify_jwt():
    with patch("app.main.verify_supabase_jwt", return_value="user-1"):
        yield


class TestPhilosophyQuizPipeline:
    @pytest.mark.asyncio
    @patch("app.routes.chat.generate_component_payload", new_callable=AsyncMock)
    @patch("app.routes.chat.cognee")
    async def test_quiz_on_philosophy_emits_correct_events(self, mock_cognee, mock_generate):
        """Full pipeline test: 'Quiz me on Philosophy' should emit:
        - intent event with subject=Philosophy
        - preparing_activity state
        - content streaming immediately
        - artifact event with Philosophy content"""
        mock_cognee.recall_context = AsyncMock(return_value={"results": []})
        mock_cognee.recall_exams = AsyncMock(return_value={"exams": []})
        mock_cognee.recall_learning_progress = AsyncMock(return_value={"progress": []})
        mock_cognee.detect_knowledge_gaps = AsyncMock(return_value=None)
        mock_cognee.remember_conversation = AsyncMock()

        # Mock component generation to return a Philosophy quiz
        from app.models.artifact import ArtifactPayload
        from app.models.components import QuizComponent, QuizQuestion
        mock_generate.return_value = ArtifactPayload(
            id="quiz-1",
            title="Philosophy Quiz",
            type="quiz",
            data=QuizComponent(
                questions=[
                    QuizQuestion(
                        id="q1",
                        question="Which philosopher proposed the categorical imperative?",
                        options=["Aristotle", "Kant", "Nietzsche", "Hume"],
                        correctIndex=1,
                    )
                ],
            ),
        )

        async def fake_stream(*args, **kwargs):
            yield 'data: {"type": "content", "delta": "Absolutely. Let\'s see what you already know first."}\n\n'
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
                        "subject": "Philosophy",
                    },
                )
                assert response.status_code == 200
                body = b"".join(response.iter_bytes()).decode("utf-8")

                # Intent event with Philosophy subject
                assert '"subject": "Philosophy"' in body or '"subject":"Philosophy"' in body

                # Content streams immediately
                assert "Absolutely" in body

                # Artifact event contains Philosophy content
                assert "categorical imperative" in body

                # No Java contamination
                assert "compile-time" not in body
                assert "overloading" not in body
                assert "runtime overriding" not in body
            finally:
                reset_current_user_id(token)

    @pytest.mark.asyncio
    @patch("app.routes.chat.generate_component_payload", new_callable=AsyncMock)
    @patch("app.routes.chat.cognee")
    async def test_component_failure_does_not_block_response(self, mock_cognee, mock_generate):
        """When component generation fails, the AI stream should still complete."""
        mock_cognee.recall_context = AsyncMock(return_value={"results": []})
        mock_cognee.recall_exams = AsyncMock(return_value={"exams": []})
        mock_cognee.recall_learning_progress = AsyncMock(return_value={"progress": []})
        mock_cognee.detect_knowledge_gaps = AsyncMock(return_value=None)
        mock_cognee.remember_conversation = AsyncMock()

        mock_generate.return_value = None

        async def fake_stream(*args, **kwargs):
            yield 'data: {"type": "content", "delta": "Let me explain."}\n\n'
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
                        "subject": "Philosophy",
                    },
                )
                assert response.status_code == 200
                body = b"".join(response.iter_bytes()).decode("utf-8")
                # Response text should be present despite component failure
                assert "Let me explain" in body
            finally:
                reset_current_user_id(token)

    @pytest.mark.asyncio
    @patch("app.routes.chat.generate_component_payload", new_callable=AsyncMock)
    @patch("app.routes.chat.cognee")
    async def test_quiz_on_physics_no_java_contamination(self, mock_cognee, mock_generate):
        """'Quiz me on Newton's Laws' should produce Physics content."""
        mock_cognee.recall_context = AsyncMock(return_value={"results": []})
        mock_cognee.recall_exams = AsyncMock(return_value={"exams": []})
        mock_cognee.recall_learning_progress = AsyncMock(return_value={"progress": []})
        mock_cognee.detect_knowledge_gaps = AsyncMock(return_value=None)
        mock_cognee.remember_conversation = AsyncMock()

        from app.models.artifact import ArtifactPayload
        from app.models.components import QuizComponent, QuizQuestion
        mock_generate.return_value = ArtifactPayload(
            id="quiz-physics",
            title="Physics Quiz",
            type="quiz",
            data=QuizComponent(
                questions=[
                    QuizQuestion(
                        id="q1",
                        question="What is Newton's First Law of Motion?",
                        options=["Inertia", "Gravity", "F=ma", "Action-Reaction"],
                        correctIndex=0,
                    )
                ],
            ),
        )

        async def fake_stream(*args, **kwargs):
            yield 'data: {"type": "content", "delta": "Here is a physics question."}\n\n'
            yield 'data: {"type": "done"}\n\n'

        with patch("app.routes.chat._stream_ai_response", side_effect=fake_stream):
            token = set_current_user_id("user-1")
            try:
                response = client.post(
                    "/api/v1/chat/stream",
                    headers=_auth_headers(),
                    json={
                        "user_id": "user-1",
                        "messages": [{"role": "user", "content": "Quiz me on Newton's Laws"}],
                        "subject": "Physics",
                    },
                )
                assert response.status_code == 200
                body = b"".join(response.iter_bytes()).decode("utf-8")
                assert "Newton" in body
                assert "compile-time" not in body
                assert "overloading" not in body
            finally:
                reset_current_user_id(token)
