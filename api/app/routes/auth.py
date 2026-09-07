"""Authentication routes — thin orchestration layer over SupabaseAuthService.

All raw Supabase HTTP calls live in app.services.supabase_auth.
These routes validate input, call the service, and map results to HTTP responses.
"""

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Header

from app.core.rbac import get_user_role
from app.models.user import (
    AuthLoginRequest,
    AuthLoginResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyOtpRequest,
    ResendOtpRequest,
)
from app.services.supabase_auth import SupabaseAuthService, SupabaseAuthError
from app.services.user_service import UserService

logger = logging.getLogger(__name__)
router = APIRouter()

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _map_supabase_error(status_code: int, detail: str) -> HTTPException:
    """Map Supabase Auth status codes to appropriate HTTP responses."""
    if status_code == 400:
        return HTTPException(status_code=400, detail=detail)
    if status_code == 401:
        return HTTPException(status_code=401, detail=detail)
    if status_code == 403:
        return HTTPException(status_code=403, detail=detail)
    if status_code == 404:
        return HTTPException(status_code=400, detail=detail)
    if status_code == 422:
        return HTTPException(status_code=400, detail="An account with this email already exists")
    if status_code == 429:
        return HTTPException(status_code=429, detail="Too many requests. Please try again later.")
    # 5xx from Supabase — never fall back to local auth
    if status_code >= 500:
        logger.error("Supabase Auth returned %d: %s", status_code, detail)
        return HTTPException(status_code=502, detail="Authentication service unavailable")
    return HTTPException(status_code=400, detail=detail)


def _extract_user_data(result: dict) -> dict:
    """Extract user data from a Supabase Auth result, raising on failure."""
    if result.get("error"):
        raise _map_supabase_error(result["status_code"], result["error"])
    data = result.get("data") or {}
    user_data = data.get("user") or {}
    if not user_data.get("id"):
        logger.error("Supabase Auth returned no user ID: %s", result)
        raise HTTPException(status_code=502, detail="Authentication service returned invalid response")
    return user_data


def _extract_token(result: dict) -> str:
    """Extract access token from a Supabase Auth result."""
    data = result.get("data") or {}
    return data.get("access_token", "")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post(
    "/auth/signup",
    response_model=AuthLoginResponse,
    summary="Sign up",
    description="Create a new account via Supabase Auth and return a JWT",
)
async def signup(payload: AuthLoginRequest):
    if not payload.email or not payload.password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    auth_service = SupabaseAuthService()
    user_service = UserService()

    try:
        result = await auth_service.signup(
            email=payload.email,
            password=payload.password,
            data={
                "name": payload.name or payload.email.split("@")[0].capitalize(),
                "avatar": payload.avatar,
                "role": get_user_role({"email": payload.email}),
            },
        )
    except Exception as exc:
        logger.error("Supabase signup connection error for %s", payload.email)
        raise HTTPException(status_code=502, detail="Authentication service unavailable")

    user_data = _extract_user_data(result)
    access_token = _extract_token(result)
    user = await user_service.sync_user_profile(user_data)
    return {"access_token": access_token, "token_type": "bearer", "user": user}


@router.post(
    "/auth/login",
    response_model=AuthLoginResponse,
    summary="Login",
    description="Authenticate via Supabase Auth and return a JWT",
)
async def login(payload: AuthLoginRequest):
    if not payload.email:
        raise HTTPException(status_code=400, detail="Email is required")
    if payload.provider == "credentials" and not payload.password:
        raise HTTPException(status_code=400, detail="Password is required")

    auth_service = SupabaseAuthService()
    user_service = UserService()

    try:
        result = await auth_service.login(
            email=payload.email,
            password=payload.password or "",
        )
    except Exception as exc:
        logger.error("Supabase login connection error for %s", payload.email.lower().strip())
        raise HTTPException(status_code=502, detail="Authentication service unavailable")

    user_data = _extract_user_data(result)
    access_token = _extract_token(result)
    user = await user_service.sync_user_profile(user_data)
    return {"access_token": access_token, "token_type": "bearer", "user": user}


@router.post(
    "/auth/verify-otp",
    response_model=AuthLoginResponse,
    summary="Verify OTP code",
    description="Verify email confirmation OTP via Supabase Auth",
)
async def verify_otp(payload: VerifyOtpRequest):
    if not payload.email or not payload.token:
        raise HTTPException(status_code=400, detail="Email and OTP code are required")

    auth_service = SupabaseAuthService()
    user_service = UserService()

    try:
        result = await auth_service.verify_otp(
            email=payload.email,
            token=payload.token,
            type=payload.type or "signup",
        )
    except Exception as exc:
        logger.error("Supabase verify-otp connection error for %s", payload.email)
        raise HTTPException(status_code=502, detail="Authentication service unavailable")

    user_data = _extract_user_data(result)
    access_token = _extract_token(result)
    user = await user_service.sync_user_profile(user_data)
    return {"access_token": access_token, "token_type": "bearer", "user": user}


@router.post(
    "/auth/resend-otp",
    summary="Resend OTP email",
    description="Resend email verification OTP via Supabase Auth",
)
async def resend_otp(payload: ResendOtpRequest):
    if not payload.email:
        raise HTTPException(status_code=400, detail="Email is required")

    auth_service = SupabaseAuthService()

    try:
        result = await auth_service.resend_otp(
            email=payload.email.lower().strip(),
            type=payload.type or "signup",
        )
    except Exception as exc:
        logger.error("Supabase resend-otp connection error for %s", payload.email)
        raise HTTPException(status_code=502, detail="Authentication service unavailable")

    if result.get("error"):
        raise _map_supabase_error(result["status_code"], result["error"])

    return {"message": "Verification code sent to your email."}


@router.post(
    "/auth/forgot-password",
    summary="Forgot password",
    description="Send a password reset email via Supabase Auth",
)
async def forgot_password(payload: ForgotPasswordRequest):
    if not payload.email:
        raise HTTPException(status_code=400, detail="Email is required")

    auth_service = SupabaseAuthService()

    try:
        result = await auth_service.recover(email=payload.email)
    except Exception as exc:
        logger.error("Supabase forgot-password connection error for %s", payload.email)
        # Always return the same message — never reveal whether the email exists.
        return {"message": "If an account exists for this email address, password reset instructions have been sent."}

    # Always the same message — never reveal whether the email exists.
    return {"message": "If an account exists for this email address, password reset instructions have been sent."}


@router.post(
    "/auth/callback",
    response_model=AuthLoginResponse,
    summary="Auth callback",
    description="Exchange a Supabase callback token for a session",
)
async def auth_callback(data: dict):
    """Called from the frontend /callback page. Supabase email confirmation links
    redirect to /callback?access_token=...&refresh_token=...&type=signup"""
    access_token = data.get("access_token", "").strip()
    if not access_token:
        raise HTTPException(status_code=400, detail="access_token is required")

    auth_service = SupabaseAuthService()
    user_service = UserService()

    try:
        result = await auth_service.get_user(access_token)
    except Exception as exc:
        logger.error("Supabase callback user fetch error")
        raise HTTPException(status_code=502, detail="Authentication service unavailable")

    if result.get("error"):
        raise _map_supabase_error(result["status_code"], result["error"])

    user_data = result.get("data", {}).get("user") or {}
    if not user_data.get("id"):
        logger.error("Supabase callback returned no user ID")
        raise HTTPException(status_code=502, detail="Authentication service returned invalid response")

    user = await user_service.sync_user_profile(user_data)
    return {"access_token": access_token, "token_type": "bearer", "user": user}


@router.post(
    "/auth/reset-password",
    summary="Reset password",
    description="Update account password via Supabase Auth",
)
async def reset_password(
    payload: ResetPasswordRequest, authorization: Optional[str] = Header(None)
):
    if not payload.password or len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization token required to reset password")

    auth_service = SupabaseAuthService()
    token = authorization.split(" ", 1)[1] if " " in authorization else authorization

    try:
        result = await auth_service.update_password(
            access_token=token,
            new_password=payload.password,
        )
    except Exception as exc:
        logger.error("Supabase reset-password connection error")
        raise HTTPException(status_code=502, detail="Authentication service unavailable — password was not changed")

    if result.get("error"):
        raise _map_supabase_error(result["status_code"], result["error"])

    return {"message": "Password updated successfully. You can now sign in with your new password."}


@router.get(
    "/auth/me",
    summary="Get current user",
    description="Validate Supabase bearer token and return authenticated user profile",
)
async def get_current_user(authorization: Optional[str] = Header(None)):
    """Single canonical endpoint for session validation / current user resolution."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Authorization token required")

    token = authorization.split(" ", 1)[1].strip()
    auth_service = SupabaseAuthService()
    user_service = UserService()

    try:
        result = await auth_service.get_user(token)
    except Exception as exc:
        logger.error("Supabase get-user connection error")
        raise HTTPException(status_code=502, detail="Authentication service unavailable")

    if result.get("error"):
        raise _map_supabase_error(result["status_code"], result["error"])

    user_data = result.get("data", {}).get("user") or {}
    if not user_data.get("id"):
        logger.error("Supabase /user returned no user ID")
        raise HTTPException(status_code=502, detail="Authentication service returned invalid response")

    user = await user_service.sync_user_profile(user_data)
    return {"user": user}
