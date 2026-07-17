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

## Milestone 3 — Identity & Data Integration
- Adopt Supabase Auth (per INTEGRATION_STRATEGY.md Decision 1)
- Migrate relational data to Supabase Postgres, separate schema (Decision 2)
Status: Blocked on Milestone 1-2

## Milestone 4 — AI Quality Hardening
- Prompt context budget cap
- Caching layer for memory/exam/progress recall
- Replace silent LLM-failure fallback with surfaced error state
- Expand test coverage beyond memory_loop
Status: Not started

## Milestone 5 — Product Boundary Resolution
- Confirm with SummaStudy whether study_planner/spaced_repetition/memory_service are live and should be reused vs rebuilt
Status: Awaiting cross-repo decision
