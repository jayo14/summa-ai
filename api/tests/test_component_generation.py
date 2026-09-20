"""Tests for the component generation pipeline.

Covers the happy-path round trip (intent -> brief -> schema-validated
content -> ArtifactPayload), the bounded-retry-then-fallback path when the
LLM's output never validates, and the local template fallback on failure.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from pydantic import ValidationError

from app.models.components import GapAnalysisComponent, QuizComponent
from app.models.artifact import ArtifactPayload
from app.services.component_generation import (
    GenerationBrief,
    generate_component_payload,
)
from app.services.intent_extraction import UserIntent


def _intent(**overrides) -> UserIntent:
    defaults = dict(
        intent="quiz",
        activity_request="quiz",
        subject="Recursion",
        topic="base cases",
        learning_goal="assessment",
        raw_query="quiz me on recursion",
    )
    defaults.update(overrides)
    return UserIntent(**defaults)


class TestGenerateComponentPayloadRoundTrip:
    @pytest.mark.asyncio
    async def test_quiz_round_trips_through_generation_and_validation(self):
        quiz_data = {
            "title": "Recursion Quiz",
            "type": "quiz",
            "questions": [
                {
                    "id": "q1",
                    "question": "What stops recursion?",
                    "options": [
                        {"id": "opt1", "text": "A base case"},
                        {"id": "opt2", "text": "A loop"},
                        {"id": "opt3", "text": "A pointer"},
                        {"id": "opt4", "text": "A stack overflow"},
                    ],
                    "correct_answer": "A base case",
                    "explanation": "The base case halts further recursive calls.",
                }
            ],
        }

        with patch("app.services.google_ai.is_gemini_configured", return_value=True), patch(
            "app.services.google_ai.generate_gemini_json",
            return_value=quiz_data,
        ) as mock_gemini:
            payload = await generate_component_payload(
                "quiz", "quiz me on recursion", "context",
                intent=_intent(),
            )

        assert payload is not None
        assert payload.type == "quiz"
        assert payload.title == "Recursion Quiz"
        assert payload.data.type == "quiz"

        # SSE serialization shape — this is what actually streams to the frontend.
        serialized = payload.data.model_dump(by_alias=True, mode="json")
        assert serialized["questions"][0]["id"] == "q1"
        assert serialized["questions"][0]["options"] == ["A base case", "A loop", "A pointer", "A stack overflow"]
        assert serialized["questions"][0]["correctIndex"] == 0
        # Single LLM call (brief is derived from intent, not a separate call)
        assert mock_gemini.call_count == 1

    @pytest.mark.asyncio
    async def test_gap_analysis_round_trips(self):
        gap_data = {
            "title": "Gaps",
            "type": "gap-analysis",
            "gaps": [
                {
                    "id": "g1",
                    "topic": "Matrix multiplication",
                    "reason": "Needed for attention.",
                    "priority": "high",
                    "estTime": "45 min",
                }
            ],
        }

        with patch("app.services.google_ai.is_gemini_configured", return_value=True), patch(
            "app.services.google_ai.generate_gemini_json",
            return_value=gap_data,
        ):
            payload = await generate_component_payload(
                "gap-analysis", "what am I missing", "context",
                intent=_intent(intent="assess", activity_request="assess"),
            )

        assert payload is not None
        assert payload.data.gaps[0].priority == "high"


class TestGenerateComponentPayloadFallback:
    @pytest.mark.asyncio
    async def test_validation_failure_triggers_local_fallback(self):
        """When LLM returns invalid data, the local template builder
        should still produce a valid, subject-appropriate component."""
        bad_quiz_data = {"title": "bad", "type": "quiz", "questions": []}

        with patch("app.services.google_ai.is_gemini_configured", return_value=True), patch(
            "app.services.google_ai.generate_gemini_json",
            return_value=bad_quiz_data,
        ):
            payload = await generate_component_payload(
                "quiz", "quiz me", "context",
                intent=_intent(),
            )

        # Local fallback should kick in and produce a valid payload
        assert payload is not None
        assert payload.type == "quiz"
        assert len(payload.data.questions) > 0

    @pytest.mark.asyncio
    async def test_network_failure_triggers_local_fallback(self):
        """When the LLM is unreachable, local templates should still produce
        a valid component so the frontend renders something real."""
        with patch("app.services.google_ai.is_gemini_configured", return_value=True), patch(
            "app.services.google_ai.generate_gemini_json",
            side_effect=ConnectionError("Gemini unreachable"),
        ):
            payload = await generate_component_payload(
                "flashcards", "make flashcards", "context",
                intent=_intent(subject="Languages", raw_query="flashcards"),
            )

        assert payload is not None
        assert payload.type == "flashcards"
        assert len(payload.data.cards) > 0

    @pytest.mark.asyncio
    async def test_unknown_component_type_returns_none(self):
        payload = await generate_component_payload(
            "not-a-real-type", "query", "context",
            intent=_intent(),
        )
        assert payload is None

    @pytest.mark.asyncio
    async def test_max_attempts_defaults_to_one(self):
        """Component generation must attempt the LLM exactly once, with no
        retry loops that block the chat. Local fallback provides the component."""
        call_count = 0

        async def flaky_gemini(**kwargs):
            nonlocal call_count
            call_count += 1
            raise ConnectionError("always fails")

        with patch("app.services.model_router.model_router.generate_json", side_effect=flaky_gemini):
            payload = await generate_component_payload(
                "quiz", "quiz me", "context",
                intent=_intent(),
                max_attempts=1,
            )

        # Local fallback succeeds
        assert payload is not None
        assert payload.type == "quiz"
        # Exactly one LLM call — no unbounded retries
        assert call_count == 1


class TestLocalComponentFallback:
    """When LLM generation fails, the local template builder should
    still produce a valid component for standard types."""

    @pytest.mark.asyncio
    async def test_local_fallback_quiz_on_philosophy(self):
        from app.services.local_component_builder import build_local_component

        intent = UserIntent(
            intent="quiz",
            activity_request="quiz",
            subject="Philosophy",
            topic=None,
            learning_goal="assessment",
            raw_query="Quiz me on Philosophy",
        )
        payload = build_local_component("quiz", intent)
        assert payload is not None
        assert payload.type == "quiz"
        assert payload.data.type == "quiz"
        # Questions must be about Philosophy, not Java/programming
        for q in payload.data.questions:
            assert "java" not in q.question.lower()
            assert "compile-time" not in q.question.lower()
            assert "overloading" not in q.question.lower()

    @pytest.mark.asyncio
    async def test_local_fallback_quiz_on_physics(self):
        from app.services.local_component_builder import build_local_component

        intent = UserIntent(
            intent="quiz",
            activity_request="quiz",
            subject="Physics",
            topic="Newton's Laws",
            learning_goal="assessment",
            raw_query="Quiz me on Newton's Laws",
        )
        payload = build_local_component("quiz", intent)
        assert payload is not None
        # Must be about physics, not programming
        for q in payload.data.questions:
            assert "java" not in q.question.lower()
            assert "polymorphism" not in q.question.lower()
