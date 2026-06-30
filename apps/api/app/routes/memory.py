"""Memory route — full Cognee remember/recall/improve/forget/session endpoints."""
from fastapi import APIRouter, Query
from typing import Optional
from ..models.memory import (RememberTextRequest, RememberExamRequest, RememberArtifactRequest, RememberProgressRequest, RememberConversationRequest, RecallRequest, RecallGraphRequest, FeedbackRequest, ForgetRequest, CreateSessionRequest, SessionContextRequest)
from ..services.cognee_service import CogneeService

router = APIRouter()
cognee = CogneeService()

@router.post("/memory/remember/text")
async def remember_text(request: RememberTextRequest, user_id: str = Query(default="demo")):
    return await cognee.remember_text(request.text, user_id, request.metadata, request.dataset_name)

@router.post("/memory/remember/conversation")
async def remember_conversation(request: RememberConversationRequest, user_id: str = Query(default="demo")):
    return await cognee.remember_conversation(user_id, request.query, request.response, request.artifacts, request.session_id)

@router.post("/memory/remember/exam")
async def remember_exam(request: RememberExamRequest, user_id: str = Query(default="demo")):
    return await cognee.remember_exam(user_id, request.model_dump())

@router.post("/memory/remember/artifact")
async def remember_artifact(request: RememberArtifactRequest, user_id: str = Query(default="demo")):
    return await cognee.remember_artifact(user_id, request.type, request.model_dump())

@router.post("/memory/remember/progress")
async def remember_progress(request: RememberProgressRequest, user_id: str = Query(default="demo")):
    return await cognee.remember_learning_progress(user_id, request.topic, request.score, request.activity_type, request.details)

@router.post("/memory/recall")
async def recall_context(request: RecallRequest, user_id: str = Query(default="demo")):
    return await cognee.recall_context(user_id, request.query, request.dataset_name, request.limit, request.include_session, request.session_id)

@router.post("/memory/recall/graph")
async def recall_graph(request: RecallGraphRequest, user_id: str = Query(default="demo")):
    return await cognee.recall_knowledge_graph(user_id, request.query, request.dataset_name, request.limit)

@router.get("/memory/exams")
async def get_exams(upcoming_only: bool = True, user_id: str = Query(default="demo")):
    return await cognee.recall_exams(user_id, upcoming_only)

@router.get("/memory/artifacts")
async def get_artifacts(type: Optional[str] = None, limit: int = 20, user_id: str = Query(default="demo")):
    return await cognee.recall_artifacts(user_id, type, limit)

@router.get("/memory/progress")
async def get_progress(topic: Optional[str] = None, limit: int = 20, user_id: str = Query(default="demo")):
    return await cognee.recall_learning_progress(user_id, topic, limit)

@router.get("/memory/hexagon")
async def get_hexagon(user_id: str = Query(default="demo")):
    return await cognee.get_hexagon_dimensions(user_id)

@router.post("/memory/improve")
async def improve_memory(dataset_name: str = "main", user_id: str = Query(default="demo")):
    return await cognee.improve_memory(user_id, dataset_name)

@router.post("/memory/feedback")
async def add_feedback(request: FeedbackRequest, user_id: str = Query(default="demo")):
    return await cognee.improve_with_feedback(user_id, request.session_id, request.score, request.text)

@router.post("/memory/forget")
async def forget_memory(request: ForgetRequest, user_id: str = Query(default="demo")):
    if request.topic: return await cognee.forget_topic(user_id, request.topic, request.dataset_name)
    elif request.memory_only: return await cognee.forget_memory_only(user_id, request.dataset_name)
    else: return await cognee.forget_dataset(user_id, request.dataset_name)

@router.post("/memory/session/create")
async def create_session(request: CreateSessionRequest, user_id: str = Query(default="demo")):
    return await cognee.create_session(user_id, request.session_id, request.initial_context)

@router.post("/memory/session/context")
async def get_session_context(request: SessionContextRequest, user_id: str = Query(default="demo")):
    return await cognee.get_session_context(user_id, request.session_id, request.query)

@router.get("/memory/{user_id}")
async def list_memories(user_id: str):
    dataset = cognee.get_user_dataset(user_id)
    memories = await cognee.list_memories(dataset)
    return {"memories": memories, "count": len(memories)}
