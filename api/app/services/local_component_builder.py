"""Deterministic local component builders.

When the LLM is unavailable or structured generation fails, these builders
produce valid component payloads using subject-aware heuristics. This ensures
the frontend always renders a real component (not generic text) for standard
activity types, while preserving the explicit subject/topic context so there
is zero cross-domain contamination.

The LLM generates the *content* (the actual questions), but the system owns
the *structure* (the activity schema). If generation fails entirely, these
templates provide a safety net.
"""

from __future__ import annotations

import logging
import uuid
from typing import List

from app.models.artifact import ArtifactPayload
from app.models.components import (
    QuizQuestion,
    QuizComponent,
    Flashcard,
    FlashcardsComponent,
    ShortAnswerComponent,
    RecallPromptComponent,
    WorkedExampleComponent,
    WorkedExampleStep,
)
from app.services.intent_extraction import UserIntent

logger = logging.getLogger(__name__)


_SUBJECT_QUESTION_BANKS = {
    "philosophy": {
        "questions": [
            {
                "question": "Which philosopher is most closely associated with the idea of the categorical imperative?",
                "options": ["Aristotle", "Kant", "Nietzsche", "Hume"],
                "correct_index": 1,
                "explanation": "Immanuel Kant developed the categorical imperative as the foundation of his deontological ethics.",
            },
            {
                "question": "What is the central claim of Plato's Allegory of the Cave?",
                "options": ["Knowledge comes from sensory experience", "The physical world is all that exists", "Our perceptions may be mere shadows of a higher reality", "Virtue is the highest good"],
                "correct_index": 2,
                "explanation": "Plato argues that the shadows on the cave wall represent our imperfect perceptions of the true Forms.",
            },
            {
                "question": "Which school of thought emphasizes living in accordance with nature and reason?",
                "options": ["Epicureanism", "Stoicism", "Skepticism", "Cynicism"],
                "correct_index": 1,
                "explanation": "Stoicism teaches that virtue and happiness come from living in harmony with reason and nature.",
            },
        ]
    },
    "physics": {
        "questions": [
            {
                "question": "According to Newton's First Law, an object at rest will remain at rest unless acted upon by what?",
                "options": ["Gravity", "A net external force", "Friction", "A constant velocity"],
                "correct_index": 1,
                "explanation": "Newton's First Law (inertia) states that objects remain in their state of motion unless a net external force acts on them.",
            },
            {
                "question": "What is the SI unit of force?",
                "options": ["Joule", "Watt", "Newton", "Pascal"],
                "correct_index": 2,
                "explanation": "The Newton (N) is the SI derived unit of force, equal to kg·m/s².",
            },
            {
                "question": "Which of Newton's laws states F = ma?",
                "options": ["First law", "Second law", "Third law", "Law of universal gravitation"],
                "correct_index": 1,
                "explanation": "Newton's Second Law relates force, mass, and acceleration: F = ma.",
            },
        ]
    },
    "mathematics": {
        "questions": [
            {
                "question": "What is the derivative of x² with respect to x?",
                "options": ["x", "2x", "x²", "2x²"],
                "correct_index": 1,
                "explanation": "By the power rule, d/dx(x²) = 2x.",
            },
            {
                "question": "What does the integral of a function represent geometrically?",
                "options": ["The slope of the function", "The area under the curve", "The limit of the function", "The derivative of the function"],
                "correct_index": 1,
                "explanation": "The definite integral represents the area under the curve between two points.",
            },
            {
                "question": "In the equation y = mx + b, what does m represent?",
                "options": ["The y-intercept", "The slope", "The dependent variable", "The constant"],
                "correct_index": 1,
                "explanation": "m is the slope of the line, representing the rate of change of y with respect to x.",
            },
        ]
    },
    "biology": {
        "questions": [
            {
                "question": "What is the primary purpose of the Krebs cycle in cellular respiration?",
                "options": ["To produce glucose", "To generate ATP directly", "To break down pyruvate and produce electron carriers", "To consume oxygen"],
                "correct_index": 2,
                "explanation": "The Krebs cycle (citric acid cycle) breaks down acetyl-CoA to produce NADH and FADH₂ for the electron transport chain.",
            },
            {
                "question": "Which structure in the cell is responsible for protein synthesis?",
                "options": ["Mitochondria", "Ribosomes", "Nucleus", "Golgi apparatus"],
                "correct_index": 1,
                "explanation": "Ribosomes are the cellular machinery where proteins are synthesized from mRNA templates.",
            },
            {
                "question": "What molecule carries genetic information in most organisms?",
                "options": ["RNA", "DNA", "Proteins", "Lipids"],
                "correct_index": 1,
                "explanation": "DNA (deoxyribonucleic acid) carries the genetic instructions for development and function.",
            },
        ]
    },
    "chemistry": {
        "questions": [
            {
                "question": "What is the charge of a proton?",
                "options": ["Negative", "Positive", "Neutral", "Variable"],
                "correct_index": 1,
                "explanation": "Protons carry a positive charge (+1 elementary charge).",
            },
            {
                "question": "Which of the following is a noble gas?",
                "options": ["Oxygen", "Nitrogen", "Argon", "Carbon"],
                "correct_index": 2,
                "explanation": "Argon is a noble gas with a complete valence shell, making it chemically inert.",
            },
            {
                "question": "What type of bond involves the sharing of electrons?",
                "options": ["Ionic", "Covalent", "Metallic", "Hydrogen"],
                "correct_index": 1,
                "explanation": "Covalent bonds form when atoms share electrons to achieve a full outer shell.",
            },
        ]
    },
    "history": {
        "questions": [
            {
                "question": "What event marked the start of World War I?",
                "options": ["The sinking of the Lusitania", "The assassination of Archduke Franz Ferdinand", "The invasion of Belgium", "The Zimmermann Telegram"],
                "correct_index": 1,
                "explanation": "The assassination of Archduke Franz Ferdinand of Austria-Hungary in June 1914 triggered a chain of alliances leading to WWI.",
            },
            {
                "question": "The Renaissance began in which country?",
                "options": ["France", "England", "Italy", "Spain"],
                "correct_index": 2,
                "explanation": "The Renaissance originated in Italy in the 14th century before spreading throughout Europe.",
            },
            {
                "question": "Which document established the principle of government by consent?",
                "options": ["The Magna Carta", "The Declaration of Independence", "The U.S. Constitution", "The Social Contract"],
                "correct_index": 1,
                "explanation": "The Declaration of Independence states that governments derive their just powers from the consent of the governed.",
            },
        ]
    },
}

_GENERIC_QUESTIONS = [
    {
        "question": "What is the core concept being studied here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct_index": 0,
        "explanation": "Select the option that best represents the key principle.",
    },
    {
        "question": "Which of the following is most important to remember about this subject?",
        "options": ["A foundational principle", "A supporting detail", "An exception case", "An advanced application"],
        "correct_index": 0,
        "explanation": "Foundational principles form the basis for understanding more complex applications.",
    },
]


def _get_question_bank(subject: str) -> List[dict]:
    """Look up the question bank for a subject, or fall back to generic."""
    if not subject:
        return _GENERIC_QUESTIONS
    subject_lower = subject.lower()
    for key, bank in _SUBJECT_QUESTION_BANKS.items():
        if key in subject_lower or subject_lower in key:
            return bank["questions"]
    return _GENERIC_QUESTIONS


def build_local_component(component_type: str, intent: UserIntent) -> ArtifactPayload:
    """Build a deterministic component payload for standard activity types.

    This is used as a last-resort fallback when LLM generation fails, ensuring
    the frontend always renders a real, subject-appropriate component.
    """
    title = intent.subject or intent.raw_query or "Learning Activity"

    if component_type == "quiz":
        bank = _get_question_bank(intent.subject or "")
        questions = []
        for i, q in enumerate(bank[:3]):
            questions.append(
                QuizQuestion(
                    id=f"q{i+1}",
                    question=q["question"],
                    options=q["options"],
                    correctIndex=q["correct_index"],
                    explanation=q.get("explanation"),
                )
            )
        data = QuizComponent(title=title, questions=questions)

    elif component_type == "flashcards":
        cards = []
        focus = intent.topic or intent.subject or "the topic"
        for i in range(3):
            cards.append(
                Flashcard(
                    id=f"card_{uuid.uuid4().hex[:8]}",
                    front=f"Key term {i+1}: {focus}",
                    back=f"The definition and significance of key term {i+1} in {intent.subject or 'this subject'}.",
                )
            )
        data = FlashcardsComponent(title=title, cards=cards)

    elif component_type == "short-answer":
        prompt = f"What is the key concept in {intent.subject or 'this subject'} you should be able to explain?"
        data = ShortAnswerComponent(
            title=title,
            question=prompt,
            sampleAnswer=f"Key points to cover: definition, principles, and applications.",
            keyConcepts=[intent.topic or intent.subject or "core concept"],
        )

    elif component_type == "recall-prompt":
        prompt = f"Without looking at your notes, explain what you know about {intent.topic or intent.subject}."
        data = RecallPromptComponent(
            title=title,
            prompt=prompt,
            hint=f"Consider the main principles, key terms, and real-world applications.",
            answer=f"The key idea is that {intent.topic or intent.subject} involves...",
        )

    elif component_type == "worked-example":
        problem = f"Solve a problem involving {intent.topic or intent.subject}."
        data = WorkedExampleComponent(
            title=title,
            problem=problem,
            steps=[
                WorkedExampleStep(step="Identify", explanation=f"Understand what {intent.topic or intent.subject} requires."),
                WorkedExampleStep(step="Apply", explanation="Use the relevant principles to work through the problem."),
                WorkedExampleStep(step="Verify", explanation="Check your reasoning against expected outcomes."),
            ],
            takeaway=f"Mastering {intent.topic or intent.subject} requires practice with these core steps.",
        )

    else:
        raise ValueError(f"No local builder available for component type: {component_type}")

    return ArtifactPayload(
        id=str(uuid.uuid4()),
        title=title,
        type=component_type,
        data=data,
    )
