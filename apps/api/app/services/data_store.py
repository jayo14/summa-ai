"""Postgres-backed data store — CRUD for summa_ai schema tables via asyncpg."""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import asyncpg

from app.config import settings


def _iso(dt: Any) -> str:
    if dt is None:
        return ""
    if isinstance(dt, str):
        return dt
    try:
        return dt.isoformat()
    except AttributeError:
        return str(dt)


class DataStore:
    _instance: Optional["DataStore"] = None

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

    # ── Artifacts ──────────────────────────────────────────────────

    async def list_artifacts(
        self,
        user_id: str,
        type: Optional[str] = None,
        pinned: Optional[bool] = None,
        archived: bool = False,
    ) -> List[Dict[str, Any]]:
        pool = await self._get_pool()
        clauses = ["user_id = $1", "archived = $2"]
        vals = [user_id, archived]
        idx = 3
        if type is not None:
            clauses.append(f"type = ${idx}")
            vals.append(type)
            idx += 1
        if pinned is not None:
            clauses.append(f"pinned = ${idx}")
            vals.append(pinned)
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                f"SELECT * FROM summa_ai.artifacts WHERE {' AND '.join(clauses)} ORDER BY updated_at DESC",
                *vals,
            )
        return [dict(r) for r in rows]

    async def create_artifact(
        self, user_id: str, data: Dict[str, Any]
    ) -> Dict[str, Any]:
        pool = await self._get_pool()
        aid = str(uuid.uuid4())
        async with pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO summa_ai.artifacts
                   (id, user_id, conversation_id, title, type, source, source_label,
                    parent_artifact_id, component, change_note)
                   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)""",
                aid,
                user_id,
                data.get("conversation_id"),
                data.get("title"),
                data.get("type"),
                data.get("source"),
                data.get("source_label"),
                data.get("parent_artifact_id"),
                json.dumps(data.get("component")) if data.get("component") else None,
                data.get("change_note"),
            )
            await conn.execute(
                """INSERT INTO summa_ai.artifact_versions (artifact_id, version, title, component, change_note)
                   VALUES ($1, 1, $2, $3, $4)""",
                aid,
                data.get("title"),
                json.dumps(data.get("component")) if data.get("component") else None,
                data.get("change_note") or "Initial version",
            )
            row = await conn.fetchrow(
                "SELECT * FROM summa_ai.artifacts WHERE id = $1", aid
            )
        return dict(row)

    async def get_artifact(self, aid: str) -> Optional[Dict[str, Any]]:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM summa_ai.artifacts WHERE id = $1", aid
            )
        return dict(row) if row else None

    async def update_artifact(
        self, aid: str, data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        pool = await self._get_pool()
        sets = []
        vals = []
        for key in ("title", "archived", "pinned", "source_label"):
            if key in data:
                sets.append(f"{key} = ${len(vals) + 1}")
                vals.append(data[key])
        if data.get("component") is not None:
            sets.append(f"component = ${len(vals) + 1}")
            vals.append(json.dumps(data["component"]))
            sets.append("current_version = current_version + 1")
        if not sets:
            return await self.get_artifact(aid)
        sets.append("updated_at = NOW()")
        vals.append(aid)
        async with pool.acquire() as conn:
            await conn.execute(
                f"UPDATE summa_ai.artifacts SET {', '.join(sets)} WHERE id = ${len(vals)}",
                *vals,
            )
            new_version_row = await conn.fetchrow(
                "SELECT current_version, title, component FROM summa_ai.artifacts WHERE id = $1",
                aid,
            )
            if new_version_row:
                await conn.execute(
                    """INSERT INTO summa_ai.artifact_versions (artifact_id, version, title, component, change_note)
                       VALUES ($1, $2, $3, $4, $5)""",
                    aid,
                    new_version_row["current_version"],
                    new_version_row["title"],
                    new_version_row["component"],
                    data.get("change_note") or "Updated",
                )
            row = await conn.fetchrow(
                "SELECT * FROM summa_ai.artifacts WHERE id = $1", aid
            )
        return dict(row) if row else None

    async def delete_artifact(self, aid: str) -> bool:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            result = await conn.execute(
                "DELETE FROM summa_ai.artifacts WHERE id = $1", aid
            )
        return "DELETE 1" in result

    async def list_artifact_versions(self, aid: str) -> List[Dict[str, Any]]:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT * FROM summa_ai.artifact_versions WHERE artifact_id = $1 ORDER BY version DESC",
                aid,
            )
        return [dict(r) for r in rows]

    async def restore_artifact_version(
        self, aid: str, version: int
    ) -> Optional[Dict[str, Any]]:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM summa_ai.artifact_versions WHERE artifact_id = $1 AND version = $2",
                aid,
                version,
            )
            if not row:
                return None
            snapshot = dict(row)
            await conn.execute(
                """UPDATE summa_ai.artifacts
                   SET title = $1, component = $2, current_version = $3, updated_at = NOW()
                   WHERE id = $4""",
                snapshot["title"],
                snapshot["component"],
                snapshot["version"],
                aid,
            )
            return await self.get_artifact(aid)

    async def toggle_pin_artifact(self, aid: str) -> Optional[Dict[str, Any]]:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            await conn.execute(
                "UPDATE summa_ai.artifacts SET pinned = NOT pinned, updated_at = NOW() WHERE id = $1",
                aid,
            )
            row = await conn.fetchrow(
                "SELECT * FROM summa_ai.artifacts WHERE id = $1", aid
            )
        return dict(row) if row else None

    # ── Conversations ──────────────────────────────────────────────

    async def list_conversations(self, user_id: str) -> List[Dict[str, Any]]:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT *, (SELECT count(*) FROM summa_ai.messages WHERE conversation_id = c.id) as message_count "
                "FROM summa_ai.conversations c WHERE user_id = $1 AND archived = FALSE ORDER BY updated_at DESC",
                user_id,
            )
        return [dict(r) for r in rows]

    async def create_conversation(
        self, user_id: str, title: str = "New chat", snippet: Optional[str] = None
    ) -> Dict[str, Any]:
        pool = await self._get_pool()
        cid = str(uuid.uuid4())
        async with pool.acquire() as conn:
            await conn.execute(
                "INSERT INTO summa_ai.conversations (id, user_id, title, snippet) VALUES ($1,$2,$3,$4)",
                cid,
                user_id,
                title,
                snippet,
            )
            row = await conn.fetchrow(
                "SELECT * FROM summa_ai.conversations WHERE id = $1", cid
            )
        return dict(row)

    async def get_conversation(self, cid: str) -> Optional[Dict[str, Any]]:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT *, (SELECT count(*) FROM summa_ai.messages WHERE conversation_id = c.id) as message_count "
                "FROM summa_ai.conversations c WHERE id = $1",
                cid,
            )
        return dict(row) if row else None

    async def delete_conversation(self, cid: str) -> bool:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            result = await conn.execute(
                "DELETE FROM summa_ai.conversations WHERE id = $1", cid
            )
        return "DELETE 1" in result

    async def list_messages(self, cid: str) -> List[Dict[str, Any]]:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT * FROM summa_ai.messages WHERE conversation_id = $1 ORDER BY created_at ASC",
                cid,
            )
        return [dict(r) for r in rows]

    async def add_message(
        self,
        cid: str,
        role: str,
        content: str,
        reasoning: Optional[str] = None,
        components: Optional[Any] = None,
    ) -> Dict[str, Any]:
        pool = await self._get_pool()
        mid = str(uuid.uuid4())
        async with pool.acquire() as conn:
            await conn.execute(
                "INSERT INTO summa_ai.messages (id, conversation_id, role, content, reasoning, components) VALUES ($1,$2,$3,$4,$5,$6)",
                mid,
                cid,
                role,
                content,
                reasoning,
                json.dumps(components) if components is not None else None,
            )
            await conn.execute(
                "UPDATE summa_ai.conversations SET snippet = $1, updated_at = NOW() WHERE id = $2",
                content[:100],
                cid,
            )
            row = await conn.fetchrow(
                "SELECT * FROM summa_ai.messages WHERE id = $1", mid
            )
        return dict(row)

    # ── Timeline ───────────────────────────────────────────────────

    async def list_timeline_events(
        self, user_id: str, limit: int = 50
    ) -> List[Dict[str, Any]]:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT * FROM summa_ai.timeline_events WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2",
                user_id,
                limit,
            )
        return [dict(r) for r in rows]

    async def create_timeline_event(
        self,
        user_id: str,
        type: str,
        title: str,
        description: str,
        metadata: Optional[Any] = None,
    ) -> Dict[str, Any]:
        pool = await self._get_pool()
        eid = str(uuid.uuid4())
        async with pool.acquire() as conn:
            await conn.execute(
                "INSERT INTO summa_ai.timeline_events (id, user_id, type, title, description, metadata) VALUES ($1,$2,$3,$4,$5,$6)",
                eid,
                user_id,
                type,
                title,
                description,
                json.dumps(metadata) if metadata else None,
            )
            row = await conn.fetchrow(
                "SELECT * FROM summa_ai.timeline_events WHERE id = $1", eid
            )
        return dict(row)

    # ── Materials ──────────────────────────────────────────────────

    async def list_materials(self, user_id: str) -> List[Dict[str, Any]]:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT * FROM summa_ai.materials WHERE user_id = $1 ORDER BY created_at DESC",
                user_id,
            )
        return [dict(r) for r in rows]

    async def create_material(
        self, user_id: str, data: Dict[str, Any]
    ) -> Dict[str, Any]:
        pool = await self._get_pool()
        mid = str(uuid.uuid4())
        async with pool.acquire() as conn:
            await conn.execute(
                "INSERT INTO summa_ai.materials (id, user_id, type, title, source, size, duration, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
                mid,
                user_id,
                data.get("type"),
                data.get("title"),
                data.get("source"),
                data.get("size"),
                data.get("duration"),
                "processing",
            )
            row = await conn.fetchrow(
                "SELECT * FROM summa_ai.materials WHERE id = $1", mid
            )
        return dict(row)

    async def delete_material(self, mid: str) -> bool:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            result = await conn.execute(
                "DELETE FROM summa_ai.materials WHERE id = $1", mid
            )
        return "DELETE 1" in result

    # ── Concepts ───────────────────────────────────────────────────

    async def list_concepts(self, user_id: str) -> List[Dict[str, Any]]:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT * FROM summa_ai.concepts WHERE user_id = $1 ORDER BY created_at DESC",
                user_id,
            )
        return [dict(r) for r in rows]

    async def create_concept(
        self, user_id: str, data: Dict[str, Any]
    ) -> Dict[str, Any]:
        pool = await self._get_pool()
        cid = str(uuid.uuid4())
        async with pool.acquire() as conn:
            await conn.execute(
                "INSERT INTO summa_ai.concepts (id, user_id, name, category, mastery, material_id, related_count) VALUES ($1,$2,$3,$4,$5,$6,$7)",
                cid,
                user_id,
                data.get("name"),
                data.get("category"),
                data.get("mastery", "learning"),
                data.get("material_id"),
                data.get("related_count", 0),
            )
            row = await conn.fetchrow(
                "SELECT * FROM summa_ai.concepts WHERE id = $1", cid
            )
        return dict(row)

    async def delete_concept(self, cid: str) -> bool:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            result = await conn.execute(
                "DELETE FROM summa_ai.concepts WHERE id = $1", cid
            )
        return "DELETE 1" in result

    # ── Study Plans ─────────────────────────────────────────────────

    async def list_study_plans(self, user_id: str) -> List[Dict[str, Any]]:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT * FROM summa_ai.study_plans WHERE user_id = $1 ORDER BY created_at DESC",
                user_id,
            )
            plans = []
            for row in rows:
                p = dict(row)
                sessions = await conn.fetch(
                    "SELECT * FROM summa_ai.study_sessions WHERE plan_id = $1 ORDER BY sort_order ASC",
                    p["id"],
                )
                p["sessions"] = [dict(s) for s in sessions]
                plans.append(p)
        return plans

    async def create_study_plan(
        self, user_id: str, data: Dict[str, Any]
    ) -> Dict[str, Any]:
        pool = await self._get_pool()
        pid = str(uuid.uuid4())
        sessions_data = data.pop("sessions", [])
        async with pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO summa_ai.study_plans (id, user_id, title, progress, days_left, streak)
                   VALUES ($1, $2, $3, $4, $5, $6)""",
                pid,
                user_id,
                data.get("title", "Study Plan"),
                data.get("progress", 0.0),
                data.get("days_left", 0),
                data.get("streak", 0),
            )
            for i, s in enumerate(sessions_data):
                await conn.execute(
                    """INSERT INTO summa_ai.study_sessions (id, plan_id, day, topic, status, duration, sort_order)
                       VALUES ($1, $2, $3, $4, $5, $6, $7)""",
                    str(uuid.uuid4()),
                    pid,
                    s.get("day", ""),
                    s.get("topic", ""),
                    s.get("status", "upcoming"),
                    s.get("duration", "30 min"),
                    s.get("sort_order", i),
                )
            result = await self._get_study_plan(pid)
        await self.create_timeline_event(
            user_id,
            "study_plan",
            f"Study Plan: {data.get('title', 'Untitled')}",
            f"Created a new study plan with {len(sessions_data)} sessions",
            {"plan_id": pid},
        )
        return result

    async def _get_study_plan(self, pid: str) -> Optional[Dict[str, Any]]:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM summa_ai.study_plans WHERE id = $1", pid
            )
            if not row:
                return None
            p = dict(row)
            sessions = await conn.fetch(
                "SELECT * FROM summa_ai.study_sessions WHERE plan_id = $1 ORDER BY sort_order ASC",
                pid,
            )
            p["sessions"] = [dict(s) for s in sessions]
        return p

    async def update_study_plan(
        self, pid: str, data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        pool = await self._get_pool()
        sets = []
        vals = []
        for key in ("title", "progress", "days_left", "streak"):
            if key in data:
                sets.append(f"{key} = ${len(vals) + 1}")
                vals.append(data[key])
        if not sets:
            return await self._get_study_plan(pid)
        sets.append("updated_at = NOW()")
        vals.append(pid)
        async with pool.acquire() as conn:
            await conn.execute(
                f"UPDATE summa_ai.study_plans SET {', '.join(sets)} WHERE id = ${len(vals)}",
                *vals,
            )
            return await self._get_study_plan(pid)

    async def delete_study_plan(self, pid: str) -> bool:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            result = await conn.execute(
                "DELETE FROM summa_ai.study_plans WHERE id = $1", pid
            )
        return "DELETE 1" in result

    async def update_session(
        self, sid: str, data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        pool = await self._get_pool()
        sets = []
        vals = []
        for key in ("status", "duration"):
            if key in data:
                sets.append(f"{key} = ${len(vals) + 1}")
                vals.append(data[key])
        if not sets:
            async with pool.acquire() as conn:
                row = await conn.fetchrow(
                    "SELECT * FROM summa_ai.study_sessions WHERE id = $1", sid
                )
            return dict(row) if row else None
        vals.append(sid)
        async with pool.acquire() as conn:
            await conn.execute(
                f"UPDATE summa_ai.study_sessions SET {', '.join(sets)} WHERE id = ${len(vals)}",
                *vals,
            )
            row = await conn.fetchrow(
                "SELECT * FROM summa_ai.study_sessions WHERE id = $1", sid
            )
        return dict(row) if row else None

    # ── Flashcards ──────────────────────────────────────────────────

    async def list_flashcards(self, user_id: str) -> List[Dict[str, Any]]:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT * FROM summa_ai.flashcards WHERE user_id = $1 ORDER BY created_at ASC",
                user_id,
            )
        return [dict(r) for r in rows]

    async def create_flashcard(
        self, user_id: str, data: Dict[str, Any]
    ) -> Dict[str, Any]:
        pool = await self._get_pool()
        fid = str(uuid.uuid4())
        async with pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO summa_ai.flashcards (id, user_id, front, back)
                   VALUES ($1, $2, $3, $4)""",
                fid,
                user_id,
                data.get("front"),
                data.get("back"),
            )
            row = await conn.fetchrow(
                "SELECT * FROM summa_ai.flashcards WHERE id = $1", fid
            )
        result = dict(row)
        front_preview = (data.get("front") or "")[:60]
        await self.create_timeline_event(
            user_id,
            "flashcard",
            f"Flashcard: {front_preview}",
            "Created a new flashcard",
            {"card_id": fid},
        )
        return result

    async def update_flashcard(
        self, fid: str, data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        pool = await self._get_pool()
        sets = []
        vals = []
        for key in ("mastered", "ease_factor", "interval_days", "repetitions"):
            if key in data:
                sets.append(f"{key} = ${len(vals) + 1}")
                vals.append(data[key])
        if "interval_days" in data:
            sets.append(
                f"next_review_at = NOW() + (${len(vals) + 1} || ' days')::INTERVAL"
            )
            vals.append(data["interval_days"])
        if not sets:
            return None
        sets.append("updated_at = NOW()")
        vals.append(fid)
        async with pool.acquire() as conn:
            await conn.execute(
                f"UPDATE summa_ai.flashcards SET {', '.join(sets)} WHERE id = ${len(vals)}",
                *vals,
            )
            row = await conn.fetchrow(
                "SELECT * FROM summa_ai.flashcards WHERE id = $1", fid
            )
        return dict(row) if row else None

    async def delete_flashcard(self, fid: str) -> bool:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            result = await conn.execute(
                "DELETE FROM summa_ai.flashcards WHERE id = $1", fid
            )
        return "DELETE 1" in result

    # ── Exams ───────────────────────────────────────────────────────

    async def list_exams(self, user_id: str) -> List[Dict[str, Any]]:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT * FROM summa_ai.exams WHERE user_id = $1 ORDER BY exam_date ASC",
                user_id,
            )
        return [dict(r) for r in rows]

    async def create_exam(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        pool = await self._get_pool()
        eid = str(uuid.uuid4())
        async with pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO summa_ai.exams (id, user_id, name, exam_date, readiness)
                   VALUES ($1, $2, $3, $4, $5)""",
                eid,
                user_id,
                data.get("name"),
                data.get("exam_date"),
                data.get("readiness", 0),
            )
            row = await conn.fetchrow("SELECT * FROM summa_ai.exams WHERE id = $1", eid)
        result = dict(row)
        await self.create_timeline_event(
            user_id,
            "exam",
            f"Exam: {data.get('name', 'Untitled')}",
            f"Scheduled exam on {data.get('exam_date', 'TBD')}",
            {"exam_id": eid},
        )
        return result

    async def update_exam(
        self, eid: str, data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        pool = await self._get_pool()
        sets = []
        vals = []
        for key in ("name", "exam_date", "readiness"):
            if key in data:
                sets.append(f"{key} = ${len(vals) + 1}")
                vals.append(data[key])
        if not sets:
            async with pool.acquire() as conn:
                row = await conn.fetchrow(
                    "SELECT * FROM summa_ai.exams WHERE id = $1", eid
                )
            return dict(row) if row else None
        sets.append("updated_at = NOW()")
        vals.append(eid)
        async with pool.acquire() as conn:
            await conn.execute(
                f"UPDATE summa_ai.exams SET {', '.join(sets)} WHERE id = ${len(vals)}",
                *vals,
            )
            row = await conn.fetchrow("SELECT * FROM summa_ai.exams WHERE id = $1", eid)
        return dict(row) if row else None

    async def delete_exam(self, eid: str) -> bool:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM summa_ai.exams WHERE id = $1", eid)
        return "DELETE 1" in result
