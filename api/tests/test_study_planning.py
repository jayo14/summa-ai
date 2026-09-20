"""Tests for study planning, notifications, and proactive nudges."""

import pytest
from app.services.study_plan_generator import NudgeEngine, NotificationService


@pytest.fixture(autouse=True)
def reset_services():
    NotificationService._instance = None
    yield
    NotificationService._instance = None


class TestNudgeEngine:
    @pytest.mark.asyncio
    async def test_empty_user_gets_onboarding(self):
        nudges = await NudgeEngine.generate_nudges("new-user-no-attempts")
        assert any(n["type"] == "onboarding" for n in nudges)

    @pytest.mark.asyncio
    async def test_streak_triggers_challenge(self):
        from app.services.mastery_engine import MasteryEngine
        engine = MasteryEngine()
        for i in range(5):
            await engine.record_attempt(
                user_id="nudge-streak-user",
                activity_id=f"act-{i}",
                concept_ids=["test"],
                correct=True,
            )
        nudges = await NudgeEngine.generate_nudges("nudge-streak-user")
        assert any(n["type"] == "challenge" for n in nudges)

    @pytest.mark.asyncio
    async def test_struggle_triggers_support(self):
        from app.services.mastery_engine import MasteryEngine
        engine = MasteryEngine()
        for i in range(3):
            await engine.record_attempt(
                user_id="nudge-struggle-user",
                activity_id=f"act-{i}",
                concept_ids=["test"],
                correct=False,
            )
        nudges = await NudgeEngine.generate_nudges("nudge-struggle-user")
        assert any(n["type"] == "support" for n in nudges)

    @pytest.mark.asyncio
    async def test_milestone_nudge(self):
        from app.services.mastery_engine import MasteryEngine
        engine = MasteryEngine()
        for i in range(10):
            await engine.record_attempt(
                user_id="nudge-milestone-user",
                activity_id=f"act-{i}",
                concept_ids=["test"],
                correct=i % 2 == 0,
            )
        nudges = await NudgeEngine.generate_nudges("nudge-milestone-user")
        assert any(n["type"] == "milestone" for n in nudges)


class TestNotificationService:
    @pytest.mark.asyncio
    async def test_send_and_retrieve(self):
        svc = NotificationService()
        await svc.send_notification("n1", "info", "Test", "Hello")
        notifs = await svc.get_notifications("n1")
        assert len(notifs) >= 1
        assert notifs[0]["title"] == "Test"

    @pytest.mark.asyncio
    async def test_mark_read(self):
        svc = NotificationService()
        item = await svc.send_notification("n2", "info", "Read Me", "Body")
        result = await svc.mark_read("n2", item["id"])
        assert result is True
