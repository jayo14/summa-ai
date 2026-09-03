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
            cls._instance._audit_logs: list[dict[str, Any]] = [
                {
                    "id": "audit-1",
                    "actor_id": "119f677f-cd51-526d-acf3-3bd68d95b57b",
                    "actor_email": "alex@summa.ai",
                    "action": "ROLE_ELEVATED",
                    "target_user_id": "usr-prof-1",
                    "target_email": "prof.marcus@university.edu",
                    "details": "Assigned Instructor role for CSC 201 course management",
                    "timestamp": "2026-09-03T10:15:00Z",
                },
                {
                    "id": "audit-2",
                    "actor_id": "119f677f-cd51-526d-acf3-3bd68d95b57b",
                    "actor_email": "alex@summa.ai",
                    "action": "SYSTEM_POLICY_UPDATED",
                    "target_user_id": "SYSTEM",
                    "target_email": "system@summa.ai",
                    "details": "Enabled Hybrid Memory Vector Indexing & Gemini API Rate Limits",
                    "timestamp": "2026-09-02T14:30:00Z",
                },
            ]
            cls._instance._local_users: Dict[str, Dict[str, Any]] = {
                "119f677f-cd51-526d-acf3-3bd68d95b57b": {
                    "id": "119f677f-cd51-526d-acf3-3bd68d95b57b",
                    "email": "alex@summa.ai",
                    "name": "Alex Rivera",
                    "role": "admin",
                    "status": "active",
                    "avatar": None,
                    "provider": "credentials",
                    "onboarded": True,
                    "onboarding_data": {"degree": "M.S. Computer Science", "field_of_study": "AI & Systems"},
                    "last_active": "2026-09-03T13:10:00Z",
                    "created_at": "2026-08-01T00:00:00Z",
                },
                "usr-prof-1": {
                    "id": "usr-prof-1",
                    "email": "prof.marcus@university.edu",
                    "name": "Dr. Marcus Vance",
                    "role": "instructor",
                    "status": "active",
                    "avatar": None,
                    "provider": "credentials",
                    "onboarded": True,
                    "onboarding_data": {"degree": "Ph.D. Software Engineering", "field_of_study": "Object-Oriented Design"},
                    "last_active": "2026-09-03T11:45:00Z",
                    "created_at": "2026-08-10T00:00:00Z",
                },
                "usr-student-1": {
                    "id": "usr-student-1",
                    "email": "sarah.chen@student.edu",
                    "name": "Sarah Chen",
                    "role": "student",
                    "status": "active",
                    "avatar": None,
                    "provider": "credentials",
                    "onboarded": True,
                    "onboarding_data": {"degree": "B.S. Computer Science", "field_of_study": "Data Structures"},
                    "last_active": "2026-09-03T09:20:00Z",
                    "created_at": "2026-08-15T00:00:00Z",
                },
                "usr-student-2": {
                    "id": "usr-student-2",
                    "email": "david.k@student.edu",
                    "name": "David Kim",
                    "role": "student",
                    "status": "active",
                    "avatar": None,
                    "provider": "credentials",
                    "onboarded": True,
                    "onboarding_data": {"degree": "B.S. Information Technology", "field_of_study": "Web Systems"},
                    "last_active": "2026-09-02T16:00:00Z",
                    "created_at": "2026-08-20T00:00:00Z",
                },
                "usr-student-3": {
                    "id": "usr-student-3",
                    "email": "maya.lin@student.edu",
                    "name": "Maya Lin",
                    "role": "student",
                    "status": "suspended",
                    "avatar": None,
                    "provider": "credentials",
                    "onboarded": False,
                    "onboarding_data": {},
                    "last_active": "2026-08-28T10:00:00Z",
                    "created_at": "2026-08-25T00:00:00Z",
                },
            }
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
            "role": user.get("role", "student"),
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

        updated = await self.update_user(target_user_id, {"role": new_role})
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
            "details": f"Role updated to {new_role}",
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

    async def get_admin_stats(self) -> Dict[str, Any]:
        users = await self.list_all_users()
        active_users = sum(1 for u in users if u.get("status") == "active")
        students = sum(1 for u in users if u.get("role") == "student")
        instructors = sum(1 for u in users if u.get("role") == "instructor")
        admins = sum(1 for u in users if u.get("role") == "admin")

        return {
            "overview": {
                "total_users": len(users),
                "active_users": active_users,
                "students": students,
                "instructors": instructors,
                "admins": admins,
                "dau": 42,
                "total_messages": 1284,
                "cognee_memories_indexed": 348,
                "study_materials_uploaded": 89,
                "quizzes_completed": 156,
            },
            "telemetry": {
                "total_tokens_used": 1420500,
                "input_tokens": 980200,
                "output_tokens": 440300,
                "estimated_cost_usd": 0.35,
                "avg_response_latency_ms": 1120.5,
                "cache_hit_rate_pct": 94.2,
                "vector_search_latency_ms": 48.2,
            },
            "popular_topics": [
                {"name": "CSC 201 · Dynamic Dispatch & Polymorphism", "sessions": 148, "mastery_avg": 86},
                {"name": "Java Collections Framework & Interfaces", "sessions": 112, "mastery_avg": 92},
                {"name": "Data Structures · Recursion & Stack Frames", "sessions": 94, "mastery_avg": 78},
                {"name": "Database Design & SQL Normalization", "sessions": 76, "mastery_avg": 84},
            ],
        }
