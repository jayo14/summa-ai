"""Tests for auth routes — Supabase Auth proxy."""

from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException
import pytest
from app.routes.auth import signup, login, verify_otp, resend_otp, reset_password, forgot_password, get_current_user
from app.models.user import AuthLoginRequest, VerifyOtpRequest, ResendOtpRequest, ResetPasswordRequest, ForgotPasswordRequest


def _ok_result(data: dict) -> dict:
    """Helper: SupabaseAuthService success result."""
    return {"status_code": 200, "data": data, "error": None}


def _err_result(status: int, detail: str) -> dict:
    """Helper: SupabaseAuthService error result."""
    return {"status_code": status, "data": None, "error": detail}


# ── signup ────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_signup_success():
    result = _ok_result({
        "access_token": "token-123",
        "user": {"id": "u1", "email": "a@b.com", "user_metadata": {"name": "A", "avatar": "av"}},
    })
    with patch("app.routes.auth.SupabaseAuthService") as MockAuth, \
         patch("app.routes.auth.UserService") as MockUser:
        MockAuth.return_value.signup = AsyncMock(return_value=result)
        MockUser.return_value.sync_user_profile = AsyncMock(return_value={"id": "u1", "email": "a@b.com"})
        resp = await signup(AuthLoginRequest(email="a@b.com", password="pass123", name="A"))
        assert resp["access_token"] == "token-123"


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
    result = _err_result(422, "User already registered")
    with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
        MockAuth.return_value.signup = AsyncMock(return_value=result)
        with pytest.raises(HTTPException) as exc:
            await signup(AuthLoginRequest(email="a@b.com", password="pass123"))
        assert exc.value.status_code == 400
        assert "already exists" in exc.value.detail


@pytest.mark.asyncio
async def test_signup_supabase_connection_error_raises_502():
    with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
        MockAuth.return_value.signup = AsyncMock(side_effect=Exception("conn refused"))
        with pytest.raises(HTTPException) as exc:
            await signup(AuthLoginRequest(email="a@b.com", password="pass123"))
        assert exc.value.status_code == 502


@pytest.mark.asyncio
async def test_signup_supabase_500_returns_502():
    result = _err_result(500, "Database error")
    with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
        MockAuth.return_value.signup = AsyncMock(return_value=result)
        with pytest.raises(HTTPException) as exc:
            await signup(AuthLoginRequest(email="a@b.com", password="pass123"))
        assert exc.value.status_code == 502


@pytest.mark.asyncio
async def test_signup_missing_user_id_returns_502():
    result = _ok_result({"access_token": "tok", "user": {}})
    with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
        MockAuth.return_value.signup = AsyncMock(return_value=result)
        with pytest.raises(HTTPException) as exc:
            await signup(AuthLoginRequest(email="a@b.com", password="pass123"))
        assert exc.value.status_code == 502


# ── login ─────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_login_credentials_success():
    result = _ok_result({
        "access_token": "token-456",
        "user": {"id": "u2", "email": "a@b.com", "user_metadata": {}},
    })
    with patch("app.routes.auth.SupabaseAuthService") as MockAuth, \
         patch("app.routes.auth.UserService") as MockUser:
        MockAuth.return_value.login = AsyncMock(return_value=result)
        MockUser.return_value.sync_user_profile = AsyncMock(return_value={"id": "u2", "email": "a@b.com", "provider": "credentials"})
        resp = await login(AuthLoginRequest(email="a@b.com", password="pass123", provider="credentials"))
        assert resp["access_token"] == "token-456"


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
    result = _err_result(401, "Invalid login credentials")
    with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
        MockAuth.return_value.login = AsyncMock(return_value=result)
        with pytest.raises(HTTPException) as exc:
            await login(AuthLoginRequest(email="a@b.com", password="wrong", provider="credentials"))
        assert exc.value.status_code == 401


@pytest.mark.asyncio
async def test_login_supabase_down_returns_502():
    with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
        MockAuth.return_value.login = AsyncMock(side_effect=Exception("Supabase down"))
        with pytest.raises(HTTPException) as exc:
            await login(AuthLoginRequest(email="a@b.com", password="pass", provider="credentials"))
        assert exc.value.status_code == 502


@pytest.mark.asyncio
async def test_login_supabase_500_error_returns_502():
    result = _err_result(500, "Database error querying schema")
    with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
        MockAuth.return_value.login = AsyncMock(return_value=result)
        with pytest.raises(HTTPException) as exc:
            await login(AuthLoginRequest(email="a@b.com", password="pass", provider="credentials"))
        assert exc.value.status_code == 502


# ── verify_otp ────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_verify_otp_success():
    result = _ok_result({
        "access_token": "token-otp",
        "user": {"id": "u3", "email": "a@b.com", "user_metadata": {}, "email_confirmed_at": "2024-01-01"},
    })
    with patch("app.routes.auth.SupabaseAuthService") as MockAuth, \
         patch("app.routes.auth.UserService") as MockUser:
        MockAuth.return_value.verify_otp = AsyncMock(return_value=result)
        MockUser.return_value.sync_user_profile = AsyncMock(return_value={"id": "u3", "email": "a@b.com", "email_verified": True})
        resp = await verify_otp(VerifyOtpRequest(email="a@b.com", token="123456"))
        assert resp["access_token"] == "token-otp"
        assert resp["user"]["email_verified"] is True


@pytest.mark.asyncio
async def test_verify_otp_invalid_code_returns_400():
    result = _err_result(400, "Token has expired or is invalid")
    with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
        MockAuth.return_value.verify_otp = AsyncMock(return_value=result)
        with pytest.raises(HTTPException) as exc:
            await verify_otp(VerifyOtpRequest(email="a@b.com", token="000000"))
        assert exc.value.status_code == 400


# ── resend_otp ────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_resend_otp_success():
    result = _ok_result({})
    with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
        MockAuth.return_value.resend_otp = AsyncMock(return_value=result)
        resp = await resend_otp(ResendOtpRequest(email="a@b.com"))
        assert "sent" in resp["message"].lower()


@pytest.mark.asyncio
async def test_resend_otp_supabase_down_raises_502():
    with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
        MockAuth.return_value.resend_otp = AsyncMock(side_effect=Exception("down"))
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
    result = _ok_result({"message": "Password updated"})
    with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
        MockAuth.return_value.update_password = AsyncMock(return_value=result)
        resp = await reset_password(
            ResetPasswordRequest(password="newpassword123"),
            authorization="Bearer valid-token",
        )
        assert "successfully" in resp["message"].lower()


@pytest.mark.asyncio
async def test_reset_password_supabase_rejects_raises_400():
    result = _err_result(422, "Password too weak")
    with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
        MockAuth.return_value.update_password = AsyncMock(return_value=result)
        with pytest.raises(HTTPException) as exc:
            await reset_password(
                ResetPasswordRequest(password="weakpass"),
                authorization="Bearer valid-token",
            )
        assert exc.value.status_code == 400


# ── forgot_password ───────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_forgot_password_always_returns_same_message():
    result = _ok_result({})
    with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
        MockAuth.return_value.recover = AsyncMock(return_value=result)
        resp = await forgot_password(ForgotPasswordRequest(email="a@b.com"))
        assert "password reset" in resp["message"].lower()


@pytest.mark.asyncio
async def test_forgot_password_supabase_error_still_returns_same_message():
    result = _err_result(500, "Internal error")
    with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
        MockAuth.return_value.recover = AsyncMock(return_value=result)
        resp = await forgot_password(ForgotPasswordRequest(email="a@b.com"))
        assert "password reset" in resp["message"].lower()


# ── get_current_user (/auth/me) ──────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_current_user_success():
    result = _ok_result({"user": {"id": "u1", "email": "a@b.com"}})
    with patch("app.routes.auth.SupabaseAuthService") as MockAuth, \
         patch("app.routes.auth.UserService") as MockUser:
        MockAuth.return_value.get_user = AsyncMock(return_value=result)
        MockUser.return_value.sync_user_profile = AsyncMock(return_value={"id": "u1", "email": "a@b.com"})
        resp = await get_current_user(authorization="Bearer valid-token")
        assert resp["user"]["id"] == "u1"


@pytest.mark.asyncio
async def test_get_current_user_no_auth_raises_401():
    with pytest.raises(HTTPException) as exc:
        await get_current_user(authorization=None)
    assert exc.value.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user_invalid_token_raises_401():
    result = _err_result(401, "Invalid token")
    with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
        MockAuth.return_value.get_user = AsyncMock(return_value=result)
        with pytest.raises(HTTPException) as exc:
            await get_current_user(authorization="Bearer invalid-token")
        assert exc.value.status_code == 401
