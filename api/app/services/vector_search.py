"""Vector search service for RAG semantic retrieval.

Searches student-uploaded material chunks using pgvector cosine similarity.
Returns relevant chunks with metadata for source-grounded LLM responses.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from app.services.db_pool import get_pool
from app.services.embedding_service import embed_text

logger = logging.getLogger(__name__)


class VectorSearchService:
    """Semantic search over student material chunks using pgvector."""

    async def search(
        self,
        query: str,
        user_id: str,
        limit: int = 5,
        min_score: float = 0.3,
    ) -> List[Dict[str, Any]]:
        """Find the most relevant material chunks for a query.

        Args:
            query: The student's search query
            user_id: Only search this student's materials
            limit: Max chunks to return
            min_score: Minimum cosine similarity (0-1) to include

        Returns:
            List of dicts with: id, chunk_text, resource_id, material_title,
            location, score (similarity 0-1)
        """
        # Embed the query
        query_embedding = await embed_text(query)
        if query_embedding is None:
            logger.debug("Vector search skipped: could not embed query")
            return []

        pool = await get_pool()
        if pool is None:
            logger.warning("Vector search skipped: no DB pool")
            return []

        try:
            async with pool.acquire() as conn:
                # pgvector cosine distance: 1 - cosine_similarity
                # So lower distance = more similar. We filter by min_score.
                rows = await conn.fetch(
                    """
                    SELECT
                        rc.id,
                        rc.chunk_text,
                        rc.resource_id,
                        rc.location,
                        m.title AS material_title,
                        m.topic AS material_topic,
                        1 - (rc.embedding <=> $1::vector) AS score
                    FROM summa_ai.resource_chunks rc
                    LEFT JOIN summa_ai.materials m
                        ON m.id::text = rc.resource_id
                    WHERE rc.user_id = $2
                      AND rc.embedding IS NOT NULL
                      AND 1 - (rc.embedding <=> $1::vector) >= $3
                    ORDER BY rc.embedding <=> $1::vector
                    LIMIT $4
                    """,
                    str(query_embedding),
                    user_id,
                    min_score,
                    limit,
                )

                results = [dict(r) for r in rows]
                if results:
                    logger.info(
                        "Vector search: %d chunks found for user=%s query_len=%d (top score=%.3f)",
                        len(results), user_id, len(query), results[0]["score"],
                    )
                else:
                    logger.debug("Vector search: 0 chunks for user=%s query_len=%d", user_id, len(query))
                return results

        except Exception as exc:
            logger.warning("Vector search error: %s", exc, exc_info=True)
            return []

    async def search_for_chat(
        self,
        query: str,
        user_id: str,
        limit: int = 5,
        min_score: float = 0.25,
    ) -> List[Dict[str, Any]]:
        """Search with relaxed threshold for chat context injection.

        Uses a lower min_score (0.25) to cast a wider net — the LLM can
        decide relevance better than a strict threshold.
        """
        return await self.search(query, user_id, limit=limit, min_score=min_score)

    async def chunk_has_embedding(self, chunk_id: str) -> bool:
        """Check if a chunk already has an embedding (for idempotent uploads)."""
        pool = await get_pool()
        if pool is None:
            return False
        try:
            async with pool.acquire() as conn:
                result = await conn.fetchval(
                    "SELECT embedding IS NOT NULL FROM summa_ai.resource_chunks WHERE id = $1",
                    chunk_id,
                )
                return bool(result)
        except Exception:
            return False
