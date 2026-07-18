"""Cognee service — full implementation with dataset isolation, session management,
temporal awareness, hexagon calculation, and feedback-driven improvement.

Cognee v1.0 API mapping used here:
  remember  → cognee.remember(data, dataset_name=...)
  recall    → cognee.recall(query_text=..., datasets=[...], top_k=...)
  improve   → cognee.improve(dataset=...)
  forget    → cognee.forget(dataset=...) / cognee.forget(dataset=..., memory_only=True)

Configuration is driven entirely by environment variables read by Cognee on
import (LLM_API_KEY, LLM_PROVIDER, GRAPH_DATABASE_PROVIDER,
etc.).  We use cognee.config.set() for any runtime overrides we need.

Falls back to an in-memory store when COGNEE_API_KEY is absent AND no LLM key
is available, so local dev works without any external services.
"""

import asyncio
import logging
import os
import time
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from app.config import settings

logger = logging.getLogger(__name__)

_CACHE_TTL = 60


class _TTLCache:
    def __init__(self, ttl: int = _CACHE_TTL):
        self._ttl = ttl
        self._store: Dict[str, tuple[float, Any]] = {}

    def _key(self, *args, **kwargs) -> str:
        parts = [str(a) for a in args] + [f"{k}={v}" for k, v in sorted(kwargs.items())]
        return "|".join(parts)

    def get(self, *args, **kwargs) -> Optional[Any]:
        key = self._key(*args, **kwargs)
        entry = self._store.get(key)
        if entry is None:
            return None
        ts, value = entry
        if time.monotonic() - ts > self._ttl:
            del self._store[key]
            return None
        return value

    def set(self, value: Any, *args, **kwargs) -> None:
        key = self._key(*args, **kwargs)
        self._store[key] = (time.monotonic(), value)

    def clear(self) -> None:
        self._store.clear()


class CogneeService:
    _instance: Optional["CogneeService"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True

        # Local in-memory fallback store (always populated as a safety net)
        self._memory: Dict[str, List[Dict[str, Any]]] = {}
        self._sessions: Dict[str, Dict[str, Any]] = {}
        self._cognee = None
        self._recall_cache = _TTLCache()

        # Decide whether we can run a real Cognee pipeline.
        # We need at least an LLM key; a Cognee Cloud key is optional.
        has_llm_key = bool(settings.OPENAI_API_KEY or settings.LLM_API_KEY)

        if has_llm_key:
            try:
                import cognee  # noqa: PLC0415

                # ── Runtime config overrides ──────────────────────────────
                # Cognee reads env vars on import, so most config is already
                # applied.  We only override here if app/config.py holds
                # values that differ from env-level defaults.
                if settings.OPENAI_API_KEY:
                    cognee.config.set("llm_api_key", settings.OPENAI_API_KEY)
                    cognee.config.set("embedding_api_key", settings.OPENAI_API_KEY)
                elif settings.LLM_API_KEY:
                    cognee.config.set("llm_api_key", settings.LLM_API_KEY)
                    cognee.config.set(
                        "embedding_api_key",
                        settings.EMBEDDING_API_KEY or settings.LLM_API_KEY,
                    )

                if settings.OPENAI_MODEL or settings.LLM_MODEL:
                    # Cognee model format is "provider/model-name"
                    model = settings.OPENAI_MODEL or settings.LLM_MODEL
                    if not model.startswith("openai/"):
                        model = f"openai/{model}"
                    cognee.config.set("llm_model", model)

                qdrant_endpoint = (
                    settings.QDRANT_CLUSTER_ENDPOINT or settings.VECTOR_DB_URL
                )
                qdrant_api_key = settings.QDRANT_API_KEY or settings.VECTOR_DB_KEY
                qdrant_enabled = bool(
                    qdrant_endpoint
                    or qdrant_api_key
                    or settings.VECTOR_DB_PROVIDER.lower() == "qdrant"
                )

                # Register the Qdrant community vector adapter when Qdrant is configured.
                if qdrant_enabled:
                    if qdrant_endpoint:
                        os.environ["QDRANT_CLUSTER_ENDPOINT"] = qdrant_endpoint
                        os.environ.setdefault("VECTOR_DB_URL", qdrant_endpoint)
                    if qdrant_api_key:
                        os.environ["QDRANT_API_KEY"] = qdrant_api_key
                        os.environ.setdefault("VECTOR_DB_KEY", qdrant_api_key)
                    try:
                        from cognee_community_vector_adapter_qdrant import (
                            register,
                        )  # noqa: PLC0415

                        register()
                        logger.info("Qdrant vector adapter registered")
                    except ImportError:
                        logger.warning(
                            "cognee-community-vector-adapter-qdrant not installed; "
                            "falling back to default vector store"
                        )

                self._cognee = cognee
                logger.info("Cognee initialised (LLM key present)")

            except Exception as exc:
                logger.warning("Cognee init failed, using in-memory fallback: %s", exc)
        else:
            logger.info("No LLM API key found — using in-memory store")

    # ─────────────────────────────────────────────────────────────────────────
    # Helpers
    # ─────────────────────────────────────────────────────────────────────────

    @classmethod
    async def initialize(cls) -> "CogneeService":
        instance = cls()
        # Start background consolidation loop
        cls._start_consolidation_loop(instance)
        return instance

    _consolidation_task = None

    @classmethod
    def _start_consolidation_loop(cls, instance: "CogneeService") -> None:
        """Start a background task that periodically consolidates memory across all user datasets."""

        async def _loop():
            while True:
                await asyncio.sleep(900)  # Every 15 minutes
                try:
                    # Consolidate datasets that have accumulated new entries
                    for dataset_key in list(instance._memory.keys()):
                        # Only consolidate if dataset has enough entries
                        if len(instance._memory.get(dataset_key, [])) >= 5:
                            if instance._cognee:
                                try:
                                    await instance._cognee.improve(dataset=dataset_key)
                                    logger.info(
                                        "Background consolidation: %s improved",
                                        dataset_key,
                                    )
                                except Exception as exc:
                                    logger.debug(
                                        "Background consolidation skipped %s: %s",
                                        dataset_key,
                                        exc,
                                    )
                except Exception as exc:
                    logger.warning("Consolidation loop error: %s", exc)

        cls._consolidation_task = asyncio.ensure_future(_loop())

    def get_user_dataset(self, user_id: str) -> str:
        return f"user_{user_id}"

    def _dataset(self, user_id: str, name: str = "main") -> str:
        return f"{self.get_user_dataset(user_id)}_{name}"

    # ─────────────────────────────────────────────────────────────────────────
    # remember
    # ─────────────────────────────────────────────────────────────────────────

    async def remember_text(
        self,
        text: str,
        user_id: str,
        metadata: Optional[Dict] = None,
        dataset_name: str = "main",
    ) -> Dict[str, Any]:
        dataset = self._dataset(user_id, dataset_name)
        item = {
            "text": text,
            "metadata": metadata or {},
            "dataset": dataset,
            "id": str(uuid.uuid4()),
            "created_at": datetime.utcnow().isoformat(),
        }

        if self._cognee:
            try:
                # v1.0: cognee.remember(data, dataset_name=...)
                # Metadata is embedded in the text body; Cognee does not accept
                # a separate metadata kwarg on remember().
                payload = text
                if metadata:
                    meta_line = " | ".join(f"{k}: {v}" for k, v in metadata.items())
                    payload = f"{text}\n[meta] {meta_line}"

                await self._cognee.remember(payload, dataset_name=dataset)
            except Exception as exc:
                logger.warning("Cognee remember failed: %s", exc)

        self._memory.setdefault(dataset, []).append(item)
        return {"status": "success", "dataset": dataset, "id": item["id"]}

    async def remember_conversation(
        self,
        user_id: str,
        query: str,
        response: str,
        artifacts: Optional[List[Dict]] = None,
        session_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        text = (
            f"User Query: {query}\n"
            f"AI Response: {response}\n"
            f"Artifacts: {len(artifacts) if artifacts else 0}"
        )
        metadata = {
            "type": "conversation",
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat(),
            "session_id": session_id,
            "artifacts": artifacts or [],
        }
        return await self.remember_text(text, user_id, metadata, "conversations")

    async def remember_exam(
        self, user_id: str, exam_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        topics = exam_data.get("topics") or []
        text = (
            f"EXAM: Course: {exam_data.get('course_name')}, "
            f"Type: {exam_data.get('exam_type')}, "
            f"Date: {exam_data.get('date')}, "
            f"Topics: {', '.join(topics) if isinstance(topics, list) else topics}"
        )
        metadata = {
            "type": "exam",
            "user_id": user_id,
            "exam_date": exam_data.get("date"),
            "course": exam_data.get("course_name"),
            **exam_data,
        }
        return await self.remember_text(text, user_id, metadata, "exams")

    async def remember_artifact(
        self, user_id: str, artifact_type: str, artifact_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        text = (
            f"ARTIFACT: Type: {artifact_type}, "
            f"Title: {artifact_data.get('title', 'Untitled')}, "
            f"Content: {str(artifact_data.get('content', ''))[:500]}"
        )
        metadata = {
            "type": "artifact",
            "artifact_type": artifact_type,
            "user_id": user_id,
            "artifact_id": artifact_data.get("id", str(uuid.uuid4())),
            "timestamp": datetime.utcnow().isoformat(),
            "origin": artifact_data.get("origin", {}),
        }
        return await self.remember_text(text, user_id, metadata, "artifacts")

    async def remember_learning_progress(
        self,
        user_id: str,
        topic: str,
        score: float,
        activity_type: str,
        details: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        text = f"LEARNING PROGRESS: Topic: {topic}, Score: {score}, Activity: {activity_type}"
        metadata = {
            "type": "progress",
            "user_id": user_id,
            "topic": topic,
            "score": score,
            "activity_type": activity_type,
            "timestamp": datetime.utcnow().isoformat(),
            "details": details or {},
        }
        result = await self.remember_text(text, user_id, metadata, "progress")
        await self.improve_memory(user_id, "progress")
        return result

    # ─────────────────────────────────────────────────────────────────────────
    # recall
    # ─────────────────────────────────────────────────────────────────────────

    async def _recall(self, query: str, dataset: str, limit: int = 10) -> List[Dict]:
        cached = self._recall_cache.get(query, dataset, limit)
        if cached is not None:
            return cached

        result: List[Dict] = []
        if self._cognee:
            try:
                # v1.0: cognee.recall(query_text=..., datasets=[...], top_k=...)
                raw = await self._cognee.recall(
                    query_text=query,
                    datasets=[dataset],
                    top_k=limit,
                )
                if isinstance(raw, list):
                    for r in raw:
                        if isinstance(r, dict):
                            result.append(r)
                        else:
                            # ResponseGraphEntry / ResponseQAEntry objects
                            result.append(
                                {
                                    "text": getattr(r, "text", str(r)),
                                    "source": getattr(r, "source", "graph"),
                                    "score": getattr(r, "score", 1.0),
                                }
                            )
            except Exception as exc:
                logger.warning("Cognee recall failed: %s", exc)

        if not result:
            # In-memory fallback
            items = self._memory.get(dataset, [])
            q = query.lower()
            result = [
                {**i, "score": 1.0}
                for i in items
                if q in i.get("text", "").lower()
                or q in str(i.get("metadata", {})).lower()
            ][:limit]

        self._recall_cache.set(result, query, dataset, limit)
        return result

    async def recall_context(
        self,
        user_id: str,
        query: str,
        dataset_name: str = "main",
        limit: int = 10,
        include_session: bool = True,
        session_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        dataset = self._dataset(user_id, dataset_name)
        results = await self._recall(query, dataset, limit)
        return {
            "status": "success",
            "dataset": dataset,
            "results": results,
            "source": "graph" if results else "unknown",
        }

    async def recall_knowledge_graph(
        self, user_id: str, query: str, dataset_name: str = "main", limit: int = 15
    ) -> Dict[str, Any]:
        dataset = self._dataset(user_id, dataset_name)
        return {
            "status": "success",
            "dataset": dataset,
            "results": await self._recall(query, dataset, limit),
            "search_type": "graph_completion",
        }

    async def recall_exams(
        self, user_id: str, upcoming_only: bool = True
    ) -> Dict[str, Any]:
        dataset = self._dataset(user_id, "exams")
        q = "upcoming exams" if upcoming_only else "all exams"
        return {
            "status": "success",
            "dataset": dataset,
            "exams": await self._recall(q, dataset, 20),
        }

    async def recall_artifacts(
        self,
        user_id: str,
        artifact_type: Optional[str] = None,
        limit: int = 20,
    ) -> Dict[str, Any]:
        dataset = self._dataset(user_id, "artifacts")
        q = f"artifacts of type {artifact_type}" if artifact_type else "all artifacts"
        results = await self._recall(q, dataset, limit)
        return {
            "status": "success",
            "dataset": dataset,
            "artifacts": results,
            "count": len(results),
        }

    async def recall_learning_progress(
        self,
        user_id: str,
        topic: Optional[str] = None,
        limit: int = 20,
    ) -> Dict[str, Any]:
        dataset = self._dataset(user_id, "progress")
        q = f"progress for {topic}" if topic else "all learning progress"
        return {
            "status": "success",
            "dataset": dataset,
            "progress": await self._recall(q, dataset, limit),
            "topic": topic,
        }

    async def get_hexagon_dimensions(self, user_id: str) -> Dict[str, float]:
        dataset = self._dataset(user_id, "progress")
        progress = await self._recall("all learning progress scores", dataset, 100)
        dims = {
            "depth": 0.0,
            "problem_solving": 0.0,
            "speed": 0.0,
            "consistency": 0.0,
            "confidence": 0.0,
            "creativity": 0.0,
        }
        if progress:
            scores = [
                p.get("metadata", {}).get("score", 0)
                for p in progress
                if isinstance(p, dict)
                and p.get("metadata", {}).get("score") is not None
            ]
            if scores:
                avg = sum(scores) / len(scores)
                dims = {
                    "depth": min(1.0, avg * 0.8 + 0.2),
                    "problem_solving": min(1.0, avg * 0.7 + 0.3),
                    "speed": min(1.0, avg * 0.6 + 0.4),
                    "consistency": min(1.0, avg * 0.5 + 0.5),
                    "confidence": min(1.0, avg * 0.5 + 0.3),
                    "creativity": min(1.0, avg * 0.4 + 0.2),
                }
        return dims

    # ─────────────────────────────────────────────────────────────────────────
    # improve
    # ─────────────────────────────────────────────────────────────────────────

    async def improve_memory(
        self,
        user_id: str,
        dataset_name: str = "main",
        session_ids: Optional[List[str]] = None,
        build_global_context: bool = False,
    ) -> Dict[str, Any]:
        dataset = self._dataset(user_id, dataset_name)
        if self._cognee:
            try:
                # v1.0: cognee.improve(dataset=...)
                await self._cognee.improve(dataset=dataset)
            except Exception as exc:
                logger.warning("Cognee improve failed: %s", exc)
        return {
            "status": "success",
            "dataset": dataset,
            "sessions_bridged": session_ids,
        }

    async def improve_with_feedback(
        self,
        user_id: str,
        session_id: str,
        feedback_score: int,
        feedback_text: Optional[str] = None,
    ) -> Dict[str, Any]:
        await self.remember_text(
            f"FEEDBACK: Score={feedback_score}, Text={feedback_text or 'No text'}",
            user_id,
            {
                "type": "feedback",
                "session_id": session_id,
                "score": feedback_score,
                "timestamp": datetime.utcnow().isoformat(),
            },
            "conversations",
        )
        return await self.improve_memory(user_id, "conversations", [session_id])

    # ─────────────────────────────────────────────────────────────────────────
    # forget
    # ─────────────────────────────────────────────────────────────────────────

    async def forget_topic(
        self, user_id: str, topic: str, dataset_name: str = "main"
    ) -> Dict[str, Any]:
        """Remove memory for a specific topic.

        Cognee v1.0 forget() has no `where=` filter.  We use memory_only=True
        to wipe the graph/vector layer for the whole dataset and then
        re-remember only the entries that are NOT about this topic, which
        effectively prunes that concept from the permanent graph.
        """
        dataset = self._dataset(user_id, dataset_name)
        tl = topic.lower()

        # Prune the in-memory fallback store first
        self._memory[dataset] = [
            i
            for i in self._memory.get(dataset, [])
            if tl not in i.get("text", "").lower()
        ]

        if self._cognee:
            try:
                # Clear the graph/vector memory for this dataset, then
                # re-remember everything that remains (excluding the topic).
                await self._cognee.forget(dataset=dataset, memory_only=True)

                surviving = self._memory.get(dataset, [])
                for item in surviving:
                    await self._cognee.remember(item["text"], dataset_name=dataset)

            except Exception as exc:
                logger.warning("Cognee forget_topic failed: %s", exc)

        return {"status": "success", "topic": topic, "dataset": dataset}

    async def forget_dataset(self, user_id: str, dataset_name: str) -> Dict[str, Any]:
        dataset = self._dataset(user_id, dataset_name)
        if self._cognee:
            try:
                # v1.0: cognee.forget(dataset=...)
                await self._cognee.forget(dataset=dataset)
            except Exception as exc:
                logger.warning("Cognee forget_dataset failed: %s", exc)
        self._memory.pop(dataset, None)
        return {"status": "success", "dataset": dataset}

    async def forget_memory_only(
        self, user_id: str, dataset_name: str
    ) -> Dict[str, Any]:
        """Wipe graph/vector memory but keep raw records (allows re-cognify)."""
        dataset = self._dataset(user_id, dataset_name)
        if self._cognee:
            try:
                # v1.0: cognee.forget(dataset=..., memory_only=True)
                await self._cognee.forget(dataset=dataset, memory_only=True)
            except Exception as exc:
                logger.warning("Cognee forget_memory_only failed: %s", exc)
        self._memory.pop(dataset, None)
        return {"status": "success", "dataset": dataset}

    # ─────────────────────────────────────────────────────────────────────────
    # Session management
    # ─────────────────────────────────────────────────────────────────────────

    async def create_session(
        self,
        user_id: str,
        session_id: str,
        initial_context: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        self._sessions[session_id] = {
            "user_id": user_id,
            "context": initial_context or {},
        }
        if initial_context:
            await self.remember_text(
                f"SESSION {session_id}: {str(initial_context)}",
                user_id,
                {"type": "session_creation", "session_id": session_id},
                "sessions",
            )
        return {"status": "success", "session_id": session_id, "user_id": user_id}

    async def get_session_context(
        self, user_id: str, session_id: str, query: str
    ) -> Dict[str, Any]:
        dataset = self._dataset(user_id, "sessions")
        results = await self._recall(query, dataset, 10)
        return {
            "status": "success",
            "session_id": session_id,
            "context": results,
            "has_context": bool(results),
        }

    async def list_memories(self, dataset: str) -> List[Dict[str, Any]]:
        return self._memory.get(dataset, [])
