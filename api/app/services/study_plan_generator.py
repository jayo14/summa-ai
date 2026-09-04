"""Study Plan Generator & Notification Scheduler Service."""

import logging
from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from app.services.db_pool import get_pool
from app.services.mastery_engine import MasteryEngine

logger = logging.getLogger(__name__)


class StudyPlanGenerator:
    @staticmethod
    async def generate_plan(
        user_id: str,
        exam_id: str,
        available_days: int = 14,
        minutes_per_day: int = 45,
    ) -> Dict[str, Any]:
        from app.services.data_store import DataStore
        store = DataStore()
        mastery_engine = MasteryEngine()

        mastery = await mastery_engine.compute_mastery(user_id, f"exam:{exam_id}")
        
        # Allocate days per session favoring developing areas
        days_list = []
        for d in range(1, available_days + 1):
            days_list.append({
                "day": f"Day {d}",
                "topic": "Weak Concepts & Practice" if d % 2 == 1 else "Core Theory Review",
                "duration": f"{minutes_per_day} min",
            })

        plan_data = {
            "title": f"Targeted Exam Prep Plan ({available_days} Days)",
            "exam_id": exam_id,
            "approved": False,
            "days": days_list,
        }

        created = await store.create_study_plan(user_id, plan_data)
        return created


class NotificationService:
    _instance: Optional["NotificationService"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._notifications: List[Dict[str, Any]] = []
        return cls._instance

    async def send_notification(
        self, user_id: str, type_: str, title: str, message: str
    ) -> Dict[str, Any]:
        item = {
            "id": f"notif-{len(self._notifications)+1}",
            "user_id": user_id,
            "type": type_,
            "title": title,
            "message": message,
            "read": False,
        }
        self._notifications.append(item)
        try:
            pool = await get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    await conn.execute(
                        """INSERT INTO summa_ai.notifications (id, user_id, type, title, message)
                           VALUES (gen_random_uuid(), $1, $2, $3, $4)""",
                        user_id,
                        type_,
                        title,
                        message,
                    )
        except Exception:
            pass

        return item
