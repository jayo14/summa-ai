"""Tests for SupabaseAuthService — token validation only.

All authentication operations are handled by the frontend.
This service is ONLY used for token validation on protected routes.
"""

import pytest
import httpx
from unittest.mock import AsyncMock, patch, MagicMock

from app.services.supabase_auth import SupabaseAuthService, SupabaseAuthError


def _mock_settings():
    return patch.multiple(
        "app.services.supabase_auth.settings",
        SUPABASE_URL="https://test.supabase.co",
        SUPABASE_ANON_KEY="test-anon-key",
    )


class TestSupabaseAuthServiceInit:
    def test_missing_url_raises(self):
        with patch("app.services.supabase_auth.settings.SUPABASE_URL", ""):
            with pytest.raises(ValueError, match="SUPABASE_URL"):
                SupabaseAuthService()

    def test_missing_anon_key_raises(self):
        with _mock_settings(), patch("app.services.supabase_auth.settings.SUPABASE_ANON_KEY", ""):
            with pytest.raises(ValueError, match="SUPABASE_ANON_KEY"):
                SupabaseAuthService()

    def test_init_success(self):
        with _mock_settings():
            service = SupabaseAuthService()
            assert service.base_url == "https://test.supabase.co/auth/v1"


class TestSafeJsonParsing:
    def test_valid_json(self):
        resp = MagicMock()
        resp.json.return_value = {"key": "value"}
        assert SupabaseAuthService._safe_json(resp) == {"key": "value"}

    def test_invalid_json_returns_empty(self):
        resp = MagicMock()
        resp.json.side_effect = ValueError("Invalid JSON")
        assert SupabaseAuthService._safe_json(resp) == {}

    def test_empty_body_returns_empty(self):
        resp = MagicMock()
        resp.json.return_value = {}
        assert SupabaseAuthService._safe_json(resp) == {}


class TestGetUser:
    @pytest.mark.asyncio
    async def test_get_user_success(self):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "user": {"id": "u1", "email": "a@b.com"},
        }

        with _mock_settings():
            service = SupabaseAuthService()
            mock_client = AsyncMock()
            mock_client.request.return_value = mock_response
            mock_client.is_closed = False
            with patch.object(service, "_get_client", return_value=mock_client):
                result = await service.get_user("valid-token")
                assert result["status_code"] == 200
                assert result["data"]["user"]["id"] == "u1"
                assert result["error"] is None

    @pytest.mark.asyncio
    async def test_get_user_invalid_token_returns_401(self):
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_response.json.return_value = {
            "error_code": "invalid_token",
            "msg": "Invalid token",
        }

        with _mock_settings():
            service = SupabaseAuthService()
            mock_client = AsyncMock()
            mock_client.request.return_value = mock_response
            mock_client.is_closed = False
            with patch.object(service, "_get_client", return_value=mock_client):
                result = await service.get_user("bad-token")
                assert result["status_code"] == 401
                assert result["error"] is not None

    @pytest.mark.asyncio
    async def test_get_user_expired_token_returns_401(self):
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_response.json.return_value = {
            "error_code": "token_expired",
            "msg": "Token has expired",
        }

        with _mock_settings():
            service = SupabaseAuthService()
            mock_client = AsyncMock()
            mock_client.request.return_value = mock_response
            mock_client.is_closed = False
            with patch.object(service, "_get_client", return_value=mock_client):
                result = await service.get_user("expired-token")
                assert result["status_code"] == 401

    @pytest.mark.asyncio
    async def test_get_user_timeout_raises_error(self):
        with _mock_settings():
            service = SupabaseAuthService()
            mock_client = AsyncMock()
            mock_client.request.side_effect = httpx.TimeoutException("timeout")
            mock_client.is_closed = False
            with patch.object(service, "_get_client", return_value=mock_client):
                with pytest.raises(SupabaseAuthError) as exc:
                    await service.get_user("token")
                assert exc.value.status_code == 504

    @pytest.mark.asyncio
    async def test_get_user_connection_error_raises_error(self):
        with _mock_settings():
            service = SupabaseAuthService()
            mock_client = AsyncMock()
            mock_client.request.side_effect = httpx.ConnectError("refused")
            mock_client.is_closed = False
            with patch.object(service, "_get_client", return_value=mock_client):
                with pytest.raises(SupabaseAuthError) as exc:
                    await service.get_user("token")
                assert exc.value.status_code == 502

    @pytest.mark.asyncio
    async def test_get_user_server_error_returns_error(self):
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.json.return_value = {"msg": "Internal Server Error"}

        with _mock_settings():
            service = SupabaseAuthService()
            mock_client = AsyncMock()
            mock_client.request.return_value = mock_response
            mock_client.is_closed = False
            with patch.object(service, "_get_client", return_value=mock_client):
                result = await service.get_user("token")
                assert result["status_code"] == 500
                assert "unavailable" in result["error"].lower()

    @pytest.mark.asyncio
    async def test_get_user_includes_auth_header(self):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"user": {"id": "u1"}}

        with _mock_settings():
            service = SupabaseAuthService()
            mock_client = AsyncMock()
            mock_client.request.return_value = mock_response
            mock_client.is_closed = False
            with patch.object(service, "_get_client", return_value=mock_client):
                await service.get_user("my-token")
                call_args = mock_client.request.call_args
                headers = call_args[1]["headers"]
                assert headers["Authorization"] == "Bearer my-token"


class TestClientReuse:
    def test_get_client_creates_singleton(self):
        SupabaseAuthService._client = None
        with _mock_settings():
            service = SupabaseAuthService()
            client1 = service._get_client()
            client2 = service._get_client()
            assert client1 is client2
        SupabaseAuthService._client = None

    def test_get_client_creates_new_when_closed(self):
        mock_closed = MagicMock()
        mock_closed.is_closed = True
        SupabaseAuthService._client = mock_closed
        with _mock_settings():
            service = SupabaseAuthService()
            client = service._get_client()
            assert client is not mock_closed
        SupabaseAuthService._client = None
