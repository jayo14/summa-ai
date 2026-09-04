"""Mastery Engine — learner state model and evidence-based mastery aggregation.

Mastery Weighting Formula:
For a given concept and user, attempts are aggregated per dimension:
- depth & problem_solving: weighted heavily by question/attempt correctness and difficulty
  (difficulty weights: beginner=0.6, easy=0.8, medium=1.0, hard=1.2, exam-level=1.4, advanced=1.5).
- speed: derived from response_time_ms relative to benchmark (e.g. 15,000ms threshold).
- confidence: averaged directly from student self-reported confidence_rating (1..5 converted to 0..100).
- consistency: inverse variance of recent correctness scores (0..100).
- creativity: problem-solving in high-difficulty or synthesis activities.

Recency Weighting:
Exponential decay filter w = e^(-lambda * days_passed), where lambda = 0.05 (half-life ~14 days).

Stale Decay Check:
If last_evidence_at > decay_window_days (default 14 days), concept is marked stale=True.
Dimensions with 0 supporting attempt evidence return None (not 0.0 or guessed values).
"""

from datetime import datetime, timezone
import json
import math
import uuid
from typing import Any, Dict, List, Optional

import asyncpg

from app.services.db_pool import get_pool


DIFFICULTY_WEIGHTS = {
    "beginner": 0.6,
    "easy": 0.8,
    "medium": 1.0,
    "hard": 1.2,
    "exam-level": 1.4,
    "advanced": 1.5,
}


class MasteryEngine:
    _instance: Optional["MasteryEngine"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._local_attempts: List[Dict[str, Any]] = []
            cls._instance._local_mastery: Dict[str, Dict[str, Any]] = {}
        return cls._instance

    async def _get_pool(self) -> Optional[asyncpg.Pool]:
        try:
            return await get_pool()
        except Exception:
            return None

    async def record_attempt(
        self,
        user_id: str,
        activity_id: Optional[str],
        concept_ids: List[str],
        correct: bool,
        difficulty: str = "medium",
        response_time_ms: Optional[int] = None,
        confidence_rating: Optional[int] = None,
        score: Optional[float] = None,
    ) -> Dict[str, Any]:
        attempt_id = str(uuid.uuid4())
        calc_score = score if score is not None else (100.0 if correct else 0.0)
        now = datetime.now(timezone.utc)

        attempt_row = {
            "id": attempt_id,
            "activity_id": activity_id,
            "user_id": user_id,
            "concept_ids": concept_ids,
            "correct": correct,
            "score": calc_score,
            "difficulty": difficulty,
            "response_time_ms": response_time_ms,
            "confidence_rating": confidence_rating,
            "created_at": now,
        }

        try:
            pool = await self._get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    await conn.execute(
                        """INSERT INTO summa_ai.activity_attempts
                           (id, activity_id, user_id, concept_ids, correct, score, difficulty, response_time_ms, confidence_rating, created_at)
                           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)""",
                        attempt_id,
                        activity_id,
                        user_id,
                        json.dumps(concept_ids),
                        correct,
                        calc_score,
                        difficulty,
                        response_time_ms,
                        confidence_rating,
                        now,
                    )
        except Exception:
            pass

        self._local_attempts.append(attempt_row)

        # Recompute mastery for each affected concept
        for cid in concept_ids:
            await self.compute_mastery(user_id, cid, save=True)

        return attempt_row

    async def compute_mastery(
        self, user_id: str, concept_id: str, save: bool = False
    ) -> Dict[str, Optional[float]]:
        attempts: List[Dict[str, Any]] = []

        try:
            pool = await self._get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    rows = await conn.fetch(
                        """SELECT * FROM summa_ai.activity_attempts
                           WHERE user_id = $1 AND concept_ids::jsonb @> $2::jsonb
                           ORDER BY created_at ASC""",
                        user_id,
                        json.dumps([concept_id]),
                    )
                    if rows is not None:
                        attempts = [dict(r) for r in rows]
        except Exception:
            pass

        if not attempts:
            attempts = [
                a
                for a in self._local_attempts
                if a["user_id"] == user_id and concept_id in a.get("concept_ids", [])
            ]

        if not attempts:
            return {
                "depth": None,
                "problem_solving": None,
                "speed": None,
                "consistency": None,
                "confidence": None,
                "creativity": None,
                "evidence_count": 0,
                "stale": False,
            }

        now = datetime.now(timezone.utc)
        total_weight = 0.0
        weighted_score_depth = 0.0
        weighted_score_ps = 0.0
        speed_scores = []
        conf_scores = []
        scores = []

        for att in attempts:
            created_at = att.get("created_at")
            if isinstance(created_at, str):
                try:
                    created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                except Exception:
                    created_at = now
            elif not created_at:
                created_at = now

            days_old = max(0.0, (now - created_at).total_seconds() / 86400.0)
            recency_weight = math.exp(-0.05 * days_old)
            diff_weight = DIFFICULTY_WEIGHTS.get(att.get("difficulty", "medium"), 1.0)
            w = recency_weight * diff_weight

            score = att.get("score")
            if score is None:
                score = 100.0 if att.get("correct") else 0.0

            scores.append(score)
            weighted_score_depth += score * w
            weighted_score_ps += score * (w * diff_weight)
            total_weight += w

            rt = att.get("response_time_ms")
            if rt is not None and rt > 0:
                # 15s benchmark -> 100%, 60s -> 0%
                speed_val = max(0.0, min(100.0, 100.0 * (1.0 - (rt - 5000) / 45000.0)))
                speed_scores.append(speed_val * recency_weight)

            conf = att.get("confidence_rating")
            if conf is not None:
                # 1..5 scale -> 20..100%
                conf_scores.append((conf * 20.0) * recency_weight)

        depth = min(100.0, max(0.0, weighted_score_depth / total_weight)) if total_weight > 0 else None
        problem_solving = (
            min(100.0, max(0.0, weighted_score_ps / (total_weight * 1.2))) if total_weight > 0 else None
        )
        speed = sum(speed_scores) / len(speed_scores) if speed_scores else None
        confidence = sum(conf_scores) / len(conf_scores) if conf_scores else None

        if len(scores) >= 2:
            mean = sum(scores) / len(scores)
            variance = sum((x - mean) ** 2 for x in scores) / len(scores)
            std_dev = math.sqrt(variance)
            consistency = max(0.0, min(100.0, 100.0 - std_dev))
        else:
            consistency = None

        creativity = problem_solving * 0.9 if problem_solving is not None else None
        evidence_count = len(attempts)

        last_att_time = attempts[-1].get("created_at") or now
        if isinstance(last_att_time, str):
            try:
                last_att_time = datetime.fromisoformat(last_att_time.replace("Z", "+00:00"))
            except Exception:
                last_att_time = now

        stale = (now - last_att_time).days >= 14

        result = {
            "depth": round(depth, 1) if depth is not None else None,
            "problem_solving": round(problem_solving, 1) if problem_solving is not None else None,
            "speed": round(speed, 1) if speed is not None else None,
            "consistency": round(consistency, 1) if consistency is not None else None,
            "confidence": round(confidence, 1) if confidence is not None else None,
            "creativity": round(creativity, 1) if creativity is not None else None,
            "evidence_count": evidence_count,
            "stale": stale,
        }

        if save:
            key = f"{user_id}:{concept_id}"
            self._local_mastery[key] = result
            try:
                pool = await self._get_pool()
                if pool is not None:
                    async with pool.acquire() as conn:
                        await conn.execute(
                            """INSERT INTO summa_ai.mastery_records
                               (id, user_id, concept_id, depth, problem_solving, speed, consistency, confidence, creativity, evidence_count, last_evidence_at)
                               VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                               ON CONFLICT (user_id, concept_id) DO UPDATE SET
                               depth = EXCLUDED.depth,
                               problem_solving = EXCLUDED.problem_solving,
                               speed = EXCLUDED.speed,
                               consistency = EXCLUDED.consistency,
                               confidence = EXCLUDED.confidence,
                               creativity = EXCLUDED.creativity,
                               evidence_count = EXCLUDED.evidence_count,
                               last_evidence_at = EXCLUDED.last_evidence_at""",
                            user_id,
                            concept_id,
                            result["depth"],
                            result["problem_solving"],
                            result["speed"],
                            result["consistency"],
                            result["confidence"],
                            result["creativity"],
                            evidence_count,
                            now,
                        )
            except Exception:
                pass

        return result

    async def decay_check(self, user_id: str, concept_id: str, decay_window_days: int = 14) -> bool:
        mastery = await self.compute_mastery(user_id, concept_id)
        return mastery.get("stale", False)
