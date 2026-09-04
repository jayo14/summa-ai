"""Tests for Phase 2: Study Recipes, Adaptive Difficulty, and Misconception Engine."""

from unittest.mock import patch
import pytest
from app.services.mastery_engine import MasteryEngine
from app.services.misconception_engine import MisconceptionEngine
from app.services.orchestrator import LearningOrchestrator
from app.services.study_recipes import RecipeSelector


def test_recipe_selector_policy_branching():
    # Exam in 1 day selects EXAM_TOMORROW
    r_exam = RecipeSelector.select_recipe(mastery_snapshot={"depth": 80.0}, exam_proximity_days=1)
    assert r_exam == "EXAM_TOMORROW"

    # Misconception active selects WEAK_TOPIC
    r_misc = RecipeSelector.select_recipe(mastery_snapshot={"depth": 80.0}, exam_proximity_days=10, misconception_active=True)
    assert r_misc == "WEAK_TOPIC"

    # None mastery snapshot selects NEW_TOPIC
    r_new = RecipeSelector.select_recipe(mastery_snapshot=None, exam_proximity_days=10)
    assert r_new == "NEW_TOPIC"


@pytest.mark.asyncio
async def test_misconception_engine_persistence_and_occurrences():
    engine = MisconceptionEngine()
    user_id = "user-misc-test"
    concept = "con-polymorphism-overriding"
    desc = "Confuses method overriding signature with method overloading"

    m1 = await engine.record_misconception(user_id, concept, desc, confidence="high")
    assert m1["occurrences"] == 1

    m2 = await engine.record_misconception(user_id, concept, desc, confidence="high")
    assert m2["occurrences"] == 2

    active = await engine.get_active_misconceptions(user_id)
    assert len(active) == 1
    assert active[0]["occurrences"] == 2
    assert active[0]["concept_id"] == concept


@pytest.mark.asyncio
async def test_adaptive_difficulty_adjustment_and_overrides():
    user_id = "user-adaptive-diff"
    mastery_engine = MasteryEngine()

    # Seed 3 consecutive correct attempts
    for i in range(3):
        await mastery_engine.record_attempt(user_id, f"act-{i}", ["con-math"], True)

    orchestrator = LearningOrchestrator()
    with patch("app.services.mastery_engine.MasteryEngine", return_value=mastery_engine):
        decision = await orchestrator.decide_next_action(user_id, "make it harder")
        assert decision.suggested_difficulty == "hard"
