"""Tests for Phase 8 Outcome Loop: post-exam feedback and prediction evaluations."""

from unittest.mock import patch
import pytest
from app.services.outcome_loop import ExamFeedbackCreate, OutcomeLoopEngine


@pytest.mark.asyncio
async def test_submit_and_get_exam_feedback():
    engine = OutcomeLoopEngine()
    user_id = "user-phase8-test"
    exam_id = "exam-808"

    fb = ExamFeedbackCreate(
        outcome_rating="Great",
        resembled_practice=True,
        topics_appeared=["Polymorphism", "Interfaces"],
        unprepared_topics=[],
    )

    res = await engine.submit_exam_feedback(user_id, exam_id, fb)
    assert res["outcome_rating"] == "Great"
    assert res["resembled_practice"] is True

    fetched = await engine.get_exam_feedback(user_id, exam_id)
    assert fetched is not None
    assert fetched["outcome_rating"] == "Great"
    assert "Polymorphism" in fetched["topics_appeared"]


@pytest.mark.asyncio
async def test_exam_feedback_route_integration():
    from app.routes.study_routes import get_exam_feedback, submit_exam_feedback
    
    user_id = "user-phase8-route"
    exam_id = "exam-809"
    payload = {
        "outcome_rating": "Okay",
        "resembled_practice": False,
        "topics_appeared": ["Generics"],
        "unprepared_topics": ["Annotations"],
    }

    with patch("app.routes.study_routes.resolve_user_id", return_value=user_id):
        sub_res = await submit_exam_feedback(exam_id, payload)
        assert sub_res["outcome_rating"] == "Okay"

        get_res = await get_exam_feedback(exam_id)
        assert get_res["outcome_rating"] == "Okay"
