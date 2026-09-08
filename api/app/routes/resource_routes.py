"""Resource routes — ingestion pipeline, search, and consent management."""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel, Field

from app.core.security import resolve_user_id
from app.services.data_store import DataStore
from app.services.db_pool import get_pool

resource_router = APIRouter()
_store = DataStore()


class PermissionGrant(BaseModel):
    resource_id: str
    scope: str = Field(description="session, subject, always")


class ResourceSearchRequest(BaseModel):
    query: str
    limit: int = 5


@resource_router.post("/materials/upload", status_code=201, summary="Upload resource material")
async def upload_material(file: UploadFile = File(...)):
    user_id = resolve_user_id()
    content = await file.read()
    text = content.decode("utf-8", errors="ignore")

    # Create material entry
    mat_data = {
        "title": file.filename,
        "type": file.filename.split(".")[-1].upper() if "." in file.filename else "Document",
        "source": "Student Upload",
        "size": len(content),
        "status": "processing",
        "topic": "General",
    }
    mat = await _store.create_material(user_id, mat_data)

    # Simple chunking into 500 char blocks
    chunks = [text[i:i+500] for i in range(0, len(text), 500)] if text else [file.filename]
    
    try:
        pool = await get_pool()
        if pool is not None:
            async with pool.acquire() as conn:
                for idx, ch in enumerate(chunks):
                    await conn.execute(
                        """INSERT INTO summa_ai.resource_chunks (id, resource_id, user_id, chunk_text, location)
                           VALUES (gen_random_uuid(), $1, $2, $3, $4)""",
                        mat["id"],
                        user_id,
                        ch,
                        f"Chunk {idx + 1}",
                    )
    except Exception:
        pass

    await _store.update_material(mat["id"], user_id, {"status": "ready"})
    mat["status"] = "ready"
    return mat


@resource_router.post("/resources/search", summary="Search student resources")
async def search_resources(req: ResourceSearchRequest) -> List[Dict[str, Any]]:
    user_id = resolve_user_id()
    results = []
    
    try:
        pool = await get_pool()
        if pool is not None:
            async with pool.acquire() as conn:
                rows = await conn.fetch(
                    """SELECT * FROM summa_ai.resource_chunks
                       WHERE user_id = $1 AND chunk_text ILIKE $2
                       LIMIT $3""",
                    user_id,
                    f"%{req.query}%",
                    req.limit,
                )
                if rows:
                    results = [dict(r) for r in rows]
    except Exception:
        pass

    return results


@resource_router.post("/resources/permissions", summary="Grant resource permission")
async def grant_permission(grant: PermissionGrant) -> Dict[str, Any]:
    user_id = resolve_user_id()
    now = datetime.now(timezone.utc)

    try:
        pool = await get_pool()
        if pool is not None:
            async with pool.acquire() as conn:
                await conn.execute(
                    """INSERT INTO summa_ai.resource_permissions (id, user_id, resource_id, scope, granted_at)
                       VALUES (gen_random_uuid(), $1, $2, $3, $4)
                       ON CONFLICT (user_id, resource_id, scope) DO NOTHING""",
                    user_id,
                    grant.resource_id,
                    grant.scope,
                    now,
                )
    except Exception:
        pass

    return {"status": "success", "resource_id": grant.resource_id, "scope": grant.scope}
