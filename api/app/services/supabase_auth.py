"""Supabase Auth service — handles all interactions with Supabase Auth API.

All raw httpx calls to Supabase Auth live HERE, never in routers.
Routers receive processed results and map status codes to HTTP responses.
"""

import logging
import httpx
from typing import Dict, Optional, Any

from app.config import settings

logger = logging.getLogger(__name__)


class SupabaseAuthError(Exception):
    """Raised when Supabase Auth returns a non-success status."""

    def __init__(self, status_code: int, detail: str, raw: Optional[Dict] = None):
        self.status_code = status_code
        self.detail = detail
        self.raw = raw or {}


class SupabaseAuthService:
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

    def _map_error(self, status_code: int, body: Dict) -> str:
        """Extract a user-safe error message from a Supabase error response."""
        return (
            body.get("error_description")
            or body.get("msg")
            or body.get("error")
            or "Authentication service error"
        )

    async def _request(self, method: str, path: str, json_data: Optional[Dict] = None) -> Dict[str, Any]:
        """Make a request to Supabase Auth and return structured result.

        Returns:
            {"status_code": int, "data": dict|None, "error": str|None}

        Raises:
            httpx.TimeoutException on timeout
            httpx.ConnectError on network failure
        """
        url = f"{self.base_url}{path}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.request(method, url, headers=self.headers, json=json_data)

        status = response.status_code
        try:
            body = response.json()
        except Exception:
            body = {}

        if 200 <= status < 300:
            return {"status_code": status, "data": body, "error": None}

        detail = self._map_error(status, body)
        return {"status_code": status, "data": None, "error": detail}

    async def signup(self, email: str, password: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """Sign up a new user with email and password."""
        payload = {"email": email, "password": password}
        if data:
            payload["data"] = data
        return await self._request("POST", "/signup", json_data=payload)

    async def login(self, email: str, password: str) -> Dict[str, Any]:
        """Log in user with email and password."""
        payload = {"email": email, "password": password}
        return await self._request("POST", "/token?grant_type=password", json_data=payload)

    async def verify_otp(self, email: str, token: str, type: str = "signup") -> Dict[str, Any]:
        """Verify OTP token."""
        payload = {"email": email, "token": token, "type": type}
        return await self._request("POST", "/verify", json_data=payload)

    async def resend_otp(self, email: str, type: str = "signup") -> Dict[str, Any]:
        """Resend OTP verification email."""
        payload = {"email": email, "type": type}
        return await self._request("POST", "/resend", json_data=payload)

    async def recover(self, email: str) -> Dict[str, Any]:
        """Send password reset email."""
        payload = {"email": email}
        return await self._request("POST", "/recover", json_data=payload)

    async def update_password(self, access_token: str, new_password: str) -> Dict[str, Any]:
        """Update password for authenticated user."""
        headers = {**self.headers, "Authorization": f"Bearer {access_token}"}
        payload = {"password": new_password}
        url = f"{self.base_url}/user"
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.put(url, headers=headers, json=payload)

        status = response.status_code
        try:
            body = response.json()
        except Exception:
            body = {}

        if 200 <= status < 300:
            return {"status_code": status, "data": body, "error": None}

        detail = self._map_error(status, body)
        return {"status_code": status, "data": None, "error": detail}

    async def get_user(self, access_token: str) -> Dict[str, Any]:
        """Fetch user data using access token."""
        headers = {**self.headers, "Authorization": f"Bearer {access_token}"}
        url = f"{self.base_url}/user"
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, headers=headers)

        status = response.status_code
        try:
            body = response.json()
        except Exception:
            body = {}

        if 200 <= status < 300:
            return {"status_code": status, "data": body, "error": None}

        detail = self._map_error(status, body)
        return {"status_code": status, "data": None, "error": detail}