"""SummaStudy API client — calls SummaStudy's AI service endpoints.

Integration pattern (per INTEGRATION_STRATEGY.md): direct service-to-service HTTP
calls using the shared Supabase JWT.  All calls are gated by SUMMASTUDY_ENABLED
and gracefully degrade when SummaStudy is unreachable.

Services integrated:
  - study_planner    → POST /api/v1/ai-core/generate-plan
  - spaced_repetition → POST /api/v1/ai-core/flashcard/review
  - recommendation   → GET  /api/v1/tutorials/recommendations
                      GET  /api/v1/marketplace/recommendations
"""

import logging
from typing import Any, Dict, List, Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


class SummaStudyClient:
    def __init__(self):
        self._base: str = settings.SUMMASTUDY_API_BASE.rstrip("/")

    @property
    def enabled(self) -> bool:
        return bool(settings.SUMMASTUDY_ENABLED and self._base)

    def _fmt(self, path: str) -> str:
        return f"{self._base}{path}"

    async def _get(self, path: str, jwt: str, **kwargs) -> Optional[Any]:
        if not self.enabled:
            return None
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(
                    self._fmt(path),
                    headers={
                        "Authorization": f"Bearer {jwt}",
                        "Content-Type": "application/json",
                    },
                    params=kwargs.get("params"),
                )
                resp.raise_for_status()
                return resp.json()
        except Exception as e:
            logger.warning("SummaStudy GET %s failed: %s", path, e)
            return None

    async def _post(self, path: str, jwt: str, body: dict) -> Optional[Any]:
        if not self.enabled:
            return None
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(
                    self._fmt(path),
                    headers={
                        "Authorization": f"Bearer {jwt}",
                        "Content-Type": "application/json",
                    },
                    json=body,
                )
                resp.raise_for_status()
                return resp.json()
        except Exception as e:
            logger.warning("SummaStudy POST %s failed: %s", path, e)
            return None

    # ── study_planner ────────────────────────────────────────────────────

    async def generate_plan(self, jwt: str, goal: str) -> Optional[Dict[str, Any]]:
        """Generate a study plan via SummaStudy's study_planner service.

        Returns a dict with title, overview, daily_schedule[], tips[] or None.
        """
        return await self._post("/ai-core/generate-plan", jwt, {"goal": goal})

    # ── spaced_repetition ────────────────────────────────────────────────

    async def submit_flashcard_review(
        self, jwt: str, flashcard_id: str, rating: int
    ) -> Optional[Dict[str, Any]]:
        """Submit a flashcard review via SummaStudy's spaced_repetition service.

        Rating: 1=AGAIN, 2=HARD, 3=GOOD, 4=EASY
        Returns { next_review_date, interval_days, ease_factor, repetitions } or None.
        """
        if rating not in (1, 2, 3, 4):
            logger.warning("Invalid flashcard rating: %d", rating)
            return None
        return await self._post(
            "/ai-core/flashcard/review",
            jwt,
            {"flashcard_id": flashcard_id, "rating": rating},
        )

    async def get_due_flashcards(
        self, jwt: str, user_id: str
    ) -> Optional[List[Dict[str, Any]]]:
        """Get flashcards due for review via SummaStudy's spaced_repetition."""
        return await self._get(f"/ai-core/flashcards/due/{user_id}", jwt)

    # ── recommendation_service ───────────────────────────────────────────

    async def get_tutorial_recommendations(
        self, jwt: str
    ) -> Optional[List[Dict[str, Any]]]:
        """Get tutorial recommendations via SummaStudy's recommendation_service."""
        return await self._get("/tutorials/recommendations", jwt)

    async def get_marketplace_recommendations(
        self, jwt: str, limit: int = 5
    ) -> Optional[List[Dict[str, Any]]]:
        """Get marketplace recommendations via SummaStudy's recommendation_service."""
        return await self._get(
            "/marketplace/recommendations", jwt, params={"limit": limit}
        )


summastudy_client = SummaStudyClient()
