"""Single shared asyncpg pool for the whole process.

Previously UserStore, DataStore, and SummaStudyMemoryClient each opened their
own independent asyncpg pool against the same DATABASE_URL — three separate
connection pools for one database. This module gives every store one pool to
share instead.

RLS bypass: Supabase RLS policies use auth.uid() which returns NULL on direct
Postgres connections (no JWT context). Since DataStore already does its own
ownership checks, we set role = 'service_role' on every connection to bypass RLS.
"""

from __future__ import annotations

import logging
from typing import Optional

import asyncpg

from app.config import settings

logger = logging.getLogger(__name__)

_pool: Optional[asyncpg.Pool] = None


async def _init_connection(conn: asyncpg.Connection) -> None:
    """Set session role to service_role to bypass Supabase RLS.

    DataStore performs its own ownership checks, so RLS is redundant and
    actively harmful when using direct asyncpg connections.
    """
    try:
        await conn.execute("SET role TO service_role")
    except Exception as exc:
        # If service_role doesn't exist (non-Supabase DB), try postgres
        logger.debug("Could not set service_role, trying postgres: %s", exc)
        try:
            await conn.execute("SET role TO postgres")
        except Exception:
            logger.debug("Could not set role — RLS bypass may not be needed")


async def get_pool() -> Optional[asyncpg.Pool]:
    global _pool
    if _pool is not None:
        return _pool
    try:
        kwargs = {}
        if "supabase" in settings.DATABASE_URL:
            kwargs["ssl"] = "require"
        _pool = await asyncpg.create_pool(
            settings.DATABASE_URL,
            min_size=1,
            max_size=10,
            timeout=10.0,
            command_timeout=15.0,
            init=_init_connection,
            **kwargs,
        )
        logger.info("Shared asyncpg pool created (RLS bypass via role)")
    except Exception as exc:
        logger.error("Shared asyncpg pool FAILED: %s", exc, exc_info=True)
        _pool = None
        return None
    return _pool


async def close_pool() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
