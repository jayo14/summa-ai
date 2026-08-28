"""Artifact models."""

from datetime import datetime
from typing import Annotated, List, Optional
from pydantic import BaseModel, Field

from app.models.components import ComponentData


class ArtifactCreate(BaseModel):
    title: str
    type: str
    # Optional: non-AI artifact types (uploaded notes, materials) carry no
    # structured component. When present, it must match one of the known
    # dynamic-UI schemas — no more `Any`-typed passthrough.
    component: Optional[Annotated[ComponentData, Field(discriminator="type")]] = None
    source: str = "conversation"
    source_label: Optional[str] = None
    parent_artifact_id: Optional[str] = None
    conversation_id: Optional[str] = None
    change_note: Optional[str] = None


class ArtifactUpdate(BaseModel):
    title: Optional[str] = None
    archived: Optional[bool] = None
    pinned: Optional[bool] = None
    component: Optional[Annotated[ComponentData, Field(discriminator="type")]] = None
    change_note: Optional[str] = None


class ArtifactPayload(BaseModel):
    """The shape streamed to the frontend as an `artifact` SSE event's payload —
    {id, title, type, data}. `data` is the same discriminated ComponentData the
    dynamic ChatComponentRenderer on the frontend expects as props."""

    id: str
    title: str
    type: str
    data: Annotated[ComponentData, Field(discriminator="type")]


class ArtifactVersionRestore(BaseModel):
    version: int
