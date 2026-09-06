"""Tests for JWT security verification."""

import pytest
from unittest.mock import patch
import jwt as pyjwt
from datetime import datetime, timedelta, timezone

from app.core.security import verify_supabase_jwt


def _make_jwt(payload: dict, secret: str, algorithm: str = "HS256") -> str:
    return pyjwt.encode(payload, secret, algorithm=algorithm)


def _valid_payload(sub: str = "user-123") -> dict:
    return {
        "sub": sub,
        "aud": "authenticated",
        "role": "authenticated",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
    }


def test_valid_hs256_jwt_accepted():
    secret = "correct-secret-key-123456789012345"
    token = _make_jwt(_valid_payload(), secret)
    with patch("app.core.security.settings.SUPABASE_JWT_SECRET", secret):
        assert verify_supabase_jwt(token) == "user-123"


def test_jwt_rejected_with_wrong_secret():
    token = _make_jwt(_valid_payload("user-wrong"), "wrong-secret-key-12345678901234567890")
    with patch("app.core.security.settings.SUPABASE_JWT_SECRET", "correct-secret-key-123456789012345"):
        assert verify_supabase_jwt(token) is None


def test_jwt_rejected_with_alg_none():
    token = _make_jwt(_valid_payload("user-alg-none"), "", algorithm="none")
    with patch("app.core.security.settings.SUPABASE_JWT_SECRET", "some-secret"):
        assert verify_supabase_jwt(token) is None


def test_expired_jwt_rejected():
    payload = {
        "sub": "user-expired",
        "aud": "authenticated",
        "exp": datetime.now(timezone.utc) - timedelta(seconds=1),
    }
    secret = "some-secret-key-12345678901234"
    token = _make_jwt(payload, secret)
    with patch("app.core.security.settings.SUPABASE_JWT_SECRET", secret):
        assert verify_supabase_jwt(token) is None


def test_malformed_token_rejected():
    assert verify_supabase_jwt("not.a.valid.jwt.at.all") is None
    assert verify_supabase_jwt("") is None
    assert verify_supabase_jwt("null") is None
    assert verify_supabase_jwt("undefined") is None


def test_jwt_missing_supabase_secret_rejected():
    secret = "some-secret"
    token = _make_jwt(_valid_payload(), secret)
    with patch("app.core.security.settings.SUPABASE_JWT_SECRET", ""):
        assert verify_supabase_jwt(token) is None
