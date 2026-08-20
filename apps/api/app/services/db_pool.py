"""Single shared asyncpg pool for the whole process.

Previously UserStore, DataStore, and SummaStudyMemoryClient each opened their
own independent asyncpg pool against the same DATABASE_URL — three separate
connection pools for one database. This module gives every store one pool to
share instead.
"""

from __future__ import annotations

import logging
from typing import Optional

import asyncpg

from app.config import settings

logger = logging.getLogger(__name__)

_pool: Optional[asyncpg.Pool] = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            settings.DATABASE_URL,
            min_size=2,
            max_size=20,
        )
        logger.info("Shared asyncpg pool created (min=2, max=20)")
    return _pool


async def close_pool() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
