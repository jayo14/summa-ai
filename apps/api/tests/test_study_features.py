"""Tests for Milestone 19 — study plan, flashcard, and exam endpoints."""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _auth_headers():
    return {"Authorization": "Bearer valid-token"}


@pytest.fixture(autouse=True)
def _mock_verify_jwt():
    with patch("app.main.verify_supabase_jwt", return_value="user-1"):
        yield


class TestStudyPlanEndpoints:
    def test_list_study_plans_empty(self):
        with patch("app.routes.study_routes._store") as mock_store:
            mock_store.list_study_plans = AsyncMock(return_value=[])
            response = client.get("/api/v1/study-plans", headers=_auth_headers())
            assert response.status_code == 200
            assert response.json() == []

    def test_list_study_plans_with_data(self):
        mock_plan = {
            "id": "p1", "user_id": "user-1", "title": "Test Plan",
            "progress": 0.5, "days_left": 10, "streak": 3,
            "sessions": [
                {"id": "s1", "plan_id": "p1", "day": "Mon", "topic": "Math",
                 "status": "done", "duration": "30 min", "sort_order": 0},
            ],
            "created_at": "2026-07-18T00:00:00Z",
            "updated_at": "2026-07-18T00:00:00Z",
        }
        with patch("app.routes.study_routes._store") as mock_store:
            mock_store.list_study_plans = AsyncMock(return_value=[mock_plan])
            response = client.get("/api/v1/study-plans", headers=_auth_headers())
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["title"] == "Test Plan"
            assert data[0]["progress"] == 0.5

    def test_create_study_plan(self):
        payload = {
            "title": "New Plan",
            "progress": 0.0,
            "days_left": 14,
            "streak": 1,
            "sessions": [
                {"day": "Mon", "topic": "Algebra", "status": "upcoming", "duration": "45 min", "sort_order": 0},
            ],
        }
        expected = {
            "id": "p-new", "user_id": "user-1", "title": "New Plan",
            "progress": 0.0, "days_left": 14, "streak": 1,
            "sessions": [{"id": "s-new", "plan_id": "p-new", "day": "Mon", "topic": "Algebra",
                          "status": "upcoming", "duration": "45 min", "sort_order": 0}],
            "created_at": "2026-07-18T00:00:00Z", "updated_at": "2026-07-18T00:00:00Z",
        }
        with patch("app.routes.study_routes._store") as mock_store:
            mock_store.create_study_plan = AsyncMock(return_value=expected)
            response = client.post("/api/v1/study-plans", json=payload, headers=_auth_headers())
            assert response.status_code == 201
            assert response.json()["title"] == "New Plan"

    def test_get_study_plan_not_found(self):
        with patch("app.routes.study_routes._store") as mock_store:
            mock_store._get_study_plan = AsyncMock(return_value=None)
            response = client.get("/api/v1/study-plans/nonexistent", headers=_auth_headers())
            assert response.status_code == 404

    def test_get_study_plan_found(self):
        mock_plan = {"id": "p1", "user_id": "user-1", "title": "My Plan", "progress": 0.3,
                     "days_left": 7, "streak": 2, "sessions": [],
                     "created_at": "", "updated_at": ""}
        with patch("app.routes.study_routes._store") as mock_store:
            mock_store._get_study_plan = AsyncMock(return_value=mock_plan)
            response = client.get("/api/v1/study-plans/p1", headers=_auth_headers())
            assert response.status_code == 200
            assert response.json()["title"] == "My Plan"

    def test_update_study_plan(self):
        with patch("app.routes.study_routes._store") as mock_store:
            mock_store.update_study_plan = AsyncMock(return_value={
                "id": "p1", "title": "Updated", "progress": 0.8, "days_left": 3,
                "streak": 5, "sessions": [], "created_at": "", "updated_at": "",
            })
            response = client.patch("/api/v1/study-plans/p1", json={"progress": 0.8}, headers=_auth_headers())
            assert response.status_code == 200
            assert response.json()["progress"] == 0.8

    def test_delete_study_plan(self):
        with patch("app.routes.study_routes._store") as mock_store:
            mock_store.delete_study_plan = AsyncMock(return_value=True)
            response = client.delete("/api/v1/study-plans/p1", headers=_auth_headers())
            assert response.status_code == 200
            assert response.json()["status"] == "success"

    def test_delete_study_plan_not_found(self):
        with patch("app.routes.study_routes._store") as mock_store:
            mock_store.delete_study_plan = AsyncMock(return_value=False)
            response = client.delete("/api/v1/study-plans/nonexistent", headers=_auth_headers())
            assert response.status_code == 404

    def test_update_session(self):
        with patch("app.routes.study_routes._store") as mock_store:
            mock_store.update_session = AsyncMock(return_value={
                "id": "s1", "plan_id": "p1", "day": "Mon", "topic": "Math",
                "status": "done", "duration": "30 min", "sort_order": 0,
            })
            response = client.patch("/api/v1/study-plans/sessions/s1", json={"status": "done"},
                                    headers=_auth_headers())
            assert response.status_code == 200
            assert response.json()["status"] == "done"

    def test_update_session_not_found(self):
        with patch("app.routes.study_routes._store") as mock_store:
            mock_store.update_session = AsyncMock(return_value=None)
            response = client.patch("/api/v1/study-plans/sessions/s1", json={"status": "done"},
                                    headers=_auth_headers())
            assert response.status_code == 404


class TestFlashcardEndpoints:
    def test_list_flashcards_empty(self):
        with patch("app.routes.study_routes._store") as mock_store:
            mock_store.list_flashcards = AsyncMock(return_value=[])
            response = client.get("/api/v1/flashcards", headers=_auth_headers())
            assert response.status_code == 200
            assert response.json() == []

    def test_list_flashcards_with_data(self):
        mock_cards = [
            {"id": "f1", "user_id": "user-1", "front": "Q1", "back": "A1",
             "mastered": False, "ease_factor": 2.5, "interval_days": 0,
             "repetitions": 0, "next_review_at": "", "created_at": "", "updated_at": ""},
        ]
        with patch("app.routes.study_routes._store") as mock_store:
            mock_store.list_flashcards = AsyncMock(return_value=mock_cards)
            response = client.get("/api/v1/flashcards", headers=_auth_headers())
            assert response.status_code == 200
            assert len(response.json()) == 1
            assert response.json()[0]["front"] == "Q1"

    def test_create_flashcard(self):
        with patch("app.routes.study_routes._store") as mock_store:
            mock_store.create_flashcard = AsyncMock(return_value={
                "id": "f-new", "user_id": "user-1", "front": "Q1", "back": "A1",
                "mastered": False, "ease_factor": 2.5, "interval_days": 0,
                "repetitions": 0, "next_review_at": "", "created_at": "", "updated_at": "",
            })
            response = client.post("/api/v1/flashcards", json={"front": "Q1", "back": "A1"},
                                   headers=_auth_headers())
            assert response.status_code == 201
            assert response.json()["front"] == "Q1"

    def test_update_flashcard(self):
        with patch("app.routes.study_routes._store") as mock_store:
            mock_store.update_flashcard = AsyncMock(return_value={
                "id": "f1", "mastered": True, "ease_factor": 2.65, "interval_days": 2,
                "repetitions": 1, "front": "Q1", "back": "A1",
                "next_review_at": "", "created_at": "", "updated_at": "",
            })
            response = client.patch("/api/v1/flashcards/f1", json={"mastered": True, "interval_days": 2},
                                    headers=_auth_headers())
            assert response.status_code == 200
            assert response.json()["mastered"] is True

    def test_delete_flashcard(self):
        with patch("app.routes.study_routes._store") as mock_store:
            mock_store.delete_flashcard = AsyncMock(return_value=True)
            response = client.delete("/api/v1/flashcards/f1", headers=_auth_headers())
            assert response.status_code == 200

    def test_delete_flashcard_not_found(self):
        with patch("app.routes.study_routes._store") as mock_store:
            mock_store.delete_flashcard = AsyncMock(return_value=False)
            response = client.delete("/api/v1/flashcards/nonexistent", headers=_auth_headers())
            assert response.status_code == 404


class TestExamEndpoints:
    def test_list_exams_empty(self):
        with patch("app.routes.study_routes._store") as mock_store:
            mock_store.list_exams = AsyncMock(return_value=[])
            response = client.get("/api/v1/exams", headers=_auth_headers())
            assert response.status_code == 200
            assert response.json() == []

    def test_list_exams_with_data(self):
        mock_exams = [
            {"id": "e1", "user_id": "user-1", "name": "NLP Final",
             "exam_date": "2026-08-01", "readiness": 62,
             "created_at": "", "updated_at": ""},
        ]
        with patch("app.routes.study_routes._store") as mock_store:
            mock_store.list_exams = AsyncMock(return_value=mock_exams)
            response = client.get("/api/v1/exams", headers=_auth_headers())
            assert response.status_code == 200
            assert len(response.json()) == 1
            assert response.json()[0]["name"] == "NLP Final"

    def test_create_exam(self):
        with patch("app.routes.study_routes._store") as mock_store:
            mock_store.create_exam = AsyncMock(return_value={
                "id": "e-new", "user_id": "user-1", "name": "Calculus",
                "exam_date": "2026-08-15", "readiness": 50,
                "created_at": "", "updated_at": "",
            })
            response = client.post("/api/v1/exams", json={"name": "Calculus", "exam_date": "2026-08-15"},
                                   headers=_auth_headers())
            assert response.status_code == 201
            assert response.json()["name"] == "Calculus"

    def test_update_exam(self):
        with patch("app.routes.study_routes._store") as mock_store:
            mock_store.update_exam = AsyncMock(return_value={
                "id": "e1", "name": "Calculus II", "exam_date": "2026-08-15",
                "readiness": 75, "created_at": "", "updated_at": "",
            })
            response = client.patch("/api/v1/exams/e1", json={"readiness": 75}, headers=_auth_headers())
            assert response.status_code == 200
            assert response.json()["readiness"] == 75

    def test_delete_exam(self):
        with patch("app.routes.study_routes._store") as mock_store:
            mock_store.delete_exam = AsyncMock(return_value=True)
            response = client.delete("/api/v1/exams/e1", headers=_auth_headers())
            assert response.status_code == 200

    def test_delete_exam_not_found(self):
        with patch("app.routes.study_routes._store") as mock_store:
            mock_store.delete_exam = AsyncMock(return_value=False)
            response = client.delete("/api/v1/exams/nonexistent", headers=_auth_headers())
            assert response.status_code == 404


class TestStudyModels:
    def test_study_plan_create_model(self):
        from app.models.study import StudyPlanCreate, StudySessionCreate
        plan = StudyPlanCreate(
            title="Test",
            sessions=[StudySessionCreate(day="Mon", topic="Math")],
        )
        assert plan.title == "Test"
        assert plan.progress == 0.0
        assert len(plan.sessions) == 1

    def test_study_session_update_model(self):
        from app.models.study import StudySessionUpdate
        update = StudySessionUpdate(status="done")
        assert update.status == "done"
        assert update.duration is None

    def test_flashcard_create_model(self):
        from app.models.study import FlashcardCreate
        card = FlashcardCreate(front="Q", back="A")
        assert card.front == "Q"

    def test_flashcard_update_model(self):
        from app.models.study import FlashcardsUpdate
        update = FlashcardsUpdate(mastered=True)
        assert update.mastered is True

    def test_exam_create_model(self):
        from app.models.study import ExamCreate
        from datetime import date
        exam = ExamCreate(name="Final", exam_date=date(2026, 8, 1))
        assert exam.readiness == 0

    def test_exam_update_model(self):
        from app.models.study import ExamUpdate
        update = ExamUpdate(readiness=80)
        assert update.readiness == 80
        assert update.name is None
