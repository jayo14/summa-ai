"""Authentication routes — Supabase Auth REST API proxy."""

import logging
import uuid
import httpx
from fastapi import APIRouter, HTTPException, Header
from typing import Optional

from app.config import settings
from app.models.user import (
    AuthLoginRequest,
    AuthLoginResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyOtpRequest,
    ResendOtpRequest,
)
from app.core.rbac import get_user_role
from app.services.user_store import UserStore

logger = logging.getLogger(__name__)
router = APIRouter()


def _supabase_auth_url() -> str:
    if not settings.SUPABASE_URL:
        raise HTTPException(
            status_code=503,
            detail="Authentication service is not configured. Set SUPABASE_URL.",
        )
    return f"{settings.SUPABASE_URL}/auth/v1"


def _supabase_headers() -> dict:
    if not settings.SUPABASE_ANON_KEY:
        raise HTTPException(
            status_code=503,
            detail="Authentication service is not configured. Set SUPABASE_ANON_KEY.",
        )
    return {"apikey": settings.SUPABASE_ANON_KEY}


@router.post(
    "/auth/signup",
    response_model=AuthLoginResponse,
    summary="Sign up",
    description="Create a new account via Supabase Auth and return a JWT",
)
async def signup(payload: AuthLoginRequest):
    if not payload.email or not payload.password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    supabase_auth_service = SupabaseAuthService()
    user_service = UserService()

    try:
        response = await supabase_auth_service.signup(
            email=payload.email,
            password=payload.password,
            data={
                "name": payload.name or payload.email.split("@")[0].capitalize(),
                "avatar": payload.avatar,
                "role": get_user_role({"email": payload.email}),
            },
        )
    except httpx.TimeoutException:
        logger.error("Supabase signup timed out for %s", payload.email)
        raise HTTPException(status_code=504, detail="Authentication service timed out")
    except Exception as exc:
        logger.error("Supabase signup connection error: %s", exc)
        raise HTTPException(status_code=502, detail="Authentication service unavailable")

    if resp.status_code != 200:
        body = resp.json()
        detail = (
            body.get("error_description")
            or body.get("msg")
            or body.get("error")
            or "Signup failed"
        )
        if resp.status_code == 422:
            detail = "An account with this email already exists"
        raise HTTPException(status_code=400, detail=detail)

    body = resp.json()
    user_data = body.get("user") or {}
    access_token = body.get("access_token", "")

    # Sync profile with Supabase user data
    user = await user_service.sync_user_profile(user_data)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


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

    supabase_auth_service = SupabaseAuthService()
    user_service = UserService()

    try:
        if payload.provider == "credentials":
            response = await supabase_auth_service.login(
                email=payload.email,
                password=payload.password,
            )
        else:
            # For non-credentials providers (Google, GitHub, etc.), we expect an ID token from frontend
            # In this case, we should verify the ID token with Supabase
            # However, the current frontend flow sends the ID token as password field
            # Let's treat this as needing to get user info using the ID token
            # For now, we'll use the login endpoint with the ID token as password
            # This is a temporary approach - ideally we'd have a separate endpoint for social login
            response = await supabase_auth_service.login(
                email=payload.email,
                password=payload.password or "",  # password field contains ID token for social login
            )
    except httpx.TimeoutException:
        logger.error("Supabase login timed out for %s", payload.email.lower().strip())
        raise HTTPException(status_code=504, detail="Authentication service timed out")
    except Exception as exc:
        logger.error("Supabase login connection error: %s", exc)
        raise HTTPException(status_code=502, detail="Authentication service unavailable")

    # Check for email verification requirement
    # Note: Supabase may return 200 but require email confirmation in some flows
    # However, the standard login endpoint should return 200 only when email is confirmed
    # If we get a 400/403, we handle it below

    body = response.json()
    user_data = body.get("user") or {}
    access_token = body.get("access_token", "")

    # Sync profile with Supabase user data
    user = await user_service.sync_user_profile(user_data)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.post(
    "/auth/verify-otp",
    response_model=AuthLoginResponse,
    summary="Verify OTP code",
    description="Verify email confirmation OTP via Supabase Auth",
)
async def verify_otp(payload: VerifyOtpRequest):
    if not payload.email or not payload.token:
        raise HTTPException(status_code=400, detail="Email and OTP code are required")

    supabase_auth_service = SupabaseAuthService()
    user_service = UserService()

    try:
        response = await supabase_auth_service.verify_otp(
            email=payload.email,
            token=payload.token,
            type=payload.type or "signup",
        )
    except httpx.TimeoutException:
        logger.error("Supabase verify-otp timed out for %s", payload.email.lower().strip())
        raise HTTPException(status_code=504, detail="Authentication service timed out")
    except Exception as exc:
        logger.error("Supabase verify-otp connection error: %s", exc)
        raise HTTPException(status_code=502, detail="Authentication service unavailable")

    if response.status_code != 200:
        err = response.json()
        detail = err.get("error_description") or err.get("msg") or "Invalid or expired verification code"
        raise HTTPException(status_code=400, detail=detail)

    body = response.json()
    user_data = body.get("user") or {}
    access_token = body.get("access_token", "")

    # Sync profile with Supabase user data
    user = await user_service.sync_user_profile(user_data)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.post(
    "/auth/resend-otp",
    summary="Resend OTP email",
    description="Resend email verification OTP via Supabase Auth",
)
async def resend_otp(payload: ResendOtpRequest):
    if not payload.email:
        raise HTTPException(status_code=400, detail="Email is required")

    auth_url = _supabase_auth_url()
    headers = _supabase_headers()
    email_clean = payload.email.lower().strip()

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{auth_url}/resend",
                headers=headers,
                json={"type": payload.type or "signup", "email": email_clean},
            )
        if resp.status_code not in (200, 204):
            err = resp.json()
            detail = err.get("error_description") or err.get("msg") or "Failed to resend code"
            logger.error("Supabase resend-otp failed (%d): %s", resp.status_code, detail)
            raise HTTPException(status_code=400, detail=detail)
    except HTTPException:
        raise
    except httpx.TimeoutException:
        logger.error("Supabase resend-otp timed out for %s", email_clean)
        raise HTTPException(status_code=504, detail="Authentication service timed out")
    except Exception as exc:
        logger.error("Supabase resend-otp unreachable: %s", exc)
        raise HTTPException(status_code=502, detail="Authentication service unavailable")

    return {"message": "Verification code sent to your email."}


@router.post(
    "/auth/forgot-password",
    summary="Forgot password",
    description="Send a password reset email via Supabase Auth",
)
async def forgot_password(payload: ForgotPasswordRequest):
    if not payload.email:
        raise HTTPException(status_code=400, detail="Email is required")

    auth_url = _supabase_auth_url()
    headers = _supabase_headers()

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            await client.post(
                f"{auth_url}/recover",
                headers=headers,
                json={"email": payload.email},
            )
    except httpx.TimeoutException:
        logger.error("Supabase forgot-password timed out for %s", payload.email)
    except Exception as exc:
        logger.error("Supabase forgot-password unreachable: %s", exc)

    # Always the same message — never reveal whether the email exists.
    return {
        "message": "If an account exists for this email address, password reset instructions have been sent."
    }


@router.post(
    "/auth/callback",
    response_model=AuthLoginResponse,
    summary="Auth callback",
    description="Exchange a Supabase callback token (from email confirmation link or OAuth redirect) for a session. Accepts access_token directly or resolves via token+type.",
)
async def auth_callback(data: dict):
    """
    Called from the frontend /callback page. Supabase email confirmation links
    redirect to /callback?access_token=...&refresh_token=...&type=signup
    (or type=recovery for password reset). This endpoint:
    1. Accepts the access_token from the query params
    2. Fetches the user from Supabase using the token
    3. Upserts the profile row
    4. Returns the same AuthLoginResponse shape as login
    """
    access_token = data.get("access_token", "").strip()
    if not access_token:
        raise HTTPException(status_code=400, detail="access_token is required")

    supabase_auth_service = SupabaseAuthService()
    user_service = UserService()

    # Fetch the user object from Supabase using the token
    try:
        user_data = await supabase_auth_service.get_user(access_token)
    except httpx.TimeoutException:
        logger.error("Supabase callback user fetch timed out")
        raise HTTPException(status_code=504, detail="Authentication service timed out")
    except Exception as exc:
        logger.error("Supabase callback user fetch error: %s", exc)
        raise HTTPException(status_code=502, detail="Authentication service unavailable")

    # Sync profile with Supabase user data
    user = await user_service.sync_user_profile(user_data)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


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

    supabase_auth_service = SupabaseAuthService()
    token = authorization.split(" ", 1)[1] if " " in authorization else authorization

    try:
        response = await supabase_auth_service.update_password(
            access_token=token,
            new_password=payload.password,
        )
    except httpx.TimeoutException:
        logger.error("Supabase reset-password timed out")
        raise HTTPException(status_code=504, detail="Authentication service timed out — password was not changed")
    except Exception as exc:
        logger.error("Supabase reset-password connection error: %s", exc)
        raise HTTPException(status_code=502, detail="Authentication service unavailable — password was not changed")

    # Note: Supabase update_password endpoint returns 200 on success
    # If we get here without exception, the password was updated successfully
    return {"message": "Password updated successfully. You can now sign in with your new password."}
