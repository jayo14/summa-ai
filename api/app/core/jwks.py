"""JWKS fetching and caching for asymmetric Supabase JWT verification (RS256/ES256)."""

import logging
import time
from typing import Any, Dict, Optional
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

_jwks_cache: Optional[Dict[str, Any]] = None
_jwks_cached_at: float = 0.0
JWKS_CACHE_TTL_SECONDS: float = 600.0  # 10 minutes cache TTL
JWKS_MAX_STALENESS_SECONDS: float = 86400.0  # 24 hours — after this, reject all asymmetric tokens


async def fetch_jwks() -> Optional[Dict[str, Any]]:
    """Fetch Supabase's public JWKS and cache it with a TTL.

    If the cache is older than JWKS_MAX_STALENESS_SECONDS and the network
    fails, the cache is cleared so stale keys cannot be used indefinitely.
    """
    global _jwks_cache, _jwks_cached_at
    now = time.time()
    if _jwks_cache is not None and (now - _jwks_cached_at) < JWKS_CACHE_TTL_SECONDS:
        return _jwks_cache

    if not settings.SUPABASE_URL:
        return None

    jwks_url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/.well-known/jwks.json"
    try:
        async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as client:
            resp = await client.get(jwks_url)
            if resp.status_code == 200:
                _jwks_cache = resp.json()
                _jwks_cached_at = now
                return _jwks_cache
            else:
                logger.warning("JWKS endpoint returned status %s from %s", resp.status_code, jwks_url)
    except Exception as exc:
        logger.warning("Failed to fetch Supabase JWKS from %s: %s", jwks_url, exc)

    # If cache is too old (>24h), clear it so stale keys can't be used
    if _jwks_cache is not None and (now - _jwks_cached_at) > JWKS_MAX_STALENESS_SECONDS:
        logger.error("JWKS cache is stale (>24h) and refresh failed — clearing cache")
        _jwks_cache = None
        _jwks_cached_at = 0.0
        return None

    return _jwks_cache  # return stale cache if request failed (within 24h)


def get_cached_jwks() -> Optional[Dict[str, Any]]:
    """Synchronously get cached JWKS if within TTL."""
    global _jwks_cache, _jwks_cached_at
    now = time.time()
    if _jwks_cache is not None and (now - _jwks_cached_at) < JWKS_CACHE_TTL_SECONDS:
        return _jwks_cache
    return None


def invalidate_jwks_cache() -> None:
    """Invalidate in-memory JWKS cache."""
    global _jwks_cache, _jwks_cached_at
    _jwks_cache = None
    _jwks_cached_at = 0.0
