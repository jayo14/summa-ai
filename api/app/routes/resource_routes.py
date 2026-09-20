"""Resource routes — ingestion pipeline, search, and consent management."""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel, Field

from app.core.security import resolve_user_id
from app.services.data_store import DataStore
from app.services.db_pool import get_pool
from app.services.embedding_service import embed_batch

resource_router = APIRouter()
_store = DataStore()

CHUNK_SIZE = 500
CHUNK_OVERLAP = 100


class PermissionGrant(BaseModel):
    resource_id: str
    scope: str = Field(description="session, subject, always")


class ResourceSearchRequest(BaseModel):
    query: str
    limit: int = 5


def _chunk_text(text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    """Split text into overlapping chunks for better semantic continuity."""
    if not text:
        return []
    chunks = []
    start = 0
    while start < len(text):
        end = start + size
        chunks.append(text[start:end])
        start = end - overlap
        if start + overlap >= len(text):
            break
    return chunks if chunks else [text[:size]]


@resource_router.post("/materials/upload", status_code=201, summary="Upload resource material")
async def upload_material(file: UploadFile = File(...)):
    user_id = resolve_user_id()
    content = await file.read()
    filename = file.filename or "document.txt"

    # Parse document using format-aware parser
    try:
        from app.services.document_parser import DocumentParser

        result = DocumentParser.extract_text(filename, content)
        text = result.full_text
        sections = result.sections
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        import logging

        logging.getLogger(__name__).warning(
            "Document parsing failed, falling back to UTF-8: %s", exc
        )
        text = content.decode("utf-8", errors="ignore")
        sections = []

    # Create material entry
    mat_data = {
        "title": filename,
        "type": filename.rsplit(".", 1)[-1].upper() if "." in filename else "Document",
        "source": "Student Upload",
        "size": len(content),
        "status": "processing",
        "topic": "General",
    }
    mat = await _store.create_material(user_id, mat_data)

    # Build location-aware chunks from sections when available
    chunks: list[str] = []
    chunk_locations: list[str] = []

    if sections:
        for section in sections:
            section_chunks = _chunk_text(section.text)
            for idx, ch in enumerate(section_chunks):
                chunks.append(ch)
                if len(section_chunks) > 1:
                    chunk_locations.append(f"{section.location} (part {idx + 1})")
                else:
                    chunk_locations.append(section.location)
    else:
        chunks = _chunk_text(text) if text else [filename]
        chunk_locations = [f"Chunk {i + 1}" for i in range(len(chunks))]

    # Generate embeddings for all chunks
    embeddings = await embed_batch(chunks)
    embedded_count = sum(1 for e in embeddings if e is not None)

    # Store chunks with embeddings and location metadata
    chunk_ids = []
    try:
        pool = await get_pool()
        if pool is not None:
            async with pool.acquire() as conn:
                for idx, ch in enumerate(chunks):
                    chunk_id = await conn.fetchval(
                        """INSERT INTO summa_ai.resource_chunks (id, resource_id, user_id, chunk_text, location, embedding)
                           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
                           RETURNING id""",
                        mat["id"],
                        user_id,
                        ch,
                        chunk_locations[idx],
                        str(embeddings[idx]) if embeddings[idx] else None,
                    )
                    chunk_ids.append(str(chunk_id))
    except Exception as exc:
        import logging

        logging.getLogger(__name__).warning(
            "Chunk storage error: %s", exc, exc_info=True
        )

    status = "ready" if text.strip() else "error"
    await _store.update_material(mat["id"], user_id, {"status": status})
    mat["status"] = status
    mat["chunk_count"] = len(chunks)
    mat["embedded_count"] = embedded_count
    return mat


@resource_router.post("/resources/search", summary="Search student resources")
async def search_resources(req: ResourceSearchRequest) -> List[Dict[str, Any]]:
    user_id = resolve_user_id()

    # Try vector search first, fall back to ILIKE
    try:
        from app.services.vector_search import VectorSearchService
        vs = VectorSearchService()
        vector_results = await vs.search(req.query, user_id, limit=req.limit, min_score=0.3)
        if vector_results:
            return vector_results
    except Exception:
        pass

    # Fallback: ILIKE substring search
    results = []
    try:
        pool = await get_pool()
        if pool is not None:
            async with pool.acquire() as conn:
                rows = await conn.fetch(
                    """SELECT rc.*, m.title AS material_title
                       FROM summa_ai.resource_chunks rc
                       LEFT JOIN summa_ai.materials m ON m.id::text = rc.resource_id
                       WHERE rc.user_id = $1 AND rc.chunk_text ILIKE $2
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


class GroundingRequest(BaseModel):
    text: str
    query: str


@resource_router.post(
    "/resources/ground",
    summary="Ground a response with citations",
    description="Extract and validate citations from LLM output, linking back to source chunks",
)
async def ground_response(req: GroundingRequest) -> Dict[str, Any]:
    user_id = resolve_user_id()

    # Retrieve relevant chunks
    rag_chunks = []
    try:
        from app.services.vector_search import VectorSearchService
        vs = VectorSearchService()
        rag_chunks = await vs.search(req.query, user_id, limit=5, min_score=0.3)
    except Exception:
        pass

    if not rag_chunks:
        try:
            pool = await get_pool()
            if pool is not None:
                async with pool.acquire() as conn:
                    rows = await conn.fetch(
                        """SELECT rc.*, m.title AS material_title
                           FROM summa_ai.resource_chunks rc
                           LEFT JOIN summa_ai.materials m ON m.id::text = rc.resource_id
                           WHERE rc.user_id = $1 AND rc.chunk_text ILIKE $2
                           LIMIT 5""",
                        user_id,
                        f"%{req.query}%",
                    )
                    if rows:
                        rag_chunks = [dict(r) for r in rows]
        except Exception:
            pass

    from app.services.citation_grounding import CitationFormatter
    return CitationFormatter.ground_response(req.text, rag_chunks)
