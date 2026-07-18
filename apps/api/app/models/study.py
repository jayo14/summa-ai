"""Study plan, flashcard, and exam models."""
from datetime import date, datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel

class StudySessionCreate(BaseModel):
    day: str; topic: str; status: str = "upcoming"; duration: str = "30 min"; sort_order: int = 0

class StudySessionUpdate(BaseModel):
    status: Optional[str] = None; duration: Optional[str] = None

class StudyPlanCreate(BaseModel):
    title: str; progress: float = 0.0; days_left: int = 0; streak: int = 0
    sessions: List[StudySessionCreate] = []

class StudyPlanUpdate(BaseModel):
    title: Optional[str] = None; progress: Optional[float] = None
    days_left: Optional[int] = None; streak: Optional[int] = None

class FlashcardsUpdate(BaseModel):
    mastered: bool
    ease_factor: Optional[float] = None
    interval_days: Optional[int] = None
    repetitions: Optional[int] = None

class FlashcardCreate(BaseModel):
    front: str; back: str

class ExamCreate(BaseModel):
    name: str; exam_date: date; readiness: int = 0

class ExamUpdate(BaseModel):
    name: Optional[str] = None; exam_date: Optional[date] = None; readiness: Optional[int] = None
