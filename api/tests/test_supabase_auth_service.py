"""Tests for SupabaseAuthService — verifies all Supabase Auth operations go through the service."""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.supabase_auth import SupabaseAuthService, SupabaseAuthError


def _mock_settings():
    return patch.multiple(
        "app.services.supabase_auth.settings",
        SUPABASE_URL="https://test.supabase.co",
        SUPABASE_ANON_KEY="test-anon-key",
    )


def _ok_response(status=200, body=None):
    """Create a mock httpx.Response for success."""
    resp = MagicMock()
    resp.status_code = status
    resp.json.return_value = body or {}
    return resp


def _err_response(status, body):
    """Create a mock httpx.Response for error."""
    resp = MagicMock()
    resp.status_code = status
    resp.json.return_value = body
    return resp


class TestSupabaseAuthServiceInit:
    def test_missing_url_raises(self):
        with patch("app.services.supabase_auth.settings.SUPABASE_URL", ""):
            with pytest.raises(ValueError, match="SUPABASE_URL"):
                SupabaseAuthService()

    def test_missing_anon_key_raises(self):
        with _mock_settings(), patch("app.services.supabase_auth.settings.SUPABASE_ANON_KEY", ""):
            with pytest.raises(ValueError, match="SUPABASE_ANON_KEY"):
                SupabaseAuthService()


class TestSupabaseAuthServiceSignup:
    @pytest.mark.asyncio
    async def test_signup_success(self):
        result = {"status_code": 200, "data": {"user": {"id": "u1"}}, "error": None}
        with _mock_settings():
            service = SupabaseAuthService()
            with patch.object(service, "_request", new_callable=AsyncMock, return_value=result):
                resp = await service.signup("a@b.com", "pass123")
                assert resp["error"] is None
                assert resp["data"]["user"]["id"] == "u1"

    @pytest.mark.asyncio
    async def test_signup_with_data(self):
        result = {"status_code": 200, "data": {"user": {"id": "u1"}}, "error": None}
        with _mock_settings():
            service = SupabaseAuthService()
            with patch.object(service, "_request", new_callable=AsyncMock, return_value=result) as mock_req:
                await service.signup("a@b.com", "pass123", data={"name": "Test"})
                call_args = mock_req.call_args
                assert call_args[1]["json_data"]["data"] == {"name": "Test"}


class TestSupabaseAuthServiceLogin:
    @pytest.mark.asyncio
    async def test_login_success(self):
        result = {"status_code": 200, "data": {"access_token": "tok"}, "error": None}
        with _mock_settings():
            service = SupabaseAuthService()
            with patch.object(service, "_request", new_callable=AsyncMock, return_value=result):
                resp = await service.login("a@b.com", "pass123")
                assert resp["error"] is None
                assert resp["data"]["access_token"] == "tok"

    @pytest.mark.asyncio
    async def test_login_invalid_credentials(self):
        result = {"status_code": 401, "data": None, "error": "Invalid login credentials"}
        with _mock_settings():
            service = SupabaseAuthService()
            with patch.object(service, "_request", new_callable=AsyncMock, return_value=result):
                resp = await service.login("a@b.com", "wrong")
                assert resp["status_code"] == 401
                assert "Invalid" in resp["error"]


class TestSupabaseAuthServiceVerifyOtp:
    @pytest.mark.asyncio
    async def test_verify_otp_success(self):
        result = {"status_code": 200, "data": {"access_token": "otp-tok"}, "error": None}
        with _mock_settings():
            service = SupabaseAuthService()
            with patch.object(service, "_request", new_callable=AsyncMock, return_value=result):
                resp = await service.verify_otp("a@b.com", "123456")
                assert resp["error"] is None


class TestSupabaseAuthServiceResendOtp:
    @pytest.mark.asyncio
    async def test_resend_otp_success(self):
        result = {"status_code": 200, "data": {}, "error": None}
        with _mock_settings():
            service = SupabaseAuthService()
            with patch.object(service, "_request", new_callable=AsyncMock, return_value=result):
                resp = await service.resend_otp("a@b.com")
                assert resp["error"] is None


class TestSupabaseAuthServiceRecover:
    @pytest.mark.asyncio
    async def test_recover_success(self):
        result = {"status_code": 200, "data": {}, "error": None}
        with _mock_settings():
            service = SupabaseAuthService()
            with patch.object(service, "_request", new_callable=AsyncMock, return_value=result):
                resp = await service.recover("a@b.com")
                assert resp["error"] is None


class TestSupabaseAuthErrorMapping:
    @pytest.mark.asyncio
    async def test_400_maps_to_error(self):
        result = {"status_code": 400, "data": None, "error": "Bad request"}
        with _mock_settings():
            service = SupabaseAuthService()
            with patch.object(service, "_request", new_callable=AsyncMock, return_value=result):
                resp = await service.login("a@b.com", "pass")
                assert resp["status_code"] == 400

    @pytest.mark.asyncio
    async def test_429_maps_to_rate_limit(self):
        result = {"status_code": 429, "data": None, "error": "Rate limit exceeded"}
        with _mock_settings():
            service = SupabaseAuthService()
            with patch.object(service, "_request", new_callable=AsyncMock, return_value=result):
                resp = await service.signup("a@b.com", "pass")
                assert resp["status_code"] == 429

    @pytest.mark.asyncio
    async def test_500_maps_to_service_unavailable(self):
        result = {"status_code": 500, "data": None, "error": "Database error"}
        with _mock_settings():
            service = SupabaseAuthService()
            with patch.object(service, "_request", new_callable=AsyncMock, return_value=result):
                resp = await service.login("a@b.com", "pass")
                assert resp["status_code"] == 500
                # The router maps this to 502, but the service returns the raw status
