"""Artifacts, Conversations, Timeline, User, Settings, Materials, Concepts, Analytics routes."""
import uuid
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.models.artifact import ArtifactCreate, ArtifactUpdate, ArtifactVersionRestore
from app.models.chat import ConversationCreate, MessageCreate
from app.models.timeline import TimelineEventCreate, MaterialCreate, ConceptCreate
from app.core.security import resolve_user_id
from app.services.user_store import UserStore

# ========== ARTIFACTS ==========
artifacts_router = APIRouter()
_art_store: dict = {}

def _new_artifact(user_id: str, data: ArtifactCreate) -> dict:
    now = datetime.utcnow()
    aid = f"art-{uuid.uuid4().hex[:16]}"
    return {"id": aid, "user_id": user_id, "conversation_id": data.conversation_id, "title": data.title, "type": data.type, "source": data.source, "source_label": data.source_label, "parent_artifact_id": data.parent_artifact_id, "current_version": 1, "archived": False, "pinned": False, "created_at": now, "updated_at": now, "versions": [{"id": f"ver-{uuid.uuid4().hex[:8]}", "artifact_id": aid, "version": 1, "component": data.component, "change_note": data.change_note, "created_at": now}]}

@artifacts_router.get("/artifacts", summary="List artifacts", description="Get artifacts for a user, filterable by type and pinned status")
async def get_artifacts(user_id: str = Query(default="demo"), type: Optional[str] = None, pinned: Optional[bool] = None, archived: bool = False):
    user_id = resolve_user_id()
    items = [a for a in _art_store.values() if a["user_id"] == user_id and a["archived"] == archived]
    if type: items = [a for a in items if a["type"] == type]
    if pinned is not None: items = [a for a in items if a["pinned"] == pinned]
    return sorted(items, key=lambda a: a["updated_at"], reverse=True)

@artifacts_router.post("/artifacts", status_code=201, summary="Create artifact", description="Create a new artifact for a user")
async def create_artifact(data: ArtifactCreate, user_id: str = Query(default="demo")):
    user_id = resolve_user_id()
    a = _new_artifact(user_id, data); _art_store[a["id"]] = a; return a

@artifacts_router.get("/artifacts/{aid}", summary="Get artifact", description="Get a specific artifact by ID")
async def get_artifact(aid: str):
    resolve_user_id()
    if aid not in _art_store: raise HTTPException(404, "Not found")
    return _art_store[aid]

@artifacts_router.patch("/artifacts/{aid}", summary="Update artifact", description="Update an artifact's metadata, pin status, archive status, or component")
async def update_artifact(aid: str, data: ArtifactUpdate):
    resolve_user_id()
    if aid not in _art_store: raise HTTPException(404, "Not found")
    a = _art_store[aid]
    if data.component:
        nv = a["current_version"] + 1
        a["versions"].append({"id": f"ver-{uuid.uuid4().hex[:8]}", "artifact_id": aid, "version": nv, "component": data.component, "change_note": data.change_note, "created_at": datetime.utcnow()})
        a["current_version"] = nv; a["type"] = data.component.get("type", a["type"])
    if data.title is not None: a["title"] = data.title
    if data.archived is not None: a["archived"] = data.archived
    if data.pinned is not None: a["pinned"] = data.pinned
    a["updated_at"] = datetime.utcnow(); return a

@artifacts_router.delete("/artifacts/{aid}", summary="Delete artifact", description="Permanently delete an artifact by ID")
async def delete_artifact(aid: str):
    resolve_user_id()
    if aid not in _art_store: raise HTTPException(404, "Not found")
    del _art_store[aid]; return {"status": "success"}

@artifacts_router.post("/artifacts/{aid}/pin", summary="Toggle artifact pin", description="Toggle the pinned state of an artifact")
async def pin_artifact(aid: str):
    resolve_user_id()
    if aid not in _art_store: raise HTTPException(404, "Not found")
    _art_store[aid]["pinned"] = not _art_store[aid]["pinned"]; _art_store[aid]["updated_at"] = datetime.utcnow(); return _art_store[aid]

@artifacts_router.post("/artifacts/{aid}/versions", summary="Restore version", description="Restore a previous version of an artifact, creating a new version entry")
async def restore_version(aid: str, data: ArtifactVersionRestore):
    resolve_user_id()
    if aid not in _art_store: raise HTTPException(404, "Not found")
    a = _art_store[aid]
    old = next((v for v in a["versions"] if v["version"] == data.version), None)
    if not old: raise HTTPException(404, "Version not found")
    nv = a["current_version"] + 1
    a["versions"].append({"id": f"ver-{uuid.uuid4().hex[:8]}", "artifact_id": aid, "version": nv, "component": old["component"], "change_note": f"Restored from v{data.version}", "created_at": datetime.utcnow()})
    a["current_version"] = nv; a["updated_at"] = datetime.utcnow(); return a

# ========== CONVERSATIONS ==========
conv_router = APIRouter()
_convs: dict = {}; _msgs: dict = {}

@conv_router.get("/conversations", summary="List conversations", description="Get all non-archived conversations for a user")
async def get_conversations(user_id: str = Query(default="demo")):
    user_id = resolve_user_id()
    return sorted([c for c in _convs.values() if c["user_id"] == user_id and not c.get("archived")], key=lambda c: c["updated_at"], reverse=True)

@conv_router.post("/conversations", status_code=201, summary="Create conversation", description="Create a new conversation for a user")
async def create_conversation(data: ConversationCreate, user_id: str = Query(default="demo")):
    user_id = resolve_user_id()
    now = datetime.utcnow()
    c = {"id": f"conv-{uuid.uuid4().hex[:16]}", "user_id": user_id, "title": data.title, "snippet": data.snippet, "archived": False, "created_at": now, "updated_at": now}
    _convs[c["id"]] = c; _msgs[c["id"]] = []; return c

@conv_router.get("/conversations/{cid}", summary="Get conversation", description="Get a specific conversation by ID")
async def get_conversation(cid: str):
    resolve_user_id()
    if cid not in _convs: raise HTTPException(404, "Not found")
    return _convs[cid]

@conv_router.get("/conversations/{cid}/messages", summary="Get messages", description="Get all messages for a specific conversation")
async def get_messages(cid: str):
    resolve_user_id()
    if cid not in _convs: raise HTTPException(404, "Not found")
    return _msgs.get(cid, [])

@conv_router.post("/conversations/{cid}/messages", status_code=201, summary="Add message", description="Add a message to a conversation")
async def add_message(cid: str, data: MessageCreate):
    resolve_user_id()
    if cid not in _convs: raise HTTPException(404, "Not found")
    msg = {"id": f"msg-{uuid.uuid4().hex[:16]}", "conversation_id": cid, "role": data.role, "content": data.content, "reasoning": data.reasoning, "components": data.components, "created_at": datetime.utcnow()}
    _msgs.setdefault(cid, []).append(msg)
    _convs[cid]["snippet"] = data.content[:100]; _convs[cid]["updated_at"] = datetime.utcnow(); return msg

@conv_router.delete("/conversations/{cid}", summary="Delete conversation", description="Permanently delete a conversation and its messages")
async def delete_conversation(cid: str):
    resolve_user_id()
    if cid not in _convs: raise HTTPException(404, "Not found")
    del _convs[cid]; _msgs.pop(cid, None); return {"status": "success"}

# ========== TIMELINE ==========
timeline_router = APIRouter()
_events: dict = {}
def _seed_timeline():
    for i, (t, title, desc) in enumerate([("streak","7-day study streak!","You studied every day for a week."),("quiz-completed","Completed: NLP Quiz","Scored 85%."),("artifact-generated","Generated: Flashcards","12 cards created."),("study-session","Study session: NLP","45 minutes."),("resource-uploaded","Uploaded: Paper","PDF processed."),("milestone","Milestone: 100 concepts","Incredible!"),("recommendation","AI Recommendation","Review Attention."),("reminder","Exam reminder","NLP Final in 14 days.")]):
        _events[f"evt-{i}"] = {"id": f"evt-{i}", "user_id": "demo", "type": t, "title": title, "description": desc, "metadata": None, "created_at": datetime.utcnow() - timedelta(hours=i*6)}
_seed_timeline()

@timeline_router.get("/timeline", summary="Get timeline", description="Get timeline events for a user, up to a limit of 200")
async def get_timeline(user_id: str = Query(default="demo"), limit: int = Query(default=50, le=200)):
    user_id = resolve_user_id()
    return sorted([e for e in _events.values() if e["user_id"] == user_id], key=lambda e: e["created_at"], reverse=True)[:limit]

@timeline_router.post("/timeline", status_code=201, summary="Create timeline event", description="Create a new timeline event for a user")
async def create_timeline_event(data: TimelineEventCreate, user_id: str = Query(default="demo")):
    user_id = resolve_user_id()
    eid = f"evt-{uuid.uuid4().hex[:16]}"
    _events[eid] = {"id": eid, "user_id": user_id, "type": data.type, "title": data.title, "description": data.description, "metadata": data.metadata, "created_at": datetime.utcnow()}; return _events[eid]

# ========== USER ==========
user_router = APIRouter()
_store = UserStore()

@user_router.get("/user", summary="Get user profile", description="Get the current user's profile information")
async def get_user():
    user_id = resolve_user_id()
    current = await _store.get_user_by_id(user_id)
    if current is None:
        raise HTTPException(404, "Not found")
    return _store.serialize_user(current)

@user_router.patch("/user", summary="Update user profile", description="Update the current user's profile information")
async def update_user(data: dict):
    user_id = resolve_user_id()
    updated = await _store.update_user(user_id, data)
    return _store.serialize_user(updated)

# ========== SETTINGS ==========
settings_router = APIRouter()

@settings_router.get("/settings", summary="Get settings", description="Get the current user's application settings")
async def get_settings():
    user_id = resolve_user_id()
    pool = await _store._get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM summa_ai.settings WHERE user_id = $1", user_id)
    if row:
        return dict(row)
    return {"user_id": user_id}

@settings_router.patch("/settings", summary="Update settings", description="Update the current user's application settings")
async def update_settings(data: dict):
    user_id = resolve_user_id()
    pool = await _store._get_pool()
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
_mats: dict = {}
for i, (t, title, src) in enumerate([("pdf","Speech and Language Processing","Jurafsky"),("video","CS224N Lecture 8","YouTube"),("pdf","Attention is All You Need","arxiv"),("webpage","Illustrated Transformer","jalammar"),("notes","Calculus II Notes","Manual")]):
    _mats[f"mat-{i}"] = {"id": f"mat-{i}", "user_id": "demo", "type": t, "title": title, "source": src, "size": None, "duration": None, "concepts_extracted": 10+i*5, "status": "processed", "created_at": datetime.utcnow()}

@materials_router.get("/materials", summary="List materials", description="Get all learning materials for the user")
async def get_materials():
    resolve_user_id()
    return list(_mats.values())

@materials_router.post("/materials", status_code=201, summary="Create material", description="Upload/create a new learning material")
async def create_material(data: MaterialCreate):
    resolve_user_id()
    mid = f"mat-{uuid.uuid4().hex[:16]}"
    _mats[mid] = {"id": mid, "user_id": "demo", "type": data.type, "title": data.title, "source": data.source, "size": data.size, "duration": data.duration, "concepts_extracted": 0, "status": "processing", "created_at": datetime.utcnow()}; return _mats[mid]

@materials_router.delete("/materials/{mid}", summary="Delete material", description="Permanently delete a learning material by ID")
async def delete_material(mid: str):
    resolve_user_id()
    if mid not in _mats: raise HTTPException(404, "Not found")
    del _mats[mid]; return {"status": "success"}

# ========== CONCEPTS ==========
concepts_router = APIRouter()
_concepts: dict = {}
for i, (name, cat, mas, rel) in enumerate([("Self-Attention","NLP","learning",6),("Word2Vec","NLP","mastered",4),("GloVe","NLP","struggling",3),("Backprop","Deep Learning","mastered",8),("Transformers","NLP","gap",12),("Integration","Calculus","mastered",2),("Eigenvalues","Linear Algebra","mastered",5),("Multi-Head Attention","NLP","gap",7)]):
    _concepts[f"cpt-{i}"] = {"id": f"cpt-{i}", "user_id": "demo", "name": name, "category": cat, "mastery": mas, "related_count": rel, "material_id": None, "created_at": datetime.utcnow()}

@concepts_router.get("/concepts", summary="List concepts", description="Get all learning concepts for the user")
async def get_concepts():
    resolve_user_id()
    return list(_concepts.values())

@concepts_router.post("/concepts", status_code=201, summary="Create concept", description="Create a new learning concept for the user")
async def create_concept(data: ConceptCreate):
    resolve_user_id()
    cid = f"cpt-{uuid.uuid4().hex[:16]}"
    _concepts[cid] = {"id": cid, "user_id": "demo", "name": data.name, "category": data.category, "mastery": data.mastery, "material_id": data.material_id, "related_count": data.related_count, "created_at": datetime.utcnow()}; return _concepts[cid]

@concepts_router.delete("/concepts/{cid}", summary="Delete concept", description="Permanently delete a learning concept by ID")
async def delete_concept(cid: str):
    resolve_user_id()
    if cid not in _concepts: raise HTTPException(404, "Not found")
    del _concepts[cid]; return {"status": "success"}

# ========== ANALYTICS ==========
analytics_router = APIRouter()

@analytics_router.get("/analytics", summary="Get analytics", description="Get aggregated learning analytics and insights for the user")
async def get_analytics():
    resolve_user_id()
    return {
        "hexagon_dimensions": [{"label":"Depth","score":78},{"label":"Problem-Solving","score":65},{"label":"Speed","score":42},{"label":"Consistency","score":80},{"label":"Confidence","score":55},{"label":"Creativity","score":70}],
        "hexagon_evolution": [{"month":"Jan","Depth":45,"Problem-Solving":38,"Speed":30,"Consistency":50,"Confidence":35,"Creativity":40},{"month":"Feb","Depth":55,"Problem-Solving":45,"Speed":35,"Consistency":58,"Confidence":42,"Creativity":48},{"month":"Mar","Depth":65,"Problem-Solving":55,"Speed":38,"Consistency":65,"Confidence":50,"Creativity":55},{"month":"Apr","Depth":78,"Problem-Solving":65,"Speed":42,"Consistency":80,"Confidence":55,"Creativity":70}],
        "quiz_scores": [{"date":"Apr 1","score":65,"topic":"LA"},{"date":"Apr 8","score":72,"topic":"Calc"},{"date":"Apr 15","score":85,"topic":"NLP"},{"date":"Apr 22","score":60,"topic":"Prob"},{"date":"Apr 29","score":88,"topic":"Embed"},{"date":"May 6","score":92,"topic":"LA"},{"date":"May 13","score":78,"topic":"Attn"}],
        "study_time": [{"topic":"NLP","hours":12},{"topic":"Calculus","hours":6},{"topic":"LA","hours":4},{"topic":"Prob","hours":3},{"topic":"Music","hours":2}],
        "topic_mastery": [{"topic":"LA","mastery":92,"trend":"up"},{"topic":"Prob","mastery":85,"trend":"up"},{"topic":"Embed","mastery":75,"trend":"up"},{"topic":"RNN","mastery":60,"trend":"up"},{"topic":"Attention","mastery":45,"trend":"up"},{"topic":"Transformers","mastery":20,"trend":"down"}],
        "exam_readiness": [{"exam":"NLP Final","readiness":62,"daysLeft":14},{"exam":"DL Final","readiness":78,"daysLeft":17},{"exam":"Calc II","readiness":88,"daysLeft":21}],
        "summary": {"avg_quiz_score":77,"total_study_hours":27,"avg_exam_readiness":76,"quizzes_taken":7,"insight":"Your Speed is lagging (42 vs avg 65). Add timed quizzes. NLP Final in 14 days."},
    }
