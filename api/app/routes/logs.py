"""Logs & System Diagnostics Router — handles GET/POST /api/v1/system/logs and /__manus__/logs
for full system, runtime, build, backend, frontend, and network telemetry.
"""

import collections
import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Query, Request
from fastapi.responses import JSONResponse

from app.core.logging_system import (
    add_log_entry,
    clear_backend_logs,
    get_backend_logs,
    get_system_metrics,
)

logger = logging.getLogger(__name__)

router = APIRouter()

# Ring buffers for frontend logs sent by debug-collector.js
MAX_FRONTEND_LOGS = 500
_frontend_console_buffer: collections.deque = collections.deque(maxlen=MAX_FRONTEND_LOGS)
_frontend_network_buffer: collections.deque = collections.deque(maxlen=MAX_FRONTEND_LOGS)
_frontend_ui_buffer: collections.deque = collections.deque(maxlen=MAX_FRONTEND_LOGS)


@router.get("/system/logs", summary="Get system logs & diagnostics")
@router.get("/__manus__/logs", include_in_schema=False)
async def get_system_logs(
    limit: int = Query(default=200, ge=1, le=1000),
    level: Optional[str] = Query(default=None),
    source: Optional[str] = Query(default=None),
):
    """Retrieve unified system diagnostic logs (backend, frontend, network, system metrics)."""
    backend_logs = get_backend_logs(limit=limit, level_filter=level)
    metrics = get_system_metrics()

    frontend_console = list(_frontend_console_buffer)[:limit]
    frontend_network = list(_frontend_network_buffer)[:limit]
    frontend_ui = list(_frontend_ui_buffer)[:limit]

    # Calculate summary metrics
    all_levels = [l.get("level", "INFO").upper() for l in backend_logs]
    error_count = sum(1 for lvl in all_levels if lvl in ("ERROR", "CRITICAL", "FAILED"))
    warn_count = sum(1 for lvl in all_levels if lvl in ("WARN", "WARNING"))
    info_count = len(backend_logs) - error_count - warn_count

    return {
        "success": True,
        "backendLogs": backend_logs,
        "frontendLogs": frontend_console,
        "networkRequests": frontend_network,
        "sessionEvents": frontend_ui,
        "systemMetrics": metrics,
        "summary": {
            "total_backend_logs": len(backend_logs),
            "total_frontend_logs": len(frontend_console),
            "total_network_requests": len(frontend_network),
            "error_count": error_count,
            "warn_count": warn_count,
            "info_count": info_count,
        },
    }


@router.post("/system/logs", summary="Submit frontend runtime logs")
@router.post("/__manus__/logs", include_in_schema=False)
async def submit_frontend_logs(request: Request):
    """Receives console, network, and UI logs from debug-collector.js and buffers them."""
    try:
        payload = await request.json()
    except Exception:
        return JSONResponse({"success": False, "error": "Invalid JSON"}, status_code=400)

    console_logs = payload.get("consoleLogs") or []
    network_reqs = payload.get("networkRequests") or []
    ui_events = payload.get("sessionEvents") or payload.get("uiEvents") or []

    for item in console_logs:
        _frontend_console_buffer.appendleft(item)

    for item in network_reqs:
        _frontend_network_buffer.appendleft(item)

    for item in ui_events:
        _frontend_ui_buffer.appendleft(item)

    return {"success": True, "received": len(console_logs) + len(network_reqs) + len(ui_events)}


@router.post("/system/logs/clear", summary="Clear log buffers")
@router.delete("/system/logs", summary="Clear system log buffers")
async def clear_all_logs():
    """Clears backend and frontend log buffers."""
    clear_backend_logs()
    _frontend_console_buffer.clear()
    _frontend_network_buffer.clear()
    _frontend_ui_buffer.clear()
    add_log_entry("INFO", "app.routes.logs", "System log buffers cleared by user request")
    return {"success": True, "message": "Log buffers cleared"}
