"""Tests for SummaStudyClient and UserStore."""
import json
from unittest.mock import AsyncMock, patch
from app.services.summastudy_client import SummaStudyClient
from app.services.user_store import UserStore


class TestSummaStudyClient:
    def setup_method(self):
        self.client = SummaStudyClient()

    def test_enabled_false_when_flag_off(self):
        with patch("app.services.summastudy_client.settings") as mock_settings:
            mock_settings.SUMMASTUDY_ENABLED = False
            mock_settings.SUMMASTUDY_API_BASE = "http://example.com"
            assert self.client.enabled is False

    def test_enabled_false_when_base_empty(self):
        with patch("app.services.summastudy_client.settings") as mock_settings:
            mock_settings.SUMMASTUDY_ENABLED = True
            mock_settings.SUMMASTUDY_API_BASE = ""
            assert self.client.enabled is False

    @patch("app.services.summastudy_client.settings")
    async def test_get_returns_none_on_exception(self, mock_settings):
        mock_settings.SUMMASTUDY_ENABLED = True
        mock_settings.SUMMASTUDY_API_BASE = "http://example.com"
        with patch("app.services.summastudy_client.httpx.AsyncClient") as MockClient:
            MockClient.return_value.__aenter__.return_value.get.side_effect = Exception("boom")
            result = await self.client._get("/path", "token")
            assert result is None

    @patch("app.services.summastudy_client.settings")
    async def test_post_returns_data(self, mock_settings):
        mock_settings.SUMMASTUDY_ENABLED = True
        mock_settings.SUMMASTUDY_API_BASE = "http://example.com"
        mock_resp = AsyncMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"ok": True}
        mock_resp.raise_for_status.return_value = None
        with patch("app.services.summastudy_client.httpx.AsyncClient") as MockClient:
            MockClient.return_value.__aenter__.return_value.post.return_value = mock_resp
            result = await self.client._post("/path", "token", {"key": "val"})
            assert result == {"ok": True}

    @patch("app.services.summastudy_client.settings")
    async def test_submit_flashcard_review_invalid_rating(self, mock_settings):
        mock_settings.SUMMASTUDY_ENABLED = True
        mock_settings.SUMMASTUDY_API_BASE = "http://example.com"
        result = await self.client.submit_flashcard_review("token", "c1", 99)
        assert result is None

    @patch("app.services.summastudy_client.settings")
    async def test_generate_plan(self, mock_settings):
        mock_settings.SUMMASTUDY_ENABLED = True
        mock_settings.SUMMASTUDY_API_BASE = "http://example.com"
        mock_resp = AsyncMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"title": "Plan"}
        mock_resp.raise_for_status.return_value = None
        with patch("app.services.summastudy_client.httpx.AsyncClient") as MockClient:
            MockClient.return_value.__aenter__.return_value.post.return_value = mock_resp
            result = await self.client.generate_plan("token", "pass math")
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
