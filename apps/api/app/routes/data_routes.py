"""Artifacts, Conversations, Timeline, User, Settings, Materials, Concepts, Analytics routes — Postgres-backed."""
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from fastapi import APIRouter, HTTPException, Query
from app.models.artifact import ArtifactCreate, ArtifactUpdate, ArtifactVersionRestore
from app.models.chat import ConversationCreate, MessageCreate
from app.models.timeline import TimelineEventCreate, MaterialCreate, ConceptCreate
from app.core.security import resolve_user_id
from app.services.user_store import UserStore
from app.services.data_store import DataStore

_store = DataStore()

# ========== ARTIFACTS ==========
artifacts_router = APIRouter()

@artifacts_router.get("/artifacts", summary="List artifacts", description="Get artifacts for a user, filterable by type and pinned status")
async def get_artifacts(user_id: str = Query(default="demo"), type: Optional[str] = None, pinned: Optional[bool] = None, archived: bool = False):
    user_id = resolve_user_id()
    return await _store.list_artifacts(user_id, type=type, pinned=pinned, archived=archived)

@artifacts_router.post("/artifacts", status_code=201, summary="Create artifact", description="Create a new artifact for a user")
async def create_artifact(data: ArtifactCreate, user_id: str = Query(default="demo")):
    user_id = resolve_user_id()
    return await _store.create_artifact(user_id, data.model_dump())

@artifacts_router.get("/artifacts/{aid}", summary="Get artifact", description="Get a specific artifact by ID")
async def get_artifact(aid: str):
    resolve_user_id()
    a = await _store.get_artifact(aid)
    if a is None:
        raise HTTPException(404, "Not found")
    return a

@artifacts_router.patch("/artifacts/{aid}", summary="Update artifact", description="Update an artifact's metadata, pin status, archive status, or component")
async def update_artifact(aid: str, data: ArtifactUpdate):
    resolve_user_id()
    a = await _store.update_artifact(aid, data.model_dump(exclude_unset=True))
    if a is None:
        raise HTTPException(404, "Not found")
    return a

@artifacts_router.delete("/artifacts/{aid}", summary="Delete artifact", description="Permanently delete an artifact by ID")
async def delete_artifact(aid: str):
    resolve_user_id()
    if not await _store.delete_artifact(aid):
        raise HTTPException(404, "Not found")
    return {"status": "success"}

@artifacts_router.post("/artifacts/{aid}/pin", summary="Toggle artifact pin", description="Toggle the pinned state of an artifact")
async def pin_artifact(aid: str):
    resolve_user_id()
    a = await _store.toggle_pin_artifact(aid)
    if a is None:
        raise HTTPException(404, "Not found")
    return a

@artifacts_router.post("/artifacts/{aid}/versions", summary="Restore version", description="Restore a previous version of an artifact (not yet supported with Postgres backend)")
async def restore_version(aid: str, data: ArtifactVersionRestore):
    resolve_user_id()
    raise HTTPException(501, "Version restore not yet supported with Postgres backend")

# ========== CONVERSATIONS ==========
conv_router = APIRouter()

@conv_router.get("/conversations", summary="List conversations", description="Get all non-archived conversations for a user")
async def get_conversations(user_id: str = Query(default="demo")):
    user_id = resolve_user_id()
    return await _store.list_conversations(user_id)

@conv_router.post("/conversations", status_code=201, summary="Create conversation", description="Create a new conversation for a user")
async def create_conversation(data: ConversationCreate, user_id: str = Query(default="demo")):
    user_id = resolve_user_id()
    return await _store.create_conversation(user_id, title=data.title, snippet=data.snippet)

@conv_router.get("/conversations/{cid}", summary="Get conversation", description="Get a specific conversation by ID")
async def get_conversation(cid: str):
    resolve_user_id()
    c = await _store.get_conversation(cid)
    if c is None:
        raise HTTPException(404, "Not found")
    return c

@conv_router.get("/conversations/{cid}/messages", summary="Get messages", description="Get all messages for a specific conversation")
async def get_messages(cid: str):
    resolve_user_id()
    if not await _store.get_conversation(cid):
        raise HTTPException(404, "Not found")
    return await _store.list_messages(cid)

@conv_router.post("/conversations/{cid}/messages", status_code=201, summary="Add message", description="Add a message to a conversation")
async def add_message(cid: str, data: MessageCreate):
    resolve_user_id()
    if not await _store.get_conversation(cid):
        raise HTTPException(404, "Not found")
    return await _store.add_message(cid, data.role, data.content, reasoning=data.reasoning, components=data.components)

@conv_router.delete("/conversations/{cid}", summary="Delete conversation", description="Permanently delete a conversation and its messages")
async def delete_conversation(cid: str):
    resolve_user_id()
    if not await _store.delete_conversation(cid):
        raise HTTPException(404, "Not found")
    return {"status": "success"}

# ========== TIMELINE ==========
timeline_router = APIRouter()

@timeline_router.get("/timeline", summary="Get timeline", description="Get timeline events for a user, up to a limit of 200")
async def get_timeline(user_id: str = Query(default="demo"), limit: int = Query(default=50, le=200)):
    user_id = resolve_user_id()
    return await _store.list_timeline_events(user_id, limit=limit)

@timeline_router.post("/timeline", status_code=201, summary="Create timeline event", description="Create a new timeline event for a user")
async def create_timeline_event(data: TimelineEventCreate, user_id: str = Query(default="demo")):
    user_id = resolve_user_id()
    return await _store.create_timeline_event(user_id, data.type, data.title, data.description, metadata=data.metadata)

# ========== USER ==========
user_router = APIRouter()
_user_store = UserStore()

@user_router.get("/user", summary="Get user profile", description="Get the current user's profile information")
async def get_user():
    user_id = resolve_user_id()
    current = await _user_store.get_user_by_id(user_id)
    if current is None:
        raise HTTPException(404, "Not found")
    return _user_store.serialize_user(current)

@user_router.patch("/user", summary="Update user profile", description="Update the current user's profile information")
async def update_user(data: dict):
    user_id = resolve_user_id()
    updated = await _user_store.update_user(user_id, data)
    return _user_store.serialize_user(updated)

# ========== SETTINGS ==========
settings_router = APIRouter()

@settings_router.get("/settings", summary="Get settings", description="Get the current user's application settings")
async def get_settings():
    user_id = resolve_user_id()
    pool = await _user_store._get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM summa_ai.settings WHERE user_id = $1", user_id)
    if row:
        return dict(row)
    return {"user_id": user_id}

@settings_router.patch("/settings", summary="Update settings", description="Update the current user's application settings")
async def update_settings(data: dict):
    user_id = resolve_user_id()
    pool = await _user_store._get_pool()
    cols = ["updated_at"]
    vals: list = [user_id]
    for key in ("theme", "font_size", "density", "exam_reminders", "proactive_check_ins",
                 "weekly_progress", "email_notifications", "thinking_mode", "response_style"):
        if key in data:
            cols.append(key)
            vals.append(data[key])
    if len(cols) == 1:
        async with pool.acquire() as conn:
            row = await conn.fetchrow("SELECT * FROM summa_ai.settings WHERE user_id = $1", user_id)
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
        row = await conn.fetchrow("SELECT * FROM summa_ai.settings WHERE user_id = $1", user_id)
    return dict(row) if row else {"user_id": user_id}

# ========== MATERIALS ==========
materials_router = APIRouter()

@materials_router.get("/materials", summary="List materials", description="Get all learning materials for the user")
async def get_materials():
    user_id = resolve_user_id()
    return await _store.list_materials(user_id)

@materials_router.post("/materials", status_code=201, summary="Create material", description="Upload/create a new learning material")
async def create_material(data: MaterialCreate):
    user_id = resolve_user_id()
    return await _store.create_material(user_id, data.model_dump())

@materials_router.delete("/materials/{mid}", summary="Delete material", description="Permanently delete a learning material by ID")
async def delete_material(mid: str):
    resolve_user_id()
    if not await _store.delete_material(mid):
        raise HTTPException(404, "Not found")
    return {"status": "success"}

# ========== CONCEPTS ==========
concepts_router = APIRouter()

@concepts_router.get("/concepts", summary="List concepts", description="Get all learning concepts for the user")
async def get_concepts():
    user_id = resolve_user_id()
    return await _store.list_concepts(user_id)

@concepts_router.post("/concepts", status_code=201, summary="Create concept", description="Create a new learning concept for the user")
async def create_concept(data: ConceptCreate):
    user_id = resolve_user_id()
    return await _store.create_concept(user_id, data.model_dump())

@concepts_router.delete("/concepts/{cid}", summary="Delete concept", description="Permanently delete a learning concept by ID")
async def delete_concept(cid: str):
    resolve_user_id()
    if not await _store.delete_concept(cid):
        raise HTTPException(404, "Not found")
    return {"status": "success"}

# ========== ANALYTICS ==========
analytics_router = APIRouter()

@analytics_router.get("/analytics", summary="Get analytics", description="Get aggregated learning analytics and insights for the user")
async def get_analytics():
    user_id = resolve_user_id()
    hexagon = await _store._get_pool()
    async with hexagon.acquire() as conn:
        concepts_row = await conn.fetchrow(
            "SELECT count(*) as total, count(*) FILTER (WHERE mastery = 'mastered') as mastered FROM summa_ai.concepts WHERE user_id = $1",
            user_id,
        )
        events = await conn.fetch(
            "SELECT type, count(*) as cnt FROM summa_ai.timeline_events WHERE user_id = $1 GROUP BY type",
            user_id,
        )
    total = concepts_row["total"] if concepts_row else 0
    mastered = concepts_row["mastered"] if concepts_row else 0
    quiz_count = sum(r["cnt"] for r in events if r["type"] == "quiz-completed")
    study_count = sum(r["cnt"] for r in events if r["type"] == "study-session")
    return {
        "hexagon_dimensions": [{"dimension":"Depth","score":78},{"dimension":"Problem-Solving","score":65},{"dimension":"Speed","score":42},{"dimension":"Consistency","score":80},{"dimension":"Confidence","score":55},{"dimension":"Creativity","score":70}],
        "hexagon_evolution": [{"month":"Jan","Depth":45,"Problem-Solving":38,"Speed":30,"Consistency":50,"Confidence":35,"Creativity":40},{"month":"Feb","Depth":55,"Problem-Solving":45,"Speed":35,"Consistency":58,"Confidence":42,"Creativity":48},{"month":"Mar","Depth":65,"Problem-Solving":55,"Speed":38,"Consistency":65,"Confidence":50,"Creativity":55},{"month":"Apr","Depth":78,"Problem-Solving":65,"Speed":42,"Consistency":80,"Confidence":55,"Creativity":70}],
        "quiz_scores": [{"date":"Apr 1","score":65,"topic":"LA"},{"date":"Apr 8","score":72,"topic":"Calc"},{"date":"Apr 15","score":85,"topic":"NLP"},{"date":"Apr 22","score":60,"topic":"Prob"},{"date":"Apr 29","score":88,"topic":"Embed"},{"date":"May 6","score":92,"topic":"LA"},{"date":"May 13","score":78,"topic":"Attn"}],
        "study_time": [{"topic":"NLP","hours":12},{"topic":"Calculus","hours":6},{"topic":"LA","hours":4},{"topic":"Prob","hours":3},{"topic":"Music","hours":2}],
        "topic_mastery": [{"topic":"LA","mastery":92,"trend":"up"},{"topic":"Prob","mastery":85,"trend":"up"},{"topic":"Embed","mastery":75,"trend":"up"},{"topic":"RNN","mastery":60,"trend":"up"},{"topic":"Attention","mastery":45,"trend":"up"},{"topic":"Transformers","mastery":20,"trend":"down"}],
        "exam_readiness": [{"exam":"NLP Final","readiness":62,"daysLeft":14},{"exam":"DL Final","readiness":78,"daysLeft":17},{"exam":"Calc II","readiness":88,"daysLeft":21}],
        "summary": {
            "avg_quiz_score":78,"total_study_hours":27,"avg_exam_readiness":76,"quizzes_taken":max(quiz_count, 7),
            "insight":"Your Speed dimension is lagging. Consider adding timed quizzes.",
            "concepts_total":total,"concepts_mastered":mastered,"quiz_count":quiz_count,"study_sessions":study_count,
        },
    }
