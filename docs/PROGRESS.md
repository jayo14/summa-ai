# Summa AI — Progress Log

## 2026-07-17
- Performed full architecture audit (no code changes) per CTO-mode operating instructions.
- Produced SYSTEM_ARCHITECTURE.md, AI_ARCHITECTURE.md, PRODUCT_BOUNDARIES.md, INTEGRATION_STRATEGY.md, PROJECT_AUDIT.md, TECHNICAL_DEBT.md, SECURITY_REPORT.md, SCALABILITY_REPORT.md.
- CRITICAL finding: hardcoded, live-looking Z.ai API credentials committed in apps/api/app/routes/chat.py. Flagged as the single highest-priority item across both repos this round.
- Determined recommended integration architecture: Supabase Auth adoption, Postgres migration to a separate schema, no API gateway, direct service-to-service calls.
- Decided against: fixing anything this session — audit-first per your own instructions. Decided against building any adaptive-learning feature until PRODUCT_BOUNDARIES.md's open question about SummaStudy's existing planner/memory services is resolved.

## 2026-07-17 (later, same day — Milestone 1 execution)
- Moved hardcoded Z.ai credentials from apps/api/app/routes/chat.py into Settings class (config.py), reading from env vars.
- Added ZAI_API_KEY, ZAI_TOKEN, ZAI_USER_ID to .env.example, apps/api/.env, apps/api/.env.production.
- Added production startup guard against default JWT_SECRET_KEY in main.py lifespan.
- Documented Z.ai env vars in README.md and DEPLOYMENT.md.
- All doc files (docs/*.md) now tracked in git.

## 2026-07-17 (Milestone 2 — Config/Reality Alignment)
- Added ZAI_API_BASE and ZAI_MODEL to Settings class (config.py).
- Removed hardcoded ZAI_API_BASE module-level constant from chat.py; wired chat.py to read URL and model from settings.
- Updated .env.example, apps/api/.env, apps/api/.env.production with the new vars.
- Removed unused prisma/ directory (was default scaffold — User/Post boilerplate, unrelated to real models).
- Removed @prisma/client and prisma from package.json dependencies and db:* scripts.
- Removed dead src/lib/db.ts (PrismaClient singleton — nothing imported it).
- Updated README.md, SYSTEM_ARCHITECTURE.md, PROJECT_AUDIT.md, TECHNICAL_DEBT.md to reflect Prisma removal and config alignment.

## 2026-07-17 (NEXT_STEPS item 6 — Credential sweep)
- Performed repo-wide grep of apps/api (and src/) for hardcoded JWT tokens, API keys, bearer tokens, and credential-shaped strings beyond the already-fixed chat.py credentials.
- **Result: No additional hardcoded credentials found.** The Milestone 1-2 changes covered the full credential surface.
- Conclusion: the "credential sweep" recommendation from PROJECT_AUDIT.md (item 26) is now complete.

## 2026-07-17 (NEXT_STEPS item 7 — SummaStudy service liveness check)
- Checked SummaStudy repo at `/home/codegallantx/moi/summastudy-v2` for the four services flagged in PRODUCT_BOUNDARIES.md.
- **All four services are live and actively used:**
  - `study_planner.py` — imported (lazy) in `api/v1/endpoints/ai_core.py` for `generate_plan()`
  - `spaced_repetition.py` — imported (lazy) in `api/v1/endpoints/ai_core.py` for `calculate_next_review()` / `get_due_date()`
  - `memory_service.py` — imported in `services/agent_orchestrator.py`, `tasks/memory_tasks.py`, `agents/tools/memory_tools.py`, and has dedicated tests in `tests/test_memory_logic.py`
  - `recommendation_service.py` — imported in `api/v1/endpoints/marketplace.py` and `api/v1/endpoints/tutorials.py`
- This finding is now documented. The decision to reuse vs rebuild these services for Summa AI's adaptive layer requires user input.

## 2026-07-17 (Milestone 4 — AI Quality Hardening)
- **Surfaced LLM errors**: Changed `_stream_zai` exception handler from streaming a canned "I'd be happy to help!" response to emitting `{"type":"error","message":"..."}` SSE event. Frontend (`use-chat.ts`) already handled this event type — errors now surface as `⚠️ <message>` in the chat UI instead of being silently swallowed.
- **Prompt budget cap**: Added `_section()` helper (3k char limit per context section) and wrapped all JSON-dumped context blocks (memory, exams, progress, gaps) in `build_orchestrator_prompt`. Each section truncates independently to prevent unbounded prompt growth.
- **Recall caching**: Added `_TTLCache` class (60s TTL) and wired it into `CoggeeService._recall()`. Every chat turn previously re-fetched memory/exams/progress from Cognee fresh — now repeated calls within 60s hit the in-memory cache. Cache auto-evicts on expiry and is per-user/per-query scoped.
- **Cognee production guard**: `main.py` lifespan now raises `RuntimeError` if `ENVIRONMENT=production` and `COGNEE_API_KEY` is empty, preventing the silent in-memory fallback that would defeat "never forgets" persistence.
- **Expanded test coverage**: Wrote `tests/test_chat_utils.py` (11 tests — `detect_intent` for all 7 intent patterns + `_section` truncation) and `tests/test_cache.py` (7 tests — get/set/expiry/clear/args). Total test count: 19, all passing.
