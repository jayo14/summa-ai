"""Misconception Engine — classifies wrong-answer patterns and persists misconceptions."""

import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

import asyncpg
from app.services.db_pool import get_pool

logger = logging.getLogger(__name__)


class MisconceptionClassification(BaseModel):
    is_misconception: bool
    concept_id: str
    description: str
    confidence: str = Field(default="medium", description="high, medium, low")


class MisconceptionEngine:
    _instance: Optional["MisconceptionEngine"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._local_misconceptions: Dict[str, Dict[str, Any]] = {}
        return cls._instance

    async def _get_pool(self) -> Optional[asyncpg.Pool]:
        try:
            return await get_pool()
        except Exception:
            return None

    async def analyze_and_record(
        self,
        user_id: str,
        concept_ids: List[str],
        recent_attempts: List[Dict[str, Any]],
    ) -> Optional[Dict[str, Any]]:
        incorrect_attempts = [a for a in recent_attempts if not a.get("correct", True)]

        if len(incorrect_attempts) < 2:
            return None

        # Simple classification fallback or LLM classifier
        concept_id = concept_ids[0] if concept_ids else "general"
        description = f"Repeated confusion regarding {concept_id} boundaries"
        confidence = "medium"

        try:
            from app.services import zai_client
            import instructor
            from app.config import settings

            client = instructor.from_openai(
                zai_client.get_client(),
                mode=instructor.Mode.JSON,
            )

            prompt = (
                f"Analyze these incorrect student attempts for concept '{concept_id}':\n"
                f"{json.dumps(incorrect_attempts, default=str)}\n"
                "Classify whether a persistent conceptual misconception exists."
            )

            result = client.chat.completions.create(
                model=settings.ZAI_MODEL,
                messages=[{"role": "user", "content": prompt}],
                response_model=MisconceptionClassification,
                max_retries=2,
            )

            if result and result.is_misconception:
                description = result.description
                confidence = result.confidence
                concept_id = result.concept_id
            else:
                return None
        except Exception as exc:
            logger.debug("Misconception LLM classification skipped: %s", exc)

        return await self.record_misconception(user_id, concept_id, description, confidence)

    async def record_misconception(
        self,
        user_id: str,
        concept_id: str,
        description: str,
        confidence: str = "medium",
    ) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        key = f"{user_id}:{concept_id}:{description}"

        if key in self._local_misconceptions:
            item = self._local_misconceptions[key]
            item["occurrences"] += 1
            item["last_observed_at"] = now.isoformat()
        else:
            item = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "concept_id": concept_id,
                "description": description,
                "confidence": confidence,
                "occurrences": 1,
                "last_observed_at": now.isoformat(),
            }
            self._local_misconceptions[key] = item

        try:
            pool = await self._get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    await conn.execute(
                        """INSERT INTO summa_ai.misconceptions
                           (id, user_id, concept_id, description, confidence, occurrences, last_observed_at)
                           VALUES ($1, $2, $3, $4, $5, 1, $6)
                           ON CONFLICT (user_id, concept_id, description) DO UPDATE SET
                           occurrences = summa_ai.misconceptions.occurrences + 1,
                           last_observed_at = EXCLUDED.last_observed_at""",
                        item["id"],
                        user_id,
                        concept_id,
                        description,
                        confidence,
                        now,
                    )
        except Exception:
            pass

        return item

    async def get_active_misconceptions(self, user_id: str) -> List[Dict[str, Any]]:
        try:
            pool = await self._get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    rows = await conn.fetch(
                        "SELECT * FROM summa_ai.misconceptions WHERE user_id = $1 ORDER BY last_observed_at DESC",
                        user_id,
                    )
                    if rows is not None:
                        return [dict(r) for r in rows]
        except Exception:
            pass

        return [v for v in self._local_misconceptions.values() if v["user_id"] == user_id]

    async def get_correction_recommendations(self, user_id: str) -> List[Dict[str, Any]]:
        """Return misconception-driven practice recommendations."""
        misconceptions = await self.get_active_misconceptions(user_id)
        if not misconceptions:
            return []

        recommendations = []
        for m in misconceptions[:5]:
            concept = m.get("concept_id", "general")
            recommendations.append({
                "misconception_id": m.get("id"),
                "concept_id": concept,
                "description": m.get("description", ""),
                "occurrences": m.get("occurrences", 1),
                "practice_type": "targeted_drill",
                "recommended_action": f"Focus practice on {concept} — repeated confusion ({m.get('occurrences', 1)}x) indicates persistent misunderstanding.",
                "priority": "high" if m.get("occurrences", 1) >= 3 else "medium",
            })

        return recommendations

    async def record_correction_attempt(
        self,
        user_id: str,
        misconception_id: str,
        correct: bool,
    ) -> Dict[str, Any]:
        """Record a correction attempt against a known misconception."""
        key = f"{user_id}:{misconception_id}"
        record = {
            "user_id": user_id,
            "misconception_id": misconception_id,
            "correct": correct,
            "attempted_at": datetime.now(timezone.utc).isoformat(),
        }

        if correct:
            # Mark misconception as resolved if this is a correct correction attempt
            for k, v in self._local_misconceptions.items():
                if v.get("id") == misconception_id:
                    v["resolved"] = True
                    v["resolved_at"] = record["attempted_at"]
                    break

            try:
                pool = await self._get_pool()
                if pool is not None:
                    async with pool.acquire() as conn:
                        await conn.execute(
                            """UPDATE summa_ai.misconceptions
                               SET resolved = TRUE, resolved_at = NOW()
                               WHERE id = $1 AND user_id = $2""",
                            misconception_id,
                            user_id,
                        )
            except Exception:
                pass

        return record
