"""Tests for Pydantic models — validation, defaults, and edge cases."""

import pytest
from pydantic import ValidationError
from app.models.chat import ChatMessage, ChatRequest, ArtifactRef, ChatResponse
from app.models.user import (
    User,
    UserUpdate,
    UserSettings,
    UserSettingsUpdate,
    AuthLoginRequest,
    AuthLoginResponse,
)
from app.models.memory import (
    RememberTextRequest,
    RememberExamRequest,
    RememberArtifactRequest,
    RememberProgressRequest,
    RememberConversationRequest,
    RecallRequest,
    RecallGraphRequest,
    FeedbackRequest,
    ForgetRequest,
    CreateSessionRequest,
    SessionContextRequest,
)
from app.models.artifact import ArtifactCreate, ArtifactUpdate, ArtifactVersionRestore
from app.models.timeline import (
    TimelineEventCreate,
    MaterialCreate,
    ConceptCreate,
)


class TestChatModels:
    def test_chat_message_valid(self):
        msg = ChatMessage(role="user", content="Hello")
        assert msg.role == "user"
        assert msg.content == "Hello"

    def test_chat_request_defaults(self):
        req = ChatRequest(
            user_id="u1", messages=[ChatMessage(role="user", content="Hi")]
        )
        assert req.enable_thinking is True
        assert req.conversation_id is None

    def test_chat_request_allows_empty_messages(self):
        req = ChatRequest(user_id="u1", messages=[])
        assert req.messages == []

    def test_chat_response_defaults(self):
        resp = ChatResponse(response="Hi")
        assert resp.artifacts == []
        assert resp.conversation_id is None


class TestUserModels:
    def test_user_defaults(self):
        user = User(id="u1", email="a@b.com")
        assert user.onboarded is False
        assert user.onboarding_data == {}

    def test_user_update_partial(self):
        update = UserUpdate(name="Alice")
        assert update.name == "Alice"
        assert update.email is None

    def test_auth_login_request_defaults(self):
        req = AuthLoginRequest(email="a@b.com", password="pass")
        assert req.provider == "credentials"
        assert req.name is None


class TestMemoryModels:
    def test_remember_text_defaults(self):
        req = RememberTextRequest(text="hello")
        assert req.dataset_name == "main"
        assert req.metadata is None

    def test_remember_exam_accepts_empty_strings(self):
        req = RememberExamRequest(course_name="", exam_type="", date="")
        assert req.course_name == ""

    def test_feedback_score_bounds(self):
        req = FeedbackRequest(session_id="s1", score=5, text="good")
        assert req.score == 5

    def test_forget_request_defaults(self):
        req = ForgetRequest(topic="loops")
        assert req.dataset_name == "main"
        assert req.memory_only is False


class TestArtifactModels:
    def test_artifact_create_defaults(self):
        req = ArtifactCreate(
            title="Notes", type="notes", component=None, source="upload"
        )
        assert req.source == "upload"
        assert req.parent_artifact_id is None

    def test_artifact_update_partial(self):
        req = ArtifactUpdate(title="New title")
        assert req.title == "New title"
        assert req.archived is None


class TestTimelineModels:
    def test_timeline_event_create(self):
        req = TimelineEventCreate(type="milestone", title="Win", description="Done")
        assert req.metadata is None

    def test_material_create_accepts_empty_source(self):
        req = MaterialCreate(type="pdf", title="Notes", source="")
        assert req.source == ""

    def test_concept_create_defaults(self):
        req = ConceptCreate(name="Polymorphism", category="oop")
        assert req.mastery == "learning"
        assert req.related_count == 0
