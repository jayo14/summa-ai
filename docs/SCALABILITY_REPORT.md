# Summa AI — Scalability Report

## Current state

Summa AI in its present form is a hackathon build serving what is likely a small number of demo users (`DEMO_USER_EMAIL = "alex@summa.ai"` in config suggests a single demo account was the primary test case). Scalability analysis here is about the path from "works in a demo" to "works for paying subscribers," not about current load, since current load is presumably minimal.

## Real scalability risks, in order of when they'd bite

1. **SQLite as the relational store.** SQLite does not handle concurrent writes well under real multi-user load — fine for a hackathon, not viable for a subscriber base of any real size. This resolves itself once `INTEGRATION_STRATEGY.md` Decision 2 (move to Supabase Postgres) is executed — don't invest in scaling SQLite itself.
2. **Unbounded prompt context** (see `AI_ARCHITECTURE.md`) means cost-per-conversation-turn grows with how long a student has used the product, not just with message length. This is the one item on this list that actively gets worse the *more successful* the product is at its core promise (long-term memory) — worth prioritizing before the first cohort of long-term users exists, not after.
3. **No caching** means every chat turn pays full Cognee recall latency + Z.ai generation latency serially. At current scale this is a UX/cost issue, not an outage risk; at higher concurrent usage it becomes both.
4. **In-memory Cognee fallback**, if it ever silently activates under production load (e.g., a transient Cognee outage), means memory data written during the outage window is lost on the next restart — a correctness issue that looks like a scalability issue when it happens under load (more concurrent users = more data at risk during any given outage window).

## What does NOT need scaling attention yet

- WebSocket connection manager (`ConnectionManager`) is a simple in-process dict — fine until you run multiple backend instances, at which point it needs a shared store (Redis pub/sub or similar) for cross-instance delivery. Not urgent at current scale; worth flagging now so it's not a surprise later when horizontal scaling becomes necessary.
- Regex-based intent detection has no meaningful scaling cost at any realistic message volume.

## Resolution status (2026-07-17)

- ✅ **Prompt budget** — resolved in Milestone 4 (3k char cap per context section). No longer an unbounded growth risk.
- ❌ **SQLite → Postgres** — still pending, gated on Integration Strategy decision (NEXT_STEPS item 8).
- ✅ **No caching** — resolved in Milestone 4 (60s TTL cache on `_recall()`). Redundant Cognee calls within a conversation window are now avoided.
- ✅ **Cognee production guard** — resolved in Milestone 4 (boot-time hard failure if `COGNEE_API_KEY` missing in production). No more silent in-memory fallback risk.

## Recommendation

Don't do dedicated "scalability work" as its own project. The two items that matter (SQLite → Postgres, prompt budget) are already scheduled inside `INTEGRATION_STRATEGY.md` and `AI_ARCHITECTURE.md`'s recommendations respectively. Scalability here is a side effect of doing the security and architecture fixes correctly, not a separate initiative.
