"""Tests for security, main app wiring, and config settings."""
import os
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
    hash_password,
    verify_password,
    ConnectionManager,
)
from app.config import Settings, get_cors_origins, is_production


class TestVerifySupabaseJwt:
    def test_valid_token(self):
        token = _make_token("sub-123", "secret", "authenticated")
        assert verify_supabase_jwt(token) == "sub-123"

    def test_expired_token(self):
        token = _make_token("sub-123", "secret", "authenticated", expired=True)
        assert verify_supabase_jwt(token) is None

    def test_invalid_token(self):
        assert verify_supabase_jwt("not-a-jwt") is None

    def test_wrong_audience(self):
        token = _make_token("sub-123", "secret", "wrong-aud")
        assert verify_supabase_jwt(token) is None


def _make_token(sub: str, secret: str, aud: str, expired: bool = False):
    import jwt as pyjwt
    from datetime import datetime, timedelta
    payload = {"sub": sub, "aud": aud}
    if expired:
        payload["exp"] = datetime.utcnow() - timedelta(hours=1)
    else:
        payload["exp"] = datetime.utcnow() + timedelta(hours=1)
    return pyjwt.encode(payload, secret, algorithm="HS256")


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
        ws = MagicMock()
        manager.connect(ws, "user-1")
        assert manager.get_online_count() == 1
        manager.disconnect(ws, "user-1")
        assert manager.get_online_count() == 0

    def test_send_to_user(self):
        manager = ConnectionManager()
        ws = MagicMock()
        manager.connect(ws, "user-1")
        import asyncio
        asyncio.get_event_loop().run_until_complete(manager.send_to_user("user-1", {"type": "test"}))
        ws.send_json.assert_called_once_with({"type": "test"})

    def test_send_to_disconnected_user(self):
        manager = ConnectionManager()
        import asyncio
        asyncio.get_event_loop().run_until_complete(manager.send_to_user("user-1", {"type": "test"}))


class TestPasswordHashing:
    def test_hash_and_verify(self):
        hashed = hash_password("secret")
        assert verify_password("secret", hashed) is True
        assert verify_password("wrong", hashed) is False


class TestConfig:
    def test_is_production_true(self):
        s = Settings(ENVIRONMENT="production")
        assert s.is_production is True

    def test_is_production_false(self):
        s = Settings(ENVIRONMENT="development")
        assert s.is_production is False

    def test_get_cors_origins_default(self):
        s = Settings(BACKEND_CORS_ORIGINS=["http://localhost:3000"], ENVIRONMENT="development")
        assert s.get_cors_origins() == ["http://localhost:3000"]

    def test_get_cors_origins_production_with_frontend_url(self):
        s = Settings(
            BACKEND_CORS_ORIGINS=["http://localhost:3000"],
            ENVIRONMENT="production",
            FRONTEND_URL="https://app.example.com",
        )
        assert "https://app.example.com" in s.get_cors_origins()
