"""Supabase Auth service — token validation only.

All authentication operations (signup, login, OTP, password recovery)
are handled by the frontend via @supabase/supabase-js.

FastAPI only needs to validate access tokens and fetch user data.
"""

import logging
from typing import Any, Dict, Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


class SupabaseAuthError(Exception):
    """Raised when Supabase Auth returns a non-success status."""

    def __init__(self, status_code: int, error_code: str = "", detail: str = ""):
        self.status_code = status_code
        self.error_code = error_code
        self.detail = detail or "Authentication service error"
        super().__init__(self.detail)


class SupabaseAuthService:
    """Validates Supabase access tokens and fetches user data.

    All authentication operations are handled by the frontend.
    This service is ONLY used for token validation on protected routes.
    """

    _client: Optional[httpx.AsyncClient] = None

    def __init__(self):
        if not settings.SUPABASE_URL:
            raise ValueError("SUPABASE_URL must be set")
        if not settings.SUPABASE_ANON_KEY:
            raise ValueError("SUPABASE_ANON_KEY must be set")
        self.base_url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1"
        self.headers = {
            "apikey": settings.SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
        }

    def _get_client(self) -> httpx.AsyncClient:
        """Return a reusable async HTTP client."""
        if SupabaseAuthService._client is None or SupabaseAuthService._client.is_closed:
            SupabaseAuthService._client = httpx.AsyncClient(
                timeout=httpx.Timeout(15.0, connect=5.0),
                limits=httpx.Limits(max_connections=10, max_keepalive_connections=5),
            )
        return SupabaseAuthService._client

    @staticmethod
    def _safe_json(response: httpx.Response) -> Dict[str, Any]:
        """Safely parse JSON from a response. Returns {} on any failure."""
        try:
            return response.json()
        except Exception:
            return {}

    async def get_user(self, access_token: str) -> Dict[str, Any]:
        """Validate an access token and return the Supabase user.

        This is the ONLY method this service needs. All other auth
        operations are handled by the frontend Supabase client.

        Returns:
            {"status_code": int, "data": dict|None, "error_code": str, "error": str|None}
        """
        url = f"{self.base_url}/user"
        headers = {**self.headers, "Authorization": f"Bearer {access_token}"}

        client = self._get_client()
        try:
            response = await client.request("GET", url, headers=headers)
        except httpx.TimeoutException:
            logger.error("Supabase Auth timeout: GET /user")
            raise SupabaseAuthError(504, "timeout", "Authentication service timed out")
        except httpx.ConnectError:
            logger.error("Supabase Auth connection refused: GET /user")
            raise SupabaseAuthError(502, "connection_error", "Authentication service unavailable")
        except httpx.RequestError as exc:
            logger.error("Supabase Auth request error: GET /user — %s", type(exc).__name__)
            raise SupabaseAuthError(502, "request_error", "Authentication service unavailable")

        status = response.status_code
        body = self._safe_json(response)

        if 200 <= status < 300:
            return {"status_code": status, "data": body, "error_code": "", "error": None}

        error_code = body.get("error_code", "")
        msg = body.get("msg", body.get("error_description", ""))

        if status == 401:
            error_msg = "Invalid or expired token"
        elif status >= 500:
            error_msg = "Authentication service unavailable"
        else:
            error_msg = msg or "Authentication service error"

        return {"status_code": status, "data": None, "error_code": error_code, "error": error_msg}

    async def close(self):
        """Close the underlying HTTP client. Call on app shutdown."""
        if SupabaseAuthService._client and not SupabaseAuthService._client.is_closed:
            await SupabaseAuthService._client.aclose()
            SupabaseAuthService._client = None
