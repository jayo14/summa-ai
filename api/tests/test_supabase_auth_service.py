"""Tests for SupabaseAuthService — verifies centralized error handling, client reuse, status code mapping."""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.supabase_auth import SupabaseAuthService, SupabaseAuthError, _SUPABASE_ERROR_MAP


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


class TestErrorExtraction:
    def test_known_error_code(self):
        body = {"error_code": "invalid_credentials", "msg": "Bad"}
        assert SupabaseAuthService._extract_error(body, 401) == "Invalid email or password"

    def test_unknown_error_400(self):
        body = {"msg": "Something wrong"}
        assert SupabaseAuthService._extract_error(body, 400) == "Something wrong"

    def test_unknown_error_401(self):
        body = {}
        assert SupabaseAuthService._extract_error(body, 401) == "Invalid email or password"

    def test_unknown_error_429(self):
        body = {}
        assert SupabaseAuthService._extract_error(body, 429) == "Too many requests. Please try again later."

    def test_500_hides_infrastructure(self):
        body = {"msg": "Database connection pool exhausted"}
        error = SupabaseAuthService._extract_error(body, 500)
        assert "Database" not in error
        assert "unavailable" in error.lower()

    def test_weak_password_code(self):
        body = {"error_code": "weak_password", "msg": "Too short"}
        assert SupabaseAuthService._extract_error(body, 422) == "Password does not meet strength requirements"

    def test_rate_limit_code(self):
        body = {"error_code": "over_request_rate_limit"}
        assert SupabaseAuthService._extract_error(body, 429) == "Too many requests. Please try again later."


class TestSupabaseAuthErrorMapping:
    @pytest.mark.asyncio
    async def test_timeout_raises_error(self):
        import httpx
        with _mock_settings():
            service = SupabaseAuthService()
            mock_client = AsyncMock()
            mock_client.request.side_effect = httpx.TimeoutException("timeout")
            mock_client.is_closed = False
            with patch.object(service, "_get_client", return_value=mock_client):
                with pytest.raises(SupabaseAuthError) as exc:
                    await service.login("a@b.com", "pass")
                assert exc.value.status_code == 504

    @pytest.mark.asyncio
    async def test_connection_error_raises_error(self):
        import httpx
        with _mock_settings():
            service = SupabaseAuthService()
            mock_client = AsyncMock()
            mock_client.request.side_effect = httpx.ConnectError("refused")
            mock_client.is_closed = False
            with patch.object(service, "_get_client", return_value=mock_client):
                with pytest.raises(SupabaseAuthError) as exc:
                    await service.login("a@b.com", "pass")
                assert exc.value.status_code == 502


class TestSupabaseAuthErrorMap:
    def test_all_known_codes_have_messages(self):
        for code in _SUPABASE_ERROR_MAP:
            assert isinstance(_SUPABASE_ERROR_MAP[code], str)
            assert len(_SUPABASE_ERROR_MAP[code]) > 0
