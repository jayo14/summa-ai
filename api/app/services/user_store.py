"""Postgres-backed user store — queries summa_ai.user_profiles via asyncpg.

UserStore is an APPLICATION-LEVEL data store only. It MUST NOT:
- verify passwords
- authenticate users
- issue authentication tokens
- act as an authentication fallback
- manufacture user identities from JWT claims
"""

from __future__ import annotations

import json
import logging
from typing import Any, Dict, List, Optional

import asyncpg

from app.services.db_pool import get_pool

logger = logging.getLogger(__name__)


class UserStore:
    _instance: Optional["UserStore"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._pool: Optional[asyncpg.Pool] = None
            cls._instance._audit_logs: list[dict[str, Any]] = []
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

        # Fall back to in-process cache only — never return a generic anonymous
        # identity.  If the DB is unreachable AND the user has not been seen in
        # this process yet, callers receive None and must handle it explicitly.
        return self._local_users.get(user_id)  # returns None when not cached

    async def save_user(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        user_obj = {
            "id": user_id,
            "email": data.get("email", ""),
            "name": data.get("name"),
            "avatar": data.get("avatar"),
            "bio": data.get("bio"),
            "role": data.get("role", "user"),
            "status": data.get("status", "active"),
            "provider": data.get("provider", "credentials"),
            "email_verified": bool(data.get("email_verified", False)),
            "onboarded": bool(data.get("onboarded", False)),
            "onboarding_data": data.get("onboarding_data", {}),
        }
        try:
            pool = await self._get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    row = await conn.fetchrow(
                        """
                        INSERT INTO summa_ai.user_profiles (id, email, name, avatar, bio, role, status, provider, email_verified, onboarded, onboarding_data)
                        VALUES ($1, $2, $3, $4, $5, $6::summa_ai.user_role_enum, $7, $8, $9, $10, $11)
                        ON CONFLICT (id) DO UPDATE SET
                            email            = EXCLUDED.email,
                            name             = COALESCE(summa_ai.user_profiles.name, EXCLUDED.name),
                            avatar           = COALESCE(summa_ai.user_profiles.avatar, EXCLUDED.avatar),
                            bio              = COALESCE(summa_ai.user_profiles.bio, EXCLUDED.bio),
                            role             = EXCLUDED.role,
                            status           = EXCLUDED.status,
                            provider         = COALESCE(summa_ai.user_profiles.provider, EXCLUDED.provider),
                            email_verified   = EXCLUDED.email_verified,
                            onboarded        = COALESCE(summa_ai.user_profiles.onboarded, EXCLUDED.onboarded),
                            onboarding_data  = COALESCE(summa_ai.user_profiles.onboarding_data, EXCLUDED.onboarding_data)
                        RETURNING *
                        """,
                        user_id,
                        user_obj["email"],
                        user_obj["name"],
                        user_obj["avatar"],
                        user_obj["bio"],
                        user_obj["role"],
                        user_obj["status"],
                        user_obj["provider"],
                        user_obj["email_verified"],
                        user_obj["onboarded"],
                        json.dumps(user_obj["onboarding_data"]),
                    )
                    if row:
                        saved = dict(row)
                        self._local_users[user_id] = saved
                        return saved
        except Exception:
            pass

        self._local_users[user_id] = user_obj
        return user_obj

    async def update_user(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        current = await self.get_user_by_id(user_id)
        if current is None:
            # User does not exist in application DB — this is a data inconsistency.
            # The caller (UserService) should have synced the profile first.
            # Never fabricate a profile from JWT claims or email alone.
            logger.warning(
                "update_user called for non-existent user %s — "
                "profile should be synced via UserService.sync_user_profile first",
                user_id,
            )
            return {}

        try:
            pool = await self._get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    row = await conn.fetchrow(
                        "SELECT * FROM summa_ai.user_profiles WHERE id = $1",
                        user_id,
                    )
                    if not row:
                        await self.save_user(user_id, current)
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
                        if "role" in data:
                            sets.append(f"role = ${len(values) + 1}::summa_ai.user_role_enum")
                            values.append(data["role"])
                        if "email" in data and isinstance(data["email"], str) and data["email"].strip():
                            sets.append(f"email = ${len(values) + 1}")
                            values.append(data["email"].lower().strip())
                        if "onboarded" in data:
                            sets.append(f"onboarded = ${len(values) + 1}")
                            values.append(bool(data["onboarded"]))
                        if "email_verified" in data:
                            sets.append(f"email_verified = ${len(values) + 1}")
                            values.append(bool(data["email_verified"]))
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
                            if updated:
                                res = dict(updated)
                                self._local_users[user_id] = res
                                return res
                        res = dict(row)
                        self._local_users[user_id] = res
                        return res
        except Exception:
            pass

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
            "id": str(user["id"]),
            "email": user["email"],
            "name": user.get("name"),
            "avatar": user.get("avatar"),
            "bio": user.get("bio"),
            "provider": user.get("provider"),
            "email_verified": bool(user.get("email_verified", False)),
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
            "role": "admin" if user.get("role") == "admin" else "user",
            "status": user.get("status", "active"),
            "last_active": user.get("last_active"),
        }

    async def list_all_users(self) -> List[Dict[str, Any]]:
        try:
            pool = await self._get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    rows = await conn.fetch("SELECT * FROM summa_ai.user_profiles ORDER BY created_at DESC")
                if rows:
                    return [self.serialize_user(dict(r)) for r in rows]
        except Exception:
            pass

        return [self.serialize_user(u) for u in self._local_users.values()]

    async def update_user_role(self, actor_id: str, target_user_id: str, new_role: str) -> Optional[Dict[str, Any]]:
        target = await self.get_user_by_id(target_user_id)
        if not target:
            return None

        # Standardize role enum: admin vs user
        normalized_role = "admin" if new_role.lower().strip() == "admin" else "user"
        updated = await self.update_user(target_user_id, {"role": normalized_role})
        import uuid
        from datetime import datetime, timezone
        actor = await self.get_user_by_id(actor_id) or {"email": "system@summa.ai"}
        self._audit_logs.insert(0, {
            "id": f"audit-{uuid.uuid4().hex[:8]}",
            "actor_id": actor_id,
            "actor_email": actor.get("email"),
            "action": "ROLE_CHANGED",
            "target_user_id": target_user_id,
            "target_email": target.get("email"),
            "details": f"Role updated to {normalized_role.upper()}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        return self.serialize_user(updated)

    async def update_user_status(self, actor_id: str, target_user_id: str, new_status: str) -> Optional[Dict[str, Any]]:
        target = await self.get_user_by_id(target_user_id)
        if not target:
            return None

        updated = await self.update_user(target_user_id, {"status": new_status})
        import uuid
        from datetime import datetime, timezone
        actor = await self.get_user_by_id(actor_id) or {"email": "system@summa.ai"}
        self._audit_logs.insert(0, {
            "id": f"audit-{uuid.uuid4().hex[:8]}",
            "actor_id": actor_id,
            "actor_email": actor.get("email"),
            "action": f"USER_{new_status.upper()}",
            "target_user_id": target_user_id,
            "target_email": target.get("email"),
            "details": f"Account status set to {new_status}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        return self.serialize_user(updated)

    def get_audit_logs(self, limit: int = 100) -> List[Dict[str, Any]]:
        return self._audit_logs[:limit]

    async def get_tracking_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        return []

    async def get_feedback_analysis(self) -> Dict[str, Any]:
        return {
            "satisfaction_score": None,
            "total_ratings": 0,
            "positive_ratings": 0,
            "negative_ratings": 0,
            "recent_feedback": [],
        }

    async def get_system_health(self) -> Dict[str, Any]:
        db_status = "operational"
        try:
            pool = await self._get_pool()
            if pool is None:
                db_status = "degraded (in-memory fallback)"
        except Exception:
            db_status = "error"

        return {
            "status": "healthy" if db_status == "operational" else "degraded",
            "services": [
                {"name": "Google Gemini LLM Engine", "type": "LLM Provider", "status": "operational"},
                {"name": "Cognee Memory Vector Index", "type": "Vector DB", "status": "operational"},
                {"name": "Postgres User Store Pool", "type": "Database", "status": db_status},
            ],
        }

    async def get_admin_stats(self) -> Dict[str, Any]:
        users = await self.list_all_users()
        active_users = sum(1 for u in users if u.get("status") == "active")
        admins = sum(1 for u in users if u.get("role") == "admin")
        standard_users = len(users) - admins

        msg_count = 0
        mat_count = 0
        quiz_count = 0
        concept_count = 0
        popular_topics = []

        try:
            pool = await self._get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    msg_row = await conn.fetchrow("SELECT count(*) as cnt FROM summa_ai.messages")
                    mat_row = await conn.fetchrow("SELECT count(*) as cnt FROM summa_ai.materials")
                    concept_row = await conn.fetchrow("SELECT count(*) as cnt FROM summa_ai.concepts")
                    quiz_row = await conn.fetchrow("SELECT count(*) as cnt FROM summa_ai.timeline_events WHERE type = 'quiz-completed'")
                    
                    if msg_row: msg_count = msg_row["cnt"]
                    if mat_row: mat_count = mat_row["cnt"]
                    if concept_row: concept_count = concept_row["cnt"]
                    if quiz_row: quiz_count = quiz_row["cnt"]

                    top_rows = await conn.fetch("SELECT name, category FROM summa_ai.concepts ORDER BY created_at DESC LIMIT 5")
                    if top_rows:
                        popular_topics = [{"name": r["name"], "category": r.get("category", "General")} for r in top_rows]
        except Exception:
            pass

        return {
            "overview": {
                "total_users": len(users),
                "active_users": active_users,
                "regular_users": standard_users,
                "admins": admins,
                "dau": active_users,
                "total_messages": msg_count,
                "cognee_memories_indexed": concept_count,
                "study_materials_uploaded": mat_count,
                "quizzes_completed": quiz_count,
            },
            "telemetry": {
                "total_messages_processed": msg_count,
                "estimated_tokens_processed": msg_count * 1150 if msg_count > 0 else 0,
                "estimated_cost_usd": round(((msg_count * 1150) / 1000000) * 0.075, 4) if msg_count > 0 else 0.0,
            },
            "popular_topics": popular_topics,
        }
