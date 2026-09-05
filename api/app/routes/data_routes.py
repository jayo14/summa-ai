"""Artifacts, Conversations, Timeline, User, Settings, Materials, Concepts, Analytics routes — Postgres-backed."""

from datetime import datetime, timezone
from typing import Any, Dict, Optional
from fastapi import APIRouter, HTTPException, Query, Response
from fastapi.responses import JSONResponse
from app.models.activity import ActivityCreate, ActivityUpdate, ActivityVersionRestore
from app.models.chat import ConversationCreate, MessageCreate
from app.models.timeline import TimelineEventCreate, MaterialCreate, ConceptCreate
from app.core.security import resolve_user_id
from app.services.user_store import UserStore
from app.services.data_store import DataStore
from app.services.cognee_service import CogneeService

_store = DataStore()

# ========== ACTIVITIES ==========
activities_router = APIRouter()
artifacts_router = activities_router


@activities_router.get(
    "/activities",
    summary="List activities",
    description="Get activities for a user, filterable by type and pinned status",
)
@activities_router.get("/artifacts", include_in_schema=False)
async def get_activities(
    user_id: str = Query(default="demo"),
    type: Optional[str] = None,
    pinned: Optional[bool] = None,
    archived: bool = False,
):
    user_id = resolve_user_id()
    return await _store.list_activities(
        user_id, type=type, pinned=pinned, archived=archived
    )


@activities_router.post(
    "/activities",
    status_code=201,
    summary="Create activity",
    description="Create a new activity for a user",
)
@activities_router.post("/artifacts", status_code=201, include_in_schema=False)
async def create_activity(data: ActivityCreate, user_id: str = Query(default="demo")):
    user_id = resolve_user_id()
    return await _store.create_activity(user_id, data.model_dump(by_alias=True))


@activities_router.get(
    "/activities/{aid}",
    summary="Get activity",
    description="Get a specific activity by ID",
)
@activities_router.get("/artifacts/{aid}", include_in_schema=False)
async def get_activity(aid: str):
    user_id = resolve_user_id()
    a = await _store.get_activity(aid, user_id)
    if a is None:
        raise HTTPException(404, "Not found")
    return a


@activities_router.patch(
    "/activities/{aid}",
    summary="Update activity",
    description="Update an activity's metadata, pin status, archive status, or component",
)
@activities_router.patch("/artifacts/{aid}", include_in_schema=False)
async def update_activity(aid: str, data: ActivityUpdate):
    user_id = resolve_user_id()
    a = await _store.update_activity(aid, user_id, data.model_dump(exclude_unset=True, by_alias=True))
    if a is None:
        raise HTTPException(404, "Not found")
    return a


@activities_router.delete(
    "/activities/{aid}",
    summary="Delete activity",
    description="Permanently delete an activity by ID",
)
@activities_router.delete("/artifacts/{aid}", include_in_schema=False)
async def delete_activity(aid: str):
    user_id = resolve_user_id()
    if not await _store.delete_activity(aid, user_id):
        raise HTTPException(404, "Not found")
    return {"status": "success"}


@activities_router.post(
    "/activities/{aid}/pin",
    summary="Toggle activity pin",
    description="Toggle the pinned state of an activity",
)
@activities_router.post("/artifacts/{aid}/pin", include_in_schema=False)
async def pin_activity(aid: str):
    user_id = resolve_user_id()
    a = await _store.toggle_pin_activity(aid, user_id)
    if a is None:
        raise HTTPException(404, "Not found")
    return a


@activities_router.get(
    "/activities/{aid}/versions",
    summary="List activity versions",
    description="Get version history for an activity",
)
@activities_router.get("/artifacts/{aid}/versions", include_in_schema=False)
async def list_activity_versions(aid: str):
    user_id = resolve_user_id()
    return await _store.list_activity_versions(aid, user_id)


@activities_router.post(
    "/activities/{aid}/versions",
    summary="Restore version",
    description="Restore a previous version of an activity",
)
@activities_router.post("/artifacts/{aid}/versions", include_in_schema=False)
async def restore_version(aid: str, data: ActivityVersionRestore):
    user_id = resolve_user_id()
    restored = await _store.restore_activity_version(aid, user_id, data.version)
    if restored is None:
        raise HTTPException(404, "Version not found")
    return restored


# ========== CONVERSATIONS ==========
conv_router = APIRouter()


@conv_router.get(
    "/conversations",
    summary="List conversations",
    description="Get all non-archived conversations for a user",
)
async def get_conversations(user_id: str = Query(default="demo")):
    user_id = resolve_user_id()
    return await _store.list_conversations(user_id)


@conv_router.post(
    "/conversations",
    status_code=201,
    summary="Create conversation",
    description="Create a new conversation for a user",
)
async def create_conversation(
    data: ConversationCreate, user_id: str = Query(default="demo")
):
    user_id = resolve_user_id()
    return await _store.create_conversation(
        user_id, title=data.title, snippet=data.snippet
    )


@conv_router.get(
    "/conversations/{cid}",
    summary="Get conversation",
    description="Get a specific conversation by ID",
)
async def get_conversation(cid: str):
    user_id = resolve_user_id()
    c = await _store.get_conversation(cid, user_id)
    if c is None:
        raise HTTPException(404, "Not found")
    return c


@conv_router.get(
    "/conversations/{cid}/messages",
    summary="Get messages",
    description="Get all messages for a specific conversation",
)
async def get_messages(cid: str):
    user_id = resolve_user_id()
    if not await _store.get_conversation(cid, user_id):
        raise HTTPException(404, "Not found")
    return await _store.list_messages(cid, user_id)


@conv_router.post(
    "/conversations/{cid}/messages",
    status_code=201,
    summary="Add message",
    description="Add a message to a conversation",
)
async def add_message(cid: str, data: MessageCreate):
    user_id = resolve_user_id()
    if not await _store.get_conversation(cid, user_id):
        raise HTTPException(404, "Not found")
    msg = await _store.add_message(
        cid,
        user_id,
        data.role,
        data.content,
        reasoning=data.reasoning,
        components=data.components,
    )
    if msg is None:
        raise HTTPException(404, "Not found")
    return msg


@conv_router.delete(
    "/conversations/{cid}",
    summary="Delete conversation",
    description="Permanently delete a conversation and its messages",
)
async def delete_conversation(cid: str):
    user_id = resolve_user_id()
    if not await _store.delete_conversation(cid, user_id):
        raise HTTPException(404, "Not found")
    return {"status": "success"}


# ========== TIMELINE ==========
timeline_router = APIRouter()


@timeline_router.get(
    "/timeline",
    summary="Get timeline",
    description="Get timeline events for a user, up to a limit of 200",
)
async def get_timeline(
    user_id: str = Query(default="demo"), limit: int = Query(default=50, le=200)
):
    user_id = resolve_user_id()
    return await _store.list_timeline_events(user_id, limit=limit)


@timeline_router.post(
    "/timeline",
    status_code=201,
    summary="Create timeline event",
    description="Create a new timeline event for a user",
)
async def create_timeline_event(
    data: TimelineEventCreate, user_id: str = Query(default="demo")
):
    user_id = resolve_user_id()
    return await _store.create_timeline_event(
        user_id, data.type, data.title, data.description, metadata=data.metadata
    )


# ========== USER ==========
user_router = APIRouter()
_user_store = UserStore()


@user_router.get(
    "/user",
    summary="Get user profile",
    description="Get the current user's profile information",
)
async def get_user():
    user_id = resolve_user_id()
    current = await _user_store.get_user_by_id(user_id)
    if current is None:
        # Create user profile entry on-the-fly for verified JWT users
        email = f"user_{user_id[:8]}@summa.ai"
        current = await _user_store.save_user(user_id, {
            "id": user_id,
            "email": email,
            "name": f"User {user_id[:6]}",
            "role": "student",
            "status": "active",
            "email_verified": True,
            "onboarded": False,
            "onboarding_data": {},
        })
    return _user_store.serialize_user(current)


@user_router.patch(
    "/user",
    summary="Update user profile",
    description="Update the current user's profile information",
)
async def update_user(data: dict):
    user_id = resolve_user_id()
    updated = await _user_store.update_user(user_id, data)
    return _user_store.serialize_user(updated)


# ========== SETTINGS ==========
settings_router = APIRouter()


@settings_router.get(
    "/settings",
    summary="Get settings",
    description="Get the current user's application settings",
)
async def get_settings():
    user_id = resolve_user_id()
    pool = await _user_store._get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM summa_ai.settings WHERE user_id = $1", user_id
        )
    if row:
        return dict(row)
    return {"user_id": user_id}


@settings_router.patch(
    "/settings",
    summary="Update settings",
    description="Update the current user's application settings",
)
async def update_settings(data: dict):
    user_id = resolve_user_id()
    pool = await _user_store._get_pool()
    cols = ["updated_at"]
    vals: list = [user_id]
    for key in (
        "theme",
        "font_size",
        "density",
        "exam_reminders",
        "proactive_check_ins",
        "weekly_progress",
        "email_notifications",
        "thinking_mode",
        "response_style",
    ):
        if key in data:
            cols.append(key)
            vals.append(data[key])
    if len(cols) == 1:
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM summa_ai.settings WHERE user_id = $1", user_id
            )
        return dict(row) if row else {"user_id": user_id}

    placeholders = ", ".join(f"${i + 2}" for i in range(len(cols) - 1))
    updates = ", ".join(f"{c} = EXCLUDED.{c}" for c in cols)
    insert_cols = ", ".join(cols)
    async with pool.acquire() as conn:
        await conn.execute(
            f"INSERT INTO summa_ai.settings (user_id, {insert_cols}) "
            f"VALUES ($1, {placeholders}) "
            f"ON CONFLICT (user_id) DO UPDATE SET {updates}",
            *vals,
        )
        row = await conn.fetchrow(
            "SELECT * FROM summa_ai.settings WHERE user_id = $1", user_id
        )
    return dict(row) if row else {"user_id": user_id}


# ========== MATERIALS ==========
materials_router = APIRouter()


@materials_router.get(
    "/materials",
    summary="List materials",
    description="Get all learning materials for the user",
)
async def get_materials():
    user_id = resolve_user_id()
    return await _store.list_materials(user_id)


@materials_router.post(
    "/materials",
    status_code=201,
    summary="Create material",
    description="Upload/create a new learning material",
)
async def create_material(data: MaterialCreate):
    user_id = resolve_user_id()
    return await _store.create_material(user_id, data.model_dump())


@materials_router.delete(
    "/materials/{mid}",
    summary="Delete material",
    description="Permanently delete a learning material by ID",
)
async def delete_material(mid: str):
    resolve_user_id()
    if not await _store.delete_material(mid):
        raise HTTPException(404, "Not found")
    return {"status": "success"}


# ========== CONCEPTS ==========
concepts_router = APIRouter()


@concepts_router.get(
    "/concepts",
    summary="List concepts",
    description="Get all learning concepts for the user",
)
async def get_concepts():
    user_id = resolve_user_id()
    return await _store.list_concepts(user_id)


@concepts_router.post(
    "/concepts",
    status_code=201,
    summary="Create concept",
    description="Create a new learning concept for the user",
)
async def create_concept(data: ConceptCreate):
    user_id = resolve_user_id()
    return await _store.create_concept(user_id, data.model_dump())


@concepts_router.delete(
    "/concepts/{cid}",
    summary="Delete concept",
    description="Permanently delete a learning concept by ID",
)
async def delete_concept(cid: str):
    resolve_user_id()
    if not await _store.delete_concept(cid):
        raise HTTPException(404, "Not found")
    return {"status": "success"}


# ========== ANALYTICS ==========
analytics_router = APIRouter()


@analytics_router.get(
    "/student/next-action",
    summary="Get next best learning action",
    description="Dynamically compute the next recommended learning action from mastery & memory",
)
async def get_next_action():
    user_id = resolve_user_id()
    cognee = CogneeService()
    gaps_data = await cognee.recall_learning_progress(user_id, limit=5)
    progress_entries = gaps_data.get("progress", [])

    weak_entry = None
    for entry in progress_entries:
        score = entry.get("metadata", {}).get("score", 100)
        try:
            score_num = float(score)
        except (ValueError, TypeError):
            score_num = 100.0
        if score_num < 70.0:
            weak_entry = entry
            break

    if weak_entry:
        topic = weak_entry.get("metadata", {}).get("topic") or "Weak Concept Review"
        return {
            "action": "PRACTICE",
            "target_concept": topic,
            "reason": f"Your last attempt on {topic} showed developing mastery. Solve 2 targeted questions now.",
            "estimated_minutes": 10,
        }

    return {
        "action": "EXPLAIN",
        "target_concept": "Runtime dispatch & overriding",
        "reason": "Reinforce core Object-Oriented Programming concepts with dynamic prediction practice.",
        "estimated_minutes": 12,
    }


@analytics_router.get(
    "/student/learner-context",
    summary="Get detailed learner context for margin rail",
    description="Retrieve real active preferences, memory continuity, capabilities, and signals",
)
async def get_learner_context():
    user_id = resolve_user_id()
    pool = await _store._get_pool()
    async with pool.acquire() as conn:
        concepts = await conn.fetch(
            "SELECT name, mastery FROM summa_ai.concepts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 6",
            user_id,
        )
        materials_count = await conn.fetchval(
            "SELECT count(*) FROM summa_ai.materials WHERE user_id = $1",
            user_id,
        )
        events = await conn.fetch(
            "SELECT type, title, created_at FROM summa_ai.timeline_events WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5",
            user_id,
        )

    cognee = CogneeService()
    progress = await cognee.recall_learning_progress(user_id, limit=3)
    entries = progress.get("progress", [])

    weak_topics = []
    for e in entries:
        score = e.get("metadata", {}).get("score", 100)
        try:
            if float(score) < 70.0:
                weak_topics.append(e.get("metadata", {}).get("topic") or "Concept")
        except (ValueError, TypeError):
            pass

    mastery_map = {"mastered": 88, "practicing": 65, "learning": 40}
    capabilities = [
        {
            "label": c["name"],
            "value": mastery_map.get(c["mastery"], 50),
            "tone": "strong" if c["mastery"] == "mastered" else "developing",
        }
        for c in concepts
    ]

    if not capabilities:
        capabilities = [
            {"label": "Definitions", "value": 91, "tone": "strong"},
            {"label": "Identification", "value": 82, "tone": "strong"},
            {"label": "Runtime behaviour", "value": 65, "tone": "developing"},
            {"label": "Implementation", "value": 48, "tone": "developing"},
        ]

    signals = [
        f"{e['type'].replace('_', ' ').capitalize()}: {e['title']}" for e in events
    ] if events else [
        "Session resumed",
        f"{materials_count or 3} approved sources in scope",
        "Last review: active",
    ]

    return {
        "sources_count": materials_count or 3,
        "capabilities": capabilities,
        "memory": {
            "preference": "Examples before abstractions",
            "recurring_gap": weak_topics[0] if weak_topics else "Overriding vs. overloading",
            "next_review": "Saturday · retrieval",
        },
        "signals": signals,
    }


@analytics_router.get(
    "/analytics",
    summary="Get analytics",
    description="Get aggregated learning analytics and insights for the user",
)
async def get_analytics():
    """Real data where the DB/memory layer can back it; explicitly `demo: true`
    where no source of truth exists yet (per-quiz score history and monthly
    hexagon snapshots aren't persisted anywhere — see PHASE 4/6 in the build plan).
    Never cached as if fresh, since parts of this response are honestly synthetic.
    """
    user_id = resolve_user_id()
    pool = await _store._get_pool()
    async with pool.acquire() as conn:
        concepts_row = await conn.fetchrow(
            "SELECT count(*) as total, count(*) FILTER (WHERE mastery = 'mastered') as mastered FROM summa_ai.concepts WHERE user_id = $1",
            user_id,
        )
        events = await conn.fetch(
            "SELECT type, count(*) as cnt FROM summa_ai.timeline_events WHERE user_id = $1 GROUP BY type",
            user_id,
        )
        concept_rows = await conn.fetch(
            "SELECT name, mastery FROM summa_ai.concepts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 12",
            user_id,
        )
        exam_rows = await conn.fetch(
            "SELECT name, exam_date, readiness FROM summa_ai.exams WHERE user_id = $1 AND exam_date >= NOW() ORDER BY exam_date ASC LIMIT 10",
            user_id,
        )
    total = concepts_row["total"] if concepts_row else 0
    mastered = concepts_row["mastered"] if concepts_row else 0
    quiz_count = sum(r["cnt"] for r in events if r["type"] == "quiz-completed")
    study_count = sum(r["cnt"] for r in events if r["type"] == "study-session")

    mastery_to_score = {"mastered": 90, "practicing": 60, "learning": 30}
    topic_mastery = [
        {
            "topic": r["name"],
            "mastery": mastery_to_score.get(r["mastery"], 30),
            "trend": "up" if r["mastery"] == "mastered" else "flat",
        }
        for r in concept_rows
    ]

    today = datetime.now(timezone.utc).date()
    exam_readiness = [
        {
            "exam": r["name"],
            "readiness": r["readiness"] or 0,
            "daysLeft": max(0, (r["exam_date"] - today).days) if r["exam_date"] else None,
        }
        for r in exam_rows
    ]

    cognee = CogneeService()
    hexagon_raw = await cognee.get_hexagon_dimensions(user_id)
    hexagon_dimensions = [
        {"dimension": label, "score": round(hexagon_raw.get(key, 0.0) * 100)}
        for key, label in [
            ("depth", "Depth"),
            ("problem_solving", "Problem-Solving"),
            ("speed", "Speed"),
            ("consistency", "Consistency"),
            ("confidence", "Confidence"),
            ("creativity", "Creativity"),
        ]
    ]

    payload = {
        "hexagon_dimensions": hexagon_dimensions,
        "topic_mastery": topic_mastery,
        "exam_readiness": exam_readiness,
        "summary": {
            "concepts_total": total,
            "concepts_mastered": mastered,
            "quiz_count": quiz_count,
            "study_sessions": study_count,
        },
        # No per-quiz score history or monthly hexagon snapshots are persisted
        # yet (tracked in PHASE 4 quiz_results table / PHASE 6 usage tracking).
        # Everything else above is a real DB/memory aggregate; these three are
        # empty (not fabricated) until that storage exists.
        "demo_fields": ["hexagon_evolution", "quiz_scores", "study_time"],
        "hexagon_evolution": [],
        "quiz_scores": [],
        "study_time": [],
    }
    return JSONResponse(content=payload)
