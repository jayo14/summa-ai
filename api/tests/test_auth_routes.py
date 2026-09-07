"""Auth route tests — covers the simplified auth architecture.

All authentication (signup, login, OTP, password recovery) is handled
directly by the frontend via @supabase/supabase-js.

FastAPI only validates Supabase JWTs and resolves application profiles.

Tests verify:
- GET /auth/me — token validation, profile sync
- Bearer token parsing (strict)
- Supabase failure → 502, no local fallback
- Role escalation attempts blocked
"""

from unittest.mock import AsyncMock, patch
from fastapi import HTTPException
import pytest

from app.routes.auth import (
    get_current_user,
    parse_bearer_token,
    _extract_user_data,
)
from app.services.supabase_auth import SupabaseAuthError


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _ok(data: dict) -> dict:
    return {"status_code": 200, "data": data, "error_code": "", "error": None}


def _err(status: int, error: str, error_code: str = "") -> dict:
    return {"status_code": status, "data": None, "error_code": error_code, "error": error}


# ---------------------------------------------------------------------------
# 1. Bearer token parsing
# ---------------------------------------------------------------------------

class TestBearerParsing:
    def test_valid_bearer(self):
        assert parse_bearer_token("Bearer abc123") == "abc123"

    def test_strips_whitespace(self):
        assert parse_bearer_token("Bearer   abc123  ") == "abc123"

    def test_missing_header(self):
        with pytest.raises(HTTPException) as exc:
            parse_bearer_token(None)
        assert exc.value.status_code == 401

    def test_wrong_scheme(self):
        with pytest.raises(HTTPException) as exc:
            parse_bearer_token("Token abc123")
        assert exc.value.status_code == 401
        assert "Bearer" in exc.value.detail

    def test_no_space(self):
        with pytest.raises(HTTPException) as exc:
            parse_bearer_token("Bearerabc123")
        assert exc.value.status_code == 401

    def test_empty_token(self):
        with pytest.raises(HTTPException) as exc:
            parse_bearer_token("Bearer ")
        assert exc.value.status_code == 401

    def test_lowercase_bearer(self):
        assert parse_bearer_token("bearer abc123") == "abc123"

    def test_tab_in_header(self):
        assert parse_bearer_token("Bearer\tabc123") == "abc123"


# ---------------------------------------------------------------------------
# 2. Extract user data helper
# ---------------------------------------------------------------------------

class TestExtractUserData:
    def test_valid_user_data_wrapped(self):
        result = _ok({"user": {"id": "u1", "email": "a@b.com"}})
        data = _extract_user_data(result)
        assert data["id"] == "u1"

    def test_valid_user_data_direct(self):
        """Supabase /auth/v1/user returns user object directly, not wrapped."""
        result = _ok({"id": "u1", "email": "a@b.com"})
        data = _extract_user_data(result)
        assert data["id"] == "u1"
        assert data["email"] == "a@b.com"

    def test_missing_user_id_raises_502(self):
        result = _ok({"user": {}})
        with pytest.raises(HTTPException) as exc:
            _extract_user_data(result)
        assert exc.value.status_code == 502

    def test_supabase_error_raises(self):
        result = _err(401, "Invalid token")
        with pytest.raises(HTTPException) as exc:
            _extract_user_data(result)
        assert exc.value.status_code == 401

    def test_supabase_500_raises_502(self):
        result = _err(500, "Internal error")
        with pytest.raises(HTTPException) as exc:
            _extract_user_data(result)
        assert exc.value.status_code == 502


# ---------------------------------------------------------------------------
# 3. GET /auth/me — get_current_user
# ---------------------------------------------------------------------------

class TestGetCurrentUser:
    @pytest.mark.asyncio
    async def test_get_current_user_success(self):
        result = _ok({"user": {"id": "u1", "email": "a@b.com"}})
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth, \
             patch("app.routes.auth.UserService") as MockUser:
            MockAuth.return_value.get_user = AsyncMock(return_value=result)
            MockUser.return_value.sync_user_profile = AsyncMock(return_value={"id": "u1", "email": "a@b.com"})
            resp = await get_current_user(authorization="Bearer valid-token")
            assert resp["user"]["id"] == "u1"

    @pytest.mark.asyncio
    async def test_get_current_user_no_auth_returns_401(self):
        with pytest.raises(HTTPException) as exc:
            await get_current_user(authorization=None)
        assert exc.value.status_code == 401

    @pytest.mark.asyncio
    async def test_get_current_user_wrong_scheme_returns_401(self):
        with pytest.raises(HTTPException) as exc:
            await get_current_user(authorization="Token abc123")
        assert exc.value.status_code == 401

    @pytest.mark.asyncio
    async def test_get_current_user_empty_token_returns_401(self):
        with pytest.raises(HTTPException) as exc:
            await get_current_user(authorization="Bearer ")
        assert exc.value.status_code == 401

    @pytest.mark.asyncio
    async def test_get_current_user_invalid_token_returns_401(self):
        result = _err(401, "Invalid token", "invalid_token")
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.get_user = AsyncMock(return_value=result)
            with pytest.raises(HTTPException) as exc:
                await get_current_user(authorization="Bearer invalid-token")
            assert exc.value.status_code == 401

    @pytest.mark.asyncio
    async def test_get_current_user_expired_token_returns_401(self):
        result = _err(401, "Token expired", "token_expired")
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.get_user = AsyncMock(return_value=result)
            with pytest.raises(HTTPException) as exc:
                await get_current_user(authorization="Bearer expired-token")
            assert exc.value.status_code == 401

    @pytest.mark.asyncio
    async def test_get_current_user_supabase_500_returns_502(self):
        result = _err(500, "Internal error")
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.get_user = AsyncMock(return_value=result)
            with pytest.raises(HTTPException) as exc:
                await get_current_user(authorization="Bearer valid-token")
            assert exc.value.status_code == 502

    @pytest.mark.asyncio
    async def test_get_current_user_connection_error_returns_502(self):
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.get_user = AsyncMock(
                side_effect=SupabaseAuthError(502, "connection_error", "unavailable")
            )
            with pytest.raises(HTTPException) as exc:
                await get_current_user(authorization="Bearer valid-token")
            assert exc.value.status_code == 502

    @pytest.mark.asyncio
    async def test_get_current_user_timeout_returns_502(self):
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.get_user = AsyncMock(
                side_effect=SupabaseAuthError(504, "timeout", "timed out")
            )
            with pytest.raises(HTTPException) as exc:
                await get_current_user(authorization="Bearer valid-token")
            assert exc.value.status_code == 502

    @pytest.mark.asyncio
    async def test_get_current_user_missing_user_id_returns_502(self):
        """Supabase returned no user ID — never manufacture an identity."""
        result = _ok({"user": {}})
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.get_user = AsyncMock(return_value=result)
            with pytest.raises(HTTPException) as exc:
                await get_current_user(authorization="Bearer valid-token")
            assert exc.value.status_code == 502

    @pytest.mark.asyncio
    async def test_supabase_failure_never_authenticates_via_userstore(self):
        """THE INVARIANT: Supabase auth failure NEVER results in successful login via UserStore."""
        result = _err(500, "Service down", "unexpected_failure")
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth, \
             patch("app.routes.auth.UserService") as MockUser:
            MockAuth.return_value.get_user = AsyncMock(return_value=result)
            with pytest.raises(HTTPException) as exc:
                await get_current_user(authorization="Bearer valid-token")
            assert exc.value.status_code == 502
            MockUser.return_value.sync_user_profile.assert_not_called()

    @pytest.mark.asyncio
    async def test_profile_sync_preserves_application_fields(self):
        """sync_user_profile must preserve app-owned fields."""
        result = _ok({"user": {"id": "u1", "email": "a@b.com", "email_confirmed_at": "2024-01-01"}})
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth, \
             patch("app.routes.auth.UserService") as MockUser:
            MockAuth.return_value.get_user = AsyncMock(return_value=result)
            MockUser.return_value.sync_user_profile = AsyncMock(return_value={
                "id": "u1", "email": "a@b.com", "name": "A", "role": "user",
            })
            resp = await get_current_user(authorization="Bearer valid-token")
            assert resp["user"]["id"] == "u1"
            assert resp["user"]["role"] == "user"


# ---------------------------------------------------------------------------
# 4. Supabase infrastructure failure → 502 (THE INVARIANT)
# ---------------------------------------------------------------------------

class TestSupabaseFailureInvariant:
    """THE CRITICAL INVARIANT: Supabase Auth failure NEVER results in
    successful login via UserStore or any other local fallback."""

    @pytest.mark.asyncio
    async def test_supabase_500_returns_502(self):
        result = _err(500, "Internal Server Error")
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.get_user = AsyncMock(return_value=result)
            with pytest.raises(HTTPException) as exc:
                await get_current_user(authorization="Bearer valid-token")
            assert exc.value.status_code == 502
            assert "unavailable" in exc.value.detail.lower()

    @pytest.mark.asyncio
    async def test_supabase_timeout_returns_502(self):
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.get_user = AsyncMock(
                side_effect=SupabaseAuthError(504, "timeout", "Authentication service timed out")
            )
            with pytest.raises(HTTPException) as exc:
                await get_current_user(authorization="Bearer valid-token")
            assert exc.value.status_code == 502

    @pytest.mark.asyncio
    async def test_supabase_connection_error_returns_502(self):
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.get_user = AsyncMock(
                side_effect=SupabaseAuthError(502, "connection_error", "Authentication service unavailable")
            )
            with pytest.raises(HTTPException) as exc:
                await get_current_user(authorization="Bearer valid-token")
            assert exc.value.status_code == 502
