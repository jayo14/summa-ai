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

## Milestone 5 — Product Boundary Resolution ✅
- ✅ SummaStudy services confirmed **live and actively used** (from earlier audit)
- ✅ **Decision: reuse** — SummaStudy's existing services adopted as integration targets
- ✅ **Hybrid memory layer** — built `SummaStudyMemoryClient` (`services/summastudy_memory.py`):
  - Cognee remains primary memory backbone
  - Atomic fact extraction (preference, goal, struggle, fact, habit) using Z.ai LLM
  - Shared `public.user_memories` table (same schema as SummaStudy) for cross-product memory
  - Automatic extraction after each chat turn via `chat.py`
  - Supplementary facts injected into orchestrator prompt
  - Dedicated hybrid memory API endpoints at `/memory/hybrid/*`
- ✅ **SummaStudy API client** — built `SummaStudyClient` (`services/summastudy_client.py`):
  - Study planner: `POST /ai-core/generate-plan`
  - Spaced repetition: `POST /ai-core/flashcard/review`, `GET /ai-core/flashcards/due/{user_id}`
  - Recommendations: `GET /tutorials/recommendations`, `GET /marketplace/recommendations`
  - Gated by `SUMMASTUDY_ENABLED` + `SUMMASTUDY_API_BASE` config
  - Passes shared Supabase JWT for auth
- ✅ JWT token context var added (`current_jwt_token`) for service-to-service auth forwarding
- ✅ Database migration: `public.user_memories` table added to `db/migrate_to_supabase.sql`
- ✅ All 19 existing tests pass
Status: ✅ Complete

## Milestone 6 — Frontend-Backend Integration ✅
- ✅ Created typed API service layer (`src/lib/api.ts`) covering analytics, hexagon, exams, progress, artifacts, materials, concepts, timeline, and memory endpoints
- ✅ Connected AnalyticsView to `GET /analytics`, `/memory/hexagon`, `/memory/exams`, `/memory/progress` with graceful fallback to sample data
- ✅ Connected ResourcesView to `GET /artifacts` with fallback to `SAMPLE_RESOURCES`
- ✅ Connected KnowledgeBaseView to `GET /materials` and `GET /concepts` with fallback to hardcoded samples
- ✅ Connected TimelineView to `GET /timeline` with fallback to `TIMELINE_EVENTS`
- ✅ Connected Settings memory tab to `GET /memory/hybrid/facts` and `POST /memory/forget` for real data + forget workflow
- ✅ Connected onboarding completion to `PATCH /user` to persist `onboarded` status and `onboarding_data` to backend
- ✅ Fixed `package.json` JSON syntax error (trailing comma)
- ✅ `npx next build` passes cleanly
Status: ✅ Complete

## Milestone 7 — Postgres-Backed Data Routes ✅
- ✅ Created `DataStore` (`services/data_store.py`) — asyncpg-backed singleton with full CRUD for artifacts, conversations, messages, timeline events, materials, and concepts in the `summa_ai` schema
- ✅ Rewrote all `data_routes.py` endpoints — artifacts, conversations/messages, timeline, materials, and concepts now persist to Supabase Postgres instead of in-memory dicts
- ✅ Removed all seed data and in-memory stores (`_art_store`, `_convs`, `_msgs`, `_events`, `_mats`, `_concepts`)
- ✅ Kept API shapes identical — frontend needs no changes
- ✅ Analytics endpoint queries real concept/timeline counts from Postgres alongside hardcoded hexagon data
- ✅ Version restore endpoint returns 501 (no versions table in schema yet — can be added later)
- ✅ 31/31 tests pass, Next.js build passes cleanly
Status: ✅ Complete
