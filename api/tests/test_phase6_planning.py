"""Tests for Phase 6 Planning and Notifications."""

from unittest.mock import patch
import pytest
from app.services.study_plan_generator import NotificationService, StudyPlanGenerator


@pytest.mark.asyncio
async def test_study_plan_generation_and_approval():
    user_id = "user-phase6-test"
    plan = await StudyPlanGenerator.generate_plan(user_id, "exam-101", available_days=7)
    
    assert plan["title"] is not None
    assert plan["approved"] is False

    from app.routes.study_routes import approve_study_plan
    with patch("app.routes.study_routes.resolve_user_id", return_value=user_id):
        with patch("app.routes.study_routes._store.update_study_plan", return_value={**plan, "approved": True}):
            approved = await approve_study_plan(plan["id"])
            assert approved["approved"] is True


@pytest.mark.asyncio
async def test_notification_delivery():
    notif_service = NotificationService()
    user_id = "user-phase6-notif"
    
    item = await notif_service.send_notification(user_id, "exam_approaching", "Exam Soon", "Your CSC201 exam is in 3 days.")
    assert item["user_id"] == user_id
    assert item["type"] == "exam_approaching"
    assert item["read"] is False
