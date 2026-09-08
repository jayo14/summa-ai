"""Abstract LLM provider protocol — uniform interface for all backends."""

from __future__ import annotations

from typing import Any, AsyncGenerator, Dict, List, Optional, Protocol


class LLMProvider(Protocol):
    """All providers must implement these two methods."""

    @property
    def name(self) -> str: ...

    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str = "",
        enable_thinking: bool = True,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Yield {"type": "thinking"|"content", "delta": str} chunks, then {"type": "done"}."""
        ...

    async def generate_json(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str = "",
        json_schema: Optional[Dict[str, Any]] = None,
    ) -> Optional[Dict[str, Any]]:
        """Generate structured JSON. Returns parsed dict or None on failure."""
        ...

    async def health_check(self) -> bool:
        """Return True if provider is reachable and configured."""
        ...
