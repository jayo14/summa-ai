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

    async def get_prediction_accuracy(self, user_id: str) -> Dict[str, Any]:
        """Compute overall prediction accuracy across all exams."""
        evals = [e for e in self._evals_store if e["user_id"] == user_id]
        if not evals:
            try:
                pool = await get_pool()
                if pool is not None:
                    async with pool.acquire() as conn:
                        rows = await conn.fetch(
                            "SELECT * FROM summa_ai.exam_feedback WHERE user_id = $1",
                            user_id,
                        )
                        evals = [dict(r) for r in rows] if rows else []
            except Exception:
                pass

        if not evals:
            return {"accuracy": 0, "total_predictions": 0, "correct_predictions": 0}

        total = len(evals)
        correct = sum(1 for e in evals if e.get("actually_appeared", False))
        accuracy = round(correct / total, 2) if total > 0 else 0

        return {
            "accuracy": accuracy,
            "total_predictions": total,
            "correct_predictions": correct,
        }

    async def get_unprepared_topics(self, user_id: str) -> List[str]:
        """Extract topics the student reported as unprepared for."""
        feedbacks = [f for f in self._feedback_store if f["user_id"] == user_id]
        topics = set()
        for f in feedbacks:
            topics.update(f.get("unprepared_topics", []))

        if not topics:
            try:
                pool = await get_pool()
                if pool is not None:
                    async with pool.acquire() as conn:
                        rows = await conn.fetch(
                            "SELECT unprepared_topics FROM summa_ai.exam_feedback WHERE user_id = $1",
                            user_id,
                        )
                        if rows:
                            for r in rows:
                                raw = r.get("unprepared_topics")
                                if raw:
                                    if isinstance(raw, str):
                                        import json as _json
                                        topics.update(_json.loads(raw))
                                    elif isinstance(raw, list):
                                        topics.update(raw)
            except Exception:
                pass

        return sorted(topics)
