"""Progress and Recommendation routes — real mastery aggregation and next-action recommendation."""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException
from app.core.security import resolve_user_id
from app.services.data_store import DataStore
from app.services.mastery_engine import MasteryEngine
from app.services.orchestrator import LearningOrchestrator

progress_router = APIRouter()
_store = DataStore()
_mastery = MasteryEngine()
_orchestrator = LearningOrchestrator()


@progress_router.get(
    "/courses/{course_id}/mastery",
    summary="Get course mastery breakdown",
    description="Get real evidence-aggregated mastery scores for a course",
)
async def get_course_mastery(course_id: str) -> Dict[str, Any]:
    user_id = resolve_user_id()
    overall = await _mastery.compute_mastery(user_id, f"course:{course_id}")
    concepts = await _store.list_concepts(user_id)
    
    breakdown = []
    for c in concepts:
        cid = c.get("id", c.get("name"))
        m = await _mastery.compute_mastery(user_id, cid)
        breakdown.append({
            "concept_id": cid,
            "name": c.get("name"),
            "category": c.get("category"),
            "mastery": m,
        })

    return {
        "course_id": course_id,
        "overall_mastery": overall,
        "concepts": breakdown,
    }


@progress_router.get(
    "/courses/{course_id}/progress",
    summary="Get course progress metrics",
    description="Get real evidence-backed course progress summary",
)
async def get_course_progress(course_id: str) -> Dict[str, Any]:
    user_id = resolve_user_id()
    mastery = await _mastery.compute_mastery(user_id, f"course:{course_id}")
    attempts = [a for a in _mastery._local_attempts if a["user_id"] == user_id]
    
    return {
        "course_id": course_id,
        "total_attempts": len(attempts),
        "mastery": mastery,
        "stale": mastery.get("stale", False),
    }


@progress_router.get(
    "/student/next-action",
    summary="Get next best learning action",
    description="Returns real pedagogical recommendation for what the student should do next",
)
async def get_next_best_action() -> Dict[str, Any]:
    user_id = resolve_user_id()
    decision = await _orchestrator.decide_next_action(user_id, "What should I do now?")
    
    target_concept = decision.target_concept_ids[0] if decision.target_concept_ids else None
    
    # Dynamically determine the weakest concept from user's attempts
    if not target_concept:
        attempts = [a for a in _mastery._local_attempts if a["user_id"] == user_id]
        if attempts:
            # Find concept with lowest recent score
            concept_scores = {}
            for a in attempts:
                for cid in a.get("concept_ids", []):
                    if cid not in concept_scores:
                        concept_scores[cid] = []
                    concept_scores[cid].append(a.get("score", 0))
            if concept_scores:
                target_concept = min(
                    concept_scores,
                    key=lambda c: sum(concept_scores[c]) / len(concept_scores[c]),
                )
    
    return {
        "action": decision.action,
        "target_concept": target_concept or "general review",
        "reason": decision.reasoning,
        "estimated_minutes": 12 if decision.suggested_difficulty == "medium" else 15,
        "suggested_difficulty": decision.suggested_difficulty,
    }
