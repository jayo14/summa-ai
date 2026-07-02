"""Authentication routes for the NextAuth exchange flow."""
from typing import Optional

from fastapi import APIRouter, HTTPException

from app.core.security import create_access_token
from app.models.user import AuthLoginRequest, AuthLoginResponse
from app.services.user_store import UserStore

router = APIRouter()
store = UserStore()


@router.post("/auth/login", response_model=AuthLoginResponse, summary="Login exchange", description="Validate the authenticated frontend session and mint a backend JWT for protected API calls")
async def login(payload: AuthLoginRequest):
    try:
        if payload.provider == "credentials":
            if not payload.password:
                raise ValueError("Password is required for credential sign-in")
            user = store.authenticate_credentials(
                email=payload.email,
                password=payload.password,
                name=payload.name,
                avatar=payload.avatar,
            )
        else:
            user = store.authenticate_oauth(
                provider=payload.provider,
                email=payload.email,
                name=payload.name,
                avatar=payload.avatar,
            )
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc

    access_token = create_access_token(user["id"])
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": store.serialize_user(user),
    }
