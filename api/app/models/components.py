"""Structured-output contract for AI-generated chat components.

Mirrors src/components/prompt-kit/chat-components.tsx's `ChatComponentType`
union field-for-field. This is the schema the LLM's generated content is
validated against (via `instructor`) before it is ever streamed to the
frontend, and the schema the frontend's zod mirrors validate against on
receipt. Keep the two in lockstep — a field added on one side and not the
other silently reopens the `Any`-typed crash path this replaces.
"""

from __future__ import annotations

from typing import List, Literal, Optional, Union

from pydantic import BaseModel, Field


class BaseComponent(BaseModel):
    title: Optional[str] = None


class HexagonDimension(BaseModel):
    label: str
    score: float = Field(ge=0, le=100)


class HexagonComponent(BaseComponent):
    type: Literal["hexagon"] = "hexagon"
    dimensions: List[HexagonDimension] = Field(min_length=1)


class QuizQuestion(BaseModel):
    id: str
    question: str
    options: List[str] = Field(min_length=2)
    correctIndex: int = Field(ge=0)
    explanation: Optional[str] = None


class QuizComponent(BaseComponent):
    type: Literal["quiz"] = "quiz"
    questions: List[QuizQuestion] = Field(min_length=1)


class Flashcard(BaseModel):
    id: str
    front: str
    back: str


class FlashcardsComponent(BaseComponent):
    type: Literal["flashcards"] = "flashcards"
    cards: List[Flashcard] = Field(min_length=1)


class StudyPlanTask(BaseModel):
    id: str
    text: str
    done: Optional[bool] = None


class StudyPlanDay(BaseModel):
    id: str
    label: str
    tasks: List[StudyPlanTask] = Field(min_length=1)


class StudyPlanComponent(BaseComponent):
    type: Literal["study-plan"] = "study-plan"
    days: List[StudyPlanDay] = Field(min_length=1)


class GraphNode(BaseModel):
    id: str
    label: str
    x: float
    y: float
    mastery: Literal["mastered", "learning", "struggling", "gap"]


class GraphEdge(BaseModel):
    from_: str = Field(alias="from")
    to: str

    model_config = {"populate_by_name": True}


class GraphComponent(BaseComponent):
    type: Literal["graph"] = "graph"
    nodes: List[GraphNode] = Field(min_length=1)
    edges: List[GraphEdge] = Field(default_factory=list)


class TimelineEvent(BaseModel):
    id: str
    title: str
    date: str
    description: Optional[str] = None
    status: Literal["upcoming", "past", "urgent"]


class TimelineComponent(BaseComponent):
    type: Literal["timeline"] = "timeline"
    events: List[TimelineEvent] = Field(min_length=1)


class GapAnalysisGap(BaseModel):
    id: str
    topic: str
    reason: str
    priority: Literal["high", "medium", "low"]
    estTime: str


class GapAnalysisComponent(BaseComponent):
    type: Literal["gap-analysis"] = "gap-analysis"
    gaps: List[GapAnalysisGap] = Field(min_length=1)


ComponentData = Union[
    HexagonComponent,
    QuizComponent,
    FlashcardsComponent,
    StudyPlanComponent,
    GraphComponent,
    TimelineComponent,
    GapAnalysisComponent,
]

COMPONENT_TYPE_MAP = {
    "hexagon": HexagonComponent,
    "quiz": QuizComponent,
    "flashcards": FlashcardsComponent,
    "study-plan": StudyPlanComponent,
    "graph": GraphComponent,
    "timeline": TimelineComponent,
    "gap-analysis": GapAnalysisComponent,
}

ComponentType = Literal[
    "hexagon", "quiz", "flashcards", "study-plan", "graph", "timeline", "gap-analysis"
]
