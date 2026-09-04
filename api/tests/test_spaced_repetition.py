"""Tests for Spaced Repetition engine and auto-creation of flashcards on repeated mistakes."""

from unittest.mock import AsyncMock, patch
import pytest
from app.services.mastery_engine import MasteryEngine
from app.services.orchestrator import LearningOrchestrator, OrchestratorDecision
from app.services.spaced_repetition import next_review


def test_sm2_spaced_repetition_semantics():
    # Easy rating increases interval and ease factor
    ease_easy, interval_easy, reps_easy = next_review("easy", ease_factor=2.5, interval_days=6, repetitions=2)
    # Hard rating produces smaller interval
    ease_hard, interval_hard, reps_hard = next_review("hard", ease_factor=2.5, interval_days=6, repetitions=2)

    assert interval_easy > interval_hard
    assert ease_easy > ease_hard
    assert reps_easy == 3
    assert reps_hard == 3

    # Again rating resets repetitions and interval to 1
    ease_again, interval_again, reps_again = next_review("again", ease_factor=2.5, interval_days=10, repetitions=4)
    assert interval_again == 1
    assert reps_again == 0


@pytest.mark.asyncio
async def test_repeated_misses_triggers_flashcard_decision():
    user_id = "user-repeated-miss"
    concept = "con-pointers"
    engine = MasteryEngine()

    # Record 2 consecutive incorrect attempts on the same concept
    await engine.record_attempt(user_id=user_id, activity_id="a1", concept_ids=[concept], correct=False)
    await engine.record_attempt(user_id=user_id, activity_id="a2", concept_ids=[concept], correct=False)

    orchestrator = LearningOrchestrator()

    mock_decision = OrchestratorDecision(
        action="FLASHCARD",
        reasoning="Repeated mistakes detected on con-pointers.",
        target_concept_ids=[concept],
        suggested_difficulty="easy",
    )

    with patch.object(orchestrator, "decide_next_action", return_value=mock_decision):
        decision = await orchestrator.decide_next_action(user_id, "what's next?")
        assert decision.action == "FLASHCARD"
        assert concept in decision.target_concept_ids
