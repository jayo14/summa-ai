"""Authentication routes — profile endpoint only.

All authentication (signup, login, OTP, password recovery) is handled
directly by the frontend via @supabase/supabase-js.

FastAPI only:
- Validates Supabase JWTs
- Resolves application profiles
- Enforces role/permissions

Security invariants:
- Supabase Auth is the sole source of truth for authentication
- UserStore existence is NOT authentication
- Passwords never reach FastAPI
- Roles are server-controlled, never accepted from the client
"""

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Header

from app.services.supabase_auth import SupabaseAuthService, SupabaseAuthError
from app.services.user_service import UserService

logger = logging.getLogger(__name__)
router = APIRouter()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def parse_bearer_token(authorization: Optional[str]) -> str:
    """Strictly parse a Bearer token from the Authorization header.

    Only accepts: "Bearer <token>"
    Rejects: missing header, wrong scheme, whitespace-only tokens.

    Raises:
        HTTPException 401 for any malformed input.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header is required")

    # Split on any whitespace after "Bearer" (space or tab)
    import re
    match = re.match(r'(?i)bearer\s+(\S+)', authorization)
    if not match:
        raise HTTPException(
            status_code=401,
            detail="Authorization header must be 'Bearer <token>'",
        )

    token = match.group(1)
    if not token:
        raise HTTPException(status_code=401, detail="Bearer token is empty")

    return token


def _extract_user_data(result: dict) -> dict:
    """Extract and validate user data from a Supabase Auth result.

    Requires a real Supabase user ID. Never manufactures an identity.
    """
    error = result.get("error")
    if error:
        status_code = result.get("status_code", 500)
        if status_code >= 500:
            logger.error("Supabase Auth %d: %s", status_code, error)
            raise HTTPException(status_code=502, detail="Authentication service unavailable")
        raise HTTPException(status_code=status_code, detail=error)

    data = result.get("data") or {}
    # Supabase /auth/v1/user returns the user object directly.
    # Handle both formats: {"user": {...}} and {"id": "...", "email": "...", ...}
    user_data = data.get("user") or data
    if not user_data.get("id"):
        logger.error("Supabase Auth returned no user ID")
        raise HTTPException(
            status_code=502,
            detail="Authentication service returned invalid response",
        )
    return user_data


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

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

    This is the ONLY auth endpoint. All authentication is handled
    by the frontend via @supabase/supabase-js.
    """
    token = parse_bearer_token(authorization)
    auth_service = SupabaseAuthService()
    user_service = UserService()

    try:
        result = await auth_service.get_user(token)
    except SupabaseAuthError as exc:
        raise HTTPException(
            status_code=exc.status_code if exc.status_code < 500 else 502,
            detail=exc.detail,
        )
    except Exception:
        logger.error("Supabase get-user connection error")
        raise HTTPException(status_code=502, detail="Authentication service unavailable")

    user_data = _extract_user_data(result)
    user = await user_service.sync_user_profile(user_data)
    return {"user": user}
