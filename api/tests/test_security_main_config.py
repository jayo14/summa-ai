"""Tests for security, main app wiring, and config settings."""

import os
import asyncio
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import HTTPException
from app.core.security import (
    verify_supabase_jwt,
    resolve_user_id,
    set_current_user_id,
    reset_current_user_id,
    set_current_jwt_token,
    reset_current_jwt_token,
    ConnectionManager,
)
from app.config import Settings


def _make_token(sub: str, secret: str, aud: str, expired: bool = False):
    import jwt as pyjwt
    from datetime import datetime, timedelta

    payload = {"sub": sub, "aud": aud}
    if expired:
        payload["exp"] = datetime.now() - timedelta(hours=1)
    else:
        payload["exp"] = datetime.now() + timedelta(hours=1)
    return pyjwt.encode(payload, secret, algorithm="HS256")


class TestVerifySupabaseJwt:
    def test_valid_token(self):
        with patch("app.core.security.settings") as mock_settings:
            mock_settings.SUPABASE_JWT_SECRET = "secret"
            token = _make_token("sub-123", "secret", "authenticated")
            assert verify_supabase_jwt(token) == "sub-123"

    def test_expired_token(self):
        with patch("app.core.security.settings") as mock_settings:
            mock_settings.SUPABASE_JWT_SECRET = "secret"
            token = _make_token("sub-123", "secret", "authenticated", expired=True)
            assert verify_supabase_jwt(token) is None

    def test_invalid_token(self):
        with patch("app.core.security.settings") as mock_settings:
            mock_settings.SUPABASE_JWT_SECRET = "secret"
            assert verify_supabase_jwt("not-a-jwt") is None

    def test_wrong_audience(self):
        with patch("app.core.security.settings") as mock_settings:
            mock_settings.SUPABASE_JWT_SECRET = "secret"
            token = _make_token("sub-123", "secret", "wrong-aud")
            assert verify_supabase_jwt(token) is None


class TestResolveUserId:
    def test_set_and_resolve(self):
        token = set_current_user_id("user-1")
        assert resolve_user_id() == "user-1"
        reset_current_user_id(token)

    def test_unset_raises(self):
        from app.core.security import current_user_id

        token = current_user_id.set(None)
        with pytest.raises(HTTPException) as exc:
            resolve_user_id()
        assert exc.value.status_code == 401
        current_user_id.reset(token)


class TestConnectionManager:
    def test_connect_disconnect(self):
        manager = ConnectionManager()
        ws = AsyncMock()
        asyncio.run(manager.connect(ws, "user-1"))
        assert manager.get_online_count() == 1
        manager.disconnect(ws, "user-1")
        assert manager.get_online_count() == 0

    def test_send_to_user(self):
        manager = ConnectionManager()
        ws = AsyncMock()
        asyncio.run(manager.connect(ws, "user-1"))
        asyncio.run(manager.send_to_user("user-1", {"type": "test"}))
        ws.send_json.assert_called_once_with({"type": "test"})

    def test_send_to_disconnected_user(self):
        manager = ConnectionManager()
        asyncio.run(manager.send_to_user("user-1", {"type": "test"}))


class TestConfig:
    def test_is_production_true(self):
        s = Settings(ENVIRONMENT="production")
        assert s.is_production is True

    def test_is_production_false(self):
        s = Settings(ENVIRONMENT="development")
        assert s.is_production is False

    def test_get_cors_origins_default(self):
        s = Settings(
            BACKEND_CORS_ORIGINS=["http://localhost:3000"], ENVIRONMENT="development"
        )
        assert s.get_cors_origins() == ["http://localhost:3000"]

    def test_get_cors_origins_production_with_frontend_url(self):
        with patch.dict(os.environ, {"FRONTEND_URL": "https://app.example.com"}):
            s = Settings(
                BACKEND_CORS_ORIGINS=["http://localhost:3000"],
                ENVIRONMENT="production",
            )
            assert "https://app.example.com" in s.get_cors_origins()


# ---------------------------------------------------------------------------
# Security invariants — must never regress
# ---------------------------------------------------------------------------

class TestSecurityInvariants:
    def test_create_access_token_must_not_exist(self):
        """create_access_token was removed during refactor — must never be re-added."""
        from app.core import security
        assert not hasattr(security, "create_access_token"), (
            "create_access_token must not exist in security module — "
            "Supabase Auth is the sole token source"
        )

    def test_hash_password_must_not_exist(self):
        """hash_password was removed during refactor — must never be re-added."""
        from app.core import security
        assert not hasattr(security, "hash_password"), (
            "hash_password must not exist in security module"
        )

    def test_verify_password_must_not_exist(self):
        """verify_password was removed during refactor — must never be re-added."""
        from app.core import security
        assert not hasattr(security, "verify_password"), (
            "verify_password must not exist in security module"
        )

    def test_jwks_max_staleness_constant(self):
        """JWKS cache must have a max staleness limit."""
        from app.core import jwks
        assert hasattr(jwks, "JWKS_MAX_STALENESS_SECONDS")
        assert jwks.JWKS_MAX_STALENESS_SECONDS == 86400.0  # 24 hours
