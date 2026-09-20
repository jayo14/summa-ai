"""Structured-output contract for AI-generated chat components.

Mirrors src/components/prompt-kit/chat-components.tsx's `ChatComponentType`
union field-for-field. This is the schema the LLM's generated content is
validated against (via `instructor`) before it is ever streamed to the
frontend, and the schema the frontend's zod mirrors validate against on
receipt. Keep the two in lockstep — a field added on one side and not the
other silently reopens the `Any`-typed crash path this replaces.
"""

from __future__ import annotations

from typing import Any, List, Literal, Optional, Union

from pydantic import BaseModel, Field, field_validator, model_validator


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
    correctIndex: int = Field(default=0, ge=0)
    explanation: Optional[str] = None

    @field_validator("options", mode="before")
    @classmethod
    def _coerce_options(cls, v):
        if isinstance(v, list):
            coerced = []
            for item in v:
                if isinstance(item, dict):
                    coerced.append(str(item.get("text") or item.get("label") or item.get("value") or list(item.values())[0]))
                else:
                    coerced.append(str(item))
            return coerced
        return v

    @model_validator(mode="before")
    @classmethod
    def _coerce_correct_index(cls, values):
        if isinstance(values, dict):
            if "correctIndex" not in values:
                for alt in ("correct_index", "correctAnswer", "correct_answer", "answerIndex", "answer_index"):
                    if alt in values:
                        val = values[alt]
                        if isinstance(val, int):
                            values["correctIndex"] = val
                            break
                        elif isinstance(val, str):
                            opts = values.get("options") or []
                            if val.isdigit():
                                values["correctIndex"] = int(val)
                                break
                            found = False
                            for i, opt in enumerate(opts):
                                opt_text = opt.get("text") if isinstance(opt, dict) else str(opt)
                                if opt_text.strip().lower() == val.strip().lower():
                                    values["correctIndex"] = i
                                    found = True
                                    break
                            if found:
                                break
        return values


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


class ComparisonDistinction(BaseModel):
    aspect: str
    conceptA: str
    conceptB: str


class ComparisonComponent(BaseComponent):
    type: Literal["comparison"] = "comparison"
    conceptA: str
    conceptB: str
    distinctions: List[ComparisonDistinction] = Field(min_length=1)


class HintStep(BaseModel):
    stepNumber: int
    hintText: str


class HintLadderComponent(BaseComponent):
    type: Literal["hint-ladder"] = "hint-ladder"
    problem: str
    hints: List[HintStep] = Field(min_length=1)
    solution: Optional[str] = None


class WorkedExampleStep(BaseModel):
    step: str
    explanation: str


class WorkedExampleComponent(BaseComponent):
    type: Literal["worked-example"] = "worked-example"
    problem: str
    steps: List[WorkedExampleStep] = Field(min_length=1)
    takeaway: Optional[str] = None


class ShortAnswerComponent(BaseComponent):
    type: Literal["short-answer"] = "short-answer"
    question: str
    sampleAnswer: Optional[str] = None
    keyConcepts: List[str] = Field(default_factory=list)


class RecallPromptComponent(BaseComponent):
    type: Literal["recall-prompt"] = "recall-prompt"
    prompt: str
    hint: Optional[str] = None
    answer: str


class MatchingPair(BaseModel):
    left: str
    right: str


class MatchingComponent(BaseComponent):
    type: Literal["matching"] = "matching"
    pairs: List[MatchingPair] = Field(min_length=2)
    distractors: List[str] = Field(default_factory=list)


class OrderingComponent(BaseComponent):
    type: Literal["ordering"] = "ordering"
    items: List[str] = Field(min_length=2)
    correct_order: List[int] = Field(min_length=2)
    description: Optional[str] = None


class FillBlankSlot(BaseModel):
    options: List[str] = Field(min_length=2)
    correct_answer: Optional[str] = None


class FillBlankComponent(BaseComponent):
    type: Literal["fill-blank"] = "fill-blank"
    template: str
    blanks: List[FillBlankSlot] = Field(min_length=1)


class ScenarioOption(BaseModel):
    id: str
    text: str
    correct: bool = False
    feedback: Optional[str] = None


class ScenarioComponent(BaseComponent):
    type: Literal["scenario"] = "scenario"
    context: str
    dilemma: str
    options: List[ScenarioOption] = Field(min_length=2)


class TrueFalseQuestion(BaseModel):
    id: str
    statement: str
    correct_answer: bool
    explanation: Optional[str] = None


class TrueFalseComponent(BaseComponent):
    type: Literal["true-false"] = "true-false"
    questions: List[TrueFalseQuestion] = Field(min_length=1)


class PastQuestionComponent(BaseComponent):
    type: Literal["past-question"] = "past-question"
    year: Optional[str] = None
    question_text: str
    marks: Optional[int] = None
    recurring_pattern: str
    suggested_approach: str


class PredictedPracticeComponent(BaseComponent):
    type: Literal["predicted-practice"] = "predicted-practice"
    target_concept: str
    structural_basis: str
    practice_question: str
    rubric: List[str] = Field(default_factory=list)


class MilestoneComponent(BaseComponent):
    type: Literal["milestone"] = "milestone"
    milestone_title: str
    achieved_evidence: str
    mastery_level: float = Field(ge=0, le=100)
    next_objective: str


ComponentData = Union[
    HexagonComponent,
    QuizComponent,
    FlashcardsComponent,
    StudyPlanComponent,
    GraphComponent,
    TimelineComponent,
    GapAnalysisComponent,
    ComparisonComponent,
    HintLadderComponent,
    WorkedExampleComponent,
    ShortAnswerComponent,
    RecallPromptComponent,
    MatchingComponent,
    OrderingComponent,
    FillBlankComponent,
    ScenarioComponent,
    TrueFalseComponent,
    PastQuestionComponent,
    PredictedPracticeComponent,
    MilestoneComponent,
]

COMPONENT_TYPE_MAP = {
    "hexagon": HexagonComponent,
    "quiz": QuizComponent,
    "flashcards": FlashcardsComponent,
    "study-plan": StudyPlanComponent,
    "graph": GraphComponent,
    "timeline": TimelineComponent,
    "gap-analysis": GapAnalysisComponent,
    "comparison": ComparisonComponent,
    "hint-ladder": HintLadderComponent,
    "worked-example": WorkedExampleComponent,
    "short-answer": ShortAnswerComponent,
    "recall-prompt": RecallPromptComponent,
    "matching": MatchingComponent,
    "ordering": OrderingComponent,
    "fill-blank": FillBlankComponent,
    "scenario": ScenarioComponent,
    "true-false": TrueFalseComponent,
    "past-question": PastQuestionComponent,
    "predicted-practice": PredictedPracticeComponent,
    "milestone": MilestoneComponent,
}

ACTION_TO_COMPONENT = {
    "QUIZ": "quiz",
    "FLASHCARD": "flashcards",
    "PLAN": "study-plan",
    "ASSESS": "hexagon",
    "REVIEW": "gap-analysis",
    "COMPARE": "comparison",
    "RECALL": "recall-prompt",
    "PRACTICE": "short-answer",
    "EXAMPLE": "worked-example",
    "MATCH": "matching",
    "ORDER": "ordering",
    "FILL_BLANK": "fill-blank",
    "SCENARIO": "scenario",
    "TRUE_FALSE": "true-false",
    "PAST_QUESTION": "past-question",
    "PREDICTED_PRACTICE": "predicted-practice",
    "MILESTONE": "milestone",
}

ComponentType = Literal[
    "hexagon",
    "quiz",
    "flashcards",
    "study-plan",
    "graph",
    "timeline",
    "gap-analysis",
    "comparison",
    "hint-ladder",
    "worked-example",
    "short-answer",
    "recall-prompt",
    "matching",
    "ordering",
    "fill-blank",
    "scenario",
    "true-false",
    "past-question",
    "predicted-practice",
    "milestone",
]
