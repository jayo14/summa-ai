"""Tests for SummaStudyClient and UserStore."""
import json
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.summastudy_client import SummaStudyClient
from app.services.user_store import UserStore


class _AsyncContextManager:
    def __init__(self, value):
        self.value = value
    async def __aenter__(self):
        return self.value
    async def __aexit__(self, *args):
        return None


def _mock_pool(store):
    pool = AsyncMock()
    conn = AsyncMock()
    pool.acquire = MagicMock(return_value=_AsyncContextManager(conn))
    store._pool = pool
    return pool, conn


class TestSummaStudyClient:
    def test_enabled_false_when_flag_off(self):
        with patch("app.services.summastudy_client.settings") as mock_settings:
            mock_settings.SUMMASTUDY_ENABLED = False
            mock_settings.SUMMASTUDY_API_BASE = "http://example.com"
            client = SummaStudyClient()
            assert client.enabled is False

    def test_enabled_false_when_base_empty(self):
        with patch("app.services.summastudy_client.settings") as mock_settings:
            mock_settings.SUMMASTUDY_ENABLED = True
            mock_settings.SUMMASTUDY_API_BASE = ""
            client = SummaStudyClient()
            assert client.enabled is False

    @pytest.mark.asyncio
    @patch("app.services.summastudy_client.settings")
    async def test_get_returns_none_on_exception(self, mock_settings):
        mock_settings.SUMMASTUDY_ENABLED = True
        mock_settings.SUMMASTUDY_API_BASE = "http://example.com"
        client = SummaStudyClient()
        mock_client = AsyncMock()
        mock_client.get.side_effect = Exception("boom")
        with patch("app.services.summastudy_client.httpx.AsyncClient") as MockClient:
            MockClient.return_value.__aenter__.return_value = mock_client
            result = await client._get("/path", "token")
            assert result is None

    @pytest.mark.asyncio
    @patch("app.services.summastudy_client.settings")
    async def test_post_returns_data(self, mock_settings):
        mock_settings.SUMMASTUDY_ENABLED = True
        mock_settings.SUMMASTUDY_API_BASE = "http://example.com"
        client = SummaStudyClient()
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"ok": True}
        mock_resp.raise_for_status.return_value = None
        mock_client = AsyncMock()
        mock_client.post.return_value = mock_resp
        with patch("app.services.summastudy_client.httpx.AsyncClient") as MockClient:
            MockClient.return_value.__aenter__.return_value = mock_client
            result = await client._post("/path", "token", {"key": "val"})
            assert result == {"ok": True}

    @pytest.mark.asyncio
    @patch("app.services.summastudy_client.settings")
    async def test_submit_flashcard_review_invalid_rating(self, mock_settings):
        mock_settings.SUMMASTUDY_ENABLED = True
        mock_settings.SUMMASTUDY_API_BASE = "http://example.com"
        client = SummaStudyClient()
        result = await client.submit_flashcard_review("token", "c1", 99)
        assert result is None

    @pytest.mark.asyncio
    @patch("app.services.summastudy_client.settings")
    async def test_generate_plan(self, mock_settings):
        mock_settings.SUMMASTUDY_ENABLED = True
        mock_settings.SUMMASTUDY_API_BASE = "http://example.com"
        client = SummaStudyClient()
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"title": "Plan"}
        mock_resp.raise_for_status.return_value = None
        mock_client = AsyncMock()
        mock_client.post.return_value = mock_resp
        with patch("app.services.summastudy_client.httpx.AsyncClient") as MockClient:
            MockClient.return_value.__aenter__.return_value = mock_client
            result = await client.generate_plan("token", "pass math")
            assert result["title"] == "Plan"


class TestUserStore:
    def setup_method(self):
        self.store = UserStore()

    def test_serialize_user_with_string_dates(self):
        user = {
            "id": "u1",
            "email": "a@b.com",
            "name": "A",
            "avatar": "av",
            "bio": "bio",
            "provider": "credentials",
            "onboarded": True,
            "onboarding_data": "{}",
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-02T00:00:00",
        }
        result = self.store.serialize_user(user)
        assert result["onboarding_data"] == {}
        assert result["created_at"] == "2024-01-01T00:00:00"

    def test_serialize_user_with_datetime_dates(self):
        from datetime import datetime
        user = {
            "id": "u1",
            "email": "a@b.com",
            "name": None,
            "avatar": None,
            "bio": None,
            "provider": "google",
            "onboarded": False,
            "onboarding_data": None,
            "created_at": datetime(2024, 1, 1),
            "updated_at": datetime(2024, 1, 2),
        }
        result = self.store.serialize_user(user)
        assert result["created_at"] == "2024-01-01T00:00:00"
        assert result["updated_at"] == "2024-01-02T00:00:00"

    def test_serialize_user_bad_json_onboarding(self):
        user = {
            "id": "u1",
            "email": "a@b.com",
            "name": None,
            "avatar": None,
            "bio": None,
            "provider": "credentials",
            "onboarded": False,
            "onboarding_data": "not-json",
            "created_at": None,
            "updated_at": None,
        }
        result = self.store.serialize_user(user)
        assert result["onboarding_data"] == {}


class TestUserStoreAsync:
    @pytest.mark.asyncio
    async def test_get_user_by_id_found(self):
        store = UserStore()
        pool, conn = _mock_pool(store)
        conn.fetchrow.return_value = {"id": "u1", "email": "a@b.com"}
        user = await store.get_user_by_id("u1")
        assert user["id"] == "u1"

    @pytest.mark.asyncio
    async def test_get_user_by_id_missing(self):
        store = UserStore()
        pool, conn = _mock_pool(store)
        conn.fetchrow.return_value = None
        user = await store.get_user_by_id("missing")
        assert user is None

    @pytest.mark.asyncio
    async def test_update_user_success(self):
        store = UserStore()
        pool, conn = _mock_pool(store)
        conn.fetchrow.return_value = {"id": "u1", "name": "Alice", "email": "a@b.com"}
        updated = await store.update_user("u1", {"name": "Alice"})
        assert updated["name"] == "Alice"

    @pytest.mark.asyncio
    async def test_update_user_not_found(self):
        store = UserStore()
        pool, conn = _mock_pool(store)
        conn.fetchrow.return_value = None
        with pytest.raises(ValueError):
            await store.update_user("missing", {"name": "X"})

    @pytest.mark.asyncio
    async def test_update_user_no_changes(self):
        store = UserStore()
        pool, conn = _mock_pool(store)
        existing = {"id": "u1", "email": "a@b.com"}
        conn.fetchrow.return_value = existing
        result = await store.update_user("u1", {})
        assert result == existing
