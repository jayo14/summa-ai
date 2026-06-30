"""Artifact models."""
from datetime import datetime
from typing import Any, List, Optional
from pydantic import BaseModel

class ArtifactCreate(BaseModel):
    title: str; type: str; component: Any; source: str = "conversation"
    source_label: Optional[str] = None; parent_artifact_id: Optional[str] = None
    conversation_id: Optional[str] = None; change_note: Optional[str] = None

class ArtifactUpdate(BaseModel):
    title: Optional[str] = None; archived: Optional[bool] = None; pinned: Optional[bool] = None
    component: Optional[Any] = None; change_note: Optional[str] = None

class ArtifactVersionRestore(BaseModel):
    version: int
