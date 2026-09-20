"""Study Recipe Engine — defines structured learning recipes and recipe selection policy.

Seven pedagogical recipes matching the Master Prompt (Section 8):
1. NEW_TOPIC — Diagnostic → Explanation → Example → Retrieval → Practice → Summary
2. WEAK_TOPIC — Misconception Diagnosis → Alternative Explanation → Analogy → Worked Example → Practice → Reassessment
3. MEMORY_REPAIR — Free Recall → Flashcard → Retrieval → Interleaving → Delayed Retrieval
4. EXAM_PREPARATION — Diagnostic → High-Yield → Weakness Detection → Exam Questions → Error Correction → Timed Assessment
5. EXAM_TOMORROW — Rapid Diagnostic → Priority Ranking → High-Yield Revision → Targeted Retrieval → Past-Q Patterns → Predicted Practice → Final Readiness
6. STUDENT_STRUGGLING — Reduce Difficulty → Simplify → Worked Example → Guided Question → Immediate Feedback → Confidence Restoration → Gradual Increase
7. STUDENT_ADVANCED — Reduce Explanation → Increase Difficulty → Application → Novel Scenario → Open-Ended Reasoning → Exam Challenge
"""

from __future__ import annotations

from typing import Dict, List, Literal, Optional
from pydantic import BaseModel, Field

RecipeName = Literal[
    "NEW_TOPIC",
    "WEAK_TOPIC",
    "MEMORY_REPAIR",
    "EXAM_PREPARATION",
    "EXAM_TOMORROW",
    "STUDENT_STRUGGLING",
    "STUDENT_ADVANCED",
]


class RecipeStep(BaseModel):
    action: str
    rationale: str


RECIPES: Dict[RecipeName, List[RecipeStep]] = {
    "NEW_TOPIC": [
        RecipeStep(action="DIAGNOSTIC", rationale="Gauge baseline understanding with a short diagnostic."),
        RecipeStep(action="EXPLAIN", rationale="Introduce core mental models and foundational terminology."),
        RecipeStep(action="EXAMPLE", rationale="Provide concrete worked traces and application scenarios."),
        RecipeStep(action="RETRIEVAL", rationale="Low-stakes retrieval to check immediate comprehension."),
        RecipeStep(action="GUIDED_PRACTICE", rationale="Scaffolded problem solving with hints."),
        RecipeStep(action="INDEPENDENT_PRACTICE", rationale="Independent questions to consolidate learning."),
        RecipeStep(action="SUMMARY", rationale="Synthesize key takeaways and set next focus."),
    ],
    "WEAK_TOPIC": [
        RecipeStep(action="MISCONCEPTION_DIAGNOSIS", rationale="Identify the specific misconception and its boundaries."),
        RecipeStep(action="ALTERNATIVE_EXPLANATION", rationale="Reframe the concept using a different angle."),
        RecipeStep(action="ANALOGY", rationale="Map the abstract concept to a concrete analogy."),
        RecipeStep(action="WORKED_EXAMPLE", rationale="Step-by-step walkthrough of correct reasoning."),
        RecipeStep(action="GUIDED_PRACTICE", rationale="Targeted practice with immediate corrective feedback."),
        RecipeStep(action="INDEPENDENT_PRACTICE", rationale="Independent application to verify correction."),
        RecipeStep(action="REASSESSMENT", rationale="Re-assess to confirm the misconception is resolved."),
    ],
    "MEMORY_REPAIR": [
        RecipeStep(action="FREE_RECALL", rationale="Unprompted recall to surface weak memory traces."),
        RecipeStep(action="FLASHCARD", rationale="Spaced-repetition flashcard review of decaying definitions."),
        RecipeStep(action="RETRIEVAL", rationale="Active retrieval to rebuild trace strength."),
        RecipeStep(action="INTERLEAVING", rationale="Mix topics to strengthen discrimination."),
        RecipeStep(action="DELAYED_RETRIEVAL", rationale="Time-shifted recall to promote long-term retention."),
    ],
    "EXAM_PREPARATION": [
        RecipeStep(action="DIAGNOSTIC", rationale="Identify current readiness across all exam topics."),
        RecipeStep(action="HIGH_YIELD_CONCEPTS", rationale="Focus on most frequently tested concepts."),
        RecipeStep(action="WEAKNESS_DETECTION", rationale="Isolate specific gaps for targeted repair."),
        RecipeStep(action="EXAM_QUESTIONS", rationale="Practice exam-style questions at realistic difficulty."),
        RecipeStep(action="ERROR_CORRECTION", rationale="Review mistakes and build correction strategies."),
        RecipeStep(action="SIMILAR_PRACTICE", rationale="Generate structurally similar questions for reinforcement."),
        RecipeStep(action="TIMED_ASSESSMENT", rationale="Simulate timed exam conditions for readiness."),
    ],
    "EXAM_TOMORROW": [
        RecipeStep(action="RAPID_DIAGNOSTIC", rationale="Quick check of highest-yield topics only."),
        RecipeStep(action="PRIORITY_RANKING", rationale="Rank topics by exam frequency × current weakness."),
        RecipeStep(action="HIGH_YIELD_REVISION", rationale="Rapid review of critical formulas, definitions, and patterns."),
        RecipeStep(action="TARGETED_RETRIEVAL", rationale="Focused retrieval on weakest high-priority topics."),
        RecipeStep(action="PAST_QUESTION_PATTERNS", rationale="Analyze recurring past question structures."),
        RecipeStep(action="PREDICTED_PRACTICE", rationale="Generate predicted questions based on historical patterns."),
        RecipeStep(action="WEAKNESS_REPAIR", rationale="Final targeted repair of remaining weak spots."),
        RecipeStep(action="FINAL_READINESS", rationale="Confidence check and strategic exam advice."),
    ],
    "STUDENT_STRUGGLING": [
        RecipeStep(action="REDUCE_DIFFICULTY", rationale="Step down to accessible baseline difficulty."),
        RecipeStep(action="SIMPLIFY_EXPLANATION", rationale="Use plain language, avoid jargon, add visual anchors."),
        RecipeStep(action="WORKED_EXAMPLE", rationale="Provide a fully worked solution to model correct reasoning."),
        RecipeStep(action="GUIDED_QUESTION", rationale="Ask a single guided question with heavy scaffolding."),
        RecipeStep(action="IMMEDIATE_FEEDBACK", rationale="Give instant corrective feedback after each attempt."),
        RecipeStep(action="CONFIDENCE_RESTORATION", rationale="Celebrate small wins to rebuild momentum."),
        RecipeStep(action="GRADUAL_DIFFICULTY_INCREASE", rationale="Slowly ramp difficulty as confidence returns."),
    ],
    "STUDENT_ADVANCED": [
        RecipeStep(action="REDUCE_EXPLANATION", rationale="Skip basics, jump straight to application."),
        RecipeStep(action="INCREASE_DIFFICULTY", rationale="Present challenging, multi-step problems."),
        RecipeStep(action="APPLICATION", rationale="Apply concepts to real-world or cross-domain contexts."),
        RecipeStep(action="NOVEL_SCENARIO", rationale="Present an unfamiliar scenario requiring transfer."),
        RecipeStep(action="OPEN_ENDED_REASONING", rationale="Require justification, not just correct answers."),
        RecipeStep(action="EXAM_CHALLENGE", rationale="Tackle exam-level questions for stretch goals."),
    ],
}


class RecipeSelector:
    """Selects the optimal study recipe based on learner state."""

    @staticmethod
    def select_recipe(
        mastery_snapshot: Optional[Dict[str, float]] = None,
        consecutive_failures: int = 0,
        consecutive_successes: int = 0,
        exam_proximity_days: Optional[int] = None,
        misconception_active: bool = False,
        available_minutes: Optional[int] = None,
    ) -> RecipeName:
        """Determine the best pedagogical recipe for the current learner state.

        Priority:
          1. Exam imminent (tomorrow) → EXAM_TOMORROW
          2. Exam approaching (≤7 days) → EXAM_PREPARATION
          3. Active misconception → WEAK_TOPIC
          4. Struggling (≥3 consecutive failures) → STUDENT_STRUGGLING
          5. Advanced (≥3 consecutive successes, mastery >80%) → STUDENT_ADVANCED
          6. Weak mastery (<50%) → WEAK_TOPIC
          7. Stale memory (>14 days) → MEMORY_REPAIR
          8. Default → NEW_TOPIC
        """
        if exam_proximity_days is not None:
            if exam_proximity_days <= 1:
                return "EXAM_TOMORROW"
            if exam_proximity_days <= 7:
                return "EXAM_PREPARATION"

        if misconception_active:
            return "WEAK_TOPIC"

        if consecutive_failures >= 3:
            return "STUDENT_STRUGGLING"

        if consecutive_successes >= 3:
            depth = (mastery_snapshot or {}).get("depth", 0)
            if depth > 80:
                return "STUDENT_ADVANCED"

        if not mastery_snapshot or mastery_snapshot.get("depth") is None:
            return "NEW_TOPIC"

        depth = mastery_snapshot.get("depth", 100.0)
        if depth is not None and depth < 50.0:
            return "WEAK_TOPIC"

        if mastery_snapshot.get("stale", False):
            return "MEMORY_REPAIR"

        return "NEW_TOPIC"

    @staticmethod
    def get_next_step(
        recipe_name: RecipeName,
        current_step_index: int = 0,
    ) -> Optional[RecipeStep]:
        """Return the next step in the recipe, or None if recipe is complete."""
        steps = RECIPES.get(recipe_name, [])
        if current_step_index < len(steps):
            return steps[current_step_index]
        return None
