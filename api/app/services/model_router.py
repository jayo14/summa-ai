"""Multi-provider model router with automatic failover and health tracking.

Routes LLM requests through a priority-ordered cascade of providers.
Detects quota exhaustion, marks providers degraded, logs usage, and
falls back to offline responses when all providers fail.
"""

from __future__ import annotations

import asyncio
import logging
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from typing import Any, AsyncGenerator, Dict, List, Optional

from app.config import settings
from app.services.providers.gemini import GeminiProvider
from app.services.providers.openai import OpenAIProvider, QuotaExhausted as OpenAIQuotaExhausted
from app.services.providers.anthropic import AnthropicProvider, QuotaExhausted as AnthropicQuotaExhausted
from app.services.providers.zai import ZaiProvider
from app.services.key_encryption import decrypt_api_key
from app.services import google_ai

logger = logging.getLogger(__name__)

# Quota-exhausted providers are degraded for this duration
QUOTA_DEGRADE_MINUTES = 5
# Max consecutive failures before marking unhealthy
MAX_FAILURES = 3
# Usage log batch interval
_LOG_FLUSH_INTERVAL = 30


@dataclass
class ProviderHealth:
    healthy: bool = True
    failures: int = 0
    quota_until: Optional[datetime] = None
    last_check: Optional[datetime] = None
    last_error: Optional[str] = None

    def is_available(self) -> bool:
        if not self.healthy:
            return False
        if self.quota_until and datetime.now(timezone.utc) < self.quota_until:
            return False
        return True


@dataclass
class UsageLogEntry:
    provider: str
    model_name: str
    request_type: str
    latency_ms: int
    success: bool
    error_type: str = ""
    failover_from: str = ""
    tokens_in: int = 0
    tokens_out: int = 0


class ModelRouter:
    _instance: Optional["ModelRouter"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True

        self._health: Dict[str, ProviderHealth] = {
            "gemini": ProviderHealth(),
            "openai": ProviderHealth(),
            "anthropic": ProviderHealth(),
            "zai": ProviderHealth(),
        }
        self._providers = {}
        self._usage_buffer: List[UsageLogEntry] = []
        self._last_flush = time.time()
        self._priority_order: List[str] = ["gemini", "openai", "anthropic", "zai"]
        self._routing_mode: str = "auto"  # "auto" or manual provider name
        self._manual_provider: Optional[str] = None

    def _get_providers(self) -> Dict[str, Any]:
        """Lazy-init providers with DB-over-env key resolution."""
        if self._providers:
            return self._providers

        keys = self._load_api_keys()

        self._providers = {
            "gemini": GeminiProvider(api_key=keys.get("gemini", "")),
            "openai": OpenAIProvider(api_key=keys.get("openai", "")),
            "anthropic": AnthropicProvider(api_key=keys.get("anthropic", "")),
            "zai": ZaiProvider(api_key=keys.get("zai", "")),
        }
        return self._providers

    def _load_api_keys(self) -> Dict[str, str]:
        """Load API keys: database overrides > .env defaults."""
        keys: Dict[str, str] = {}

        # .env defaults
        env_keys = {
            "gemini": settings.GEMINI_API_KEY,
            "openai": settings.OPENAI_API_KEY,
            "anthropic": os.getenv("ANTHROPIC_API_KEY", ""),
            "zai": settings.ZAI_API_KEY,
        }

        # Try DB overrides
        try:
            import asyncpg
            from app.services.db_pool import get_pool
            # Sync-ish read via event loop — acceptable at init time
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # Can't block; use env keys
                return env_keys
            pool = loop.run_until_complete(get_pool())
            # This path is for startup; runtime uses _refresh_keys()
            return env_keys
        except Exception:
            return env_keys

    async def _refresh_keys_from_db(self) -> Dict[str, str]:
        """Async key refresh from database with env fallback."""
        keys: Dict[str, str] = {
            "gemini": settings.GEMINI_API_KEY,
            "openai": settings.OPENAI_API_KEY,
            "anthropic": "",
            "zai": settings.ZAI_API_KEY,
        }
        try:
            from app.services.db_pool import get_pool
            pool = await get_pool()
            rows = await pool.fetch(
                "SELECT provider, api_key_encrypted FROM summa_ai.model_providers WHERE api_key_encrypted IS NOT NULL AND api_key_encrypted != ''"
            )
            for row in rows:
                decrypted = decrypt_api_key(row["api_key_encrypted"])
                if decrypted:
                    keys[row["provider"]] = decrypted
        except Exception as exc:
            logger.debug("DB key refresh failed, using env defaults: %s", exc)
        return keys

    def _get_priority_order(self) -> List[str]:
        """Return providers in cascade order."""
        if self._routing_mode == "manual" and self._manual_provider:
            return [self._manual_provider]
        return list(self._priority_order)

    def set_routing_mode(self, mode: str, provider: Optional[str] = None):
        self._routing_mode = mode
        if provider:
            self._manual_provider = provider

    def get_health(self) -> Dict[str, Dict[str, Any]]:
        """Return current health snapshot."""
        now = datetime.now(timezone.utc)
        result = {}
        for name, h in self._health.items():
            result[name] = {
                "healthy": h.healthy,
                "available": h.is_available(),
                "failures": h.failures,
                "quota_until": h.quota_until.isoformat() if h.quota_until else None,
                "last_error": h.last_error,
            }
        return result

    def mark_degraded(self, provider: str, error_type: str = "quota"):
        """Mark a provider as degraded (quota exhausted)."""
        h = self._health[provider]
        h.quota_until = datetime.now(timezone.utc) + timedelta(minutes=QUOTA_DEGRADE_MINUTES)
        h.last_error = error_type
        logger.warning("Provider %s degraded for %d minutes: %s", provider, QUOTA_DEGRADE_MINUTES, error_type)

    def mark_failure(self, provider: str, error: str = ""):
        """Record a failure. Marks unhealthy after MAX_FAILURES."""
        h = self._health[provider]
        h.failures += 1
        h.last_error = error
        if h.failures >= MAX_FAILURES:
            h.healthy = False
            logger.warning("Provider %s marked unhealthy after %d failures", provider, h.failures)

    def mark_healthy(self, provider: str):
        """Reset health on success."""
        h = self._health[provider]
        h.failures = 0
        h.healthy = True
        h.last_error = None
        h.last_check = datetime.now(timezone.utc)

    def _log_usage(self, entry: UsageLogEntry):
        """Buffer usage log entry, flush periodically."""
        self._usage_buffer.append(entry)
        if time.time() - self._last_flush > _LOG_FLUSH_INTERVAL:
            asyncio.create_task(self._flush_usage())

    async def _flush_usage(self):
        """Write buffered usage logs to database."""
        if not self._usage_buffer:
            return
        entries = self._usage_buffer[:]
        self._usage_buffer.clear()
        self._last_flush = time.time()
        try:
            from app.services.db_pool import get_pool
            pool = await get_pool()
            await pool.executemany(
                """INSERT INTO summa_ai.model_usage_logs
                   (provider, model_name, request_type, latency_ms, tokens_in, tokens_out, success, error_type, failover_from)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)""",
                [
                    (e.provider, e.model_name, e.request_type, e.latency_ms,
                     e.tokens_in, e.tokens_out, e.success, e.error_type, e.failover_from)
                    for e in entries
                ],
            )
        except Exception as exc:
            logger.debug("Usage log flush failed: %s", exc)

    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str = "",
        enable_thinking: bool = True,
        request_type: str = "chat",
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Route chat through provider cascade with automatic failover."""
        providers = self._get_providers()
        keys = await self._refresh_keys_from_db()

        # Update provider keys
        for name, provider in providers.items():
            if name in keys and keys[name]:
                if name == "gemini":
                    provider._api_key = keys[name]
                elif name == "openai":
                    provider._api_key = keys[name]
                elif name == "anthropic":
                    provider._api_key = keys[name]
                elif name == "zai":
                    provider._api_key = keys[name]

        order = self._get_priority_order()
        prev_provider = ""

        for provider_name in order:
            provider = providers.get(provider_name)
            if not provider or not provider.is_configured:
                continue
            if not self._health[provider_name].is_available():
                logger.debug("Skipping %s: not available", provider_name)
                continue

            start = time.time()
            success = False
            error_type = ""

            try:
                async for chunk in provider.stream_chat(messages, system_prompt, enable_thinking):
                    if chunk.get("type") == "error":
                        error_msg = chunk.get("message", "")
                        if "quota" in error_msg.lower() or "429" in error_msg:
                            self.mark_degraded(provider_name, "quota")
                            error_type = "quota"
                        else:
                            self.mark_failure(provider_name, error_msg)
                            error_type = "error"
                        break
                    yield chunk
                else:
                    # Stream completed without error
                    success = True
                    self.mark_healthy(provider_name)

            except (OpenAIQuotaExhausted, AnthropicQuotaExhausted) as exc:
                self.mark_degraded(provider_name, "quota")
                error_type = "quota"
            except Exception as exc:
                self.mark_failure(provider_name, str(exc))
                error_type = "error"

            latency_ms = int((time.time() - start) * 1000)
            self._log_usage(UsageLogEntry(
                provider=provider_name,
                model_name=getattr(provider, "_model", "unknown"),
                request_type=request_type,
                latency_ms=latency_ms,
                success=success,
                error_type=error_type,
                failover_from=prev_provider,
            ))

            if success:
                return

            # Failed — log failover and try next
            logger.info("Failover: %s → next provider (reason: %s)", provider_name, error_type or "error")
            prev_provider = provider_name

        # All providers failed — use offline fallback
        logger.warning("All providers failed. Using offline fallback.")
        async for chunk in google_ai._generate_fallback_stream(messages, system_prompt):
            yield chunk

    async def generate_json(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str = "",
        json_schema: Optional[Dict[str, Any]] = None,
        request_type: str = "json",
    ) -> Optional[Dict[str, Any]]:
        """Route JSON generation through provider cascade."""
        providers = self._get_providers()
        keys = await self._refresh_keys_from_db()

        # Update keys
        for name, provider in providers.items():
            if name in keys and keys[name]:
                if name == "gemini":
                    provider._api_key = keys[name]
                elif name == "openai":
                    provider._api_key = keys[name]
                elif name == "anthropic":
                    provider._api_key = keys[name]
                elif name == "zai":
                    provider._api_key = keys[name]

        order = self._get_priority_order()
        prev_provider = ""

        for provider_name in order:
            provider = providers.get(provider_name)
            if not provider or not provider.is_configured:
                continue
            if not self._health[provider_name].is_available():
                continue

            start = time.time()
            try:
                result = await provider.generate_json(messages, system_prompt, json_schema)
                latency_ms = int((time.time() - start) * 1000)
                self.mark_healthy(provider_name)
                self._log_usage(UsageLogEntry(
                    provider=provider_name,
                    model_name=getattr(provider, "_model", "unknown"),
                    request_type=request_type,
                    latency_ms=latency_ms,
                    success=True,
                    failover_from=prev_provider,
                ))
                if result:
                    return result
            except (OpenAIQuotaExhausted, AnthropicQuotaExhausted):
                self.mark_degraded(provider_name, "quota")
                self._log_usage(UsageLogEntry(
                    provider=provider_name,
                    model_name=getattr(provider, "_model", "unknown"),
                    request_type=request_type,
                    latency_ms=int((time.time() - start) * 1000),
                    success=False,
                    error_type="quota",
                    failover_from=prev_provider,
                ))
                prev_provider = provider_name
            except Exception as exc:
                self.mark_failure(provider_name, str(exc))
                self._log_usage(UsageLogEntry(
                    provider=provider_name,
                    model_name=getattr(provider, "_model", "unknown"),
                    request_type=request_type,
                    latency_ms=int((time.time() - start) * 1000),
                    success=False,
                    error_type="error",
                    failover_from=prev_provider,
                ))
                prev_provider = provider_name

        return None


# Singleton
model_router = ModelRouter()


# Needed for os.getenv in _load_api_keys
import os
