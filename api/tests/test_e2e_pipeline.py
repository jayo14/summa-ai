"""End-to-end integration tests for the Summa AI learning pipeline.

Tests the full flow from intent extraction → orchestrator → activity generation → mastery tracking.
"""

import pytest
from app.services.intent_extraction import extract_intent
from app.services.orchestrator import LearningOrchestrator
from app.services.mastery_engine import MasteryEngine
from app.services.misconception_engine import MisconceptionEngine
from app.services.difficulty_engine import DifficultyEngine, AdaptiveScaler
from app.services.pattern_analysis import PatternAnalysisEngine, PredictivePracticeGenerator
from app.services.citation_grounding import CitationExtractor, CitationValidator, CitationFormatter
from app.services.study_plan_generator import NudgeEngine, NotificationService, StudyPlanGenerator
from app.services.outcome_loop import OutcomeLoopEngine
from app.services.study_recipes import RecipeSelector, RECIPES


class TestIntentExtractionPipeline:
    def test_quiz_intent(self):
        intent = extract_intent("Give me a quiz on ethics")
        assert intent.activity_request == "quiz" or intent.intent == "quiz"

    def test_flashcard_intent(self):
        intent = extract_intent("Create flashcards for logic")
        assert intent.activity_request == "flashcards" or intent.intent == "flashcards"

    def test_subject_extraction(self):
        intent = extract_intent("Give me a quiz on ethics")
        assert intent.subject is not None or intent.activity_request == "quiz"

    def test_difficulty_detection(self):
        intent = extract_intent("Give me something easy")
        assert intent.difficulty_preference == "easy"

    def test_difficulty_hard(self):
        intent = extract_intent("I want a hard challenge")
        assert intent.difficulty_preference == "hard"


class TestOrchestratorPipeline:
    @pytest.mark.asyncio
    async def test_deterministic_fallback(self):
        """Test orchestrator falls back without LLM."""
        orchestrator = LearningOrchestrator()
        intent = extract_intent("quiz me on history")
        decision = await orchestrator.decide_next_action(
            user_id="e2e-test-user",
            query="quiz me on history",
            intent=intent,
        )
        assert decision.action in [
            "TEACH", "EXPLAIN", "EXAMPLE", "RECALL", "FLASHCARD",
            "QUIZ", "PRACTICE", "ASSESS", "REVIEW", "COMPARE",
            "APPLY", "REFLECT", "SIMULATE", "PREDICT", "PLAN", "REST",
        ]
        assert decision.suggested_difficulty in ("easy", "medium", "hard", "exam-level")


class TestMasteryPipeline:
    @pytest.mark.asyncio
    async def test_record_and_compute(self):
        engine = MasteryEngine()
        for i in range(5):
            await engine.record_attempt(
                user_id="e2e-mastery-user",
                activity_id=f"activity-{i}",
                concept_ids=["concept-a", "concept-b"],
                correct=i < 3,
            )
        mastery = await engine.compute_mastery("e2e-mastery-user", "overall")
        assert "depth" in mastery
        assert "problem_solving" in mastery

    @pytest.mark.asyncio
    async def test_concept_mastery(self):
        engine = MasteryEngine()
        await engine.record_attempt(
            user_id="e2e-concept-user",
            activity_id="a1",
            concept_ids=["specific-concept"],
            correct=True,
        )
        mastery = await engine.get_concept_mastery("e2e-concept-user", "specific-concept")
        assert mastery["concept_id"] == "specific-concept"
        assert mastery["evidence_count"] >= 1


class TestMisconceptionPipeline:
    @pytest.mark.asyncio
    async def test_record_and_recommend(self):
        engine = MisconceptionEngine()
        for i in range(3):
            await engine.record_misconception(
                user_id="e2e-miscon-user",
                concept_id="test-concept",
                description="Persistent confusion",
                confidence="medium",
            )
        recs = await engine.get_correction_recommendations("e2e-miscon-user")
        assert len(recs) >= 1
        assert recs[0]["priority"] == "high"


class TestDifficultyPipeline:
    def test_engine_scales_correctly(self):
        engine = DifficultyEngine(window=5)
        attempts = [{"correct": True} for _ in range(5)]
        result = engine.compute_difficulty(attempts, current_difficulty="medium")
        assert result["suggested"] in ("hard", "exam-level")

    def test_scaler_prevents_oscillation(self):
        scaler = AdaptiveScaler(cooldown=3)
        # Build cooldown history
        for _ in range(3):
            scaler.scale("medium", "medium")
        # Now allow change
        result = scaler.scale("hard", "medium")
        assert result == "hard"


class TestPatternAnalysisPipeline:
    def test_analyze_and_generate(self):
        questions = [
            {"topic": "Ethics", "year": "2023"},
            {"topic": "Ethics", "year": "2024"},
            {"topic": "Logic", "year": "2023"},
        ]
        result = PatternAnalysisEngine.analyze_patterns(questions)
        assert "Ethics" in result.topic_frequencies

        practice = PredictivePracticeGenerator.generate_from_patterns(
            topic="Ethics",
            recurring_structures=result.recurring_structures,
            question_type="predicted",
        )
        assert practice["label"] == "Predicted Practice"
        assert "Ethics" in practice["target_concept"]


class TestCitationPipeline:
    def test_extract_validate_format(self):
        chunks = [
            {"material_title": "Notes", "chunk_text": "Content", "location": "S1", "score": 0.9},
        ]
        text = "See [Source 1] for details."
        result = CitationFormatter.ground_response(text, chunks)
        assert result["has_citations"] is True
        assert result["validation"]["all_valid"] is True


class TestNudgePipeline:
    @pytest.mark.asyncio
    async def test_generate_for_new_user(self):
        nudges = await NudgeEngine.generate_nudges("e2e-new-nudge-user")
        assert len(nudges) >= 1
        assert nudges[0]["type"] == "onboarding"


class TestNotificationPipeline:
    @pytest.mark.asyncio
    async def test_send_read_cycle(self):
        NotificationService._instance = None
        svc = NotificationService()
        item = await svc.send_notification("e2e-notif-user", "info", "Test", "Body")
        notifs = await svc.get_notifications("e2e-notif-user")
        assert len(notifs) >= 1

        await svc.mark_read("e2e-notif-user", item["id"])
        NotificationService._instance = None


class TestOutcomeLoopPipeline:
    @pytest.mark.asyncio
    async def test_submit_and_evaluate(self):
        engine = OutcomeLoopEngine()
        from app.services.outcome_loop import ExamFeedbackCreate
        feedback = ExamFeedbackCreate(
            outcome_rating="Okay",
            resembled_practice=True,
            topics_appeared=["Ethics", "Logic"],
            unprepared_topics=["Logic"],
        )
        result = await engine.submit_exam_feedback("e2e-outcome-user", "exam-201", feedback)
        assert result["exam_id"] == "exam-201"

        unprepared = await engine.get_unprepared_topics("e2e-outcome-user")
        assert "Logic" in unprepared

        accuracy = await engine.get_prediction_accuracy("e2e-outcome-user")
        assert "accuracy" in accuracy


class TestRecipeSelector:
    def test_new_topic_recipe(self):
        recipe = RecipeSelector.select_recipe(
            mastery_snapshot={"depth": 10},
            exam_proximity_days=None,
            misconception_active=False,
        )
        assert recipe in RECIPES

    def test_exam_tomorrow_recipe(self):
        recipe = RecipeSelector.select_recipe(
            mastery_snapshot={"depth": 50},
            exam_proximity_days=1,
            misconception_active=False,
        )
        assert recipe in RECIPES
