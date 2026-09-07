"""Tests for auth routes — Supabase Auth proxy."""

from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException
import pytest
from app.routes.auth import signup, login, verify_otp, resend_otp, reset_password
from app.models.user import AuthLoginRequest, VerifyOtpRequest, ResendOtpRequest, ResetPasswordRequest


def _mock_supabase_settings():
    """Patch settings so _supabase_auth_url / _supabase_headers don't raise 503."""
    return patch.multiple(
        "app.routes.auth.settings",
        SUPABASE_URL="https://test.supabase.co",
        SUPABASE_ANON_KEY="test-anon-key",
    )


# ── signup ────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_signup_success():
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "access_token": "token-123",
        "user": {
            "id": "u1",
            "email": "a@b.com",
            "user_metadata": {"name": "A", "avatar": "av"},
        },
    }
    with _mock_supabase_settings(), \
         patch("app.routes.auth.httpx.AsyncClient") as MockClient:
        MockClient.return_value.__aenter__.return_value.post.return_value = mock_resp
        result = await signup(AuthLoginRequest(email="a@b.com", password="pass123", name="A"))
        assert result["access_token"] == "token-123"


@pytest.mark.asyncio
async def test_signup_missing_email():
    with pytest.raises(HTTPException) as exc:
        await signup(AuthLoginRequest(email="", password="pass123"))
    assert exc.value.status_code == 400


@pytest.mark.asyncio
async def test_signup_missing_password():
    with pytest.raises(HTTPException) as exc:
        await signup(AuthLoginRequest(email="a@b.com", password=""))
    assert exc.value.status_code == 400


@pytest.mark.asyncio
async def test_signup_duplicate_email():
    mock_resp = MagicMock()
    mock_resp.status_code = 422
    mock_resp.json.return_value = {"msg": "User already registered"}
    with _mock_supabase_settings(), \
         patch("app.routes.auth.httpx.AsyncClient") as MockClient:
        MockClient.return_value.__aenter__.return_value.post.return_value = mock_resp
        with pytest.raises(HTTPException) as exc:
            await signup(AuthLoginRequest(email="a@b.com", password="pass123"))
        assert exc.value.status_code == 400
        assert "already exists" in exc.value.detail


@pytest.mark.asyncio
async def test_signup_supabase_connection_error_raises_502():
    with _mock_supabase_settings(), \
         patch("app.routes.auth.httpx.AsyncClient") as MockClient:
        MockClient.return_value.__aenter__.return_value.post.side_effect = Exception("conn refused")
        with pytest.raises(HTTPException) as exc:
            await signup(AuthLoginRequest(email="a@b.com", password="pass123"))
        assert exc.value.status_code == 502


@pytest.mark.asyncio
async def test_signup_missing_supabase_url_raises_503():
    with patch("app.routes.auth.settings.SUPABASE_URL", ""), \
         patch("app.routes.auth.settings.SUPABASE_ANON_KEY", "key"):
        with pytest.raises(HTTPException) as exc:
            await signup(AuthLoginRequest(email="a@b.com", password="pass123"))
        assert exc.value.status_code == 503


# ── login ─────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_login_credentials_success():
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "access_token": "token-456",
        "user": {"id": "u2", "email": "a@b.com", "user_metadata": {}},
    }
    with _mock_supabase_settings(), \
         patch("app.routes.auth.httpx.AsyncClient") as MockClient:
        MockClient.return_value.__aenter__.return_value.post.return_value = mock_resp
        result = await login(AuthLoginRequest(email="a@b.com", password="pass123", provider="credentials"))
        assert result["access_token"] == "token-456"
        assert result["user"]["provider"] == "credentials"


@pytest.mark.asyncio
async def test_login_missing_email():
    with pytest.raises(HTTPException) as exc:
        await login(AuthLoginRequest(email="", password="pass123"))
    assert exc.value.status_code == 400


@pytest.mark.asyncio
async def test_login_missing_password_credentials():
    with pytest.raises(HTTPException) as exc:
        await login(AuthLoginRequest(email="a@b.com", password="", provider="credentials"))
    assert exc.value.status_code == 400


@pytest.mark.asyncio
async def test_login_invalid_credentials_returns_401():
    mock_resp = MagicMock()
    mock_resp.status_code = 401
    mock_resp.json.return_value = {"error_description": "Invalid login credentials"}
    with _mock_supabase_settings(), \
         patch("app.routes.auth.httpx.AsyncClient") as MockClient:
        MockClient.return_value.__aenter__.return_value.post.return_value = mock_resp
        with pytest.raises(HTTPException) as exc:
            await login(AuthLoginRequest(email="a@b.com", password="wrong", provider="credentials"))
        assert exc.value.status_code == 401


@pytest.mark.asyncio
async def test_login_unconfirmed_email_returns_403():
    mock_resp = MagicMock()
    mock_resp.status_code = 400
    mock_resp.json.return_value = {"error_description": "Email not confirmed"}
    with _mock_supabase_settings(), \
         patch("app.routes.auth.httpx.AsyncClient") as MockClient:
        MockClient.return_value.__aenter__.return_value.post.return_value = mock_resp
        with pytest.raises(HTTPException) as exc:
            await login(AuthLoginRequest(email="a@b.com", password="pass", provider="credentials"))
        assert exc.value.status_code == 403


@pytest.mark.asyncio
async def test_login_supabase_down_returns_502():
    with _mock_supabase_settings(), \
         patch("app.routes.auth.httpx.AsyncClient") as MockClient:
        MockClient.return_value.__aenter__.return_value.post.side_effect = Exception("Supabase down")
        with pytest.raises(HTTPException) as exc:
            await login(AuthLoginRequest(email="a@b.com", password="pass", provider="credentials"))
        assert exc.value.status_code == 502


@pytest.mark.asyncio
async def test_login_supabase_500_fallback_success():
    mock_resp = MagicMock()
    mock_resp.status_code = 500
    mock_resp.json.return_value = {
        "code": 500,
        "error_code": "unexpected_failure",
        "msg": "Database error querying schema",
    }
    mock_resp.text = '{"code":500,"error_code":"unexpected_failure","msg":"Database error querying schema"}'
    
    mock_user = {
        "id": "u-fallback",
        "email": "fallback@summa.ai",
        "name": "Fallback User",
        "role": "student",
    }
    
    with _mock_supabase_settings(), \
         patch("app.routes.auth.httpx.AsyncClient") as MockClient, \
         patch("app.routes.auth.UserStore.get_user_by_email", new_callable=AsyncMock) as mock_get_user, \
         patch("app.routes.auth.UserStore.serialize_user", side_effect=lambda u: u):
        MockClient.return_value.__aenter__.return_value.post.return_value = mock_resp
        mock_get_user.return_value = mock_user
        
        result = await login(AuthLoginRequest(email="fallback@summa.ai", password="pass", provider="credentials"))
        assert "access_token" in result
        assert result["user"]["email"] == "fallback@summa.ai"


@pytest.mark.asyncio
async def test_login_missing_supabase_url_raises_503():
    with patch("app.routes.auth.settings.SUPABASE_URL", ""), \
         patch("app.routes.auth.settings.SUPABASE_ANON_KEY", "key"):
        with pytest.raises(HTTPException) as exc:
            await login(AuthLoginRequest(email="a@b.com", password="pass"))
        assert exc.value.status_code == 503


# ── verify_otp ────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_verify_otp_success():
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "access_token": "token-otp",
        "user": {"id": "u3", "email": "a@b.com", "user_metadata": {}},
    }
    with _mock_supabase_settings(), \
         patch("app.routes.auth.httpx.AsyncClient") as MockClient:
        MockClient.return_value.__aenter__.return_value.post.return_value = mock_resp
        result = await verify_otp(VerifyOtpRequest(email="a@b.com", token="123456"))
        assert result["access_token"] == "token-otp"
        assert result["user"]["email_verified"] is True


@pytest.mark.asyncio
async def test_verify_otp_invalid_code_returns_400():
    mock_resp = MagicMock()
    mock_resp.status_code = 400
    mock_resp.json.return_value = {"error_description": "Token has expired or is invalid"}
    with _mock_supabase_settings(), \
         patch("app.routes.auth.httpx.AsyncClient") as MockClient:
        MockClient.return_value.__aenter__.return_value.post.return_value = mock_resp
        with pytest.raises(HTTPException) as exc:
            await verify_otp(VerifyOtpRequest(email="a@b.com", token="000000"))
        assert exc.value.status_code == 400


# ── resend_otp ────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_resend_otp_success():
    mock_resp = MagicMock()
    mock_resp.status_code = 204
    with _mock_supabase_settings(), \
         patch("app.routes.auth.httpx.AsyncClient") as MockClient:
        MockClient.return_value.__aenter__.return_value.post.return_value = mock_resp
        result = await resend_otp(ResendOtpRequest(email="a@b.com"))
        assert "sent" in result["message"].lower()


@pytest.mark.asyncio
async def test_resend_otp_supabase_down_raises_502():
    with _mock_supabase_settings(), \
         patch("app.routes.auth.httpx.AsyncClient") as MockClient:
        MockClient.return_value.__aenter__.return_value.post.side_effect = Exception("down")
        with pytest.raises(HTTPException) as exc:
            await resend_otp(ResendOtpRequest(email="a@b.com"))
        assert exc.value.status_code == 502


# ── reset_password ────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_reset_password_no_auth_raises_401():
    with pytest.raises(HTTPException) as exc:
        await reset_password(ResetPasswordRequest(password="newpass123"), authorization=None)
    assert exc.value.status_code == 401


@pytest.mark.asyncio
async def test_reset_password_too_short_raises_400():
    with pytest.raises(HTTPException) as exc:
        await reset_password(ResetPasswordRequest(password="abc"), authorization="Bearer tok")
    assert exc.value.status_code == 400


@pytest.mark.asyncio
async def test_reset_password_success():
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    with _mock_supabase_settings(), \
         patch("app.routes.auth.httpx.AsyncClient") as MockClient:
        MockClient.return_value.__aenter__.return_value.put.return_value = mock_resp
        result = await reset_password(
            ResetPasswordRequest(password="newpassword123"),
            authorization="Bearer valid-token",
        )
        assert "successfully" in result["message"].lower()


@pytest.mark.asyncio
async def test_reset_password_supabase_rejects_raises_400():
    mock_resp = MagicMock()
    mock_resp.status_code = 422
    mock_resp.json.return_value = {"error_description": "Password too weak"}
    with _mock_supabase_settings(), \
         patch("app.routes.auth.httpx.AsyncClient") as MockClient:
        MockClient.return_value.__aenter__.return_value.put.return_value = mock_resp
        with pytest.raises(HTTPException) as exc:
            await reset_password(
                ResetPasswordRequest(password="weakpass"),
                authorization="Bearer valid-token",
            )
        assert exc.value.status_code == 400
