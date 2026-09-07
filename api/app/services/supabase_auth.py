"""Supabase Auth service — single source of truth for all Supabase Auth interactions.

All raw HTTP calls to Supabase Auth live HERE, never in routers.
Routers receive structured results and map to HTTP responses.

Design invariants:
- One reusable httpx.AsyncClient per service instance
- Safe JSON parsing (never crashes on non-JSON responses)
- Explicit status code mapping (no blind 400 fallbacks)
- No sensitive data in logs (no tokens, passwords, or full response bodies)
"""

import logging
from typing import Any, Dict, Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Supabase error codes → user-safe messages
# ---------------------------------------------------------------------------
_SUPABASE_ERROR_MAP: Dict[str, str] = {
    "invalid_grant": "Invalid email or password",
    "invalid_credentials": "Invalid email or password",
    "email_not_confirmed": "Please verify your email address before signing in",
    "user_not_found": "Invalid email or password",
    "weak_password": "Password does not meet strength requirements",
    "signup_disabled": "Account creation is currently disabled",
    "email_address_not_valid": "Invalid email address",
    "over_request_rate_limit": "Too many requests. Please try again later.",
    "over_email_send_rate_limit": "Too many requests. Please try again later.",
    "token_expired": "Verification code has expired. Please request a new one.",
    "token_already_used": "Verification code has already been used.",
    "invalid_token": "Invalid or expired verification code.",
}


class SupabaseAuthError(Exception):
    """Raised when Supabase Auth returns a non-success status.

    Attributes:
        status_code: HTTP status code from Supabase
        error_code: Supabase error_code field (e.g. "invalid_grant")
        detail: User-safe error message
    """

    def __init__(self, status_code: int, error_code: str = "", detail: str = ""):
        self.status_code = status_code
        self.error_code = error_code
        self.detail = detail or "Authentication service error"
        super().__init__(self.detail)


class SupabaseAuthService:
    """Handles all interactions with Supabase Auth REST API.

    Uses a single reusable httpx.AsyncClient for connection pooling.
    Callers should use this service; never make raw HTTP calls to Supabase Auth.
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
        """Return a reusable async HTTP client. Creates one if needed."""
        if SupabaseAuthService._client is None or SupabaseAuthService._client.is_closed:
            SupabaseAuthService._client = httpx.AsyncClient(
                timeout=httpx.Timeout(10.0, connect=5.0),
                limits=httpx.Limits(max_connections=20, max_keepalive_connections=5),
            )
        return SupabaseAuthService._client

    # ------------------------------------------------------------------
    # Safe JSON parsing — never crashes on non-JSON responses
    # ------------------------------------------------------------------

    @staticmethod
    def _safe_json(response: httpx.Response) -> Dict[str, Any]:
        """Safely parse JSON from a response. Returns {} on any failure."""
        try:
            return response.json()
        except Exception:
            return {}

    # ------------------------------------------------------------------
    # Error extraction — maps Supabase error codes to safe messages
    # ------------------------------------------------------------------

    @staticmethod
    def _extract_error(body: Dict[str, Any], status_code: int) -> str:
        """Extract a user-safe error message from a Supabase error response.

        Uses the Supabase error_code field to look up a known message.
        Falls back to generic messages. Never exposes infrastructure details.
        """
        error_code = body.get("error_code", "")
        msg = body.get("msg", "")
        error_description = body.get("error_description", "")

        # Try known error code mapping first
        if error_code in _SUPABASE_ERROR_MAP:
            return _SUPABASE_ERROR_MAP[error_code]

        # Map by HTTP status code for unknown errors
        if status_code == 400:
            return error_description or msg or "Invalid request"
        if status_code == 401:
            return "Invalid email or password"
        if status_code == 403:
            return error_description or msg or "Access denied"
        if status_code == 404:
            return "Invalid email or password"
        if status_code == 422:
            return error_description or msg or "Invalid request"
        if status_code == 429:
            return "Too many requests. Please try again later."
        if status_code >= 500:
            # Never expose Supabase infrastructure errors
            return "Authentication service unavailable"

        return error_description or msg or "Authentication service error"

    # ------------------------------------------------------------------
    # Core request method
    # ------------------------------------------------------------------

    async def _request(
        self,
        method: str,
        path: str,
        *,
        json_data: Optional[Dict] = None,
        access_token: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Make a request to Supabase Auth and return a structured result.

        Returns:
            {"status_code": int, "data": dict|None, "error_code": str, "error": str|None}

        The caller (router) maps status_code to HTTP responses.
        """
        url = f"{self.base_url}{path}"
        headers = {**self.headers}
        if access_token:
            headers["Authorization"] = f"Bearer {access_token}"

        client = self._get_client()
        try:
            response = await client.request(method, url, headers=headers, json=json_data)
        except httpx.TimeoutException:
            logger.error("Supabase Auth timeout: %s %s", method, path)
            raise SupabaseAuthError(504, "timeout", "Authentication service timed out")
        except httpx.ConnectError:
            logger.error("Supabase Auth connection refused: %s %s", method, path)
            raise SupabaseAuthError(502, "connection_error", "Authentication service unavailable")
        except httpx.RequestError as exc:
            logger.error("Supabase Auth request error: %s %s — %s", method, path, type(exc).__name__)
            raise SupabaseAuthError(502, "request_error", "Authentication service unavailable")

        status = response.status_code
        body = self._safe_json(response)

        # Success (2xx)
        if 200 <= status < 300:
            return {"status_code": status, "data": body, "error_code": "", "error": None}

        # Error — extract safe message
        error_code = body.get("error_code", "")
        error_msg = self._extract_error(body, status)
        return {"status_code": status, "data": None, "error_code": error_code, "error": error_msg}

    # ------------------------------------------------------------------
    # Auth operations
    # ------------------------------------------------------------------

    async def signup(self, email: str, password: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """Sign up a new user with email and password."""
        payload: Dict[str, Any] = {"email": email, "password": password}
        if data:
            payload["data"] = data
        return await self._request("POST", "/signup", json_data=payload)

    async def login(self, email: str, password: str) -> Dict[str, Any]:
        """Log in user with email and password (grant_type=password)."""
        return await self._request(
            "POST", "/token?grant_type=password",
            json_data={"email": email, "password": password},
        )

    async def verify_otp(self, email: str, token: str, type: str = "signup") -> Dict[str, Any]:
        """Verify OTP token."""
        return await self._request(
            "POST", "/verify",
            json_data={"email": email, "token": token, "type": type},
        )

    async def resend_otp(self, email: str, type: str = "signup") -> Dict[str, Any]:
        """Resend OTP verification email."""
        return await self._request(
            "POST", "/resend",
            json_data={"email": email, "type": type},
        )

    async def recover(self, email: str) -> Dict[str, Any]:
        """Send password reset email."""
        return await self._request("POST", "/recover", json_data={"email": email})

    async def update_password(self, access_token: str, new_password: str) -> Dict[str, Any]:
        """Update password for authenticated user."""
        return await self._request(
            "PUT", "/user",
            json_data={"password": new_password},
            access_token=access_token,
        )

    async def get_user(self, access_token: str) -> Dict[str, Any]:
        """Fetch user data using access token."""
        return await self._request("GET", "/user", access_token=access_token)

    async def close(self):
        """Close the underlying HTTP client. Call on app shutdown."""
        if SupabaseAuthService._client and not SupabaseAuthService._client.is_closed:
            await SupabaseAuthService._client.aclose()
            SupabaseAuthService._client = None
