"""Timeline & Knowledge models."""
from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel

class TimelineEventCreate(BaseModel):
    type: str; title: str; description: str; metadata: Optional[Dict[str, Any]] = None

class MaterialCreate(BaseModel):
    type: str; title: str; source: str; size: Optional[str] = None; duration: Optional[str] = None

class ConceptCreate(BaseModel):
    name: str; category: str; mastery: str = "learning"; material_id: Optional[str] = None; related_count: int = 0
