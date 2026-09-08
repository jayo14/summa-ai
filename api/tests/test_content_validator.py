"""Tests for content relevance validation — ensures generated components
are about the right subject and never contaminated with unrelated domains."""

import pytest

from app.models.components import QuizComponent, QuizQuestion, FlashcardsComponent, Flashcard
from app.services.content_validator import validate_component_relevance
from app.services.intent_extraction import UserIntent


def _intent(subject="Philosophy", topic=None, raw_query="Quiz me on Philosophy"):
    return UserIntent(
        intent="quiz",
        activity_request="quiz",
        subject=subject,
        topic=topic,
        learning_goal="assessment",
        raw_query=raw_query,
    )


class TestContentRelevanceValidation:
    def test_valid_philosophy_quiz_passes(self):
        quiz = QuizComponent(
            title="Philosophy Quiz",
            questions=[
                QuizQuestion(
                    id="q1",
                    question="Which philosopher proposed the categorical imperative?",
                    options=["Aristotle", "Kant", "Nietzsche", "Hume"],
                    correctIndex=1,
                    explanation="Kant's categorical imperative is central to his ethics.",
                )
            ],
        )
        assert validate_component_relevance("quiz", quiz, _intent()) is True

    def test_java_contaminated_philosophy_quiz_fails(self):
        """The exact bug from the incident report: Philosophy subject but
        Java/programming questions."""
        quiz = QuizComponent(
            title="Active Recall Check — Philosophy",
            questions=[
                QuizQuestion(
                    id="q1",
                    question="What is the primary difference between compile-time overloading and runtime overriding?",
                    options=["Option A", "Option B", "Option C", "Option D"],
                    correctIndex=0,
                ),
                QuizQuestion(
                    id="q2",
                    question="Does dynamic method dispatch evaluate the declared reference type or the instantiated runtime object type?",
                    options=["Option A", "Option B", "Option C", "Option D"],
                    correctIndex=0,
                ),
            ],
        )
        assert validate_component_relevance("quiz", quiz, _intent()) is False

    def test_polymorphism_contaminated_philosophy_quiz_fails(self):
        quiz = QuizComponent(
            title="Philosophy Quiz",
            questions=[
                QuizQuestion(
                    id="q1",
                    question="What is polymorphism in object-oriented programming?",
                    options=["A concept", "Another concept", "Third concept", "Fourth"],
                    correctIndex=0,
                )
            ],
        )
        assert validate_component_relevance("quiz", quiz, _intent()) is False

    def test_valid_physics_quiz_passes(self):
        quiz = QuizComponent(
            title="Physics Quiz",
            questions=[
                QuizQuestion(
                    id="q1",
                    question="What is Newton's First Law of Motion?",
                    options=["Law of gravity", "Law of inertia", "Law of motion", "Law of thermodynamics"],
                    correctIndex=1,
                )
            ],
        )
        intent = _intent(subject="Physics", topic="Newton's Laws")
        assert validate_component_relevance("quiz", quiz, intent) is True

    def test_programming_subject_allows_programming_content(self):
        """If the subject IS programming, contamination markers are OK."""
        quiz = QuizComponent(
            title="Programming Quiz",
            questions=[
                QuizQuestion(
                    id="q1",
                    question="What is the difference between compile-time overloading and runtime overriding?",
                    options=["A", "B", "C", "D"],
                    correctIndex=0,
                )
            ],
        )
        intent = _intent(subject="Computer Science", topic="OOP")
        assert validate_component_relevance("quiz", quiz, intent) is True

    def test_invalid_correct_index_fails(self):
        quiz = QuizComponent(
            title="Philosophy Quiz",
            questions=[
                QuizQuestion(
                    id="q1",
                    question="What is Plato's Theory of Forms?",
                    options=["A", "B"],
                    correctIndex=5,  # out of range
                )
            ],
        )
        assert validate_component_relevance("quiz", quiz, _intent()) is False

    def test_valid_flashcards_pass(self):
        cards = FlashcardsComponent(
            title="Philosophy Cards",
            cards=[
                Flashcard(id="c1", front="What is the categorical imperative?", back="Kant's moral law"),
                Flashcard(id="c2", front="Who wrote The Republic?", back="Plato"),
            ],
        )
        assert validate_component_relevance("flashcards", cards, _intent()) is True

    def test_java_contaminated_flashcards_fail(self):
        cards = FlashcardsComponent(
            title="Philosophy Cards",
            cards=[
                Flashcard(id="c1", front="What is compile-time overloading?", back="Method overloading in Java"),
            ],
        )
        assert validate_component_relevance("flashcards", cards, _intent()) is False
