"""Summa AI FastAPI Package."""

from typing import Any


def __getattr__(name: str) -> Any:
    if name in ("app", "main"):
        from app.main import app as _app

        return _app
    raise AttributeError(f"module '{__name__}' has no attribute '{name}'")
