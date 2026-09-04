"""Tests for Phase 5 Pattern Analysis and Exam Readiness Model."""

from unittest.mock import patch
import pytest
from app.services.pattern_analysis import PatternAnalysisEngine, sanitize_certainty_phrases


def test_sanitize_certainty_phrases():
    raw = "This topic will be on the exam for sure and is guaranteed to appear."
    clean = sanitize_certainty_phrases(raw)
    assert "will be on the exam" not in clean
    assert "guaranteed to appear" not in clean
    assert "is historically frequent" in clean


def test_pattern_analysis_engine():
    questions = [
        {"topic": "Polymorphism", "year": 2024},
        {"topic": "Polymorphism", "year": 2025},
        {"topic": "Interfaces", "year": 2025},
    ]
    res = PatternAnalysisEngine.analyze_patterns(questions)
    assert res.topic_frequencies["Polymorphism"] == 0.67
    assert res.topic_frequencies["Interfaces"] == 0.33
    assert "will be on the exam" not in res.uncertainty_note


@pytest.mark.asyncio
async def test_exam_readiness_rejects_client_override():
    from app.routes.study_routes import update_exam, get_exam_readiness
    from app.models.study import ExamUpdate
    
    user_id = "user-phase5-test"
    with patch("app.routes.study_routes.resolve_user_id", return_value=user_id):
        with patch("app.routes.study_routes._store.update_exam", return_value={"id": "ex-1", "title": "CSC201 Final"}):
            updated = await update_exam("ex-1", ExamUpdate(readiness=99))
            assert updated is not None

            readiness = await get_exam_readiness("ex-1")
            assert readiness["exam_id"] == "ex-1"
            assert "readiness_score" in readiness
            assert readiness["readiness_score"] != 99
