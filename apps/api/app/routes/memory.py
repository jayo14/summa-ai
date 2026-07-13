"""Memory route — full Cognee remember/recall/improve/forget/session endpoints."""
from fastapi import APIRouter, Query
from typing import Optional
from app.models.memory import (RememberTextRequest, RememberExamRequest, RememberArtifactRequest, RememberProgressRequest, RememberConversationRequest, RecallRequest, RecallGraphRequest, FeedbackRequest, ForgetRequest, CreateSessionRequest, SessionContextRequest)
from app.core.security import resolve_user_id
from app.services.cognee_service import CogneeService

router = APIRouter()
cognee = CogneeService()

@router.post("/memory/remember/text", summary="Remember text", description="Store arbitrary text in the user's memory dataset")
async def remember_text(request: RememberTextRequest, user_id: str = Query(default="demo")):
    user_id = resolve_user_id()
    return await cognee.remember_text(request.text, user_id, request.metadata, request.dataset_name)

@router.post("/memory/remember/conversation", summary="Remember conversation", description="Store a Q&A exchange in the user's conversation memory")
async def remember_conversation(request: RememberConversationRequest, user_id: str = Query(default="demo")):
    user_id = resolve_user_id()
    return await cognee.remember_conversation(user_id, request.query, request.response, request.artifacts, request.session_id)

@router.post("/memory/remember/exam", summary="Remember exam", description="Store exam metadata in the user's exam memory")
async def remember_exam(request: RememberExamRequest, user_id: str = Query(default="demo")):
    user_id = resolve_user_id()
    return await cognee.remember_exam(user_id, request.model_dump())

@router.post("/memory/remember/artifact", summary="Remember artifact", description="Store an artifact reference in the user's artifact memory")
async def remember_artifact(request: RememberArtifactRequest, user_id: str = Query(default="demo")):
    user_id = resolve_user_id()
    return await cognee.remember_artifact(user_id, request.type, request.model_dump())

@router.post("/memory/remember/progress", summary="Remember progress", description="Record learning progress for a topic and trigger memory improvement")
async def remember_progress(request: RememberProgressRequest, user_id: str = Query(default="demo")):
    user_id = resolve_user_id()
    return await cognee.remember_learning_progress(user_id, request.topic, request.score, request.activity_type, request.details)

@router.post("/memory/recall", summary="Recall context", description="Recall relevant memories from the user's dataset based on a query")
async def recall_context(request: RecallRequest, user_id: str = Query(default="demo")):
    user_id = resolve_user_id()
    return await cognee.recall_context(user_id, request.query, request.dataset_name, request.limit, request.include_session, request.session_id)

@router.post("/memory/recall/graph", summary="Recall graph", description="Recall knowledge graph completions from the user's dataset")
async def recall_graph(request: RecallGraphRequest, user_id: str = Query(default="demo")):
    user_id = resolve_user_id()
    return await cognee.recall_knowledge_graph(user_id, request.query, request.dataset_name, request.limit)

@router.get("/memory/exams", summary="Get exams", description="Retrieve upcoming exam events from the user's memory")
async def get_exams(upcoming_only: bool = True, user_id: str = Query(default="demo")):
    user_id = resolve_user_id()
    return await cognee.recall_exams(user_id, upcoming_only)

@router.get("/memory/artifacts", summary="Get artifacts", description="Retrieve artifact memories from the user's dataset, optionally filtered by type")
async def get_artifacts(type: Optional[str] = None, limit: int = 20, user_id: str = Query(default="demo")):
    user_id = resolve_user_id()
    return await cognee.recall_artifacts(user_id, type, limit)

@router.get("/memory/progress", summary="Get progress", description="Retrieve learning progress records from the user's memory, optionally filtered by topic")
async def get_progress(topic: Optional[str] = None, limit: int = 20, user_id: str = Query(default="demo")):
    user_id = resolve_user_id()
    return await cognee.recall_learning_progress(user_id, topic, limit)

@router.get("/memory/hexagon", summary="Get hexagon dimensions", description="Get the user's hexagon proficiency dimensions based on learning progress")
async def get_hexagon(user_id: str = Query(default="demo")):
    user_id = resolve_user_id()
    return await cognee.get_hexagon_dimensions(user_id)

@router.post("/memory/improve", summary="Improve memory", description="Trigger memory improvement/consolidation for a user's dataset")
async def improve_memory(dataset_name: str = "main", user_id: str = Query(default="demo")):
    user_id = resolve_user_id()
    return await cognee.improve_memory(user_id, dataset_name)

@router.post("/memory/feedback", summary="Add feedback", description="Submit feedback for a session to improve memory and responses")
async def add_feedback(request: FeedbackRequest, user_id: str = Query(default="demo")):
    user_id = resolve_user_id()
    return await cognee.improve_with_feedback(user_id, request.session_id, request.score, request.text)

@router.post("/memory/forget", summary="Forget memory", description="Forget topic, memory, or entire dataset for a user")
async def forget_memory(request: ForgetRequest, user_id: str = Query(default="demo")):
    user_id = resolve_user_id()
    if request.topic: return await cognee.forget_topic(user_id, request.topic, request.dataset_name)
    elif request.memory_only: return await cognee.forget_memory_only(user_id, request.dataset_name)
    else: return await cognee.forget_dataset(user_id, request.dataset_name)

@router.post("/memory/session/create", summary="Create session", description="Create a new learning session with initial context")
async def create_session(request: CreateSessionRequest, user_id: str = Query(default="demo")):
    user_id = resolve_user_id()
    return await cognee.create_session(user_id, request.session_id, request.initial_context)

@router.post("/memory/session/context", summary="Get session context", description="Retrieve context for an existing learning session")
async def get_session_context(request: SessionContextRequest, user_id: str = Query(default="demo")):
    user_id = resolve_user_id()
    return await cognee.get_session_context(user_id, request.session_id, request.query)

@router.post("/memory/consolidate", summary="Consolidate all", description="Trigger improvement across all datasets for the current user to strengthen cross-session context")
async def consolidate_all(user_id: str = Query(default="demo")):
    user_id = resolve_user_id()
    results = {}
    for ds in ["main", "conversations", "exams", "artifacts", "progress", "sessions"]:
        try:
            r = await cognee.improve_memory(user_id, ds)
            results[ds] = r.get("status", "skipped")
        except Exception as exc:
            results[ds] = f"error: {exc}"
    return {"status": "success", "datasets": results}

@router.get("/memory/context", summary="Get full context", description="Aggregate all memory — progress, exams, artifacts, conversations — for a user into a single rich context object")
async def get_full_context(query: str = "", limit: int = 5, user_id: str = Query(default="demo")):
    user_id = resolve_user_id()
    q = query or "latest activity"
    context = {
        "memories": (await cognee.recall_context(user_id, q, limit=limit)).get("results", []),
        "exams": (await cognee.recall_exams(user_id)).get("exams", []),
        "progress": (await cognee.recall_learning_progress(user_id)).get("progress", []),
        "artifacts": (await cognee.recall_artifacts(user_id, limit=limit)).get("artifacts", []),
    }
    return {"status": "success", "user_id": user_id, "context": context}

@router.get("/memory/{user_id}", summary="List memories", description="List all memories for a specific user dataset")
async def list_memories(user_id: str):
    user_id = resolve_user_id()
    dataset = cognee.get_user_dataset(user_id)
    memories = await cognee.list_memories(dataset)
    return {"memories": memories, "count": len(memories)}
