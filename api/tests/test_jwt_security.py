"""Tests for Prompt 0.1 — JWT security verification."""

import pytest
from unittest.mock import patch
import jwt as pyjwt
from datetime import datetime, timedelta, timezone

from app.core.security import verify_supabase_jwt
from app.routes.auth import _create_mock_jwt


def test_jwt_rejected_with_random_wrong_secret():
    payload = {
        "sub": "user-wrong-secret",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
    }
    token = pyjwt.encode(payload, "wrong-secret-key-12345678901234567890", algorithm="HS256")
    with patch("app.core.security.settings.SUPABASE_JWT_SECRET", "correct-secret-key-123456789012345"):
        assert verify_supabase_jwt(token) is None


def test_jwt_rejected_with_alg_none():
    payload = {
        "sub": "user-alg-none",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
    }
    token = pyjwt.encode(payload, "", algorithm="none")
    with patch("app.core.security.settings.SUPABASE_JWT_SECRET", "some-secret"):
        assert verify_supabase_jwt(token) is None


def test_dev_token_accepted_in_non_prod_config():
    secret = "dev-secret-key-change-in-production-12345"
    with patch("app.routes.auth.settings.SUPABASE_JWT_SECRET", secret), \
         patch("app.core.security.settings.SUPABASE_JWT_SECRET", secret):
        token = _create_mock_jwt("dev-user-123")
        assert verify_supabase_jwt(token) == "dev-user-123"
