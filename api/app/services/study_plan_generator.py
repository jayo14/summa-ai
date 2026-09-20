"""Study Plan Generator, Notification Scheduler, and Proactive Nudge Engine."""

import logging
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional
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
        depth = mastery.get("depth") or 50
        problem_solving = mastery.get("problem_solving") or 50

        days_list = []
        for d in range(1, available_days + 1):
            progress_pct = d / available_days

            if progress_pct <= 0.3:
                phase, topic, activity = "Foundation", "Core Concepts & Definitions", "EXPLAIN + FLASHCARD"
            elif progress_pct <= 0.6:
                phase, topic, activity = "Application", "Practice Problems & Examples", "PRACTICE + QUIZ"
            elif progress_pct <= 0.85:
                phase, topic, activity = "Consolidation", "Weak Areas & Misconceptions", "RECALL + COMPARE"
            else:
                phase, topic, activity = "Exam Simulation", "Timed Practice & Review", "ASSESS + EXAM_QUESTIONS"

            if (depth < 40 or problem_solving < 40) and d % 2 == 0:
                topic, activity = "Targeted Weak Concept Drill", "PRACTICE + RECALL"

            days_list.append({
                "day": d, "phase": phase, "topic": topic,
                "activity": activity, "duration_minutes": minutes_per_day,
            })

        plan_data = {
            "title": f"Exam Prep Plan ({available_days} Days) - Mastery-Aware",
            "exam_id": exam_id, "approved": False,
            "mastery_snapshot": mastery, "days": days_list,
        }
        return await store.create_study_plan(user_id, plan_data)


class NotificationService:
    _instance: Optional["NotificationService"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._notifications: List[Dict[str, Any]] = []
        return cls._instance

    async def send_notification(self, user_id: str, type_: str, title: str, message: str) -> Dict[str, Any]:
        item = {
            "id": f"notif-{len(self._notifications)+1}", "user_id": user_id,
            "type": type_, "title": title, "message": message,
            "read": False, "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self._notifications.append(item)
        try:
            pool = await get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    await conn.execute(
                        """INSERT INTO summa_ai.notifications (id, user_id, type, title, message)
                           VALUES (gen_random_uuid(), $1, $2, $3, $4)""",
                        user_id, type_, title, message,
                    )
        except Exception:
            pass
        return item

    async def get_notifications(self, user_id: str) -> List[Dict[str, Any]]:
        local = [n for n in self._notifications if n["user_id"] == user_id]
        try:
            pool = await get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    rows = await conn.fetch(
                        "SELECT * FROM summa_ai.notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20",
                        user_id,
                    )
                    if rows:
                        return [dict(r) for r in rows]
        except Exception:
            pass
        return local

    async def mark_read(self, user_id: str, notification_id: str) -> bool:
        try:
            pool = await get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    await conn.execute(
                        "UPDATE summa_ai.notifications SET read = TRUE WHERE id = $1 AND user_id = $2",
                        notification_id, user_id,
                    )
                    return True
        except Exception:
            pass
        for n in self._notifications:
            if n["id"] == notification_id and n["user_id"] == user_id:
                n["read"] = True
                return True
        return False


class NudgeEngine:
    """Generate proactive nudges based on learning patterns."""

    @staticmethod
    async def generate_nudges(user_id: str) -> List[Dict[str, Any]]:
        nudges = []
        mastery_engine = MasteryEngine()
        attempts = [a for a in mastery_engine._local_attempts if a["user_id"] == user_id]

        if not attempts:
            nudges.append({
                "type": "onboarding", "title": "Start Your First Session",
                "message": "Begin by asking about a topic you're studying.",
                "priority": "high",
            })
            return nudges

        recent = attempts[-5:]
        consecutive_correct = sum(1 for a in reversed(recent) if a.get("correct"))
        if consecutive_correct >= 4:
            nudges.append({
                "type": "challenge", "title": "You're on Fire!",
                "message": f"{consecutive_correct} correct in a row. Ready for harder?",
                "priority": "medium",
            })

        consecutive_incorrect = sum(1 for a in reversed(recent) if not a.get("correct"))
        if consecutive_incorrect >= 2:
            nudges.append({
                "type": "support", "title": "Struggling? Let's Review",
                "message": "Recent answers suggest confusion. Want me to explain differently?",
                "priority": "high",
            })

        if attempts:
            last_attempt = attempts[-1]
            last_time = last_attempt.get("created_at")
            if last_time:
                try:
                    if isinstance(last_time, str):
                        last_dt = datetime.fromisoformat(last_time.replace("Z", "+00:00"))
                    else:
                        last_dt = last_time
                    hours_since = (datetime.now(timezone.utc) - last_dt).total_seconds() / 3600
                    if hours_since > 24:
                        nudges.append({
                            "type": "reengagement", "title": "Time for a Review",
                            "message": f"It's been {int(hours_since)}h since your last session.",
                            "priority": "medium",
                        })
                except Exception:
                    pass

        total = len(attempts)
        if total in (10, 25, 50, 100):
            nudges.append({
                "type": "milestone", "title": f"Milestone: {total} Interactions!",
                "message": f"You've completed {total} learning interactions. Keep going!",
                "priority": "low",
            })

        return nudges
