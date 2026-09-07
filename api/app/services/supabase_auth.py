"""Supabase Auth service — handles all interactions with Supabase Auth API."""

import logging
import httpx
from typing import Dict, Optional, Any

from app.config import settings

logger = logging.getLogger(__name__)

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

    async def _request(self, method: str, path: str, json_data: Optional[Dict] = None) -> httpx.Response:
        url = f"{self.base_url}{path}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.request(method, url, headers=self.headers, json=json_data)
                return response
            except httpx.TimeoutException:
                logger.error("Supabase Auth request timed out: %s %s", method, url)
                raise
            except Exception as exc:
                logger.error("Supabase Auth request failed: %s %s - %s", method, url, exc)
                raise

    async def signup(self, email: str, password: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """Sign up a new user with email and password."""
        payload = {
            "email": email,
            "password": password,
        }
        if data:
            payload["data"] = data
        response = await self._request("POST", "/signup", json_data=payload)
        return response.json()

    async def login(self, email: str, password: str) -> Dict[str, Any]:
        """Log in user with email and password (grant_type=password)."""
        payload = {
            "email": email,
            "password": password,
        }
        response = await self._request("POST", "/token?grant_type=password", json_data=payload)
        return response.json()

    async def verify_otp(self, email: str, token: str, type: str = "signup") -> Dict[str, Any]:
        """Verify OTP token."""
        payload = {
            "email": email,
            "token": token,
            "type": type,
        }
        response = await self._request("POST", "/verify", json_data=payload)
        return response.json()

    async def resend_otp(self, email: str, type: str = "signup") -> Dict[str, Any]:
        """Resend OTP verification email."""
        payload = {
            "email": email,
            "type": type,
        }
        response = await self._request("POST", "/resend", json_data=payload)
        return response.json()

    async def recover(self, email: str) -> Dict[str, Any]:
        """Send password reset email."""
        payload = {
            "email": email,
        }
        response = await self._request("POST", "/recover", json_data=payload)
        return response.json()

    async def update_password(self, access_token: str, new_password: str) -> Dict[str, Any]:
        """Update password for authenticated user."""
        headers = {**self.headers, "Authorization": f"Bearer {access_token}"}
        payload = {
            "password": new_password,
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.put(
                    f"{self.base_url}/user",
                    headers=headers,
                    json=payload,
                )
                return response.json()
            except httpx.TimeoutException:
                logger.error("Supabase Auth update password timed out")
                raise
            except Exception as exc:
                logger.error("Supabase Auth update password failed: %s", exc)
                raise

    async def get_user(self, access_token: str) -> Dict[str, Any]:
        """Fetch user data using access token."""
        headers = {**self.headers, "Authorization": f"Bearer {access_token}"}
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(
                    f"{self.base_url}/user",
                    headers=headers,
                )
                return response.json()
            except httpx.TimeoutException:
                logger.error("Supabase Auth get user timed out")
                raise
            except Exception as exc:
                logger.error("Supabase Auth get user failed: %s", exc)
                raise