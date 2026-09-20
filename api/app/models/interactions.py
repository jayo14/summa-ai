"""Interaction models — the interaction -> memory -> next-response feedback
loop (Phase 4). Each endpoint here records a real learning interaction and
feeds it into CogneeService so the *next* turn's orchestrator prompt can
react to it (see app.routes.chat.detect_knowledge_gaps)."""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class QuizResultCreate(BaseModel):
    artifact_id: Optional[str] = None
    topic: str
    score: float = Field(ge=0, le=100)
    # question id -> selected option index (quiz) or rating string (flashcards)
    answers: Dict[str, Any] = Field(default_factory=dict)


class ActivityAttemptCreate(BaseModel):
    activity_id: str
    activity_type: str
    concept_ids: List[str] = Field(default_factory=list)
    step_index: Optional[int] = None
    interaction_type: str = Field(
        description="select_option, flip_card, rate_confidence, submit_text, reorder"
    )
    payload: Dict[str, Any] = Field(default_factory=dict)
    correct: Optional[bool] = None
    score: Optional[float] = None
    response_time_ms: Optional[int] = None
    confidence_rating: Optional[int] = Field(default=None, ge=1, le=5)


class ActivityCompleteCreate(BaseModel):
    activity_id: str
    concept_ids: List[str] = Field(default_factory=list)
    total_score: float = Field(ge=0, le=100)
    completed_steps: int = Field(ge=0)
    time_spent_seconds: int = Field(ge=0)


class ActivityAttemptResponse(BaseModel):
    status: str = "recorded"
    delta_mastery: Optional[Dict[str, Any]] = None
    misconception_flagged: bool = False
    spaced_repetition_scheduled: bool = False


class ActivityCompleteResponse(BaseModel):
    status: str = "completed"
    activity_id: str
    total_score: float
    mastery_update: Optional[Dict[str, Any]] = None
    timeline_event_id: Optional[str] = None
