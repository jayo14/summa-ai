"""Tests for expanded component schemas — matching, ordering, fill-blank,
scenario, true-false, past-question, predicted-practice, milestone."""

import pytest
from app.models.components import (
    MatchingComponent,
    MatchingPair,
    OrderingComponent,
    FillBlankComponent,
    FillBlankSlot,
    ScenarioComponent,
    ScenarioOption,
    TrueFalseComponent,
    TrueFalseQuestion,
    PastQuestionComponent,
    PredictedPracticeComponent,
    MilestoneComponent,
    COMPONENT_TYPE_MAP,
    ComponentData,
)


class TestMatchingComponent:
    def test_valid_round_trip(self):
        m = MatchingComponent(
            title="Match Concepts",
            pairs=[
                MatchingPair(left="Rationalism", right="Innate knowledge"),
                MatchingPair(left="Empiricism", right="Sensory experience"),
            ],
        )
        serialized = m.model_dump(by_alias=True, mode="json")
        assert serialized["type"] == "matching"
        assert len(serialized["pairs"]) == 2
        assert serialized["pairs"][0]["left"] == "Rationalism"

    def test_min_two_pairs(self):
        with pytest.raises(Exception):
            MatchingComponent(
                title="Bad",
                pairs=[MatchingPair(left="A", right="B")],
            )


class TestOrderingComponent:
    def test_valid_round_trip(self):
        o = OrderingComponent(
            title="Order Steps",
            items=["Step A", "Step B", "Step C"],
            correct_order=[2, 0, 1],
        )
        serialized = o.model_dump(by_alias=True, mode="json")
        assert serialized["type"] == "ordering"
        assert serialized["correct_order"] == [2, 0, 1]


class TestFillBlankComponent:
    def test_valid_round_trip(self):
        f = FillBlankComponent(
            title="Fill the Blank",
            template="The answer is _____.",
            blanks=[FillBlankSlot(options=["A", "B", "C"], correct_answer="A")],
        )
        serialized = f.model_dump(by_alias=True, mode="json")
        assert serialized["type"] == "fill-blank"
        assert serialized["blanks"][0]["correct_answer"] == "A"


class TestScenarioComponent:
    def test_valid_round_trip(self):
        s = ScenarioComponent(
            title="Ethics Dilemma",
            context="A student faces a conflict.",
            dilemma="What should they do?",
            options=[
                ScenarioOption(id="a", text="Option A", correct=True),
                ScenarioOption(id="b", text="Option B", correct=False),
            ],
        )
        serialized = s.model_dump(by_alias=True, mode="json")
        assert serialized["type"] == "scenario"
        assert len(serialized["options"]) == 2


class TestTrueFalseComponent:
    def test_valid_round_trip(self):
        tf = TrueFalseComponent(
            title="True or False",
            questions=[
                TrueFalseQuestion(id="q1", statement="The sky is blue.", correct_answer=True),
                TrueFalseQuestion(id="q2", statement="1+1=3.", correct_answer=False),
            ],
        )
        serialized = tf.model_dump(by_alias=True, mode="json")
        assert serialized["type"] == "true-false"
        assert serialized["questions"][0]["correct_answer"] is True


class TestPastQuestionComponent:
    def test_valid_round_trip(self):
        pq = PastQuestionComponent(
            title="Past Question",
            year="2023",
            question_text="Discuss Kant's categorical imperative.",
            marks=15,
            recurring_pattern="Definition -> Application -> Evaluation",
            suggested_approach="Start with definition, then apply to a scenario.",
        )
        serialized = pq.model_dump(by_alias=True, mode="json")
        assert serialized["type"] == "past-question"
        assert serialized["marks"] == 15


class TestPredictedPracticeComponent:
    def test_valid_round_trip(self):
        pp = PredictedPracticeComponent(
            title="Predicted Practice",
            target_concept="Epistemology",
            structural_basis="Based on 3 years of past questions.",
            practice_question="Compare rationalism and empiricism.",
            rubric=["Define both", "Give examples", "Evaluate"],
        )
        serialized = pp.model_dump(by_alias=True, mode="json")
        assert serialized["type"] == "predicted-practice"
        assert len(serialized["rubric"]) == 3


class TestMilestoneComponent:
    def test_valid_round_trip(self):
        ms = MilestoneComponent(
            title="Milestone",
            milestone_title="Quiz Master",
            achieved_evidence="Completed 10 quizzes with >80% accuracy.",
            mastery_level=82.5,
            next_objective="Advanced scenarios",
        )
        serialized = ms.model_dump(by_alias=True, mode="json")
        assert serialized["type"] == "milestone"
        assert serialized["mastery_level"] == 82.5


class TestComponentTypeMap:
    def test_all_new_types_in_map(self):
        new_types = [
            "matching", "ordering", "fill-blank", "scenario",
            "true-false", "past-question", "predicted-practice", "milestone",
        ]
        for t in new_types:
            assert t in COMPONENT_TYPE_MAP, f"{t} missing from COMPONENT_TYPE_MAP"

    def test_all_types_serialize(self):
        for name, cls in COMPONENT_TYPE_MAP.items():
            assert hasattr(cls, "model_dump"), f"{name} is not a Pydantic model"
