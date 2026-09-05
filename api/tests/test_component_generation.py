"""Tests for the two-call structured-output pipeline (Phase 1: dynamic UI
schema contract). Covers the happy-path round trip (brief -> schema-validated
content -> ArtifactPayload) and the retry-then-fallback path when the LLM's
output never validates."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from pydantic import ValidationError

from app.models.components import GapAnalysisComponent, QuizComponent
from app.services.component_generation import (
    GenerationBrief,
    generate_component_payload,
)


def _fake_instructor_client(create_side_effect):
    client = MagicMock()
    client.chat.completions.create = AsyncMock(side_effect=create_side_effect)
    return client


class TestGenerateComponentPayloadRoundTrip:
    @pytest.mark.asyncio
    async def test_quiz_round_trips_through_generation_and_validation(self):
        brief_data = {"topic": "Recursion", "focus": "base cases"}
        quiz_data = {
            "title": "Recursion Quiz",
            "type": "quiz",
            "questions": [
                {
                    "id": "q1",
                    "question": "What stops recursion?",
                    "options": ["A base case", "A loop", "A pointer", "A stack overflow"],
                    "correctIndex": 0,
                    "explanation": "The base case halts further recursive calls.",
                }
            ],
        }

        with patch("app.services.google_ai.is_gemini_configured", return_value=True), patch(
            "app.services.google_ai.generate_gemini_json",
            side_effect=[brief_data, quiz_data],
        ) as mock_gemini:
            payload = await generate_component_payload(
                "quiz", "quiz me on recursion", "context: student studies recursion"
            )

        assert payload is not None
        assert payload.type == "quiz"
        assert payload.title == "Recursion Quiz"
        assert payload.data.type == "quiz"

        # SSE serialization shape — this is what actually streams to the frontend.
        serialized = payload.data.model_dump(by_alias=True, mode="json")
        assert serialized["questions"][0]["id"] == "q1"
        assert serialized["questions"][0]["correctIndex"] == 0
        assert mock_gemini.call_count == 2

    @pytest.mark.asyncio
    async def test_gap_analysis_round_trips(self):
        brief_data = {"topic": "Prerequisites"}
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
            side_effect=[brief_data, gap_data],
        ):
            payload = await generate_component_payload(
                "gap-analysis", "what am I missing", "context"
            )

        assert payload is not None
        assert payload.data.gaps[0].priority == "high"


class TestGenerateComponentPayloadFallback:
    @pytest.mark.asyncio
    async def test_validation_failure_after_retries_returns_none_not_raise(self):
        brief_data = {"topic": "Recursion"}
        bad_quiz_data = {"title": "bad", "type": "quiz", "questions": []}

        with patch("app.services.google_ai.is_gemini_configured", return_value=True), patch(
            "app.services.google_ai.generate_gemini_json",
            side_effect=[brief_data, bad_quiz_data],
        ):
            payload = await generate_component_payload(
                "quiz", "quiz me", "context"
            )

        assert payload is None

    @pytest.mark.asyncio
    async def test_network_failure_returns_none_not_raise(self):
        with patch("app.services.google_ai.is_gemini_configured", return_value=True), patch(
            "app.services.google_ai.generate_gemini_json",
            side_effect=ConnectionError("Gemini unreachable"),
        ):
            payload = await generate_component_payload(
                "flashcards", "make flashcards", "context"
            )

        assert payload is None

    @pytest.mark.asyncio
    async def test_unknown_component_type_returns_none(self):
        payload = await generate_component_payload(
            "not-a-real-type", "query", "context"
        )
        assert payload is None

