"""Study Recipe Engine — defines structured learning recipes and recipe selection policy."""

from typing import Dict, List, Literal, Optional
from pydantic import BaseModel, Field

RecipeName = Literal["NEW_TOPIC", "WEAK_TOPIC", "MEMORY_REPAIR", "EXAM_TOMORROW"]


class RecipeStep(BaseModel):
    action: str
    rationale: str


RECIPES: Dict[RecipeName, List[RecipeStep]] = {
    "NEW_TOPIC": [
        RecipeStep(action="EXPLAIN", rationale="Introduce core mental models and foundational terminology."),
        RecipeStep(action="EXAMPLE", rationale="Provide concrete worked traces and application scenarios."),
        RecipeStep(action="PRACTICE", rationale="Check immediate understanding with a low-stakes scaffolded prompt."),
        RecipeStep(action="QUIZ", rationale="Consolidate recall and measure baseline retention."),
    ],
    "WEAK_TOPIC": [
        RecipeStep(action="ASSESS", rationale="Identify specific misconception boundaries and knowledge gaps."),
        RecipeStep(action="COMPARE", rationale="Contrast confused concepts side-by-side to clear ambiguities."),
        RecipeStep(action="PRACTICE", rationale="Guided problem solving with targeted hint feedback."),
        RecipeStep(action="RECALL", rationale="Active retrieval practice to reinforce corrected patterns."),
    ],
    "MEMORY_REPAIR": [
        RecipeStep(action="FLASHCARD", rationale="Rapid spaced-repetition review of decaying concept definitions."),
        RecipeStep(action="RECALL", rationale="Unassisted active recall to rebuild memory trace strength."),
        RecipeStep(action="APPLY", rationale="Transfer knowledge to a novel scenario to solidify retention."),
    ],
    "EXAM_TOMORROW": [
        RecipeStep(action="REVIEW", rationale="High-yield synthesis of major exam topics and formulas."),
        RecipeStep(action="QUIZ", rationale="Timed exam-level question simulation."),
        RecipeStep(action="REST", rationale="Prevent cognitive fatigue before the assessment."),
    ],
}


class RecipeSelector:
    @staticmethod
    def select_recipe(
        mastery_snapshot: Optional[Dict[str, float]],
        exam_proximity_days: Optional[int],
        misconception_active: bool = False,
    ) -> RecipeName:
        if exam_proximity_days is not None and exam_proximity_days <= 1:
            return "EXAM_TOMORROW"

        if misconception_active:
            return "WEAK_TOPIC"

        if not mastery_snapshot or mastery_snapshot.get("depth") is None:
            return "NEW_TOPIC"

        # Check for decaying or weak depth/problem_solving
        depth = mastery_snapshot.get("depth", 100.0)
        if depth is not None and depth < 50.0:
            return "WEAK_TOPIC"

        if mastery_snapshot.get("stale", False):
            return "MEMORY_REPAIR"

        return "NEW_TOPIC"
