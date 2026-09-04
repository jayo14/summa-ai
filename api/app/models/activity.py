"""Activity models — replacing legacy artifact naming."""

from datetime import datetime
from typing import Annotated, List, Optional
from pydantic import BaseModel, Field

from app.models.components import ComponentData


class ActivityCreate(BaseModel):
    title: str
    type: str
    component: Optional[Annotated[ComponentData, Field(discriminator="type")]] = None
    source: str = "conversation"
    source_label: Optional[str] = None
    parent_activity_id: Optional[str] = Field(default=None, alias="parent_artifact_id")
    conversation_id: Optional[str] = None
    change_note: Optional[str] = None
    purpose: Optional[str] = None
    concept_ids: List[str] = Field(default_factory=list)
    difficulty: Optional[str] = None
    estimated_minutes: Optional[int] = None
    learning_signals: Optional[dict] = Field(default_factory=dict)

    model_config = {"populate_by_name": True}

    @property
    def parent_artifact_id(self) -> Optional[str]:
        return self.parent_activity_id


class ActivityUpdate(BaseModel):
    title: Optional[str] = None
    archived: Optional[bool] = None
    pinned: Optional[bool] = None
    component: Optional[Annotated[ComponentData, Field(discriminator="type")]] = None
    change_note: Optional[str] = None
    purpose: Optional[str] = None
    concept_ids: Optional[List[str]] = None
    difficulty: Optional[str] = None
    estimated_minutes: Optional[int] = None
    learning_signals: Optional[dict] = None


class ActivityPayload(BaseModel):
    id: str
    title: str
    type: str
    data: Annotated[ComponentData, Field(discriminator="type")]
    purpose: Optional[str] = None
    concept_ids: List[str] = Field(default_factory=list)
    difficulty: Optional[str] = None
    estimated_minutes: Optional[int] = None
    learning_signals: Optional[dict] = Field(default_factory=dict)


class ActivityVersionRestore(BaseModel):
    version: int


class LearningActivity(BaseModel):
    id: str
    user_id: str
    title: str
    type: str
    purpose: Optional[str] = None
    concept_ids: List[str] = Field(default_factory=list)
    difficulty: Optional[str] = None
    estimated_minutes: Optional[int] = None
    learning_signals: dict = Field(default_factory=dict)
    component: Optional[Annotated[ComponentData, Field(discriminator="type")]] = None
    pinned: bool = False
    archived: bool = False
    version: int = 1
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# Backward compatibility aliases
ArtifactCreate = ActivityCreate
ArtifactUpdate = ActivityUpdate
ArtifactPayload = ActivityPayload
ArtifactVersionRestore = ActivityVersionRestore

