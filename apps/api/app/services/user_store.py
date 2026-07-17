"""Postgres-backed user store — queries summa_ai.user_profiles via asyncpg."""
from __future__ import annotations

import json
from typing import Any, Dict, Optional

import asyncpg

from app.config import settings


class UserStore:
    _instance: Optional["UserStore"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._pool: Optional[asyncpg.Pool] = None
        return cls._instance

    async def _get_pool(self) -> asyncpg.Pool:
        if self._pool is None:
            self._pool = await asyncpg.create_pool(
                settings.DATABASE_URL,
                min_size=2,
                max_size=10,
            )
        return self._pool

    async def close(self):
        if self._pool:
            await self._pool.close()
            self._pool = None

    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM summa_ai.user_profiles WHERE id = $1",
                user_id,
            )
        return dict(row) if row else None

    async def update_user(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        current = await self.get_user_by_id(user_id)
        if current is None:
            raise ValueError("User not found")

        sets = []
        values = []
        for key in ("name", "avatar", "bio"):
            if key in data:
                sets.append(f"{key} = ${len(values) + 1}")
                values.append(data[key])
        if "email" in data and isinstance(data["email"], str) and data["email"].strip():
            sets.append(f"email = ${len(values) + 1}")
            values.append(data["email"].lower().strip())
        if "onboarded" in data:
            sets.append(f"onboarded = ${len(values) + 1}")
            values.append(bool(data["onboarded"]))
        if "onboarding_data" in data:
            sets.append(f"onboarding_data = ${len(values) + 1}")
            values.append(json.dumps(data["onboarding_data"]))
        if "provider" in data:
            sets.append(f"provider = ${len(values) + 1}")
            values.append(data["provider"])

        if not sets:
            return current

        sets.append("updated_at = NOW()")
        values.append(user_id)
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            await conn.execute(
                f"UPDATE summa_ai.user_profiles SET {', '.join(sets)} WHERE id = ${len(values)}",
                *values,
            )
        updated = await self.get_user_by_id(user_id)
        if updated is None:
            raise RuntimeError("Failed to update user")
        return updated

    def serialize_user(self, user: Dict[str, Any]) -> Dict[str, Any]:
        onboarding_raw = user.get("onboarding_data")
        if isinstance(onboarding_raw, str):
            try:
                onboarding_data = json.loads(onboarding_raw)
            except (json.JSONDecodeError, TypeError):
                onboarding_data = {}
        else:
            onboarding_data = onboarding_raw or {}
        return {
            "id": user["id"],
            "email": user["email"],
            "name": user.get("name"),
            "avatar": user.get("avatar"),
            "bio": user.get("bio"),
            "provider": user.get("provider"),
            "onboarded": bool(user.get("onboarded")),
            "onboarding_data": onboarding_data,
            "created_at": user["created_at"].isoformat() if hasattr(user.get("created_at"), "isoformat") else user["created_at"],
            "updated_at": user["updated_at"].isoformat() if hasattr(user.get("updated_at"), "isoformat") else user["updated_at"],
        }
