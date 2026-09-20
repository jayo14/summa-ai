"""Tests for the complete study recipe engine — 7 pedagogical recipes."""

import pytest
from app.services.study_recipes import (
    RECIPES,
    RecipeSelector,
    RecipeName,
)


class TestRecipeDefinitions:
    def test_all_seven_recipes_exist(self):
        expected = {
            "NEW_TOPIC", "WEAK_TOPIC", "MEMORY_REPAIR", "EXAM_PREPARATION",
            "EXAM_TOMORROW", "STUDENT_STRUGGLING", "STUDENT_ADVANCED",
        }
        assert set(RECIPES.keys()) == expected

    def test_all_recipes_have_steps(self):
        for name, steps in RECIPES.items():
            assert len(steps) >= 3, f"{name} has fewer than 3 steps"
            for step in steps:
                assert step.action, f"{name} has a step with no action"
                assert step.rationale, f"{name} has a step with no rationale"

    def test_exam_tomorrow_has_final_readiness(self):
        actions = [s.action for s in RECIPES["EXAM_TOMORROW"]]
        assert "FINAL_READABILITY" in actions or "FINAL_READINESS" in actions

    def test_student_struggling_starts_with_reduce(self):
        assert RECIPES["STUDENT_STRUGGLING"][0].action == "REDUCE_DIFFICULTY"

    def test_student_advanced_starts_with_reduce_explanation(self):
        assert RECIPES["STUDENT_ADVANCED"][0].action == "REDUCE_EXPLANATION"


class TestRecipeSelector:
    def test_exam_tomorrow_priority(self):
        assert RecipeSelector.select_recipe(exam_proximity_days=0) == "EXAM_TOMORROW"
        assert RecipeSelector.select_recipe(exam_proximity_days=1) == "EXAM_TOMORROW"

    def test_exam_preparation_window(self):
        assert RecipeSelector.select_recipe(exam_proximity_days=3) == "EXAM_PREPARATION"
        assert RecipeSelector.select_recipe(exam_proximity_days=7) == "EXAM_PREPARATION"

    def test_misconception_triggers_weak_topic(self):
        assert RecipeSelector.select_recipe(misconception_active=True) == "WEAK_TOPIC"

    def test_consecutive_failures_trigger_struggling(self):
        assert RecipeSelector.select_recipe(consecutive_failures=3) == "STUDENT_STRUGGLING"
        assert RecipeSelector.select_recipe(consecutive_failures=5) == "STUDENT_STRUGGLING"

    def test_consecutive_successes_trigger_advanced(self):
        assert RecipeSelector.select_recipe(
            mastery_snapshot={"depth": 85},
            consecutive_successes=3,
        ) == "STUDENT_ADVANCED"

    def test_low_mastery_triggers_weak_topic(self):
        assert RecipeSelector.select_recipe(mastery_snapshot={"depth": 30}) == "WEAK_TOPIC"

    def test_stale_mastery_triggers_memory_repair(self):
        assert RecipeSelector.select_recipe(mastery_snapshot={"depth": 60, "stale": True}) == "MEMORY_REPAIR"

    def test_no_mastery_triggers_new_topic(self):
        assert RecipeSelector.select_recipe(mastery_snapshot=None) == "NEW_TOPIC"
        assert RecipeSelector.select_recipe(mastery_snapshot={}) == "NEW_TOPIC"

    def test_default_is_new_topic(self):
        assert RecipeSelector.select_recipe(mastery_snapshot={"depth": 70}) == "NEW_TOPIC"


class TestGetNextStep:
    def test_returns_first_step(self):
        step = RecipeSelector.get_next_step("NEW_TOPIC", 0)
        assert step is not None
        assert step.action == "DIAGNOSTIC"

    def test_returns_none_when_complete(self):
        steps = RECIPES["MEMORY_REPAIR"]
        step = RecipeSelector.get_next_step("MEMORY_REPAIR", len(steps))
        assert step is None

    def test_iterates_through_recipe(self):
        recipe = "STUDENT_STRUGGLING"
        steps = RECIPES[recipe]
        for i in range(len(steps)):
            step = RecipeSelector.get_next_step(recipe, i)
            assert step is not None
            assert step.action == steps[i].action
