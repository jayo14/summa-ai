"""Learning Orchestrator — decides pedagogical next action for the student.

Vocabulary: TEACH, EXPLAIN, EXAMPLE, RECALL, FLASHCARD, QUIZ, PRACTICE, ASSESS,
REVIEW, COMPARE, APPLY, REFLECT, SIMULATE, PREDICT, PLAN, REST.
"""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field

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
    ) -> OrchestratorDecision:
        # Fallback intent detection table mapping regexes to orchestrator actions
        from app.routes.chat import detect_intent

        intent = detect_intent(query)
        action_map: dict[str, OrchestratorAction] = {
            "quiz": "QUIZ",
            "flashcards": "FLASHCARD",
            "study-plan": "PLAN",
            "hexagon": "ASSESS",
            "graph": "REVIEW",
            "timeline": "PLAN",
            "gap-analysis": "ASSESS",
        }

        fallback_action: OrchestratorAction = action_map.get(intent, "EXPLAIN")
        fallback_reasoning = f"Keyword matching selected default action {fallback_action} based on query terms."

        difficulty = "medium"

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

            # Gather signals
            exams = await store.list_exams(user_id)
            mastery = await mastery_engine.compute_mastery(user_id, "overall")
            misconceptions = await misconception_engine.get_active_misconceptions(user_id)

            # Determine adaptive difficulty from recent rolling attempts
            recent_attempts = [a for a in mastery_engine._local_attempts if a["user_id"] == user_id][-5:]
            consecutive_correct = sum(1 for a in reversed(recent_attempts) if a.get("correct"))
            consecutive_incorrect = sum(1 for a in reversed(recent_attempts) if not a.get("correct"))

            if consecutive_correct >= 3:
                difficulty = "hard"
            elif consecutive_incorrect >= 2:
                difficulty = "easy"

            recipe_name = RecipeSelector.select_recipe(
                mastery_snapshot=mastery,
                exam_proximity_days=1 if exams else None,
                misconception_active=len(misconceptions) > 0,
            )

            # Student override handling in query
            query_lower = query.lower()
            if "harder" in query_lower:
                difficulty = "hard"
            elif "easier" in query_lower:
                difficulty = "easy"

            if misconceptions and ("compare" in query_lower or recipe_name == "WEAK_TOPIC"):
                target_concepts = [m["concept_id"] for m in misconceptions[:2]]
                return OrchestratorDecision(
                    action="COMPARE",
                    reasoning=f"Active misconception detected for {target_concepts}. Directing contrast comparison.",
                    target_concept_ids=target_concepts,
                    suggested_difficulty=difficulty,
                )

            system_prompt = (
                "You are the pedagogical Learning Orchestrator for Summa AI.\n"
                "Your role is to choose the single best next learning action for the student from this precise list:\n"
                "TEACH, EXPLAIN, EXAMPLE, RECALL, FLASHCARD, QUIZ, PRACTICE, ASSESS, REVIEW, COMPARE, APPLY, REFLECT, SIMULATE, PREDICT, PLAN, REST.\n\n"
                f"Active Study Recipe: {recipe_name} -> {RECIPES.get(recipe_name)}\n"
                f"Student Mastery State: {mastery}\n"
                f"Active Misconceptions: {misconceptions}\n"
                f"Suggested Difficulty: {difficulty}\n"
                f"Active Exams: {exams}\n\n"
                "Analyze the student's message and history, then choose the optimal action, target concepts, difficulty, and reasoning."
            )

            try:
                client = instructor.from_openai(
                    zai_client.get_client(),
                    mode=instructor.Mode.JSON,
                )

                decision = client.chat.completions.create(
                    model=settings.ZAI_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": query},
                    ],
                    response_model=OrchestratorDecision,
                    max_retries=2,
                )
                if decision:
                    return decision
            except Exception:
                pass
        except Exception:
            pass

        return OrchestratorDecision(
            action=fallback_action,
            reasoning=fallback_reasoning,
            target_concept_ids=[],
            suggested_difficulty=difficulty,
        )
