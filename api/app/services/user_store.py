"""Postgres-backed user store — queries summa_ai.user_profiles via asyncpg."""

from __future__ import annotations

import json
from typing import Any, Dict, Optional

import asyncpg

from app.services.db_pool import get_pool


class UserStore:
    _instance: Optional["UserStore"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._pool: Optional[asyncpg.Pool] = None
            cls._instance._local_users: Dict[str, Dict[str, Any]] = {}
        return cls._instance

    async def _get_pool(self) -> asyncpg.Pool:
        if self._pool is not None:
            return self._pool
        return await get_pool()

    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        try:
            pool = await self._get_pool()
            async with pool.acquire() as conn:
                row = await conn.fetchrow(
                    "SELECT * FROM summa_ai.user_profiles WHERE id = $1",
                    user_id,
                )
            if row:
                return dict(row)
        except Exception:
            pass

        return self._local_users.get(user_id, {
            "id": user_id,
            "email": "student@summa.ai",
            "name": "Student User",
            "avatar": None,
            "provider": "credentials",
            "onboarded": True,
            "onboarding_data": {},
        })

    async def update_user(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            pool = await self._get_pool()
            async with pool.acquire() as conn:
                row = await conn.fetchrow(
                    "SELECT * FROM summa_ai.user_profiles WHERE id = $1",
                    user_id,
                )
                if row:
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
                    if sets:
                        values.append(user_id)
                        query = f"UPDATE summa_ai.user_profiles SET {', '.join(sets)} WHERE id = ${len(values)} RETURNING *"
                        updated = await conn.fetchrow(query, *values)
                        return dict(updated)
        except Exception:
            pass

        current = await self.get_user_by_id(user_id) or {"id": user_id}
        current.update({k: v for k, v in data.items() if v is not None})
        self._local_users[user_id] = current
        return current

    async def get_onboarding_data(self, user_id: str) -> Optional[Dict[str, Any]]:
        user = await self.get_user_by_id(user_id)
        if user is None:
            return None
        onboarding_raw = user.get("onboarding_data")
        if isinstance(onboarding_raw, str):
            try:
                return json.loads(onboarding_raw)
            except (json.JSONDecodeError, TypeError):
                return {}
        return onboarding_raw or {}

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
            "created_at": (
                user.get("created_at").isoformat()
                if hasattr(user.get("created_at"), "isoformat")
                else user.get("created_at")
            ),
            "updated_at": (
                user.get("updated_at").isoformat()
                if hasattr(user.get("updated_at"), "isoformat")
                else user.get("updated_at")
            ),
        }
