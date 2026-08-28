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


class ActivityUpdate(BaseModel):
    title: Optional[str] = None
    archived: Optional[bool] = None
    pinned: Optional[bool] = None
    component: Optional[Annotated[ComponentData, Field(discriminator="type")]] = None
    change_note: Optional[str] = None


class ActivityPayload(BaseModel):
    id: str
    title: str
    type: str
    data: Annotated[ComponentData, Field(discriminator="type")]


class ActivityVersionRestore(BaseModel):
    version: int


# Backward compatibility aliases
ArtifactCreate = ActivityCreate
ArtifactUpdate = ActivityUpdate
ArtifactPayload = ActivityPayload
ArtifactVersionRestore = ActivityVersionRestore
