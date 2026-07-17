# Summa AI — Technical Debt Register

| Item | Type | Cost of leaving it | Cost to fix | Priority |
|---|---|---|---|---|
| Hardcoded Z.ai credentials | Security debt | Credential compromise, no rotation path | Trivial-Low — env vars | Critical |
| Insecure JWT secret default | Security debt | Forgeable tokens in production | Trivial — startup guard | Critical |
| ~~Unused Prisma scaffold~~ | Dead code / poor abstraction | ~~Misleads future readers (human or agent) about where data lives~~ | ✅ Removed in M2 | ~~High~~ |
| ~~Config/reality LLM provider mismatch~~ | Poor abstraction | ~~Config changes silently do nothing~~ | ✅ Routed through Settings in M2 | ~~High~~ |
| ~~Two disconnected auth systems~~ | ~~Poor abstraction~~ | ~~Inconsistent identity state~~ | ✅ Resolved M3 — Supabase Auth adopted, self-issued JWT removed | ~~High~~ |
| ~~Unbounded prompt context~~ | ~~Scalability debt~~ | ~~Cost/latency grows unpredictably, eventual context overflow~~ | ✅ Resolved M4 — 3k char cap per section in `build_orchestrator_prompt` | ~~Medium~~ |
| ~~Silent LLM-failure fallback~~ | ~~Observability debt~~ | ~~Masks real incidents~~ | ✅ Resolved M4 — `_stream_zai` sends `{"type":"error"}` SSE event | ~~Medium~~ |
| ~~No caching layer~~ | ~~Performance debt~~ | ~~Redundant Cognee calls every turn~~ | ✅ Resolved M4 — `_TTLCache` (60s) on `_recall()` | ~~Medium~~ |
| Thin test coverage | Quality debt | Regressions in auth/memory go undetected | Medium-High — needs deliberate investment | Medium |

## Sequencing (respecting "never rewrite everything")

1. ✅ Security items — Milestone 1 done (credential env-var-ification, JWT production guard).
2. ✅ Prisma removal — Milestone 2 done (removed prisma/ dir, deps, dead db.ts).
3. ✅ LLM provider config alignment — Milestone 2 done (Z.ai API base, model, creds all via Settings).
4. ✅ Credential sweep — done 2026-07-17 (repo-wide grep, no additional hardcoded credentials found beyond those already fixed).
5. ✅ Auth unification — Milestone 3 done (Supabase Auth adopted, self-issued JWT removed, auth routes proxy to Supabase).
6. ✅ Prompt budget, caching, observability — Milestone 4 done (section char cap, TTL cache, error surfacing).
7. ✅ Cognee production guard — Milestone 4 done (boot-time COGNEE_API_KEY check).
8. Tests — expanded in Milestones 4 (19 total). Continue growing alongside new code.
9. Legacy JWT code removal — Milestone 3 partial (verify function replaced, create removed). Final cleanup after Supabase migration is verified in production.
