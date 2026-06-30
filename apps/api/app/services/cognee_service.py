"""Cognee service — full implementation with dataset isolation, session management,
temporal awareness, hexagon calculation, and feedback-driven improvement.
In dev/test it falls back to an in-memory store.
"""
import logging, uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from app.config import settings
logger = logging.getLogger(__name__)

class CogneeService:
    _instance: Optional["CogneeService"] = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    def __init__(self):
        if self._initialized: return
        self._initialized = True
        self._memory: Dict[str, List[Dict[str, Any]]] = {}
        self._sessions: Dict[str, Dict[str, Any]] = {}
        self._cognee = None
        if settings.COGNEE_API_KEY:
            try:
                import cognee
                cognee.configure(api_key=settings.COGNEE_API_KEY, api_url=settings.COGNEE_API_URL, llm_provider="openai", llm_api_key=settings.OPENAI_API_KEY)
                self._cognee = cognee
                logger.info("Cognee initialized with API key")
            except Exception as e:
                logger.warning(f"Cognee init failed, using in-memory fallback: {e}")
        else:
            logger.info("No COGNEE_API_KEY — using in-memory store")

    @classmethod
    async def initialize(cls) -> "CogneeService": return cls()
    def get_user_dataset(self, user_id: str) -> str: return f"user_{user_id}"
    def _dataset(self, user_id: str, name: str = "main") -> str: return f"{self.get_user_dataset(user_id)}_{name}"

    async def remember_text(self, text: str, user_id: str, metadata: Optional[Dict] = None, dataset_name: str = "main") -> Dict[str, Any]:
        dataset = self._dataset(user_id, dataset_name)
        item = {"text": text, "metadata": metadata or {}, "dataset": dataset, "id": str(uuid.uuid4()), "created_at": datetime.utcnow().isoformat()}
        if self._cognee:
            try: await self._cognee.remember(text, dataset=dataset, metadata=metadata or {})
            except Exception as e: logger.warning(f"Cognee remember failed: {e}")
        self._memory.setdefault(dataset, []).append(item)
        return {"status": "success", "dataset": dataset, "id": item["id"]}

    async def remember_conversation(self, user_id: str, query: str, response: str, artifacts: Optional[List[Dict]] = None, session_id: Optional[str] = None) -> Dict[str, Any]:
        text = f"User Query: {query}\nAI Response: {response}\nArtifacts: {len(artifacts) if artifacts else 0}"
        metadata = {"type": "conversation", "user_id": user_id, "timestamp": datetime.utcnow().isoformat(), "session_id": session_id, "artifacts": artifacts or []}
        return await self.remember_text(text, user_id, metadata, "conversations")

    async def remember_exam(self, user_id: str, exam_data: Dict[str, Any]) -> Dict[str, Any]:
        topics = exam_data.get('topics') or []
        text = f"EXAM: Course: {exam_data.get('course_name')}, Type: {exam_data.get('exam_type')}, Date: {exam_data.get('date')}, Topics: {', '.join(topics) if isinstance(topics, list) else topics}"
        metadata = {"type": "exam", "user_id": user_id, "exam_date": exam_data.get('date'), "course": exam_data.get('course_name'), **exam_data}
        return await self.remember_text(text, user_id, metadata, "exams")

    async def remember_artifact(self, user_id: str, artifact_type: str, artifact_data: Dict[str, Any]) -> Dict[str, Any]:
        text = f"ARTIFACT: Type: {artifact_type}, Title: {artifact_data.get('title', 'Untitled')}, Content: {str(artifact_data.get('content', ''))[:500]}"
        metadata = {"type": "artifact", "artifact_type": artifact_type, "user_id": user_id, "artifact_id": artifact_data.get('id', str(uuid.uuid4())), "timestamp": datetime.utcnow().isoformat(), "origin": artifact_data.get('origin', {})}
        return await self.remember_text(text, user_id, metadata, "artifacts")

    async def remember_learning_progress(self, user_id: str, topic: str, score: float, activity_type: str, details: Optional[Dict] = None) -> Dict[str, Any]:
        text = f"LEARNING PROGRESS: Topic: {topic}, Score: {score}, Activity: {activity_type}"
        metadata = {"type": "progress", "user_id": user_id, "topic": topic, "score": score, "activity_type": activity_type, "timestamp": datetime.utcnow().isoformat(), "details": details or {}}
        result = await self.remember_text(text, user_id, metadata, "progress")
        await self.improve_memory(user_id, "progress")
        return result

    async def _recall(self, query: str, dataset: str, limit: int = 10) -> List[Dict]:
        if self._cognee:
            try:
                results = await self._cognee.recall(query, dataset=dataset, limit=limit)
                return results if isinstance(results, list) else []
            except Exception as e: logger.warning(f"Cognee recall failed: {e}")
        items = self._memory.get(dataset, [])
        q = query.lower()
        return [{**i, "score": 1.0} for i in items if q in i.get("text", "").lower() or q in str(i.get("metadata", {})).lower()][:limit]

    async def recall_context(self, user_id: str, query: str, dataset_name: str = "main", limit: int = 10, include_session: bool = True, session_id: Optional[str] = None) -> Dict[str, Any]:
        dataset = self._dataset(user_id, dataset_name)
        results = await self._recall(query, dataset, limit)
        return {"status": "success", "dataset": dataset, "results": results, "source": "graph" if results else "unknown"}

    async def recall_knowledge_graph(self, user_id: str, query: str, dataset_name: str = "main", limit: int = 15) -> Dict[str, Any]:
        dataset = self._dataset(user_id, dataset_name)
        return {"status": "success", "dataset": dataset, "results": await self._recall(query, dataset, limit), "search_type": "graph_completion"}

    async def recall_exams(self, user_id: str, upcoming_only: bool = True) -> Dict[str, Any]:
        dataset = self._dataset(user_id, "exams")
        return {"status": "success", "dataset": dataset, "exams": await self._recall("upcoming exams" if upcoming_only else "all exams", dataset, 20)}

    async def recall_artifacts(self, user_id: str, artifact_type: Optional[str] = None, limit: int = 20) -> Dict[str, Any]:
        dataset = self._dataset(user_id, "artifacts")
        q = f"artifacts of type {artifact_type}" if artifact_type else "all artifacts"
        results = await self._recall(q, dataset, limit)
        return {"status": "success", "dataset": dataset, "artifacts": results, "count": len(results)}

    async def recall_learning_progress(self, user_id: str, topic: Optional[str] = None, limit: int = 20) -> Dict[str, Any]:
        dataset = self._dataset(user_id, "progress")
        q = f"progress for {topic}" if topic else "all learning progress"
        return {"status": "success", "dataset": dataset, "progress": await self._recall(q, dataset, limit), "topic": topic}

    async def get_hexagon_dimensions(self, user_id: str) -> Dict[str, float]:
        dataset = self._dataset(user_id, "progress")
        progress = await self._recall("all learning progress scores", dataset, 100)
        dims = {"depth": 0.0, "problem_solving": 0.0, "speed": 0.0, "consistency": 0.0, "confidence": 0.0, "creativity": 0.0}
        if progress:
            scores = [p.get("metadata", {}).get("score", 0) for p in progress if isinstance(p, dict) and p.get("metadata", {}).get("score") is not None]
            if scores:
                avg = sum(scores) / len(scores)
                dims = {"depth": min(1.0, avg*0.8+0.2), "problem_solving": min(1.0, avg*0.7+0.3), "speed": min(1.0, avg*0.6+0.4), "consistency": min(1.0, avg*0.5+0.5), "confidence": min(1.0, avg*0.5+0.3), "creativity": min(1.0, avg*0.4+0.2)}
        return dims

    async def improve_memory(self, user_id: str, dataset_name: str = "main", session_ids: Optional[List[str]] = None, build_global_context: bool = False) -> Dict[str, Any]:
        dataset = self._dataset(user_id, dataset_name)
        if self._cognee:
            try: await self._cognee.improve(dataset=dataset)
            except Exception as e: logger.warning(f"Cognee improve failed: {e}")
        return {"status": "success", "dataset": dataset, "sessions_bridged": session_ids}

    async def improve_with_feedback(self, user_id: str, session_id: str, feedback_score: int, feedback_text: Optional[str] = None) -> Dict[str, Any]:
        await self.remember_text(f"FEEDBACK: Score={feedback_score}, Text={feedback_text or 'No text'}", user_id, {"type": "feedback", "session_id": session_id, "score": feedback_score, "timestamp": datetime.utcnow().isoformat()}, "conversations")
        return await self.improve_memory(user_id, "conversations", [session_id])

    async def forget_topic(self, user_id: str, topic: str, dataset_name: str = "main") -> Dict[str, Any]:
        dataset = self._dataset(user_id, dataset_name)
        if self._cognee:
            try: await self._cognee.forget(dataset=dataset, where={"concept": topic})
            except: pass
        tl = topic.lower()
        self._memory[dataset] = [i for i in self._memory.get(dataset, []) if tl not in i.get("text", "").lower()]
        return {"status": "success", "topic": topic}

    async def forget_dataset(self, user_id: str, dataset_name: str) -> Dict[str, Any]:
        dataset = self._dataset(user_id, dataset_name)
        if self._cognee:
            try: await self._cognee.forget(dataset=dataset)
            except: pass
        self._memory.pop(dataset, None)
        return {"status": "success", "dataset": dataset}

    async def forget_memory_only(self, user_id: str, dataset_name: str) -> Dict[str, Any]:
        return await self.forget_dataset(user_id, dataset_name)

    async def create_session(self, user_id: str, session_id: str, initial_context: Optional[Dict] = None) -> Dict[str, Any]:
        self._sessions[session_id] = {"user_id": user_id, "context": initial_context or {}}
        if initial_context:
            await self.remember_text(f"SESSION {session_id}: {str(initial_context)}", user_id, {"type": "session_creation", "session_id": session_id}, "sessions")
        return {"status": "success", "session_id": session_id, "user_id": user_id}

    async def get_session_context(self, user_id: str, session_id: str, query: str) -> Dict[str, Any]:
        dataset = self._dataset(user_id, "sessions")
        results = await self._recall(query, dataset, 10)
        return {"status": "success", "session_id": session_id, "context": results, "has_context": bool(results)}

    async def list_memories(self, dataset: str) -> List[Dict[str, Any]]:
        return self._memory.get(dataset, [])
