"""Admin AI Models Router — provider configuration, health, usage, and failover management."""

from __future__ import annotations

import logging
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.rbac import require_admin
from app.services.key_encryption import encrypt_api_key, decrypt_api_key
from app.services.model_router import model_router
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin/models", tags=["admin-models"])


# --- Pydantic models ---

class UpdateProviderRequest(BaseModel):
    api_key: Optional[str] = None
    model_name: Optional[str] = None
    is_enabled: Optional[bool] = None
    priority: Optional[int] = None
    rate_limit_rpm: Optional[int] = None
    rate_limit_tpd: Optional[int] = None


class RoutingModeRequest(BaseModel):
    mode: str  # "auto" or a provider name for manual
    provider: Optional[str] = None


# --- Endpoints ---

@router.get("/providers", summary="List all AI providers with health and usage")
async def list_providers(current_user: dict = Depends(require_admin)):
    """Returns all providers with config, health status, and usage stats."""
    from app.services.db_pool import get_pool

    try:
        pool = await get_pool()
        rows = await pool.fetch("""
            SELECT id, provider, model_name, is_enabled, priority,
                   rate_limit_rpm, rate_limit_tpd, last_health_check, last_error,
                   created_at, updated_at,
                   CASE WHEN api_key_encrypted IS NOT NULL AND api_key_encrypted != '' THEN true ELSE false END as has_key
            FROM summa_ai.model_providers
            ORDER BY priority ASC
        """)
    except Exception as e:
        logger.warning("model_providers table not ready: %s", e)
        return {"providers": [], "routing_mode": "auto", "error": "Providers table not yet available. Retry after migration."}

    health = model_router.get_health()

    # Get usage stats for each provider (last 24h)
    now = datetime.now(timezone.utc)
    day_ago = now - timedelta(hours=24)

    providers = []
    for row in rows:
        name = row["provider"]
        usage = await pool.fetchrow("""
            SELECT
                COUNT(*) as total_requests,
                COUNT(*) FILTER (WHERE success = true) as successful,
                COUNT(*) FILTER (WHERE success = false) as failed,
                COALESCE(AVG(latency_ms)::int, 0) as avg_latency,
                COALESCE(PercentileCont(0.5) WITHIN GROUP (ORDER BY latency_ms)::int, 0) as p50_latency,
                COALESCE(PercentileCont(0.95) WITHIN GROUP (ORDER BY latency_ms)::int, 0) as p95_latency
            FROM summa_ai.model_usage_logs
            WHERE provider = $1 AND created_at >= $2
        """, name, day_ago)

        h = health.get(name, {})

        # Check .env fallback for key status
        env_key_map = {
            "gemini": settings.GEMINI_API_KEY,
            "openai": settings.OPENAI_API_KEY,
            "anthropic": "",  # No env var set
            "zai": settings.ZAI_API_KEY,
        }

        providers.append({
            "id": str(row["id"]),
            "provider": name,
            "model_name": row["model_name"],
            "is_enabled": row["is_enabled"],
            "priority": row["priority"],
            "has_key": row["has_key"] or bool(env_key_map.get(name)),
            "rate_limit_rpm": row["rate_limit_rpm"],
            "rate_limit_tpd": row["rate_limit_tpd"],
            "health": {
                "healthy": h.get("healthy", True),
                "available": h.get("available", True),
                "failures": h.get("failures", 0),
                "quota_until": h.get("quota_until"),
                "last_error": h.get("last_error"),
            },
            "usage": {
                "total_requests": usage["total_requests"] if usage else 0,
                "successful": usage["successful"] if usage else 0,
                "failed": usage["failed"] if usage else 0,
                "avg_latency_ms": usage["avg_latency"] if usage else 0,
                "p50_latency_ms": usage["p50_latency"] if usage else 0,
                "p95_latency_ms": usage["p95_latency"] if usage else 0,
            },
            "last_health_check": row["last_health_check"].isoformat() if row["last_health_check"] else None,
            "last_error": row["last_error"],
            "created_at": row["created_at"].isoformat() if row["created_at"] else None,
            "updated_at": row["updated_at"].isoformat() if row["updated_at"] else None,
        })

    return {"providers": providers, "routing_mode": model_router._routing_mode}


@router.put("/providers/{provider_id}", summary="Update provider configuration")
async def update_provider(
    provider_id: str,
    payload: UpdateProviderRequest,
    current_user: dict = Depends(require_admin),
):
    """Update API key, model name, enabled status, or priority for a provider."""
    from app.services.db_pool import get_pool

    pool = await get_pool()

    # Get current record
    row = await pool.fetchrow(
        "SELECT provider FROM summa_ai.model_providers WHERE id = $1", provider_id
    )
    if not row:
        raise HTTPException(status_code=404, detail="Provider not found")

    updates = []
    params: list = []
    idx = 1

    if payload.api_key is not None:
        encrypted = encrypt_api_key(payload.api_key) if payload.api_key else None
        updates.append(f"api_key_encrypted = ${idx}")
        params.append(encrypted)
        idx += 1

    if payload.model_name is not None:
        updates.append(f"model_name = ${idx}")
        params.append(payload.model_name)
        idx += 1

    if payload.is_enabled is not None:
        updates.append(f"is_enabled = ${idx}")
        params.append(payload.is_enabled)
        idx += 1

    if payload.priority is not None:
        updates.append(f"priority = ${idx}")
        params.append(payload.priority)
        idx += 1

    if payload.rate_limit_rpm is not None:
        updates.append(f"rate_limit_rpm = ${idx}")
        params.append(payload.rate_limit_rpm)
        idx += 1

    if payload.rate_limit_tpd is not None:
        updates.append(f"rate_limit_tpd = ${idx}")
        params.append(payload.rate_limit_tpd)
        idx += 1

    if not updates:
        return {"success": True, "message": "No changes"}

    updates.append(f"updated_at = ${idx}")
    params.append(datetime.now(timezone.utc))
    idx += 1

    params.append(provider_id)
    await pool.execute(
        f"UPDATE summa_ai.model_providers SET {', '.join(updates)} WHERE id = ${idx}",
        *params,
    )

    # Clear cached providers so router picks up new keys
    model_router._providers.clear()

    return {"success": True, "message": f"Provider {row['provider']} updated"}


@router.post("/providers/{provider_id}/test", summary="Test provider connection")
async def test_provider(
    provider_id: str,
    current_user: dict = Depends(require_admin),
):
    """Send a minimal test prompt to verify provider connectivity."""
    from app.services.db_pool import get_pool

    pool = await get_pool()
    row = await pool.fetchrow(
        "SELECT provider, api_key_encrypted, model_name FROM summa_ai.model_providers WHERE id = $1",
        provider_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Provider not found")

    name = row["provider"]
    encrypted_key = row["api_key_encrypted"] or ""

    # Resolve key: DB > env
    api_key = decrypt_api_key(encrypted_key) if encrypted_key else ""
    if not api_key:
        env_defaults = {
            "gemini": settings.GEMINI_API_KEY,
            "openai": settings.OPENAI_API_KEY,
            "anthropic": "",
            "zai": settings.ZAI_API_KEY,
        }
        api_key = env_defaults.get(name, "")

    if not api_key:
        return {"success": False, "error": "No API key configured"}

    providers = model_router._get_providers()
    provider = providers.get(name)
    if not provider:
        return {"success": False, "error": f"Unknown provider: {name}"}

    # Set the key temporarily
    provider._api_key = api_key

    try:
        healthy = await provider.health_check()
        return {"success": healthy, "provider": name}
    except Exception as exc:
        return {"success": False, "error": str(exc)}


@router.get("/providers/health", summary="Get current health snapshot")
async def get_health(current_user: dict = Depends(require_admin)):
    """Return real-time health state of all providers."""
    return {"health": model_router.get_health()}


@router.get("/providers/{provider_id}/usage", summary="Get provider usage stats")
async def get_provider_usage(
    provider_id: str,
    days: int = 7,
    current_user: dict = Depends(require_admin),
):
    """Return usage stats for a specific provider over the given period."""
    from app.services.db_pool import get_pool

    pool = await get_pool()
    row = await pool.fetchrow(
        "SELECT provider FROM summa_ai.model_providers WHERE id = $1", provider_id
    )
    if not row:
        raise HTTPException(status_code=404, detail="Provider not found")

    since = datetime.now(timezone.utc) - timedelta(days=days)

    # Daily breakdown
    daily = await pool.fetch("""
        SELECT
            DATE(created_at) as day,
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE success = true) as successful,
            COALESCE(AVG(latency_ms)::int, 0) as avg_latency
        FROM summa_ai.model_usage_logs
        WHERE provider = $1 AND created_at >= $2
        GROUP BY DATE(created_at)
        ORDER BY day DESC
    """, row["provider"], since)

    # Failover events
    failovers = await pool.fetch("""
        SELECT created_at, failover_from, error_type, latency_ms
        FROM summa_ai.model_usage_logs
        WHERE provider = $1 AND failover_from != '' AND failover_from IS NOT NULL AND created_at >= $2
        ORDER BY created_at DESC
        LIMIT 50
    """, row["provider"], since)

    return {
        "provider": row["provider"],
        "period_days": days,
        "daily": [
            {
                "day": str(d["day"]),
                "total": d["total"],
                "successful": d["successful"],
                "avg_latency_ms": d["avg_latency"],
            }
            for d in daily
        ],
        "failovers": [
            {
                "timestamp": f["created_at"].isoformat(),
                "from_provider": f["failover_from"],
                "error_type": f["error_type"],
                "latency_ms": f["latency_ms"],
            }
            for f in failovers
        ],
    }


@router.put("/routing-mode", summary="Set routing mode (auto or manual)")
async def set_routing_mode(
    payload: RoutingModeRequest,
    current_user: dict = Depends(require_admin),
):
    """Toggle between auto (router decides) and manual (locked to one provider)."""
    if payload.mode == "auto":
        model_router.set_routing_mode("auto")
    elif payload.mode == "manual":
        if not payload.provider:
            raise HTTPException(status_code=400, detail="Provider required for manual mode")
        model_router.set_routing_mode("manual", payload.provider)
    else:
        raise HTTPException(status_code=400, detail="Mode must be 'auto' or 'manual'")

    return {"success": True, "mode": payload.mode, "provider": payload.provider}


@router.get("/failover-log", summary="Get recent failover events")
async def get_failover_log(
    limit: int = 50,
    current_user: dict = Depends(require_admin),
):
    """Return recent failover events across all providers."""
    from app.services.db_pool import get_pool

    pool = await get_pool()
    rows = await pool.fetch("""
        SELECT created_at, provider, failover_from, error_type, request_type, latency_ms
        FROM summa_ai.model_usage_logs
        WHERE failover_from != '' AND failover_from IS NOT NULL
        ORDER BY created_at DESC
        LIMIT $1
    """, limit)

    return {
        "failovers": [
            {
                "timestamp": r["created_at"].isoformat(),
                "to_provider": r["provider"],
                "from_provider": r["failover_from"],
                "error_type": r["error_type"],
                "request_type": r["request_type"],
                "latency_ms": r["latency_ms"],
            }
            for r in rows
        ]
    }
