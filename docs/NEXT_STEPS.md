# Summa AI — Next Steps

1. ~~Rotate the exposed Z.ai token today, independent of any other work.~~ **⚠️ YOU STILL NEED TO DO THIS — code changes are done, but the credential must be rotated at https://internal-api.z.ai manually.**
2. ✅ Move Z.ai credentials to environment variables.
3. ✅ Add a startup guard rejecting the default JWT_SECRET_KEY in production.
4. **Pending** — Grep the rest of apps/api for any other hardcoded credential-shaped strings beyond chat.py.
5. **Pending** — Confirm with yourself (or check directly) whether SummaStudy's study_planner.py/spaced_repetition.py/memory_service.py are actually live before building Summa AI's adaptive layer further.
6. **Pending** — Review and confirm the INTEGRATION_STRATEGY.md recommendation before any identity/data migration work begins.
