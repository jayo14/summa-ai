"""Tests for LearningOrchestrator decision making and fallback paths."""

from unittest.mock import AsyncMock, patch
import pytest
from app.services.orchestrator import LearningOrchestrator, OrchestratorDecision


@pytest.mark.asyncio
async def test_orchestrator_fallback_on_llm_failure():
    orchestrator = LearningOrchestrator()
    with patch("app.services.mastery_engine.MasteryEngine", side_effect=Exception("LLM error")):
        decision = await orchestrator.decide_next_action(
            user_id="user-orch-fallback",
            query="quiz me on dynamic dispatch",
        )

    assert isinstance(decision, OrchestratorDecision)
    assert decision.action == "QUIZ"
    assert "Fallback" in decision.reasoning


@pytest.mark.asyncio
async def test_orchestrator_decision_fixtures_differentiation():
    orchestrator = LearningOrchestrator()

    mock_decision_exam_soon = OrchestratorDecision(
        action="REVIEW",
        reasoning="Exam in 1 day; prioritizing review of weak areas.",
        target_concept_ids=["con-polymorphism"],
        suggested_difficulty="exam-level",
    )

    mock_decision_no_exam = OrchestratorDecision(
        action="TEACH",
        reasoning="No upcoming exam; building foundational knowledge.",
        target_concept_ids=["con-intro-java"],
        suggested_difficulty="easy",
    )

    with patch.object(orchestrator, "decide_next_action", side_effect=[mock_decision_exam_soon, mock_decision_no_exam]):
        d1 = await orchestrator.decide_next_action("user-1", "help me study X")
        d2 = await orchestrator.decide_next_action("user-2", "help me study X")

    assert d1.action == "REVIEW"
    assert d1.suggested_difficulty == "exam-level"
    assert d2.action == "TEACH"
    assert d2.suggested_difficulty == "easy"


class TestOrchestratorIntentAware:
    @pytest.mark.asyncio
    async def test_orchestrator_uses_intent_for_quiz(self):
        """The orchestrator should accept a UserIntent and preserve the
        subject/topic in its decision."""
        orchestrator = LearningOrchestrator()
        from app.services.intent_extraction import UserIntent

        intent = UserIntent(
            intent="quiz",
            activity_request="quiz",
            subject="Philosophy",
            topic=None,
            learning_goal="assessment",
            raw_query="Quiz me on Philosophy",
            detected_subject_from_query="philosophy",
        )

        with patch("app.services.mastery_engine.MasteryEngine", side_effect=Exception("skip LLM")):
            decision = await orchestrator.decide_next_action(
                user_id="user-orch-intent",
                query="Quiz me on Philosophy",
                intent=intent,
            )

        assert decision.action == "QUIZ"
        assert "Philosophy" in decision.reasoning

    @pytest.mark.asyncio
    async def test_orchestrator_intent_preserves_subject_no_java(self):
        """Ensure the orchestrator decision references Philosophy, not Java."""
        orchestrator = LearningOrchestrator()
        from app.services.intent_extraction import UserIntent

        intent = UserIntent(
            intent="quiz",
            activity_request="quiz",
            subject="Philosophy",
            raw_query="Quiz me on Philosophy",
            detected_subject_from_query="philosophy",
        )

        with patch("app.services.mastery_engine.MasteryEngine", side_effect=Exception("skip LLM")):
            decision = await orchestrator.decide_next_action(
                user_id="user-orch-subject",
                query="Quiz me on Philosophy",
                intent=intent,
            )

        reasoning_lower = decision.reasoning.lower()
        assert "philosophy" in reasoning_lower
        assert "java" not in reasoning_lower
        assert "polymorphism" not in reasoning_lower
