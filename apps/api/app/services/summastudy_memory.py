"""Hybrid memory client — supplements Cognee with SummaStudy-style atomic facts.

Cognee is the primary memory backbone. This service adds typed atomic facts
(preference, goal, struggle, fact, habit) stored in the shared user_memories
table (same schema as SummaStudy's memory_service) for cross-product memory sharing.

Both Summa AI and SummaStudy read/write the same user_memories table, so facts
extracted by either product are available to the other.
"""

import json
import logging
import re
from datetime import datetime
from typing import Any, Dict, List, Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

MEMORY_EXTRACTION_PROMPT = """Analyze the following user message for any persistent "atomic facts" that should be remembered to improve their academic experience.
Persistent facts include:
- Learning preferences (e.g., "I like short summaries", "I prefer visual examples").
- Academic goals (e.g., "I want to pass CSC 201 with an A").
- Recurring struggles (e.g., "I always forget the definition of polymorphism").
- Habits (e.g., "I study best at 9 PM").

Return a JSON array of objects: [{"content": "fact", "type": "preference|goal|struggle|fact|habit"}]
If nothing important is found, return an empty array [].

Respond ONLY with valid JSON.

USER MESSAGE:
{message}"""

GREETING_DENYLIST = {
    "hi",
    "hello",
    "thanks",
    "thank you",
    "ok",
    "okay",
    "yes",
    "no",
    "sure",
    "hey",
    "good morning",
    "good afternoon",
    "good evening",
}


class SummaStudyMemoryClient:
    _instance: Optional["SummaStudyMemoryClient"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._pool = None
        return cls._instance

    async def _get_conn(self):
        if self._pool is None:
            import asyncpg

            self._pool = await asyncpg.create_pool(
                settings.DATABASE_URL,
                min_size=1,
                max_size=5,
            )
        return await self._pool.acquire()

    async def _release_conn(self, conn):
        if self._pool:
            await self._pool.release(conn)

    async def close(self):
        if self._pool:
            await self._pool.close()
            self._pool = None

    @staticmethod
    def _is_noise(message: str) -> bool:
        clean = re.sub(r"[^\w\s]", "", message.lower()).strip()
        if len(message.strip()) < 40:
            return True
        if clean in GREETING_DENYLIST:
            return True
        return False

    async def _call_llm(self, prompt: str) -> str:
        """Call Z.ai (non-streaming) for fact extraction."""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    f"{settings.ZAI_API_BASE}/chat/completions",
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {settings.ZAI_API_KEY}",
                        "X-Z-AI-From": "Z",
                        "X-Token": settings.ZAI_TOKEN,
                        "X-User-Id": settings.ZAI_USER_ID,
                    },
                    json={
                        "model": settings.ZAI_MODEL,
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a memory extraction assistant. Extract atomic facts from student messages.",
                            },
                            {"role": "user", "content": prompt},
                        ],
                        "stream": False,
                        "temperature": 0.2,
                        "max_tokens": 500,
                    },
                )
                resp.raise_for_status()
                data = resp.json()
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            logger.warning("LLM call for memory extraction failed: %s", e)
            return "[]"

    @staticmethod
    def _parse_facts(text: str) -> List[Dict[str, str]]:
        text = text.strip()
        if text.startswith("```json"):
            text = text.replace("```json", "").replace("```", "").strip()
        elif text.startswith("```"):
            text = text.replace("```", "").strip()
        try:
            facts = json.loads(text)
        except json.JSONDecodeError:
            return []
        if not isinstance(facts, list):
            return []
        return [
            {"content": f["content"], "type": f.get("type", "fact")}
            for f in facts
            if isinstance(f, dict) and f.get("content")
        ]

    @staticmethod
    def _summarize_facts(facts: List[Dict[str, str]]) -> Dict[str, Any]:
        by_type: Dict[str, int] = {}
        for f in facts:
            t = f.get("type", "fact")
            by_type[t] = by_type.get(t, 0) + 1
        return {"total": len(facts), "by_type": by_type}

    async def extract_and_store_memories(
        self, user_id: str, message: str
    ) -> List[Dict[str, str]]:
        """Extract atomic facts from a message and store them in user_memories."""
        if self._is_noise(message):
            return []

        response = await self._call_llm(
            MEMORY_EXTRACTION_PROMPT.format(message=message)
        )

        facts = self._parse_facts(response)
        if not facts:
            return []

        conn = await self._get_conn()
        try:
            stored = []
            for fact in facts:
                content = fact.get("content")
                m_type = fact.get("type", "fact")
                if not content:
                    continue
                await conn.execute(
                    """
                    INSERT INTO user_memories (user_id, memory_type, content)
                    VALUES ($1, $2, $3)
                    ON CONFLICT DO NOTHING
                    """,
                    user_id,
                    m_type,
                    content,
                )
                stored.append({"content": content, "type": m_type})
            if stored:
                logger.info("Stored %d atomic facts for user %s", len(stored), user_id)
            return stored
        except Exception as e:
            logger.error("Failed to store memories: %s", e)
            return []
        finally:
            await self._release_conn(conn)

    async def retrieve_relevant_memories(
        self, user_id: str, limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Retrieve the most recent atomic facts for a user."""
        conn = await self._get_conn()
        try:
            rows = await conn.fetch(
                """
                SELECT content, memory_type, created_at
                FROM user_memories
                WHERE user_id = $1
                ORDER BY created_at DESC
                LIMIT $2
                """,
                user_id,
                limit,
            )
            return [
                {
                    "content": row["content"],
                    "type": row["memory_type"],
                    "created_at": (
                        row["created_at"].isoformat() if row["created_at"] else None
                    ),
                }
                for row in rows
            ]
        except Exception as e:
            logger.error("Failed to retrieve memories: %s", e)
            return []
        finally:
            await self._release_conn(conn)

    async def get_memories_by_type(
        self, user_id: str, memory_type: str, limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Retrieve atomic facts filtered by type."""
        conn = await self._get_conn()
        try:
            rows = await conn.fetch(
                """
                SELECT content, memory_type, created_at
                FROM user_memories
                WHERE user_id = $1 AND memory_type = $2
                ORDER BY created_at DESC
                LIMIT $3
                """,
                user_id,
                memory_type,
                limit,
            )
            return [
                {
                    "content": row["content"],
                    "type": row["memory_type"],
                    "created_at": (
                        row["created_at"].isoformat() if row["created_at"] else None
                    ),
                }
                for row in rows
            ]
        except Exception as e:
            logger.error("Failed to retrieve memories by type: %s", e)
            return []
        finally:
            await self._release_conn(conn)

    async def get_memory_summary(self, user_id: str) -> Dict[str, Any]:
        """Get a summary of all atomic facts grouped by type."""
        conn = await self._get_conn()
        try:
            rows = await conn.fetch(
                """
                SELECT memory_type, COUNT(*) as count
                FROM user_memories
                WHERE user_id = $1
                GROUP BY memory_type
                ORDER BY count DESC
                """,
                user_id,
            )
            total = sum(row["count"] for row in rows)
            return {
                "total": total,
                "by_type": {row["memory_type"]: row["count"] for row in rows},
            }
        except Exception as e:
            logger.error("Failed to get memory summary: %s", e)
            return {"total": 0, "by_type": {}}
        finally:
            await self._release_conn(conn)


summastudy_memory = SummaStudyMemoryClient()
