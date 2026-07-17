# Summa AI — Project Roadmap

## Milestone 0 — Audit Complete (this session)
Status: ✅ Done. See SYSTEM_ARCHITECTURE.md, AI_ARCHITECTURE.md, PRODUCT_BOUNDARIES.md, INTEGRATION_STRATEGY.md, PROJECT_AUDIT.md, TECHNICAL_DEBT.md, SECURITY_REPORT.md, SCALABILITY_REPORT.md.

## Milestone 1 — Security Emergency (blocking everything else)
- Rotate/revoke the hardcoded Z.ai token — **⚠️ YOU STILL NEED TO DO THIS manually on Z.ai's side**
- Move Z.ai credentials to environment variables — ✅ Done (see config.py, chat.py, .env.example)
- Add production guard against default JWT_SECRET_KEY — ✅ Done (main.py lifespan)
Status: ✅ Code changes complete. Manual token rotation still required at https://internal-api.z.ai

## Milestone 2 — Config/Reality Alignment
- Route real chat generation through declared Settings-based provider config — ✅ Done (see config.py ZAI_API_BASE, ZAI_MODEL; chat.py reads from settings)
- Resolve Prisma: adopt or remove — ✅ Removed (prisma/ dir, deps in package.json, dead src/lib/db.ts)
Status: ✅ Complete. Chat now reads all Z.ai config (API base, model, key, token, user ID) from Settings. Prisma scaffolding removed.

## Milestone 3 — Identity & Data Integration (in progress)
- ✅ Decision 1 (adopt Supabase Auth): Backend JWT verification switched to `verify_supabase_jwt` (core/security.py). Auth routes now proxy through Supabase Auth REST API. JWT production guard replaced with Supabase secret guard.
- ✅ Decision 2 (migrate to Supabase Postgres): Schema migration script created at `db/migrate_to_supabase.sql`. Creates `summa_ai` schema with 8 tables + trigger for auto-creating user profiles on first Supabase login. ⚠️ Requires running via Supabase Dashboard SQL Editor (no IPv6 from this server).
- ✅ Decision 3 (direct service-to-service): No code change needed — backends already make direct calls; they'll share Supabase JWT for auth.
- ✅ Decision 4 (start fresh SQLite): No migration needed. Old SQLite data in `db/custom.db` can be archived.
- ✅ Done: `user_store.py` rewritten with `asyncpg` to Supabase Postgres (`summa_ai.user_profiles`).
- ✅ Done: Settings routes migrated to Postgres upsert (`summa_ai.settings`).
- ✅ Done: Legacy JWT code removed in Milestone 3.
Status: ✅ Migration schema applied and Backend connected to Supabase Postgres.

## Milestone 4 — AI Quality Hardening ✅
- ✅ Prompt context budget cap — added `_section()` truncation to `build_orchestrator_prompt` (3k chars per section)
- ✅ Caching layer for memory/exam/progress recall — added `_TTLCache` to `CogneeService._recall()` (60s TTL)
- ✅ Replace silent LLM-failure fallback with surfaced error state — `_stream_zai` now sends `{"type":"error","message":"..."}` instead of a canned happy response; frontend already handled this event type
- ✅ Expand test coverage beyond `memory_loop` — added `test_chat_utils.py` (11 tests) and `test_cache.py` (7 tests); 19 total tests, all passing
- ✅ Bonus: Cognee production guard — `main.py` lifespan now refuses to start in production without `COGNEE_API_KEY`, preventing silent in-memory fallback
Status: ✅ Complete

## Milestone 5 — Product Boundary Resolution
- Study_planner/spaced_repetition/memory_service/recommendation_service confirmed **live and actively used** in SummaStudy
- Decision needed: reuse SummaStudy's existing services vs rebuild inside Summa AI
Status: 🔒 Awaiting user decision — see PRODUCT_BOUNDARIES.md and PROGRESS.md for full import graph
