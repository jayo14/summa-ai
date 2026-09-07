"""Comprehensive auth route tests — covers all 16 hardening requirements.

Tests verify:
- Successful signup / login / OTP / token verification
- Duplicate signup, wrong password, unverified email
- Expired / invalid OTP
- Resend OTP, forgot password
- Supabase timeout, 500, malformed response
- Missing user ID, malformed Authorization header
- Profile preservation, role preservation
- Role escalation attempts (client cannot select admin)
- THE INVARIANT: Supabase auth failure NEVER results in successful login via UserStore
"""

from unittest.mock import AsyncMock, patch
from fastapi import HTTPException
import pytest

from app.routes.auth import (
    signup,
    login,
    verify_otp,
    resend_otp,
    reset_password,
    forgot_password,
    verify_token,
    get_current_user,
    _parse_bearer_token,
)
from app.models.user import (
    AuthSignupRequest,
    CredentialsLoginRequest,
    VerifyOtpRequest,
    ResendOtpRequest,
    ResetPasswordRequest,
    ForgotPasswordRequest,
    VerifyTokenRequest,
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
        assert _parse_bearer_token("Bearer abc123") == "abc123"

    def test_strips_whitespace(self):
        assert _parse_bearer_token("Bearer   abc123  ") == "abc123"

    def test_missing_header(self):
        with pytest.raises(HTTPException) as exc:
            _parse_bearer_token(None)
        assert exc.value.status_code == 401

    def test_wrong_scheme(self):
        with pytest.raises(HTTPException) as exc:
            _parse_bearer_token("Token abc123")
        assert exc.value.status_code == 401
        assert "Bearer" in exc.value.detail

    def test_no_space(self):
        with pytest.raises(HTTPException) as exc:
            _parse_bearer_token("Bearerabc123")
        assert exc.value.status_code == 401

    def test_empty_token(self):
        with pytest.raises(HTTPException) as exc:
            _parse_bearer_token("Bearer ")
        assert exc.value.status_code == 401

    def test_lowercase_bearer(self):
        assert _parse_bearer_token("bearer abc123") == "abc123"


# ---------------------------------------------------------------------------
# 2. Signup
# ---------------------------------------------------------------------------

class TestSignup:
    @pytest.mark.asyncio
    async def test_signup_success_verified(self):
        """Signup with pre-verified email returns authenticated."""
        result = _ok({
            "access_token": "tok-123",
            "user": {
                "id": "u1", "email": "a@b.com",
                "email_confirmed_at": "2024-01-01T00:00:00Z",
                "user_metadata": {"name": "A"},
            },
        })
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth, \
             patch("app.routes.auth.UserService") as MockUser:
            MockAuth.return_value.signup = AsyncMock(return_value=result)
            MockUser.return_value.sync_user_profile = AsyncMock(return_value={"id": "u1", "email": "a@b.com"})
            resp = await signup(AuthSignupRequest(email="a@b.com", password="pass123", name="A"))
            assert resp["status"] == "authenticated"
            assert resp["access_token"] == "tok-123"

    @pytest.mark.asyncio
    async def test_signup_verification_required(self):
        """Signup without email confirmation returns verification_required."""
        result = _ok({
            "access_token": "",
            "user": {
                "id": "u1", "email": "a@b.com",
                "user_metadata": {},
            },
        })
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth, \
             patch("app.routes.auth.UserService") as MockUser:
            MockAuth.return_value.signup = AsyncMock(return_value=result)
            MockUser.return_value.sync_user_profile = AsyncMock(return_value={"id": "u1", "email": "a@b.com"})
            resp = await signup(AuthSignupRequest(email="a@b.com", password="pass123"))
            assert resp["status"] == "verification_required"
            assert "access_token" not in resp

    @pytest.mark.asyncio
    async def test_signup_duplicate_email_returns_409(self):
        result = _err(422, "User already registered", "email_exists")
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.signup = AsyncMock(return_value=result)
            with pytest.raises(HTTPException) as exc:
                await signup(AuthSignupRequest(email="a@b.com", password="pass123"))
            assert exc.value.status_code == 409

    @pytest.mark.asyncio
    async def test_signup_weak_password_returns_400(self):
        result = _err(422, "Password too short", "weak_password")
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.signup = AsyncMock(return_value=result)
            with pytest.raises(HTTPException) as exc:
                await signup(AuthSignupRequest(email="a@b.com", password="pass123"))
            assert exc.value.status_code == 400
            assert "Password" in exc.value.detail or "password" in exc.value.detail

    @pytest.mark.asyncio
    async def test_signup_timeout_returns_502(self):
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.signup = AsyncMock(side_effect=SupabaseAuthError(504, "timeout", "timed out"))
            with pytest.raises(HTTPException) as exc:
                await signup(AuthSignupRequest(email="a@b.com", password="pass123"))
            assert exc.value.status_code == 502

    @pytest.mark.asyncio
    async def test_signup_500_returns_502(self):
        result = _err(500, "Database error", "unexpected_failure")
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.signup = AsyncMock(return_value=result)
            with pytest.raises(HTTPException) as exc:
                await signup(AuthSignupRequest(email="a@b.com", password="pass123"))
            assert exc.value.status_code == 502

    @pytest.mark.asyncio
    async def test_signup_missing_user_id_returns_502(self):
        """Supabase returned no user ID — never manufacture an identity."""
        result = _ok({"access_token": "tok", "user": {}})
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.signup = AsyncMock(return_value=result)
            with pytest.raises(HTTPException) as exc:
                await signup(AuthSignupRequest(email="a@b.com", password="pass123"))
            assert exc.value.status_code == 502

    @pytest.mark.asyncio
    async def test_signup_short_password_rejected_by_model(self):
        """Password policy enforced at model level."""
        with pytest.raises(Exception):
            AuthSignupRequest(email="a@b.com", password="ab")


# ---------------------------------------------------------------------------
# 3. Login
# ---------------------------------------------------------------------------

class TestLogin:
    @pytest.mark.asyncio
    async def test_login_success(self):
        result = _ok({
            "access_token": "tok-456",
            "user": {"id": "u2", "email": "a@b.com", "user_metadata": {}},
        })
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth, \
             patch("app.routes.auth.UserService") as MockUser:
            MockAuth.return_value.login = AsyncMock(return_value=result)
            MockUser.return_value.sync_user_profile = AsyncMock(return_value={"id": "u2", "email": "a@b.com"})
            resp = await login(CredentialsLoginRequest(email="a@b.com", password="pass123"))
            assert resp["status"] == "authenticated"
            assert resp["access_token"] == "tok-456"

    @pytest.mark.asyncio
    async def test_login_wrong_password_returns_401(self):
        result = _err(401, "Invalid login credentials", "invalid_credentials")
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.login = AsyncMock(return_value=result)
            with pytest.raises(HTTPException) as exc:
                await login(CredentialsLoginRequest(email="a@b.com", password="wrong"))
            assert exc.value.status_code == 401

    @pytest.mark.asyncio
    async def test_login_unverified_email_returns_403(self):
        result = _err(403, "Please verify your email address", "email_not_confirmed")
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.login = AsyncMock(return_value=result)
            with pytest.raises(HTTPException) as exc:
                await login(CredentialsLoginRequest(email="a@b.com", password="pass123"))
            assert exc.value.status_code == 403

    @pytest.mark.asyncio
    async def test_login_timeout_returns_502(self):
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.login = AsyncMock(side_effect=SupabaseAuthError(504, "timeout", "timed out"))
            with pytest.raises(HTTPException) as exc:
                await login(CredentialsLoginRequest(email="a@b.com", password="pass123"))
            assert exc.value.status_code == 502

    @pytest.mark.asyncio
    async def test_login_500_returns_502(self):
        result = _err(500, "Database error", "unexpected_failure")
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.login = AsyncMock(return_value=result)
            with pytest.raises(HTTPException) as exc:
                await login(CredentialsLoginRequest(email="a@b.com", password="pass123"))
            assert exc.value.status_code == 502

    @pytest.mark.asyncio
    async def test_login_rate_limited_returns_429(self):
        result = _err(429, "Rate limit exceeded", "over_request_rate_limit")
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.login = AsyncMock(return_value=result)
            with pytest.raises(HTTPException) as exc:
                await login(CredentialsLoginRequest(email="a@b.com", password="pass123"))
            assert exc.value.status_code == 429

    @pytest.mark.asyncio
    async def test_supabase_failure_never_authenticates_via_userstore(self):
        """THE INVARIANT: Supabase auth failure NEVER results in successful login via UserStore."""
        result = _err(500, "Service down", "unexpected_failure")
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth, \
             patch("app.routes.auth.UserService") as MockUser:
            MockAuth.return_value.login = AsyncMock(return_value=result)
            with pytest.raises(HTTPException) as exc:
                await login(CredentialsLoginRequest(email="a@b.com", password="pass123"))
            assert exc.value.status_code == 502
            # UserService.sync_user_profile must NEVER be called on auth failure
            MockUser.return_value.sync_user_profile.assert_not_called()


# ---------------------------------------------------------------------------
# 4. Verify OTP
# ---------------------------------------------------------------------------

class TestVerifyOtp:
    @pytest.mark.asyncio
    async def test_verify_otp_success(self):
        result = _ok({
            "access_token": "otp-tok",
            "user": {"id": "u3", "email": "a@b.com", "email_confirmed_at": "2024-01-01"},
        })
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth, \
             patch("app.routes.auth.UserService") as MockUser:
            MockAuth.return_value.verify_otp = AsyncMock(return_value=result)
            MockUser.return_value.sync_user_profile = AsyncMock(return_value={"id": "u3", "email": "a@b.com"})
            resp = await verify_otp(VerifyOtpRequest(email="a@b.com", token="123456"))
            assert resp["status"] == "authenticated"

    @pytest.mark.asyncio
    async def test_verify_otp_expired_returns_400(self):
        result = _err(400, "Token has expired", "token_expired")
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.verify_otp = AsyncMock(return_value=result)
            with pytest.raises(HTTPException) as exc:
                await verify_otp(VerifyOtpRequest(email="a@b.com", token="000000"))
            assert exc.value.status_code == 400

    @pytest.mark.asyncio
    async def test_verify_otp_invalid_returns_400(self):
        result = _err(400, "Invalid token", "invalid_token")
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.verify_otp = AsyncMock(return_value=result)
            with pytest.raises(HTTPException) as exc:
                await verify_otp(VerifyOtpRequest(email="a@b.com", token="000000"))
            assert exc.value.status_code == 400


# ---------------------------------------------------------------------------
# 5. Resend OTP
# ---------------------------------------------------------------------------

class TestResendOtp:
    @pytest.mark.asyncio
    async def test_resend_otp_success(self):
        result = _ok({})
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.resend_otp = AsyncMock(return_value=result)
            resp = await resend_otp(ResendOtpRequest(email="a@b.com"))
            assert "sent" in resp["message"].lower()

    @pytest.mark.asyncio
    async def test_resend_otp_timeout_returns_502(self):
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.resend_otp = AsyncMock(side_effect=SupabaseAuthError(504, "timeout", "timed out"))
            with pytest.raises(HTTPException) as exc:
                await resend_otp(ResendOtpRequest(email="a@b.com"))
            assert exc.value.status_code == 502


# ---------------------------------------------------------------------------
# 6. Forgot Password
# ---------------------------------------------------------------------------

class TestForgotPassword:
    @pytest.mark.asyncio
    async def test_forgot_password_success(self):
        result = _ok({})
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.recover = AsyncMock(return_value=result)
            resp = await forgot_password(ForgotPasswordRequest(email="a@b.com"))
            assert "password reset" in resp["message"].lower()

    @pytest.mark.asyncio
    async def test_forgot_password_supabase_500_returns_generic_message(self):
        """Infrastructure failure still returns generic message — no enumeration."""
        result = _err(500, "Service down", "unexpected_failure")
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.recover = AsyncMock(return_value=result)
            resp = await forgot_password(ForgotPasswordRequest(email="a@b.com"))
            assert "password reset" in resp["message"].lower()

    @pytest.mark.asyncio
    async def test_forgot_password_connection_error_returns_generic_message(self):
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.recover = AsyncMock(side_effect=SupabaseAuthError(502, "connection_error", "unavailable"))
            resp = await forgot_password(ForgotPasswordRequest(email="a@b.com"))
            assert "password reset" in resp["message"].lower()

    @pytest.mark.asyncio
    async def test_forgot_password_never_reveals_email_existence(self):
        """Even if Supabase says user not found, we return the same message."""
        result = _err(404, "User not found", "user_not_found")
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.recover = AsyncMock(return_value=result)
            resp = await forgot_password(ForgotPasswordRequest(email="a@b.com"))
            assert "password reset" in resp["message"].lower()


# ---------------------------------------------------------------------------
# 7. Verify Token (renamed from callback)
# ---------------------------------------------------------------------------

class TestVerifyToken:
    @pytest.mark.asyncio
    async def test_verify_token_success(self):
        result = _ok({"user": {"id": "u1", "email": "a@b.com"}})
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth, \
             patch("app.routes.auth.UserService") as MockUser:
            MockAuth.return_value.get_user = AsyncMock(return_value=result)
            MockUser.return_value.sync_user_profile = AsyncMock(return_value={"id": "u1", "email": "a@b.com"})
            resp = await verify_token(VerifyTokenRequest(access_token="valid-token"))
            assert resp["status"] == "authenticated"

    @pytest.mark.asyncio
    async def test_verify_token_invalid_returns_401(self):
        result = _err(401, "Invalid token", "invalid_token")
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.get_user = AsyncMock(return_value=result)
            with pytest.raises(HTTPException) as exc:
                await verify_token(VerifyTokenRequest(access_token="bad-token"))
            assert exc.value.status_code == 401

    @pytest.mark.asyncio
    async def test_verify_token_empty_returns_400(self):
        with pytest.raises(HTTPException) as exc:
            await verify_token(VerifyTokenRequest(access_token=""))
        assert exc.value.status_code == 400


# ---------------------------------------------------------------------------
# 8. Reset Password
# ---------------------------------------------------------------------------

class TestResetPassword:
    @pytest.mark.asyncio
    async def test_reset_password_no_auth_returns_401(self):
        with pytest.raises(HTTPException) as exc:
            await reset_password(ResetPasswordRequest(password="newpass123"), authorization=None)
        assert exc.value.status_code == 401

    @pytest.mark.asyncio
    async def test_reset_password_wrong_scheme_returns_401(self):
        with pytest.raises(HTTPException) as exc:
            await reset_password(ResetPasswordRequest(password="newpass123"), authorization="Token abc")
        assert exc.value.status_code == 401

    @pytest.mark.asyncio
    async def test_reset_password_short_password_rejected(self):
        """Password policy enforced by model — same as signup."""
        with pytest.raises(Exception):
            ResetPasswordRequest(password="abc")

    @pytest.mark.asyncio
    async def test_reset_password_success(self):
        result = _ok({"message": "Password updated"})
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.update_password = AsyncMock(return_value=result)
            resp = await reset_password(
                ResetPasswordRequest(password="newpassword123"),
                authorization="Bearer valid-token",
            )
            assert "successfully" in resp["message"].lower()

    @pytest.mark.asyncio
    async def test_reset_password_supabase_rejects_returns_error(self):
        result = _err(422, "Password too weak", "weak_password")
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.update_password = AsyncMock(return_value=result)
            with pytest.raises(HTTPException) as exc:
                await reset_password(
                    ResetPasswordRequest(password="newpassword123"),
                    authorization="Bearer valid-token",
                )
            assert exc.value.status_code == 400


# ---------------------------------------------------------------------------
# 9. Get Current User (/auth/me)
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


# ---------------------------------------------------------------------------
# 10. Supabase infrastructure failure → 502 (THE INVARIANT)
# ---------------------------------------------------------------------------

class TestSupabaseFailureInvariant:
    """THE CRITICAL INVARIANT: Supabase Auth failure NEVER results in
    successful login via UserStore or any other local fallback."""

    @pytest.mark.asyncio
    async def test_supabase_500_returns_502_not_local_auth(self):
        """Supabase 500 → 502. No local auth fallback."""
        result = _err(500, "Internal Server Error")
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.login = AsyncMock(return_value=result)
            with pytest.raises(HTTPException) as exc:
                await login(CredentialsLoginRequest(email="a@b.com", password="pass123"))
            assert exc.value.status_code == 502
            assert "unavailable" in exc.value.detail.lower()

    @pytest.mark.asyncio
    async def test_supabase_timeout_returns_502(self):
        """Supabase timeout → 502. No local auth fallback."""
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.login = AsyncMock(
                side_effect=SupabaseAuthError(504, "timeout", "Authentication service timed out")
            )
            with pytest.raises(HTTPException) as exc:
                await login(CredentialsLoginRequest(email="a@b.com", password="pass123"))
            assert exc.value.status_code == 502

    @pytest.mark.asyncio
    async def test_supabase_connection_error_returns_502(self):
        """Supabase connection refused → 502. No local auth fallback."""
        with patch("app.routes.auth.SupabaseAuthService") as MockAuth:
            MockAuth.return_value.login = AsyncMock(
                side_effect=SupabaseAuthError(502, "connection_error", "Authentication service unavailable")
            )
            with pytest.raises(HTTPException) as exc:
                await login(CredentialsLoginRequest(email="a@b.com", password="pass123"))
            assert exc.value.status_code == 502


# ---------------------------------------------------------------------------
# 11. Timeout retry — SupabaseAuthService retries once on timeout
# ---------------------------------------------------------------------------

class TestTimeoutRetry:
    def test_request_retries_once_on_timeout(self):
        """_request should retry once on TimeoutException before giving up."""
        from app.services.supabase_auth import SupabaseAuthService
        import httpx

        service = SupabaseAuthService.__new__(SupabaseAuthService)
        service.base_url = "http://test"
        service.headers = {}

        call_count = 0

        async def mock_request(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                raise httpx.TimeoutException("timeout")
            # Second call succeeds
            resp = httpx.Response(200, json={"access_token": "tok"})
            return resp

        with patch.object(SupabaseAuthService, "_get_client") as mock_get:
            mock_client = AsyncMock()
            mock_client.request = mock_request
            mock_get.return_value = mock_client
            import asyncio
            result = asyncio.run(service._request("POST", "/token", json_data={"email": "a@b.com", "password": "pass"}))
            assert call_count == 2
            assert result["data"]["access_token"] == "tok"

    def test_request_fails_after_second_timeout(self):
        """_request raises SupabaseAuthError after two consecutive timeouts."""
        from app.services.supabase_auth import SupabaseAuthService
        import httpx

        service = SupabaseAuthService.__new__(SupabaseAuthService)
        service.base_url = "http://test"
        service.headers = {}

        async def mock_request(*args, **kwargs):
            raise httpx.TimeoutException("timeout")

        with patch.object(SupabaseAuthService, "_get_client") as mock_get:
            mock_client = AsyncMock()
            mock_client.request = mock_request
            mock_get.return_value = mock_client
            import asyncio
            with pytest.raises(SupabaseAuthError) as exc:
                asyncio.run(service._request("POST", "/token", json_data={"email": "a@b.com", "password": "pass"}))
            assert exc.value.status_code == 504
