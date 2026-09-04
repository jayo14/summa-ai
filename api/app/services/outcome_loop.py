"""Outcome Loop Engine — post-exam feedback collection and prediction accuracy evaluation."""

import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.core.security import resolve_user_id
from app.services.db_pool import get_pool


class ExamFeedbackCreate(BaseModel):
    outcome_rating: str = Field(description="Great, Okay, Difficult, Very difficult")
    resembled_practice: Optional[bool] = None
    topics_appeared: List[str] = Field(default_factory=list)
    unprepared_topics: List[str] = Field(default_factory=list)


class OutcomeLoopEngine:
    _instance: Optional["OutcomeLoopEngine"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._feedback_store: List[Dict[str, Any]] = []
            cls._instance._evals_store: List[Dict[str, Any]] = []
        return cls._instance

    async def submit_exam_feedback(
        self, user_id: str, exam_id: str, feedback: ExamFeedbackCreate
    ) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        item = {
            "exam_id": exam_id,
            "user_id": user_id,
            "outcome_rating": feedback.outcome_rating,
            "resembled_practice": feedback.resembled_practice,
            "topics_appeared": feedback.topics_appeared,
            "unprepared_topics": feedback.unprepared_topics,
            "created_at": now.isoformat(),
        }
        self._feedback_store.append(item)

        try:
            pool = await get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    await conn.execute(
                        """INSERT INTO summa_ai.exam_feedback
                           (id, exam_id, user_id, outcome_rating, resembled_practice, topics_appeared, unprepared_topics, created_at)
                           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)
                           ON CONFLICT (user_id, exam_id) DO NOTHING""",
                        exam_id,
                        user_id,
                        feedback.outcome_rating,
                        feedback.resembled_practice,
                        json.dumps(feedback.topics_appeared),
                        json.dumps(feedback.unprepared_topics),
                        now,
                    )
        except Exception:
            pass

        # Evaluate prediction accuracy against predicted topics
        from app.services.pattern_analysis import PatternAnalysisEngine
        analysis = PatternAnalysisEngine.analyze_patterns([{"topic": t} for t in feedback.topics_appeared])
        
        for topic in analysis.topic_frequencies.keys():
            appeared = topic in feedback.topics_appeared
            eval_item = {
                "exam_id": exam_id,
                "user_id": user_id,
                "predicted_topic": topic,
                "actually_appeared": appeared,
            }
            self._evals_store.append(eval_item)

        return item

    async def get_exam_feedback(self, user_id: str, exam_id: str) -> Optional[Dict[str, Any]]:
        try:
            pool = await get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    row = await conn.fetchrow(
                        "SELECT * FROM summa_ai.exam_feedback WHERE user_id = $1 AND exam_id = $2",
                        user_id,
                        exam_id,
                    )
                    if row:
                        return dict(row)
        except Exception:
            pass

        for f in self._feedback_store:
            if f["user_id"] == user_id and f["exam_id"] == exam_id:
                return f
        return None
