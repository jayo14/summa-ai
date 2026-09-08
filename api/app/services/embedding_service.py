"""Embedding service using OpenAI text-embedding-3-small.

Generates vector embeddings for RAG semantic search. Caches results
in-memory to avoid re-embedding identical text.
"""

from __future__ import annotations

import hashlib
import logging
import time
from typing import Dict, List, Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMS = 1536
EMBEDDING_API_URL = "https://api.openai.com/v1/embeddings"

# In-memory cache: text_hash -> (embedding, timestamp)
_cache: Dict[str, tuple] = {}
_CACHE_TTL = 3600  # 1 hour
_CACHE_MAX = 5000  # max entries


def _cache_key(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()[:16]


def _get_cached(text: str) -> Optional[List[float]]:
    key = _cache_key(text)
    entry = _cache.get(key)
    if entry and (time.time() - entry[1]) < _CACHE_TTL:
        return entry[0]
    return None


def _set_cached(text: str, embedding: List[float]) -> None:
    if len(_cache) >= _CACHE_MAX:
        # Evict oldest 20%
        evict_count = _CACHE_MAX // 5
        oldest = sorted(_cache.items(), key=lambda x: x[1][1])[:evict_count]
        for k, _ in oldest:
            _cache.pop(k, None)
    _cache[_cache_key(text)] = (embedding, time.time())


async def embed_text(text: str) -> Optional[List[float]]:
    """Generate embedding for a single text string.

    Returns list of 1536 floats, or None on failure.
    """
    if not text or not text.strip():
        return None

    # Check cache
    cached = _get_cached(text)
    if cached is not None:
        return cached

    api_key = settings.OPENAI_API_KEY
    if not api_key:
        logger.warning("OPENAI_API_KEY not configured — cannot generate embeddings")
        return None

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                EMBEDDING_API_URL,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": EMBEDDING_MODEL,
                    "input": text[:8000],  # truncate to stay within token limits
                },
            )

            if resp.status_code != 200:
                logger.warning("Embedding API returned %d: %s", resp.status_code, resp.text[:200])
                return None

            data = resp.json()
            embedding = data["data"][0]["embedding"]

            if len(embedding) != EMBEDDING_DIMS:
                logger.warning("Unexpected embedding dims: %d (expected %d)", len(embedding), EMBEDDING_DIMS)
                return None

            _set_cached(text, embedding)
            return embedding

    except httpx.TimeoutException:
        logger.warning("Embedding API timeout for text length=%d", len(text))
        return None
    except Exception as exc:
        logger.warning("Embedding API error: %s", exc)
        return None


async def embed_batch(texts: List[str]) -> List[Optional[List[float]]]:
    """Generate embeddings for a batch of texts.

    OpenAI supports up to 2048 texts per call. This function batches
    automatically and returns one embedding per input text (or None on failure).
    """
    if not texts:
        return []

    api_key = settings.OPENAI_API_KEY
    if not api_key:
        logger.warning("OPENAI_API_KEY not configured — cannot generate embeddings")
        return [None] * len(texts)

    # Check cache first, separate cached vs uncached
    results: List[Optional[List[float]]] = [None] * len(texts)
    uncached_indices: List[int] = []
    uncached_texts: List[str] = []

    for i, text in enumerate(texts):
        if not text or not text.strip():
            continue
        cached = _get_cached(text)
        if cached is not None:
            results[i] = cached
        else:
            uncached_indices.append(i)
            uncached_texts.append(text[:8000])

    if not uncached_texts:
        return results

    # Batch in chunks of 2048
    BATCH_SIZE = 2048
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            for batch_start in range(0, len(uncached_texts), BATCH_SIZE):
                batch_texts = uncached_texts[batch_start:batch_start + BATCH_SIZE]
                batch_indices = uncached_indices[batch_start:batch_start + BATCH_SIZE]

                resp = await client.post(
                    EMBEDDING_API_URL,
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": EMBEDDING_MODEL,
                        "input": batch_texts,
                    },
                )

                if resp.status_code != 200:
                    logger.warning("Batch embedding API returned %d: %s", resp.status_code, resp.text[:200])
                    continue

                data = resp.json()
                # OpenAI returns embeddings in order
                for j, item in enumerate(data["data"]):
                    embedding = item["embedding"]
                    orig_idx = batch_indices[j]
                    results[orig_idx] = embedding
                    _set_cached(texts[orig_idx], embedding)

    except Exception as exc:
        logger.warning("Batch embedding API error: %s", exc)

    return results
