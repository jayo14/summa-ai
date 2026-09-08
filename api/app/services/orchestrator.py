"""Learning Orchestrator — decides pedagogical next action for the student.

Vocabulary: TEACH, EXPLAIN, EXAMPLE, RECALL, FLASHCARD, QUIZ, PRACTICE, ASSESS,
REVIEW, COMPARE, APPLY, REFLECT, SIMULATE, PREDICT, PLAN, REST.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Dict as DictKey
import time as _time
from typing import List, Literal, Optional

from pydantic import BaseModel, Field

from app.services.intent_extraction import UserIntent

logger = logging.getLogger(__name__)

OrchestratorAction = Literal[
    "TEACH",
    "EXPLAIN",
    "EXAMPLE",
    "RECALL",
    "FLASHCARD",
    "QUIZ",
    "PRACTICE",
    "ASSESS",
    "REVIEW",
    "COMPARE",
    "APPLY",
    "REFLECT",
    "SIMULATE",
    "PREDICT",
    "PLAN",
    "REST",
]


class OrchestratorDecision(BaseModel):
    action: OrchestratorAction
    reasoning: str
    target_concept_ids: List[str] = Field(default_factory=list)
    suggested_difficulty: str = "medium"


# Circuit breaker state — when the LLM fails too many times, fall back
# to deterministic intent-based decisions without calling the LLM.
_MAX_LLM_FAILURES = 3
_failure_times: List[float] = []


def _is_circuit_open() -> bool:
    """Returns True if the orchestrator LLM circuit breaker is open."""
    now = _time.monotonic()
    global _failure_times
    # Keep only failures from the last 60 seconds
    _failure_times = [t for t in _failure_times if now - t < 60.0]
    return len(_failure_times) >= _MAX_LLM_FAILURES


def _record_failure() -> None:
    global _failure_times
    _failure_times.append(_time.monotonic())


def _reset_failures() -> None:
    global _failure_times
    _failure_times = []


class LearningOrchestrator:
    _instance: Optional["LearningOrchestrator"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def decide_next_action(
        self,
        user_id: str,
        query: str,
        conversation_history: Optional[List[dict]] = None,
        intent: Optional[UserIntent] = None,
    ) -> OrchestratorDecision:
        """Decide the pedagogical next action for the student.

        If a structured ``intent`` is provided, its subject/topic are injected
        into the LLM prompt so the decision is grounded in the correct domain
        (preventing cross-domain contamination). If the LLM is unavailable or
        the circuit breaker is open, falls back to intent-based keyword
        matching with subject-awareness.
        """
        # If no intent provided, derive one from the query
        if intent is None:
            from app.services.intent_extraction import extract_intent
            intent = extract_intent(query)

        # Build fallback decision from structured intent (no LLM required)
        fallback_action, fallback_reasoning = self._intent_to_action(intent)
        difficulty = intent.difficulty_preference or "medium"

        # Circuit breaker: skip LLM if it has been failing
        if _is_circuit_open():
            logger.info("Orchestrator circuit breaker open — using intent-based fallback")
            return OrchestratorDecision(
                action=fallback_action,
                reasoning=f"Circuit breaker open. Fallback: {fallback_reasoning}",
                target_concept_ids=[intent.subject] if intent.subject else [],
                suggested_difficulty=difficulty,
            )

        try:
            from app.services.mastery_engine import MasteryEngine
            from app.services.data_store import DataStore
            from app.services.study_recipes import RecipeSelector, RECIPES
            from app.services.misconception_engine import MisconceptionEngine
            from app.services import zai_client
            import instructor
            from app.config import settings

            mastery_engine = MasteryEngine()
            store = DataStore()
            misconception_engine = MisconceptionEngine()

            # Gather signals (each wrapped to avoid blocking on failures)
            try:
                exams = await store.list_exams(user_id)
            except Exception:
                exams = []
            try:
                mastery = await mastery_engine.compute_mastery(user_id, "overall")
            except Exception:
                mastery = {}
            try:
                misconceptions = await misconception_engine.get_active_misconceptions(user_id)
            except Exception:
                misconceptions = []

            # Determine adaptive difficulty from recent rolling attempts if not
            # explicitly overridden by the user's query/intent
            if difficulty == "medium":
                recent_attempts = [a for a in mastery_engine._local_attempts if a["user_id"] == user_id][-5:]
                consecutive_correct = sum(1 for a in reversed(recent_attempts) if a.get("correct"))
                consecutive_incorrect = sum(1 for a in reversed(recent_attempts) if not a.get("correct"))

                if consecutive_correct >= 3:
                    difficulty = "hard"
                elif consecutive_incorrect >= 2:
                    difficulty = "easy"

            recipe_name = "NEW_TOPIC"
            try:
                recipe_name = RecipeSelector.select_recipe(
                    mastery_snapshot=mastery,
                    exam_proximity_days=1 if exams else None,
                    misconception_active=len(misconceptions) > 0,
                )
            except Exception:
                pass

            # If active misconceptions and the user is comparing, use COMPARE
            query_lower = query.lower()
            if misconceptions and ("compare" in query_lower or recipe_name == "WEAK_TOPIC"):
                target_concepts = [m["concept_id"] for m in misconceptions[:2]]
                return OrchestratorDecision(
                    action="COMPARE",
                    reasoning=f"Active misconception detected for {target_concepts}. Directing contrast comparison.",
                    target_concept_ids=target_concepts,
                    suggested_difficulty=difficulty,
                )

            # Build system prompt with subject/topic grounding to prevent
            # cross-domain contamination
            subject_context = ""
            if intent.subject:
                subject_context = (
                    f"\n\nIMPORTANT — SUBJECT CONTEXT:\n"
                    f"The student's subject is: {intent.subject}\n"
                    f"The student's topic is: {intent.topic or 'general'}\n"
                    f"Do NOT generate content about any other domain (e.g., programming, Java, OOP) "
                    f"unless the subject is explicitly a programming subject.\n"
                )

            system_prompt = (
                "You are the pedagogical Learning Orchestrator for Summa AI.\n"
                "Your role is to choose the single best next learning action for the student from this precise list:\n"
                "TEACH, EXPLAIN, EXAMPLE, RECALL, FLASHCARD, QUIZ, PRACTICE, ASSESS, REVIEW, COMPARE, APPLY, REFLECT, SIMULATE, PREDICT, PLAN, REST.\n\n"
                f"Active Study Recipe: {recipe_name} -> {RECIPES.get(recipe_name, 'N/A')}\n"
                f"Student Mastery State: {mastery}\n"
                f"Active Misconceptions: {misconceptions}\n"
                f"Suggested Difficulty: {difficulty}\n"
                f"Active Exams: {exams}\n"
                f"Student Intent: {intent.model_dump_json()}\n"
                + subject_context +
                "\nAnalyze the student's message and history, then choose the optimal action, "
                f"target concepts, difficulty, and reasoning. Focus on the subject: {intent.subject or 'General Learning'}."
            )

            try:
                client = instructor.from_openai(
                    zai_client.get_client(),
                    mode=instructor.Mode.JSON,
                )

                decision = await asyncio.wait_for(
                    client.chat.completions.create(
                        model=settings.ZAI_MODEL,
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": query},
                        ],
                        response_model=OrchestratorDecision,
                        max_retries=1,
                    ),
                    timeout=10.0,
                )
                if decision:
                    _reset_failures()
                    return decision
            except (asyncio.TimeoutError, Exception) as exc:
                _record_failure()
                logger.warning("Orchestrator LLM call failed: %s", exc)

        except Exception as exc:
            logger.debug("Orchestrator signal gathering failed: %s", exc)

        # Fallback: deterministic intent-based decision (no LLM)
        return OrchestratorDecision(
            action=fallback_action,
            reasoning=f"Fallback: {fallback_reasoning}",
            target_concept_ids=[intent.subject] if intent.subject else [],
            suggested_difficulty=difficulty,
        )

    @staticmethod
    def _intent_to_action(intent: UserIntent) -> tuple[str, str]:
        """Map a structured UserIntent to an orchestrator action without LLM."""
        # Map intent-based actions
        if intent.activity_request == "quiz" or intent.intent == "quiz":
            return "QUIZ", f"User requested a quiz on {intent.subject or 'the requested topic'}."
        if intent.activity_request == "flashcards" or intent.intent == "flashcards":
            return "FLASHCARD", f"User requested flashcards on {intent.subject or 'the requested topic'}."
        if intent.intent == "study-plan":
            return "PLAN", "User requested a study plan."
        if intent.intent == "review" or intent.learning_goal == "consolidation":
            return "RECALL", f"User indicated difficulty recalling {intent.topic or intent.subject}."
        if intent.intent == "teach" or intent.learning_goal == "understanding":
            return "EXPLAIN", f"User needs understanding of {intent.subject}."
        if intent.learning_goal == "application":
            return "PRACTICE", f"User needs practice applying {intent.subject}."
        return "EXPLAIN", f"No specific activity detected for {intent.subject or 'General Learning'}."
