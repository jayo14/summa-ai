"""Summa AI System Logging Infrastructure — captures Python logs, HTTP request metadata,
stack traces, process metrics, and feeds them into a unified diagnostic buffer.
"""

import collections
import logging
import os
import sys
import time
import traceback
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# Ring buffer storing up to 1000 detailed log entries
MAX_LOG_ENTRIES = 1000
_log_ring_buffer: collections.deque = collections.deque(maxlen=MAX_LOG_ENTRIES)
_start_time = time.time()


class RingBufferLogHandler(logging.Handler):
    """Custom logging handler capturing formatted log entries with stack traces and request context."""

    def emit(self, record: logging.LogRecord) -> None:
        try:
            exc_text = None
            if record.exc_info:
                exc_text = "".join(traceback.format_exception(*record.exc_info))

            entry = {
                "id": f"log-{time.time_ns()}",
                "timestamp": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
                "level": record.levelname,
                "logger": record.name,
                "message": record.getMessage(),
                "filename": record.filename,
                "lineno": record.lineno,
                "exc_info": exc_text,
            }

            # Capture extra metadata if present
            if hasattr(record, "path"):
                entry["path"] = getattr(record, "path")
            if hasattr(record, "status_code"):
                entry["status_code"] = getattr(record, "status_code")
            if hasattr(record, "duration_ms"):
                entry["duration_ms"] = getattr(record, "duration_ms")

            _log_ring_buffer.appendleft(entry)
        except Exception:
            self.handleError(record)


_handler_installed = False


def setup_system_logging() -> None:
    """Attaches RingBufferLogHandler to the root logger."""
    global _handler_installed
    if _handler_installed:
        return

    root_logger = logging.getLogger()
    handler = RingBufferLogHandler()
    handler.setLevel(logging.INFO)
    root_logger.addHandler(handler)
    _handler_installed = True
    logger.info("System RingBufferLogHandler installed successfully")


def add_log_entry(level: str, logger_name: str, message: str, extra: Optional[Dict[str, Any]] = None) -> None:
    """Manually inject a log entry into the system ring buffer."""
    entry = {
        "id": f"log-{time.time_ns()}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "level": level.upper(),
        "logger": logger_name,
        "message": message,
        **(extra or {}),
    }
    _log_ring_buffer.appendleft(entry)


def get_backend_logs(limit: int = 200, level_filter: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieve captured backend logs."""
    logs = list(_log_ring_buffer)
    if level_filter:
        lf = level_filter.upper()
        logs = [l for l in logs if l.get("level") == lf]
    return logs[:limit]


def clear_backend_logs() -> None:
    """Clear captured log ring buffer."""
    _log_ring_buffer.clear()


def get_system_metrics() -> Dict[str, Any]:
    """Gather process uptime, memory usage, environment config, and service status."""
    import resource
    uptime_seconds = round(time.time() - _start_time, 1)

    # Memory usage in MB
    try:
        max_rss = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
        memory_mb = round(max_rss / 1024.0, 2)
    except Exception:
        memory_mb = 0.0

    from app.config import settings

    return {
        "service": "summa-ai-api",
        "version": "1.0.0",
        "uptime_seconds": uptime_seconds,
        "memory_mb": memory_mb,
        "python_version": sys.version.split()[0],
        "pid": os.getpid(),
        "environment": settings.ENVIRONMENT,
        "gemini_model": settings.GEMINI_MODEL,
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "database_url_configured": bool(settings.DATABASE_URL),
        "hybrid_memory_enabled": settings.HYBRID_MEMORY_ENABLED,
        "websocket_enabled": settings.WEBSOCKET_ENABLED,
    }
