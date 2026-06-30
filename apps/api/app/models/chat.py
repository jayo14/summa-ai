"""Chat models."""
from datetime import datetime
from typing import Any, List, Optional
from pydantic import BaseModel

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    user_id: str
    messages: List[ChatMessage]
    enable_thinking: bool = True
    conversation_id: Optional[str] = None

class ArtifactRef(BaseModel):
    id: str; title: str; type: str

class ChatResponse(BaseModel):
    response: str
    artifacts: List[ArtifactRef] = []
    conversation_id: Optional[str] = None
    reasoning: Optional[str] = None

class Conversation(BaseModel):
    id: str; user_id: str; title: str = "New chat"; snippet: Optional[str] = None
    archived: bool = False; created_at: datetime; updated_at: datetime; message_count: int = 0

class ConversationCreate(BaseModel):
    title: str = "New chat"; snippet: Optional[str] = None

class Message(BaseModel):
    id: str; conversation_id: str; role: str; content: str
    reasoning: Optional[str] = None; components: Optional[Any] = None; created_at: datetime

class MessageCreate(BaseModel):
    role: str; content: str; reasoning: Optional[str] = None; components: Optional[Any] = None
