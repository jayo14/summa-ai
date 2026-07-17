# Summa AI — Changelog

## 2026-07-17
- Added: SYSTEM_ARCHITECTURE.md, AI_ARCHITECTURE.md, PRODUCT_BOUNDARIES.md, INTEGRATION_STRATEGY.md, PROJECT_AUDIT.md, TECHNICAL_DEBT.md, SECURITY_REPORT.md, SCALABILITY_REPORT.md, PROJECT_ROADMAP.md, PROGRESS.md, NEXT_STEPS.md, TECHNICAL_DECISIONS.md.
- No application code changed this session (audit-only, by design) — this includes the credential finding, which is documented but NOT yet fixed in code; that requires your go-ahead or a dedicated next session.

## 2026-07-17 (Milestone 1 — Security Emergency)
### Changed
- `apps/api/app/config.py`: Added `ZAI_API_KEY`, `ZAI_TOKEN`, `ZAI_USER_ID` fields to `Settings` class.
- `apps/api/app/routes/chat.py`: Removed hardcoded Z.ai credentials; reads from `settings` instead.
- `apps/api/app/main.py`: Added lifespan guard that raises `RuntimeError` if `ENVIRONMENT=production` and `JWT_SECRET_KEY` is the default.
- `.env.example`: Added `ZAI_API_KEY`, `ZAI_TOKEN`, `ZAI_USER_ID` placeholder entries under Backend section.
- `apps/api/.env`, `apps/api/.env.production`: Added Z.ai credential placeholders.
- `README.md`: Added Z.ai rows to the backend env vars table.
- `DEPLOYMENT.md`: Added Z.ai section under Optional Configuration.
### Removed
- Hardcoded JWT token (`ZAI_TOKEN`) and user ID (`ZAI_USER_ID`) from chat.py source.

### ⚠️ Manual action still required
- Rotate/revoke the old hardcoded Z.ai token at https://internal-api.z.ai. The code now reads from env vars, but the old committed token is still potentially compromised and must be invalidated on Z.ai's side.
