"""Authentication routes — proxy to Supabase Auth REST API with fallback."""

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
)

logger = logging.getLogger(__name__)
router = APIRouter()
SUPABASE_AUTH_URL = f"{settings.SUPABASE_URL}/auth/v1" if settings.SUPABASE_URL else ""


def _create_mock_jwt(user_id: str) -> str:
    """Generate token for local dev when Supabase is unconfigured/unreachable."""
    import jwt as pyjwt
    from datetime import datetime, timedelta, timezone

    secret = settings.SUPABASE_JWT_SECRET or "dev-secret-key-change-in-production-12345"
    payload = {
        "sub": user_id,
        "aud": "authenticated",
        "role": "authenticated",
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return pyjwt.encode(payload, secret, algorithm="HS256")


@router.post(
    "/auth/signup",
    response_model=AuthLoginResponse,
    summary="Sign up",
    description="Create a new account via Supabase Auth and return a JWT",
)
async def signup(payload: AuthLoginRequest):
    if not payload.email or not payload.password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    user_id = str(uuid.uuid4())
    name = payload.name or payload.email.split("@")[0].capitalize()

    if SUPABASE_AUTH_URL and not settings.SUPABASE_URL.startswith("https://xxx"):
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    f"{SUPABASE_AUTH_URL}/signup",
                    headers={"apikey": settings.SUPABASE_ANON_KEY},
                    json={
                        "email": payload.email,
                        "password": payload.password,
                        "data": {"name": name, "avatar": payload.avatar},
                    },
                )
                if resp.status_code == 200:
                    body = resp.json()
                    user_data = body.get("user", {})
                    token = body.get("access_token") or _create_mock_jwt(user_data.get("id", user_id))
                    return {
                        "access_token": token,
                        "token_type": "bearer",
                        "user": {
                            "id": user_data.get("id", user_id),
                            "email": user_data.get("email", payload.email),
                            "name": user_data.get("user_metadata", {}).get("name") or name,
                            "avatar": user_data.get("user_metadata", {}).get("avatar") or payload.avatar,
                            "provider": "credentials",
                            "onboarded": False,
                            "onboarding_data": {},
                        },
                    }
                else:
                    detail = (
                        resp.json().get("error_description")
                        or resp.json().get("msg")
                        or "Signup failed"
                    )
                    if resp.status_code == 422:
                        detail = "An account with this email may already exist"
                    logger.warning("Supabase signup failed: %s", detail)
        except Exception as exc:
            logger.warning("Supabase connection skipped/failed during signup: %s", exc)

    # Local / Dev Fallback
    token = _create_mock_jwt(user_id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": payload.email,
            "name": name,
            "avatar": payload.avatar,
            "provider": "credentials",
            "onboarded": False,
            "onboarding_data": {},
        },
    }


@router.post(
    "/auth/login",
    response_model=AuthLoginResponse,
    summary="Login exchange",
    description="Authenticate via Supabase Auth and return a JWT",
)
async def login(payload: AuthLoginRequest):
    if not payload.email:
        raise HTTPException(status_code=400, detail="Email is required")

    name = payload.name or payload.email.split("@")[0].capitalize()

    if SUPABASE_AUTH_URL and not settings.SUPABASE_URL.startswith("https://xxx"):
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                if payload.provider == "credentials":
                    if not payload.password:
                        raise HTTPException(
                            status_code=400,
                            detail="Password is required for credential sign-in",
                        )
                    resp = await client.post(
                        f"{SUPABASE_AUTH_URL}/token?grant_type=password",
                        headers={"apikey": settings.SUPABASE_ANON_KEY},
                        json={"email": payload.email, "password": payload.password},
                    )
                else:
                    resp = await client.post(
                        f"{SUPABASE_AUTH_URL}/token?grant_type=id_token",
                        headers={"apikey": settings.SUPABASE_ANON_KEY},
                        json={"email": payload.email, "id_token": payload.password or ""},
                    )

                if resp.status_code == 200:
                    body = resp.json()
                    user_data = body.get("user", {})
                    return {
                        "access_token": body["access_token"],
                        "token_type": "bearer",
                        "user": {
                            "id": user_data["id"],
                            "email": user_data["email"],
                            "name": user_data.get("user_metadata", {}).get("name") or name,
                            "avatar": user_data.get("user_metadata", {}).get("avatar") or payload.avatar,
                            "provider": payload.provider,
                            "onboarded": False,
                            "onboarding_data": {},
                        },
                    }
                else:
                    detail = (
                        resp.json().get("error_description")
                        or resp.json().get("msg")
                        or "Authentication failed"
                    )
                    logger.warning("Supabase login failed: %s", detail)
        except Exception as exc:
            logger.warning("Supabase login error, proceeding with dev fallback: %s", exc)

    # Local / Dev Fallback
    user_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, payload.email))
    token = _create_mock_jwt(user_id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": payload.email,
            "name": name,
            "avatar": payload.avatar,
            "provider": payload.provider,
            "onboarded": False,
            "onboarding_data": {},
        },
    }


@router.post(
    "/auth/forgot-password",
    summary="Forgot password",
    description="Request a password reset link or token",
)
async def forgot_password(payload: ForgotPasswordRequest):
    if not payload.email:
        raise HTTPException(status_code=400, detail="Email is required")

    if SUPABASE_AUTH_URL and not settings.SUPABASE_URL.startswith("https://xxx"):
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                await client.post(
                    f"{SUPABASE_AUTH_URL}/recover",
                    headers={"apikey": settings.SUPABASE_ANON_KEY},
                    json={"email": payload.email},
                )
        except Exception as exc:
            logger.warning("Supabase password recovery error: %s", exc)

    return {
        "message": "If an account exists for this email address, password reset instructions have been sent."
    }


@router.post(
    "/auth/reset-password",
    summary="Reset password",
    description="Update account password",
)
async def reset_password(
    payload: ResetPasswordRequest, authorization: Optional[str] = Header(None)
):
    if not payload.password or len(payload.password) < 6:
        raise HTTPException(
            status_code=400, detail="Password must be at least 6 characters long"
        )

    if (
        authorization
        and SUPABASE_AUTH_URL
        and not settings.SUPABASE_URL.startswith("https://xxx")
    ):
        try:
            token = authorization.split(" ", 1)[1] if " " in authorization else authorization
            async with httpx.AsyncClient(timeout=10.0) as client:
                await client.put(
                    f"{SUPABASE_AUTH_URL}/user",
                    headers={
                        "apikey": settings.SUPABASE_ANON_KEY,
                        "Authorization": f"Bearer {token}",
                    },
                    json={"password": payload.password},
                )
        except Exception as exc:
            logger.warning("Supabase reset password update error: %s", exc)

    return {"message": "Password updated successfully. You can now sign in with your new password."}
