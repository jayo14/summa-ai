"""Timing instrumentation for the chat pipeline.

Provides a lightweight Timer context manager that logs durations for every
major stage of the request lifecycle:

    request_received, intent_detection, learner_context, retrieval,
    learning_decision, component_selection, component_generation,
    model_generation, stream_start, first_token, component_event,
    response_complete

Usage::

    from app.utils.timing import Timer, log_timings

    t = Timer()
    await something()
    t.mark("intent_detection")
    ...
    t.log(logger, "CHAT")
"""

import logging
import time
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)


class Timer:
    """Records wall-clock durations between mark() calls and from creation."""

    def __init__(self, name: str = "CHAT"):
        self.name = name
        self._marks: List[tuple[str, float]] = []
        self._start = time.monotonic()
        self._marks.append(("request_received", self._start))

    def mark(self, label: str) -> float:
        ts = time.monotonic()
        self._marks.append((label, ts))
        return ts - (self._marks[-2][1] if len(self._marks) >= 2 else self._start)

    @property
    def total(self) -> float:
        if not self._marks:
            return 0.0
        return self._marks[-1][1] - self._start

    def durations(self) -> Dict[str, float]:
        """Return dict of label -> duration_in_ms since previous mark."""
        result: Dict[str, float] = {}
        for i in range(1, len(self._marks)):
            label, ts = self._marks[i]
            _, prev_ts = self._marks[i - 1]
            result[label] = round((ts - prev_ts) * 1000, 1)
        return result

    def log(self, logger_obj: Optional[logging.Logger] = None, prefix: Optional[str] = None) -> None:
        log = logger_obj or logger
        tag = prefix or self.name
        durs = self.durations()
        lines = []
        for label, ms in durs.items():
            lines.append(f"{label:<24} {ms:>8.1f}ms")
        total_ms = round(self.total * 1000, 1)
        lines.append(f"{'total':-<24} {total_ms:>8.1f}ms")
        log.info("[%s]\n%s", tag, "\n".join(lines))

    def __str__(self) -> str:
        parts = []
        for label, ms in self.durations().items():
            parts.append(f"{label}={ms:.1f}ms")
        return f"[{self.name}] " + " ".join(parts)
