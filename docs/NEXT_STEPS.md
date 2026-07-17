# Summa AI — Next Steps

1. ~~Rotate the exposed Z.ai token today, independent of any other work.~~ **⚠️ YOU STILL NEED TO DO THIS — code changes are done, but the credential must be rotated at https://internal-api.z.ai manually.**
2. ✅ Move Z.ai credentials to environment variables.
3. ✅ Add a startup guard rejecting the default JWT_SECRET_KEY in production.
4. ✅ Route chat generation through Settings-based provider config (ZAI_API_BASE, ZAI_MODEL added).
5. ✅ Remove unused Prisma scaffolding (prisma/ dir, deps, dead db.ts).
6. ✅ Grep the rest of apps/api for any other hardcoded credential-shaped strings beyond chat.py — **Done: no additional hardcoded credentials found.** Searched the full codebase (apps/api + src/) for JWT tokens, API keys, and credential patterns; all clean. The Milestone 1-2 changes (env-var-ification + Prisma removal) covered the full credential surface.
7. **Awaiting decision** — Confirmed that SummaStudy's `study_planner.py`, `spaced_repetition.py`, `memory_service.py`, and `recommendation_service.py` are **all live and actively used** in routes, agents, tasks, and tests. See `docs/PROGRESS.md` for the full import graph. Decision needed: reuse vs. rebuild for Summa AI's adaptive layer.
8. **Awaiting decision** — Review and confirm the INTEGRATION_STRATEGY.md recommendation before any identity/data migration work begins.
