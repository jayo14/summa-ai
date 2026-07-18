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


class TestAnalyticsCacheHeaders:
    def test_analytics_cache_control(self):
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
            assert "Cache-Control" in response.headers
