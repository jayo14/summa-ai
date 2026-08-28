"""Tests for new endpoints added in Milestones 10-18."""

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


class TestWebSocketBroadcast:
    def test_broadcast_disabled(self):
        with patch("app.main.verify_supabase_jwt", return_value="user-1"), patch(
            "app.config.settings.WEBSOCKET_ENABLED", False
        ):
            response = client.post("/ws/broadcast", json={"message": "hello"})
            assert response.status_code == 503

    def test_broadcast_enabled(self):
        with patch("app.main.manager") as mock_manager, patch(
            "app.main.verify_supabase_jwt", return_value="user-1"
        ):
            mock_manager.broadcast = AsyncMock()
            response = client.post(
                "/ws/broadcast", json={"type": "announcement", "text": "hello"}
            )
            assert response.status_code == 200
            assert response.json()["status"] == "broadcasted"


class TestFeatureFlags:
    def test_default_feature_flags(self):
        from app.config import settings

        assert hasattr(settings, "WEBSOCKET_ENABLED")
        assert hasattr(settings, "NEW_CHAT_UI")
        assert hasattr(settings, "ADVANCED_ANALYTICS")


class TestRateLimiting:
    def test_rate_limit_headers(self):
        response = client.get("/health", headers=_auth_headers())
        assert response.status_code == 200

    def test_security_headers(self):
        response = client.get("/health", headers=_auth_headers())
        assert response.headers.get("X-Content-Type-Options") == "nosniff"
        assert response.headers.get("X-Frame-Options") == "DENY"
        assert response.headers.get("X-XSS-Protection") == "1; mode=block"


class TestAnalyticsHonesty:
    def test_analytics_not_cached_as_fresh_and_flags_demo_fields(self):
        """Analytics used to ship a hardcoded fixture payload with a
        Cache-Control header implying it was live data. It's now real
        DB/memory aggregates, with the still-unbacked series (no per-quiz
        score history or monthly hexagon snapshots exist yet) explicitly
        named in `demo_fields` instead of faked."""
        with patch(
            "app.routes.data_routes.resolve_user_id", return_value="test-user"
        ), patch("app.routes.data_routes._store") as mock_store:
            mock_pool = MagicMock()
            mock_conn = MagicMock()
            mock_pool.acquire.return_value.__aenter__ = AsyncMock(
                return_value=mock_conn
            )
            mock_pool.acquire.return_value.__aexit__ = AsyncMock(return_value=False)
            mock_conn.fetchrow = AsyncMock(return_value={"total": 10, "mastered": 3})
            mock_conn.fetch = AsyncMock(return_value=[])
            mock_store._get_pool = AsyncMock(return_value=mock_pool)
            response = client.get("/api/v1/analytics", headers=_auth_headers())
            assert response.status_code == 200
            assert "Cache-Control" not in response.headers
            body = response.json()
            assert body["summary"]["concepts_total"] == 10
            assert body["summary"]["concepts_mastered"] == 3
            assert set(body["demo_fields"]) == {
                "hexagon_evolution",
                "quiz_scores",
                "study_time",
            }
            for field in body["demo_fields"]:
                assert body[field] == []


class TestExportMyData:
    def test_export_aggregates_cognee_and_postgres_data(self):
        """The 'Export my data' privacy control used to download a hardcoded
        stub blob. It now calls a real endpoint that pulls from both Cognee
        and every Postgres-backed table."""
        with patch(
            "app.routes.memory.resolve_user_id", return_value="user-1"
        ), patch("app.routes.memory.cognee") as mock_cognee, patch(
            "app.routes.memory.summastudy_memory"
        ) as mock_hybrid, patch(
            "app.routes.memory.DataStore"
        ) as MockDataStore:
            mock_cognee.recall_context = AsyncMock(return_value={"results": [{"text": "convo"}]})
            mock_cognee.recall_exams = AsyncMock(return_value={"exams": [{"name": "Final"}]})
            mock_cognee.recall_learning_progress = AsyncMock(return_value={"progress": []})
            mock_cognee.recall_artifacts = AsyncMock(return_value={"artifacts": []})
            mock_cognee._dataset = MagicMock(return_value="user_user-1_sessions")
            mock_cognee.list_memories = AsyncMock(return_value=[])
            mock_hybrid.retrieve_relevant_memories = AsyncMock(
                return_value=[{"content": "likes short summaries", "type": "preference"}]
            )
            mock_store = MockDataStore.return_value
            mock_store.list_artifacts = AsyncMock(return_value=[{"id": "a1"}])
            mock_store.list_conversations = AsyncMock(return_value=[])
            mock_store.list_timeline_events = AsyncMock(return_value=[])
            mock_store.list_materials = AsyncMock(return_value=[])
            mock_store.list_concepts = AsyncMock(return_value=[])
            mock_store.list_study_plans = AsyncMock(return_value=[])
            mock_store.list_flashcards = AsyncMock(return_value=[])
            mock_store.list_exams = AsyncMock(return_value=[])

            response = client.get("/api/v1/memory/export", headers=_auth_headers())
            assert response.status_code == 200
            body = response.json()
            assert body["user_id"] == "user-1"
            assert "exported_at" in body
            assert body["cognee_memory"]["conversations"] == [{"text": "convo"}]
            assert body["atomic_facts"][0]["content"] == "likes short summaries"
            assert body["postgres_data"]["artifacts"] == [{"id": "a1"}]
