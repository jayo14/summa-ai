"""Interaction models — the interaction -> memory -> next-response feedback
loop (Phase 4). Each endpoint here records a real learning interaction and
feeds it into CogneeService so the *next* turn's orchestrator prompt can
react to it (see app.routes.chat.detect_knowledge_gaps)."""

from typing import Dict, Optional

from pydantic import BaseModel, Field


class QuizResultCreate(BaseModel):
    artifact_id: Optional[str] = None
    topic: str
    score: float = Field(ge=0, le=100)
    # question id -> selected option index
    answers: Dict[str, int] = Field(default_factory=dict)
