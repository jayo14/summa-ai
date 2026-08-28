"""Tests for the in-memory TTL cache used by CogneeService."""

import time
from app.services.cognee_service import _TTLCache


class TestTTLCache:
    def test_get_miss_returns_none(self):
        cache = _TTLCache(ttl=60)
        assert cache.get("nonexistent") is None

    def test_set_and_get(self):
        cache = _TTLCache(ttl=60)
        cache.set([1, 2, 3], "key1")
        assert cache.get("key1") == [1, 2, 3]

    def test_ttl_expiry(self):
        cache = _TTLCache(ttl=0.1)
        cache.set("value", "key")
        assert cache.get("key") == "value"
        time.sleep(0.15)
        assert cache.get("key") is None

    def test_multiple_keys(self):
        cache = _TTLCache(ttl=60)
        cache.set("v1", "k1")
        cache.set("v2", "k2")
        assert cache.get("k1") == "v1"
        assert cache.get("k2") == "v2"

    def test_overwrite_existing_key(self):
        cache = _TTLCache(ttl=60)
        cache.set("old", "key")
        cache.set("new", "key")
        assert cache.get("key") == "new"

    def test_key_with_args_and_kwargs(self):
        cache = _TTLCache(ttl=60)
        cache.set("result", "arg1", "arg2", kw="val")
        assert cache.get("arg1", "arg2", kw="val") == "result"

    def test_clear(self):
        cache = _TTLCache(ttl=60)
        cache.set("v1", "k1")
        cache.set("v2", "k2")
        cache.clear()
        assert cache.get("k1") is None
        assert cache.get("k2") is None
