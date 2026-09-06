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

    auth_url = _supabase_auth_url()
    headers = _supabase_headers()
    name = payload.name or payload.email.split("@")[0].capitalize()
    role = get_user_role({"email": payload.email})

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{auth_url}/signup",
                headers=headers,
                json={
                    "email": payload.email,
                    "password": payload.password,
                    "data": {"name": name, "avatar": payload.avatar, "role": role},
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
    actual_user_id = user_data.get("id") or str(uuid.uuid5(uuid.NAMESPACE_DNS, payload.email.lower().strip()))

    user_obj = {
        "id": actual_user_id,
        "email": user_data.get("email", payload.email),
        "name": user_data.get("user_metadata", {}).get("name") or name,
        "avatar": user_data.get("user_metadata", {}).get("avatar") or payload.avatar,
        "role": role,
        "status": "active",
        "provider": "credentials",
        "email_verified": bool(user_data.get("email_confirmed_at") or user_data.get("confirmed_at")),
        "onboarded": False,
        "onboarding_data": {},
    }
    user_store = UserStore()
    saved = await user_store.save_user(actual_user_id, user_obj)
    fresh = await user_store.get_user_by_id(actual_user_id) or saved
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_store.serialize_user(fresh),
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

    auth_url = _supabase_auth_url()
    headers = _supabase_headers()
    email_clean = payload.email.lower().strip()

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            if payload.provider == "credentials":
                resp = await client.post(
                    f"{auth_url}/token?grant_type=password",
                    headers=headers,
                    json={"email": payload.email, "password": payload.password},
                )
            else:
                resp = await client.post(
                    f"{auth_url}/token?grant_type=id_token",
                    headers=headers,
                    json={"email": payload.email, "id_token": payload.password or ""},
                )
    except httpx.TimeoutException:
        logger.error("Supabase login timed out for %s", email_clean)
        raise HTTPException(status_code=504, detail="Authentication service timed out")
    except Exception as exc:
        logger.error("Supabase login connection error: %s", exc)
        raise HTTPException(status_code=502, detail="Authentication service unavailable")

    if resp.status_code != 200:
        err = resp.json()
        detail = (
            err.get("error_description")
            or err.get("msg")
            or err.get("error")
            or "Authentication failed"
        )
        if "email not confirmed" in detail.lower() or "email_not_confirmed" in str(err).lower():
            raise HTTPException(
                status_code=403,
                detail="Email not verified. Please check your inbox for the verification code.",
            )
        raise HTTPException(
            status_code=401 if resp.status_code < 500 else 502,
            detail=detail,
        )

    body = resp.json()
    user_data = body.get("user") or {}
    actual_user_id = user_data.get("id") or str(uuid.uuid5(uuid.NAMESPACE_DNS, email_clean))

    user_store = UserStore()
    existing = await user_store.get_user_by_id(actual_user_id)
    role = (existing.get("role") if existing and existing.get("role") else None) or get_user_role({"email": email_clean})
    name = (existing.get("name") if existing and existing.get("name") else None) or (
        user_data.get("user_metadata", {}).get("name") or email_clean.split("@")[0].capitalize()
    )

    user_obj = {
        "id": actual_user_id,
        "email": user_data.get("email", email_clean),
        "name": name,
        "avatar": (existing.get("avatar") if existing and existing.get("avatar") else None) or user_data.get("user_metadata", {}).get("avatar"),
        "bio": existing.get("bio", "") if existing else "",
        "role": role,
        "status": existing.get("status", "active") if existing else "active",
        "provider": payload.provider,
        "email_verified": bool(user_data.get("email_confirmed_at") or user_data.get("confirmed_at") or True),
        "onboarded": existing.get("onboarded", False) if existing else False,
        "onboarding_data": existing.get("onboarding_data", {}) if existing else {},
    }
    saved = await user_store.save_user(actual_user_id, user_obj)
    fresh = await user_store.get_user_by_id(actual_user_id) or saved
    return {
        "access_token": body["access_token"],
        "token_type": "bearer",
        "user": user_store.serialize_user(fresh),
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

    auth_url = _supabase_auth_url()
    headers = _supabase_headers()
    email_clean = payload.email.lower().strip()
    role = get_user_role({"email": email_clean})

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{auth_url}/verify",
                headers=headers,
                json={
                    "type": payload.type or "signup",
                    "email": email_clean,
                    "token": payload.token,
                },
            )
    except httpx.TimeoutException:
        logger.error("Supabase verify-otp timed out for %s", email_clean)
        raise HTTPException(status_code=504, detail="Authentication service timed out")
    except Exception as exc:
        logger.error("Supabase verify-otp connection error: %s", exc)
        raise HTTPException(status_code=502, detail="Authentication service unavailable")

    if resp.status_code != 200:
        err = resp.json()
        detail = err.get("error_description") or err.get("msg") or "Invalid or expired verification code"
        raise HTTPException(status_code=400, detail=detail)

    body = resp.json()
    user_data = body.get("user") or {}
    actual_user_id = user_data.get("id") or str(uuid.uuid5(uuid.NAMESPACE_DNS, email_clean))
    access_token = body.get("access_token", "")

    user_obj = {
        "id": actual_user_id,
        "email": user_data.get("email", email_clean),
        "name": user_data.get("user_metadata", {}).get("name") or email_clean.split("@")[0].capitalize(),
        "avatar": user_data.get("user_metadata", {}).get("avatar"),
        "role": role,
        "status": "active",
        "provider": "credentials",
        "email_verified": True,
        "onboarded": False,
        "onboarding_data": {},
    }
    user_store = UserStore()
    saved = await user_store.save_user(actual_user_id, user_obj)
    fresh = await user_store.get_user_by_id(actual_user_id) or saved
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_store.serialize_user(fresh),
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

    auth_url = _supabase_auth_url()
    headers = _supabase_headers()
    token = authorization.split(" ", 1)[1] if " " in authorization else authorization

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.put(
                f"{auth_url}/user",
                headers={**headers, "Authorization": f"Bearer {token}"},
                json={"password": payload.password},
            )
    except httpx.TimeoutException:
        logger.error("Supabase reset-password timed out")
        raise HTTPException(status_code=504, detail="Authentication service timed out — password was not changed")
    except Exception as exc:
        logger.error("Supabase reset-password connection error: %s", exc)
        raise HTTPException(status_code=502, detail="Authentication service unavailable — password was not changed")

    if resp.status_code not in (200, 204):
        err = resp.json()
        detail = (
            err.get("error_description")
            or err.get("msg")
            or err.get("error")
            or "Password update failed"
        )
        logger.warning("Supabase reset-password rejected (%d): %s", resp.status_code, detail)
        raise HTTPException(status_code=400, detail=detail)

    return {"message": "Password updated successfully. You can now sign in with your new password."}
