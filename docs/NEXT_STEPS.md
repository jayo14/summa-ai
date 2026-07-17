# Summa AI — Next Steps

1. ~~Rotate the exposed Z.ai token today, independent of any other work.~~ **⚠️ YOU STILL NEED TO DO THIS — code changes are done, but the credential must be rotated at https://internal-api.z.ai manually.**
2. ✅ Move Z.ai credentials to environment variables.
3. ✅ Add a startup guard rejecting the default JWT_SECRET_KEY in production.
4. ✅ Route chat generation through Settings-based provider config (ZAI_API_BASE, ZAI_MODEL added).
5. ✅ Remove unused Prisma scaffolding (prisma/ dir, deps, dead db.ts).
6. ✅ Grep the rest of apps/api for any other hardcoded credential-shaped strings beyond chat.py — **Done: no additional hardcoded credentials found.** Searched the full codebase (apps/api + src/) for JWT tokens, API keys, and credential patterns; all clean. The Milestone 1-2 changes (env-var-ification + Prisma removal) covered the full credential surface.
7. ✅ **Milestone 5 complete** — SummaStudy's services adopted as integration targets (reuse decision). Hybrid memory layer built with Cognee primary + SummaStudy-style atomic facts in shared `user_memories` table. SummaStudy API client for study planner, spaced repetition, and recommendations. See `PROJECT_ROADMAP.md` for details.
8. ✅ Integration strategy confirmed and Milestone 3 executed — Supabase Auth adopted (backend switch + auth routes proxy). Schema migration script created and **run** via Supabase Dashboard SQL Editor. `user_store.py` rewritten with `asyncpg` to connect to Supabase Postgres. Settings routes migrated to Postgres upsert.
