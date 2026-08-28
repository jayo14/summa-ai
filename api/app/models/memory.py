"""Memory models."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class RememberTextRequest(BaseModel):
    text: str
    metadata: Optional[Dict[str, Any]] = None
    dataset_name: str = "main"


class RememberExamRequest(BaseModel):
    course_name: str
    exam_type: str
    date: str
    weight: float = 0
    topics: Optional[List[str]] = None


class RememberArtifactRequest(BaseModel):
    type: str
    title: str
    content: Dict[str, Any]
    tags: Optional[List[str]] = None
    origin: Optional[Dict[str, Any]] = None


class RememberProgressRequest(BaseModel):
    topic: str
    score: float
    activity_type: str
    details: Optional[Dict[str, Any]] = None


class RememberConversationRequest(BaseModel):
    query: str
    response: str
    session_id: Optional[str] = None
    artifacts: Optional[List[Dict[str, Any]]] = None


class RecallRequest(BaseModel):
    query: str
    dataset_name: str = "main"
    limit: int = 10
    include_session: bool = True
    session_id: Optional[str] = None


class RecallGraphRequest(BaseModel):
    query: str
    dataset_name: str = "main"
    limit: int = 15


class FeedbackRequest(BaseModel):
    session_id: str
    score: int
    text: Optional[str] = None


class ForgetRequest(BaseModel):
    dataset_name: str = "main"
    topic: Optional[str] = None
    memory_only: bool = False


class CreateSessionRequest(BaseModel):
    session_id: str
    initial_context: Optional[Dict[str, Any]] = None


class SessionContextRequest(BaseModel):
    session_id: str
    query: str
