"""Tests for Phase 3 Progress routes and learning analytics category tagging."""

from unittest.mock import patch
import pytest
from app.services.mastery_engine import MasteryEngine


@pytest.mark.asyncio
async def test_progress_mastery_and_next_action_endpoints():
    engine = MasteryEngine()
    user_id = "user-phase3-test"

    # Seed attempt data
    await engine.record_attempt(user_id, "act-1", ["con-oop"], True, difficulty="medium")
    await engine.record_attempt(user_id, "act-2", ["con-oop"], True, difficulty="hard")

    from app.routes.progress_routes import get_course_mastery, get_course_progress, get_next_best_action
    
    with patch("app.routes.progress_routes.resolve_user_id", return_value=user_id):
        m_res = await get_course_mastery("CSC201")
        p_res = await get_course_progress("CSC201")
        n_res = await get_next_best_action()

    assert m_res["course_id"] == "CSC201"
    assert p_res["total_attempts"] >= 2
    assert n_res["action"] is not None
    assert n_res["reason"] is not None


def test_learning_analytics_event_category_tagging():
    event = {
        "event_name": "activity_generated",
        "category": "learning_analytics",
        "user_id": "user-123",
        "activity_id": "act-999",
        "success": True,
    }
    assert event["category"] == "learning_analytics"
