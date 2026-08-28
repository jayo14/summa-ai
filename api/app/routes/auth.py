"""Authentication routes — proxy to Supabase Auth REST API."""

import httpx
from fastapi import APIRouter, HTTPException

from app.config import settings
from app.models.user import AuthLoginRequest, AuthLoginResponse

router = APIRouter()
SUPABASE_AUTH_URL = f"{settings.SUPABASE_URL}/auth/v1"


@router.post(
    "/auth/signup",
    response_model=AuthLoginResponse,
    summary="Sign up",
    description="Create a new account via Supabase Auth and return a JWT",
)
async def signup(payload: AuthLoginRequest):
    if not payload.email or not payload.password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{SUPABASE_AUTH_URL}/signup",
            headers={"apikey": settings.SUPABASE_ANON_KEY},
            json={
                "email": payload.email,
                "password": payload.password,
                "data": {"name": payload.name, "avatar": payload.avatar},
            },
        )
        if resp.status_code != 200:
            detail = (
                resp.json().get("error_description")
                or resp.json().get("msg")
                or "Signup failed"
            )
            if resp.status_code == 422:
                detail = "An account with this email may already exist"
            raise HTTPException(status_code=resp.status_code, detail=detail)

        body = resp.json()
        user_data = body.get("user", {})
        return {
            "access_token": body["access_token"],
            "token_type": "bearer",
            "user": {
                "id": user_data["id"],
                "email": user_data["email"],
                "name": user_data.get("user_metadata", {}).get("name"),
                "avatar": user_data.get("user_metadata", {}).get("avatar"),
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

    async with httpx.AsyncClient() as client:
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

        if resp.status_code != 200:
            detail = (
                resp.json().get("error_description")
                or resp.json().get("msg")
                or "Authentication failed"
            )
            raise HTTPException(status_code=401, detail=detail)

        body = resp.json()
        user_data = body.get("user", {})
        return {
            "access_token": body["access_token"],
            "token_type": "bearer",
            "user": {
                "id": user_data["id"],
                "email": user_data["email"],
                "name": user_data.get("user_metadata", {}).get("name"),
                "avatar": user_data.get("user_metadata", {}).get("avatar"),
                "provider": payload.provider,
                "onboarded": False,
                "onboarding_data": {},
            },
        }
