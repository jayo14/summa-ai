"""Postgres-backed data store — CRUD for summa_ai schema tables via asyncpg."""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import asyncpg

from app.services.db_pool import get_pool


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
            cls._instance._local_activities = []
            cls._instance._local_materials = []
            cls._instance._local_concepts = []
            cls._instance._local_conversations = []
            cls._instance._local_messages = {}
            cls._instance._local_timeline = []
            cls._instance._local_study_plans: List[Dict[str, Any]] = []
            cls._instance._local_flashcards: List[Dict[str, Any]] = []
            cls._instance._local_exams: List[Dict[str, Any]] = []
            cls._instance._local_quiz_results: List[Dict[str, Any]] = []
        return cls._instance

    async def _get_pool(self) -> Optional[asyncpg.Pool]:
        if self._pool is not None:
            return self._pool
        try:
            return await get_pool()
        except Exception:
            return None

    # ── Artifacts ──────────────────────────────────────────────────

    async def list_artifacts(
        self,
        user_id: str,
        type: Optional[str] = None,
        pinned: Optional[bool] = None,
        archived: bool = False,
    ) -> List[Dict[str, Any]]:
        try:
            pool = await self._get_pool()
            if pool is not None:
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
                    idx += 1
                async with pool.acquire() as conn:
                    rows = await conn.fetch(
                        f"SELECT * FROM summa_ai.artifacts WHERE {' AND '.join(clauses)} ORDER BY updated_at DESC",
                        *vals,
                    )
                if rows is not None:
                    return [dict(r) for r in rows]
        except Exception as exc:
            import logging
            logging.getLogger(__name__).debug("list_artifacts fallback: %s", exc)

        items = self._local_activities
        if type:
            items = [i for i in items if i.get("type") == type]
        if pinned is not None:
            items = [i for i in items if i.get("pinned") == pinned]
        return items

    list_activities = list_artifacts

    async def _remember_in_cognee(
        self, user_id: str, text: str, metadata: Dict[str, Any], dataset_name: str = "main"
    ):
        try:
            from app.services.cognee_service import CogneeService
            cognee = CogneeService()
            await cognee.remember_text(text, user_id, metadata=metadata, dataset_name=dataset_name)
        except Exception as exc:
            import logging
            logging.getLogger(__name__).debug("Cognee memory sync error: %s", exc)

    async def create_artifact(
        self, user_id: str, data: Dict[str, Any]
    ) -> Dict[str, Any]:
        aid = str(uuid.uuid4())
        try:
            pool = await self._get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    await conn.execute(
                        """INSERT INTO summa_ai.artifacts
                           (id, user_id, conversation_id, title, type, source, source_label,
                            parent_artifact_id, component, change_note, purpose, concept_ids,
                            difficulty, estimated_minutes, learning_signals)
                           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)""",
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
                        data.get("purpose"),
                        json.dumps(data.get("concept_ids", [])),
                        data.get("difficulty"),
                        data.get("estimated_minutes"),
                        json.dumps(data.get("learning_signals", {})),
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
                if row:
                    result = dict(row)
                    await self._remember_in_cognee(
                        user_id,
                        f"ARTIFACT: Title: {result.get('title')}, Type: {result.get('type')}",
                        result,
                        dataset_name="artifacts",
                    )
                    return result
        except Exception as exc:
            import logging
            logging.getLogger(__name__).debug("create_artifact fallback: %s", exc)

        item = {
            "id": aid,
            "user_id": user_id,
            "title": data.get("title", "New Activity"),
            "type": data.get("type", "activity"),
            "description": data.get("description", ""),
            "meta": data.get("meta", ""),
            "accent": data.get("accent", "indigo"),
            "topic": data.get("topic", "CSC 201"),
            "date": datetime.now(timezone.utc).isoformat(),
            "action": data.get("action", "Open"),
            "pinned": False,
            "archived": False,
            "purpose": data.get("purpose"),
            "concept_ids": data.get("concept_ids", []),
            "difficulty": data.get("difficulty"),
            "estimated_minutes": data.get("estimated_minutes"),
            "learning_signals": data.get("learning_signals", {}),
            "component": data.get("component"),
        }
        self._local_activities.insert(0, item)
        return item

    create_activity = create_artifact

    async def get_artifact(self, aid: str, user_id: str) -> Optional[Dict[str, Any]]:
        try:
            pool = await self._get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    row = await conn.fetchrow(
                        "SELECT * FROM summa_ai.artifacts WHERE id = $1 AND user_id = $2", aid, user_id
                    )
                if row:
                    return dict(row)
        except Exception:
            pass

        return next((a for a in self._local_activities if a.get("id") == aid and a.get("user_id") == user_id), None)

    get_activity = get_artifact

    async def update_artifact(
        self, aid: str, user_id: str, data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        try:
            pool = await self._get_pool()
            if pool is not None:
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
                if sets:
                    sets.append("updated_at = NOW()")
                    vals.append(aid)
                    vals.append(user_id)
                    async with pool.acquire() as conn:
                        await conn.execute(
                            f"UPDATE summa_ai.artifacts SET {', '.join(sets)} WHERE id = ${len(vals) - 1} AND user_id = ${len(vals)}",
                            *vals,
                        )
                        row = await conn.fetchrow(
                            "SELECT * FROM summa_ai.artifacts WHERE id = $1 AND user_id = $2", aid, user_id
                        )
                    if row:
                        return dict(row)
        except Exception:
            pass

        for a in self._local_activities:
            if a.get("id") == aid and a.get("user_id") == user_id:
                a.update({k: v for k, v in data.items() if v is not None})
                return a
        return None

    update_activity = update_artifact

    async def delete_artifact(self, aid: str, user_id: str) -> bool:
        try:
            pool = await self._get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    result = await conn.execute(
                        "DELETE FROM summa_ai.artifacts WHERE id = $1 AND user_id = $2", aid, user_id
                    )
                return "DELETE 1" in result
        except Exception:
            pass

        orig_len = len(self._local_activities)
        self._local_activities = [a for a in self._local_activities if not (a.get("id") == aid and a.get("user_id") == user_id)]
        return len(self._local_activities) < orig_len

    delete_activity = delete_artifact
    toggle_pin_artifact = update_artifact
    toggle_pin_activity = toggle_pin_artifact

    async def list_artifact_versions(self, aid: str, user_id: str) -> List[Dict[str, Any]]:
        artifact = await self.get_artifact(aid, user_id)
        if not artifact:
            return []
        try:
            pool = await self._get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    rows = await conn.fetch(
                        "SELECT * FROM summa_ai.artifact_versions WHERE artifact_id = $1 ORDER BY version DESC",
                        aid,
                    )
                if rows is not None:
                    return [dict(r) for r in rows]
        except Exception:
            pass
        return []

    list_activity_versions = list_artifact_versions

    async def restore_artifact_version(
        self, aid: str, user_id: str, version: int
    ) -> Optional[Dict[str, Any]]:
        artifact = await self.get_artifact(aid, user_id)
        if not artifact:
            return None
        try:
            pool = await self._get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    vrow = await conn.fetchrow(
                        "SELECT * FROM summa_ai.artifact_versions WHERE artifact_id = $1 AND version = $2",
                        aid,
                        version,
                    )
                    if not vrow:
                        return None
                    vdata = dict(vrow)
                    component = vdata.get("component")
                    component_obj = json.loads(component) if isinstance(component, str) else component
                    return await self.update_artifact(
                        aid, user_id, {"title": vdata.get("title"), "component": component_obj}
                    )
        except Exception:
            pass
        return None

    restore_activity_version = restore_artifact_version

    # ── Conversations ──────────────────────────────────────────────

    async def list_conversations(self, user_id: str) -> List[Dict[str, Any]]:
        try:
            pool = await self._get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    rows = await conn.fetch(
                        "SELECT *, (SELECT count(*) FROM summa_ai.messages WHERE conversation_id = c.id) as message_count "
                        "FROM summa_ai.conversations c WHERE user_id = $1 AND archived = FALSE ORDER BY updated_at DESC",
                        user_id,
                    )
                if rows is not None:
                    return [dict(r) for r in rows]
        except Exception as exc:
            import logging
            logging.getLogger(__name__).debug("list_conversations fallback: %s", exc)

        return self._local_conversations

    async def create_conversation(
        self, user_id: str, title: str = "New chat", snippet: Optional[str] = None, folder: Optional[str] = None, cid: Optional[str] = None
    ) -> Dict[str, Any]:
        cid = cid or str(uuid.uuid4())
        try:
            pool = await self._get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    await conn.execute(
                        "INSERT INTO summa_ai.conversations (id, user_id, title, snippet, folder) VALUES ($1,$2,$3,$4,$5)",
                        cid,
                        user_id,
                        title,
                        snippet,
                        folder,
                    )
                    row = await conn.fetchrow(
                        "SELECT * FROM summa_ai.conversations WHERE id = $1", cid
                    )
                if row:
                    return dict(row)
        except Exception as exc:
            import logging
            logging.getLogger(__name__).debug("create_conversation fallback: %s", exc)

        item = {
            "id": cid,
            "user_id": user_id,
            "title": title,
            "snippet": snippet,
            "folder": folder,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "archived": False,
        }
        self._local_conversations.insert(0, item)
        return item

    async def update_conversation(
        self, cid: str, user_id: str, data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        try:
            pool = await self._get_pool()
            if pool is not None:
                sets = []
                vals = []
                for key in ("title", "folder", "archived"):
                    if key in data:
                        sets.append(f"{key} = ${len(vals) + 1}")
                        vals.append(data[key])
                if sets:
                    sets.append("updated_at = NOW()")
                    vals.append(cid)
                    vals.append(user_id)
                    async with pool.acquire() as conn:
                        await conn.execute(
                            f"UPDATE summa_ai.conversations SET {', '.join(sets)} WHERE id = ${len(vals) - 1} AND user_id = ${len(vals)}",
                            *vals,
                        )
                        row = await conn.fetchrow(
                            "SELECT * FROM summa_ai.conversations WHERE id = $1 AND user_id = $2", cid, user_id
                        )
                    if row:
                        return dict(row)
        except Exception:
            pass

        for c in self._local_conversations:
            if c.get("id") == cid and c.get("user_id") == user_id:
                c.update({k: v for k, v in data.items() if v is not None})
                return c
        return None

    async def get_conversation(self, cid: str, user_id: str) -> Optional[Dict[str, Any]]:
        try:
            pool = await self._get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    row = await conn.fetchrow(
                        "SELECT *, (SELECT count(*) FROM summa_ai.messages WHERE conversation_id = c.id) as message_count "
                        "FROM summa_ai.conversations c WHERE id = $1 AND user_id = $2",
                        cid,
                        user_id,
                    )
                if row:
                    return dict(row)
        except Exception:
            pass

        return next((c for c in self._local_conversations if c.get("id") == cid and c.get("user_id") == user_id), None)

    async def delete_conversation(self, cid: str, user_id: str) -> bool:
        try:
            pool = await self._get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    result = await conn.execute(
                        "DELETE FROM summa_ai.conversations WHERE id = $1 AND user_id = $2", cid, user_id
                    )
                return "DELETE 1" in result
        except Exception:
            pass

        orig_len = len(self._local_conversations)
        self._local_conversations = [c for c in self._local_conversations if not (c.get("id") == cid and c.get("user_id") == user_id)]
        return len(self._local_conversations) < orig_len

    async def list_messages(self, cid: str, user_id: str) -> List[Dict[str, Any]]:
        try:
            pool = await self._get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    rows = await conn.fetch(
                        """SELECT m.* FROM summa_ai.messages m
                           JOIN summa_ai.conversations c ON m.conversation_id = c.id
                           WHERE m.conversation_id = $1 AND c.user_id = $2
                           ORDER BY m.created_at ASC""",
                        cid,
                        user_id,
                    )
                if rows is not None:
                    return [dict(r) for r in rows]
        except Exception:
            pass

        conv = next((c for c in self._local_conversations if c.get("id") == cid and c.get("user_id") == user_id), None)
        if not conv:
            return []
        return self._local_messages.get(cid, [])

    async def add_message(
        self,
        cid: str,
        user_id: str,
        role: str,
        content: str,
        reasoning: Optional[str] = None,
        components: Optional[Any] = None,
    ) -> Optional[Dict[str, Any]]:
        mid = str(uuid.uuid4())
        try:
            pool = await self._get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    owner = await conn.fetchval(
                        "SELECT user_id FROM summa_ai.conversations WHERE id = $1", cid
                    )
                    if not owner:
                        # Auto-create conversation if missing in DB
                        await conn.execute(
                            "INSERT INTO summa_ai.conversations (id, user_id, title) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING",
                            cid,
                            user_id,
                            "New Chat",
                        )
                    elif owner != user_id:
                        # Update ownership if missing or mismatched user context
                        await conn.execute(
                            "UPDATE summa_ai.conversations SET user_id = $1 WHERE id = $2",
                            user_id,
                            cid,
                        )
                    await conn.execute(
                        "INSERT INTO summa_ai.messages (id, conversation_id, role, content, reasoning, components) VALUES ($1,$2,$3,$4,$5,$6)",
                        mid,
                        cid,
                        role,
                        content,
                        reasoning,
                        json.dumps(components) if components else None,
                    )
                    await conn.execute(
                        "UPDATE summa_ai.conversations SET updated_at = NOW() WHERE id = $1", cid
                    )
                    row = await conn.fetchrow(
                        "SELECT * FROM summa_ai.messages WHERE id = $1", mid
                    )
                if row:
                    return dict(row)
        except Exception:
            pass

        conv = next((c for c in self._local_conversations if c.get("id") == cid and c.get("user_id") == user_id), None)
        if not conv:
            conv = {
                "id": cid,
                "user_id": user_id,
                "title": "New Chat",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            self._local_conversations.insert(0, conv)
        item = {
            "id": mid,
            "conversation_id": cid,
            "role": role,
            "content": content,
            "reasoning": reasoning,
            "components": components,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self._local_messages.setdefault(cid, []).append(item)
        return item

    # ── Timeline ───────────────────────────────────────────────────

    async def list_timeline_events(
        self, user_id: str, limit: int = 50
    ) -> List[Dict[str, Any]]:
        try:
            pool = await self._get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    rows = await conn.fetch(
                        "SELECT * FROM summa_ai.timeline_events WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2",
                        user_id,
                        limit,
                    )
                if rows is not None:
                    return [dict(r) for r in rows]
        except Exception:
            pass

        return self._local_timeline

    async def create_timeline_event(
        self,
        user_id: str,
        type: str,
        title: str,
        description: str,
        metadata: Optional[Any] = None,
    ) -> Dict[str, Any]:
        eid = str(uuid.uuid4())
        try:
            pool = await self._get_pool()
            if pool is not None:
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
                if row:
                    return dict(row)
        except Exception:
            pass

        item = {
            "id": eid,
            "user_id": user_id,
            "type": type,
            "title": title,
            "description": description,
            "metadata": metadata,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self._local_timeline.insert(0, item)
        return item

    # ── Materials ──────────────────────────────────────────────────

    async def list_materials(self, user_id: str) -> List[Dict[str, Any]]:
        try:
            pool = await self._get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    rows = await conn.fetch(
                        "SELECT * FROM summa_ai.materials WHERE user_id = $1 ORDER BY created_at DESC",
                        user_id,
                    )
                if rows is not None:
                    return [dict(r) for r in rows]
        except Exception as exc:
            import logging
            logging.getLogger(__name__).debug("list_materials fallback: %s", exc)

        return self._local_materials

    async def create_material(
        self, user_id: str, data: Dict[str, Any]
    ) -> Dict[str, Any]:
        mid = str(uuid.uuid4())
        try:
            pool = await self._get_pool()
            if pool is not None:
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
                if row:
                    result = dict(row)
                    await self._remember_in_cognee(
                        user_id,
                        f"STUDY MATERIAL: Title: {result.get('title')}, Type: {result.get('type')}, Source: {result.get('source')}",
                        result,
                        dataset_name="materials",
                    )
                    return result
        except Exception as exc:
            import logging
            logging.getLogger(__name__).debug("create_material fallback: %s", exc)

        item = {
            "id": mid,
            "user_id": user_id,
            "type": data.get("type", "Document"),
            "title": data.get("title", "New Material"),
            "source": data.get("source", "User Upload"),
            "size": data.get("size", "1.0 MB"),
            "duration": data.get("duration", "5 min"),
            "status": "active",
            "topic": data.get("topic", "CSC 201"),
            "date": datetime.now(timezone.utc).isoformat(),
        }
        self._local_materials.insert(0, item)
        return item

    async def delete_material(self, mid: str) -> bool:
        try:
            pool = await self._get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    result = await conn.execute(
                        "DELETE FROM summa_ai.materials WHERE id = $1", mid
                    )
                return "DELETE 1" in result
        except Exception:
            pass

        self._local_materials = [m for m in self._local_materials if m.get("id") != mid]
        return True

    # ── Concepts ───────────────────────────────────────────────────

    async def list_concepts(self, user_id: str) -> List[Dict[str, Any]]:
        try:
            pool = await self._get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    rows = await conn.fetch(
                        "SELECT * FROM summa_ai.concepts WHERE user_id = $1 ORDER BY created_at DESC",
                        user_id,
                    )
                if rows is not None:
                    return [dict(r) for r in rows]
        except Exception as exc:
            import logging
            logging.getLogger(__name__).debug("list_concepts fallback: %s", exc)

        return self._local_concepts

    async def create_concept(
        self, user_id: str, data: Dict[str, Any]
    ) -> Dict[str, Any]:
        cid = str(uuid.uuid4())
        try:
            pool = await self._get_pool()
            if pool is not None:
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
                if row:
                    result = dict(row)
                    await self._remember_in_cognee(
                        user_id,
                        f"CONCEPT: Name: {result.get('name')}, Category: {result.get('category')}, Mastery: {result.get('mastery')}",
                        result,
                        dataset_name="concepts",
                    )
                    return result
        except Exception as exc:
            import logging
            logging.getLogger(__name__).debug("create_concept fallback: %s", exc)

        item = {
            "id": cid,
            "user_id": user_id,
            "name": data.get("name", "New Concept"),
            "category": data.get("category", "General"),
            "mastery": data.get("mastery", "learning"),
            "material_id": data.get("material_id"),
            "related_count": data.get("related_count", 0),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self._local_concepts.insert(0, item)
        return item

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
                p["id"] = str(p["id"])
                sessions = await conn.fetch(
                    "SELECT * FROM summa_ai.study_sessions WHERE plan_id = $1 ORDER BY sort_order ASC",
                    row["id"],
                )
                p["sessions"] = [dict(s) for s in sessions]
                plans.append(p)
        return plans

    async def create_study_plan(
        self, user_id: str, data: Dict[str, Any]
    ) -> Dict[str, Any]:
        pid = str(uuid.uuid4())
        sessions_data = data.pop("sessions", [])
        try:
            pool = await self._get_pool()
            if pool is not None:
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
                            i,
                        )
                    row = await conn.fetchrow("SELECT * FROM summa_ai.study_plans WHERE id = $1", pid)
                    if row:
                        await self.create_timeline_event(
                            user_id,
                            "study_plan",
                            f"Study Plan Created: {data.get('title', 'Study Plan')}",
                            f"Created study plan with {len(sessions_data)} session(s)",
                            {"plan_id": pid},
                        )
                        d = dict(row)
                        d["id"] = str(d["id"])
                        d["sessions"] = sessions_data
                        return d
        except Exception:
            pass

        plan_item = {
            "id": pid,
            "user_id": user_id,
            "title": data.get("title", "Study Plan"),
            "progress": data.get("progress", 0.0),
            "days_left": data.get("days_left", 0),
            "streak": data.get("streak", 0),
            "approved": data.get("approved", False),
            "sessions": sessions_data,
        }
        self._local_study_plans.append(plan_item)
        await self.create_timeline_event(
            user_id,
            "study_plan",
            f"Study Plan Created: {data.get('title', 'Study Plan')}",
            f"Created study plan with {len(sessions_data)} session(s)",
            {"plan_id": pid},
        )
        return plan_item

    async def _get_study_plan(self, pid: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            if user_id is not None:
                row = await conn.fetchrow(
                    "SELECT * FROM summa_ai.study_plans WHERE id = $1 AND user_id = $2", pid, user_id
                )
            else:
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
        self, pid: str, user_id: str, data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        pool = await self._get_pool()
        sets = []
        vals = []
        for key in ("title", "progress", "days_left", "streak"):
            if key in data:
                sets.append(f"{key} = ${len(vals) + 1}")
                vals.append(data[key])
        if not sets:
            return await self._get_study_plan(pid, user_id)
        sets.append("updated_at = NOW()")
        vals.append(pid)
        vals.append(user_id)
        async with pool.acquire() as conn:
            await conn.execute(
                f"UPDATE summa_ai.study_plans SET {', '.join(sets)} WHERE id = ${len(vals) - 1} AND user_id = ${len(vals)}",
                *vals,
            )
            return await self._get_study_plan(pid, user_id)

    async def delete_study_plan(self, pid: str, user_id: str) -> bool:
        try:
            pool = await self._get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    result = await conn.execute(
                        "DELETE FROM summa_ai.study_plans WHERE id = $1 AND user_id = $2", pid, user_id
                    )
                if "DELETE 1" in result:
                    return True
        except Exception:
            pass

        before = len(self._local_study_plans)
        self._local_study_plans = [p for p in self._local_study_plans if not (p.get("id") == pid and p.get("user_id") == user_id)]
        return len(self._local_study_plans) < before

    async def update_session(
        self, sid: str, user_id: str, data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            owner = await conn.fetchval(
                """SELECT sp.user_id FROM summa_ai.study_sessions ss
                   JOIN summa_ai.study_plans sp ON ss.plan_id = sp.id
                   WHERE ss.id = $1""", sid
            )
            if owner != user_id:
                return None

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
        self, fid: str, user_id: str, data: Dict[str, Any]
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
        vals.append(user_id)
        async with pool.acquire() as conn:
            await conn.execute(
                f"UPDATE summa_ai.flashcards SET {', '.join(sets)} WHERE id = ${len(vals) - 1} AND user_id = ${len(vals)}",
                *vals,
            )
            row = await conn.fetchrow(
                "SELECT * FROM summa_ai.flashcards WHERE id = $1 AND user_id = $2", fid, user_id
            )
        return dict(row) if row else None

    async def delete_flashcard(self, fid: str, user_id: str) -> bool:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            result = await conn.execute(
                "DELETE FROM summa_ai.flashcards WHERE id = $1 AND user_id = $2", fid, user_id
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
        exam_date = data.get("exam_date")
        if isinstance(exam_date, str):
            try:
                from datetime import date
                exam_date = date.fromisoformat(exam_date)
            except ValueError:
                pass
        async with pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO summa_ai.exams (id, user_id, name, exam_date, readiness)
                   VALUES ($1, $2, $3, $4, $5)""",
                eid,
                user_id,
                data.get("name"),
                exam_date,
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
        self, eid: str, user_id: str, data: Dict[str, Any]
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
                    "SELECT * FROM summa_ai.exams WHERE id = $1 AND user_id = $2", eid, user_id
                )
            return dict(row) if row else None
        sets.append("updated_at = NOW()")
        vals.append(eid)
        vals.append(user_id)
        async with pool.acquire() as conn:
            await conn.execute(
                f"UPDATE summa_ai.exams SET {', '.join(sets)} WHERE id = ${len(vals) - 1} AND user_id = ${len(vals)}",
                *vals,
            )
            row = await conn.fetchrow("SELECT * FROM summa_ai.exams WHERE id = $1 AND user_id = $2", eid, user_id)
        return dict(row) if row else None

    async def delete_exam(self, eid: str, user_id: str) -> bool:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            result = await conn.execute("DELETE FROM summa_ai.exams WHERE id = $1 AND user_id = $2", eid, user_id)
        return "DELETE 1" in result

    # ========== QUIZ RESULTS ==========

    async def create_quiz_result(
        self, user_id: str, data: Dict[str, Any]
    ) -> Dict[str, Any]:
        pool = await self._get_pool()
        rid = str(uuid.uuid4())
        async with pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO summa_ai.quiz_results
                   (id, user_id, artifact_id, topic, score, answers)
                   VALUES ($1, $2, $3, $4, $5, $6)""",
                rid,
                user_id,
                data.get("artifact_id"),
                data.get("topic"),
                data.get("score"),
                json.dumps(data.get("answers")) if data.get("answers") else None,
            )
            row = await conn.fetchrow(
                "SELECT * FROM summa_ai.quiz_results WHERE id = $1", rid
            )
        result = dict(row)
        await self.create_timeline_event(
            user_id,
            "quiz",
            f"Quiz: {data.get('topic', 'Untitled')}",
            f"Scored {data.get('score')}%",
            {"quiz_result_id": rid, "artifact_id": data.get("artifact_id")},
        )
        return result

    async def list_quiz_results(
        self, user_id: str, topic: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        pool = await self._get_pool()
        clauses = ["user_id = $1"]
        vals: List[Any] = [user_id]
        if topic:
            clauses.append(f"topic = ${len(vals) + 1}")
            vals.append(topic)
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                f"SELECT * FROM summa_ai.quiz_results WHERE {' AND '.join(clauses)} "
                "ORDER BY created_at DESC",
                *vals,
            )
        return [dict(r) for r in rows]
