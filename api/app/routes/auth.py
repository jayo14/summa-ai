"""Authentication routes — thin orchestration layer over SupabaseAuthService.

All raw Supabase HTTP calls live in app.services.supabase_auth.
These routes validate input, call the service, and map results to HTTP responses.

Security invariants:
- Supabase Auth is the sole source of truth for authentication
- UserStore existence is NOT authentication
- Email existence is NOT authentication
- A failed Supabase request NEVER results in successful login
- Roles are server-controlled, never accepted from the client
- Bearer tokens are strictly parsed (no arbitrary strings accepted)
"""

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Header

from app.core.rbac import derive_initial_role
from app.models.user import (
    AuthSignupRequest,
    CredentialsLoginRequest,
    OAuthCallbackRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyOtpRequest,
    ResendOtpRequest,
    VerifyTokenRequest,
    MIN_PASSWORD_LENGTH,
)
from app.services.supabase_auth import SupabaseAuthService, SupabaseAuthError
from app.services.user_service import UserService

logger = logging.getLogger(__name__)
router = APIRouter()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _parse_bearer_token(authorization: Optional[str]) -> str:
    """Strictly parse a Bearer token from the Authorization header.

    Only accepts: "Bearer <token>"
    Rejects: missing header, wrong scheme, whitespace-only tokens, arbitrary strings.

    Raises:
        HTTPException 401 for any malformed input.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header is required")

    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Authorization header must be 'Bearer <token>'",
        )

    token = parts[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Bearer token is empty")

    return token


def _handle_supabase_error(result: dict) -> None:
    """Raise an appropriate HTTPException if the Supabase result contains an error.

    Maps Supabase status codes to predictable HTTP responses.
    Never falls back to local authentication.
    """
    error = result.get("error")
    if not error:
        return

    status_code = result.get("status_code", 500)
    error_code = result.get("error_code", "")

    # 400 — Bad request (validation, malformed input)
    if status_code == 400:
        raise HTTPException(status_code=400, detail=error)

    # 401 — Authentication failure (wrong password, invalid token)
    if status_code == 401:
        raise HTTPException(status_code=401, detail=error)

    # 403 — Forbidden (email not verified, account locked)
    if status_code == 403:
        raise HTTPException(status_code=403, detail=error)

    # 404 — Not found (treat as auth failure for login)
    if status_code == 404:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # 422 — Unprocessable (duplicate email, validation error)
    if status_code == 422:
        if error_code == "weak_password":
            raise HTTPException(status_code=400, detail=error)
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    # 429 — Rate limited
    if status_code == 429:
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")

    # 5xx — Supabase infrastructure failure — NEVER fall back to local auth
    if status_code >= 500:
        logger.error("Supabase Auth %d: %s (code=%s)", status_code, error, error_code)
        raise HTTPException(status_code=502, detail="Authentication service unavailable")

    # Catch-all for unexpected status codes
    raise HTTPException(status_code=400, detail=error)


def _extract_user_data(result: dict) -> dict:
    """Extract and validate user data from a Supabase Auth result.

    Requires a real Supabase user ID. Never manufactures an identity.
    """
    _handle_supabase_error(result)

    data = result.get("data") or {}
    user_data = data.get("user") or {}
    if not user_data.get("id"):
        logger.error("Supabase Auth returned no user ID")
        raise HTTPException(
            status_code=502,
            detail="Authentication service returned invalid response",
        )
    return user_data


def _extract_access_token(result: dict) -> str:
    """Extract access token from a Supabase Auth result."""
    data = result.get("data") or {}
    return data.get("access_token", "")


def _is_email_confirmed(user_data: dict) -> bool:
    """Determine email verification state from Supabase user data.

    Uses only Supabase-derived fields. Never defaults to True.
    """
    return bool(
        user_data.get("email_confirmed_at")
        or user_data.get("confirmed_at")
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post(
    "/auth/signup",
    summary="Sign up",
    description="Create a new account via Supabase Auth. Returns verification_required if email confirmation is pending.",
)
async def signup(payload: AuthSignupRequest):
    """Signup flow:
    1. Validate request (password policy enforced by model)
    2. Call Supabase Auth signup
    3. If email verification is required → return verification_required
    4. Otherwise → sync profile and return authenticated session
    """
    auth_service = SupabaseAuthService()
    user_service = UserService()

    try:
        result = await auth_service.signup(
            email=payload.email,
            password=payload.password,
            data={"name": payload.name or payload.email.split("@")[0].capitalize()},
        )
    except SupabaseAuthError as exc:
        raise HTTPException(status_code=exc.status_code if exc.status_code < 500 else 502, detail=exc.detail)
    except Exception:
        logger.error("Supabase signup connection error")
        raise HTTPException(status_code=502, detail="Authentication service unavailable")

    user_data = _extract_user_data(result)

    # Sync profile — role is server-controlled, never from client
    user = await user_service.sync_user_profile(user_data)

    # Check if email verification is required
    email_confirmed = _is_email_confirmed(user_data)
    if not email_confirmed:
        return {
            "status": "verification_required",
            "user": user,
        }

    access_token = _extract_access_token(result)
    return {
        "status": "authenticated",
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.post(
    "/auth/login",
    summary="Login with email and password",
    description="Authenticate via Supabase Auth using credentials. Returns 401 on failure — never falls back to local auth.",
)
async def login(payload: CredentialsLoginRequest):
    """Credentials login flow:
    1. Validate request (email + password required)
    2. Call Supabase Auth login
    3. On failure → map Supabase error, never fall back to local auth
    4. On success → sync profile and return session
    """
    auth_service = SupabaseAuthService()
    user_service = UserService()

    try:
        result = await auth_service.login(
            email=payload.email,
            password=payload.password,
        )
    except SupabaseAuthError as exc:
        raise HTTPException(status_code=exc.status_code if exc.status_code < 500 else 502, detail=exc.detail)
    except Exception:
        logger.error("Supabase login connection error")
        raise HTTPException(status_code=502, detail="Authentication service unavailable")

    user_data = _extract_user_data(result)
    access_token = _extract_access_token(result)
    user = await user_service.sync_user_profile(user_data)
    return {
        "status": "authenticated",
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.post(
    "/auth/verify-otp",
    summary="Verify OTP code",
    description="Verify email confirmation OTP via Supabase Auth.",
)
async def verify_otp(payload: VerifyOtpRequest):
    """OTP verification flow:
    1. Validate request
    2. Call Supabase Auth verify
    3. Sync profile
    4. Return session
    """
    auth_service = SupabaseAuthService()
    user_service = UserService()

    try:
        result = await auth_service.verify_otp(
            email=payload.email,
            token=payload.token,
            type=payload.type or "signup",
        )
    except SupabaseAuthError as exc:
        raise HTTPException(status_code=exc.status_code if exc.status_code < 500 else 502, detail=exc.detail)
    except Exception:
        logger.error("Supabase verify-otp connection error")
        raise HTTPException(status_code=502, detail="Authentication service unavailable")

    user_data = _extract_user_data(result)
    access_token = _extract_access_token(result)
    user = await user_service.sync_user_profile(user_data)
    return {
        "status": "authenticated",
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.post(
    "/auth/resend-otp",
    summary="Resend OTP email",
    description="Resend email verification OTP via Supabase Auth.",
)
async def resend_otp(payload: ResendOtpRequest):
    auth_service = SupabaseAuthService()

    try:
        result = await auth_service.resend_otp(
            email=payload.email,
            type=payload.type or "signup",
        )
    except SupabaseAuthError as exc:
        raise HTTPException(status_code=exc.status_code if exc.status_code < 500 else 502, detail=exc.detail)
    except Exception:
        logger.error("Supabase resend-otp connection error")
        raise HTTPException(status_code=502, detail="Authentication service unavailable")

    _handle_supabase_error(result)
    return {"message": "Verification code sent to your email."}


@router.post(
    "/auth/forgot-password",
    summary="Forgot password",
    description="Send a password reset email. Always returns the same message — never reveals whether an email exists.",
)
async def forgot_password(payload: ForgotPasswordRequest):
    """Forgot password flow:
    - Always returns the same generic message (anti-enumeration)
    - Infrastructure failures return a 502 but still use the same message
      to avoid distinguishing "email exists" from "service down"
    """
    auth_service = SupabaseAuthService()
    generic_message = "If an account exists for this email address, password reset instructions have been sent."

    try:
        result = await auth_service.recover(email=payload.email)
    except SupabaseAuthError:
        # Infrastructure failure — still return generic message to avoid enumeration
        return {"message": generic_message}
    except Exception:
        logger.error("Supabase forgot-password connection error")
        return {"message": generic_message}

    # Success or Supabase error — always the same message
    # Even if Supabase says "user not found", we don't reveal that
    return {"message": generic_message}


@router.post(
    "/auth/verify-token",
    summary="Verify access token",
    description="Validate a Supabase access token and return the authenticated user profile. Use this after email confirmation or OAuth redirect.",
)
async def verify_token(payload: VerifyTokenRequest):
    """Token verification flow (renamed from /auth/callback):
    1. Accept an access_token (from email confirmation link or OAuth redirect)
    2. Validate it against Supabase /auth/v1/user
    3. Sync profile
    4. Return authenticated session

    This is NOT an OAuth token exchange — it validates an already-issued token.
    """
    access_token = payload.access_token.strip()
    if not access_token:
        raise HTTPException(status_code=400, detail="access_token is required")

    auth_service = SupabaseAuthService()
    user_service = UserService()

    try:
        result = await auth_service.get_user(access_token)
    except SupabaseAuthError as exc:
        raise HTTPException(status_code=exc.status_code if exc.status_code < 500 else 502, detail=exc.detail)
    except Exception:
        logger.error("Supabase verify-token connection error")
        raise HTTPException(status_code=502, detail="Authentication service unavailable")

    user_data = _extract_user_data(result)
    user = await user_service.sync_user_profile(user_data)
    return {
        "status": "authenticated",
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.post(
    "/auth/reset-password",
    summary="Reset password",
    description="Update account password via Supabase Auth. Requires a valid Supabase bearer token.",
)
async def reset_password(
    payload: ResetPasswordRequest,
    authorization: Optional[str] = Header(None),
):
    """Reset password flow:
    1. Strictly parse Bearer token (no arbitrary strings)
    2. Validate password meets policy (enforced by model)
    3. Call Supabase Auth update_password
    4. On success → return confirmation
    """
    token = _parse_bearer_token(authorization)

    auth_service = SupabaseAuthService()

    try:
        result = await auth_service.update_password(
            access_token=token,
            new_password=payload.password,
        )
    except SupabaseAuthError as exc:
        raise HTTPException(
            status_code=exc.status_code if exc.status_code < 500 else 502,
            detail=f"{exc.detail} — password was not changed",
        )
    except Exception:
        logger.error("Supabase reset-password connection error")
        raise HTTPException(
            status_code=502,
            detail="Authentication service unavailable — password was not changed",
        )

    if result.get("error"):
        raise HTTPException(
            status_code=result["status_code"] if result["status_code"] < 500 else 502,
            detail=f"{result['error']} — password was not changed",
        )

    return {"message": "Password updated successfully. You can now sign in with your new password."}


@router.get(
    "/auth/me",
    summary="Get current user",
    description="Validate Supabase bearer token and return authenticated user profile.",
)
async def get_current_user(authorization: Optional[str] = Header(None)):
    """Session validation flow:
    1. Strictly parse Bearer token
    2. Validate against Supabase /auth/v1/user
    3. Sync/load application profile
    4. Return canonical user
    """
    token = _parse_bearer_token(authorization)
    auth_service = SupabaseAuthService()
    user_service = UserService()

    try:
        result = await auth_service.get_user(token)
    except SupabaseAuthError as exc:
        raise HTTPException(status_code=exc.status_code if exc.status_code < 500 else 502, detail=exc.detail)
    except Exception:
        logger.error("Supabase get-user connection error")
        raise HTTPException(status_code=502, detail="Authentication service unavailable")

    user_data = _extract_user_data(result)
    user = await user_service.sync_user_profile(user_data)
    return {"user": user}
