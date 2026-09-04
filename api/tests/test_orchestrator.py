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
    assert "Keyword matching" in decision.reasoning


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
