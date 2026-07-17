# Migrating Summa AI to Supabase Postgres

## Step 1: Run the schema migration

1. Go to https://supabase.com/dashboard/project/qzynckcdexotmoxtgzuz
2. Open the **SQL Editor** (left sidebar)
3. Click **New Query**
4. Paste the entire contents of `db/migrate_to_supabase.sql`
5. Click **Run** (or `Cmd+Enter`)

Expected: All 11 steps execute successfully. You'll see `CREATE SCHEMA`, `CREATE TABLE` (x8), `CREATE INDEX` (x6), `CREATE FUNCTION`, and `CREATE TRIGGER` confirmations.

To verify, run this in the SQL Editor:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'summa_ai'
ORDER BY table_name;
```
Expected: `artifacts`, `concepts`, `conversations`, `materials`, `messages`, `settings`, `timeline_events`, `user_profiles`.

Also verify the trigger exists:
```sql
SELECT event_object_table, trigger_name FROM information_schema.triggers
WHERE trigger_schema = 'summa_ai';
```
Expected: `on_auth_user_created` on `auth.users`.

## Status: ✅ COMPLETED

All Postgres migration code changes have been applied:

| File | Change |
|---|---|
| `apps/api/app/config.py` | `DATABASE_URL` default updated to Postgres format |
| `apps/api/app/services/user_store.py` | Rewritten — `asyncpg` pool connecting to `summa_ai.user_profiles` |
| `apps/api/app/routes/data_routes.py` | User profile routes use async `UserStore`; settings routes query `summa_ai.settings` with upsert |
| `apps/api/requirements.txt` | `asyncpg==0.31.0` added |
| `apps/api/app/requirements.txt` | `asyncpg==0.31.0` added |
| `.env.example` | `DATABASE_URL` placeholder updated to Postgres format |
| `apps/api/.env` | `DATABASE_URL` set to Supabase Postgres |
| `apps/api/.env.production` | `DATABASE_URL` set to Supabase Postgres |

### Remaining in-memory stores (optional — work for demo)
Artifacts, conversations, messages, timeline events, materials, and concepts still use in-memory dicts in `data_routes.py`. These can be migrated to Postgres later if needed.

### Testing
```bash
cd apps/api && venv/bin/python -m pytest tests/ -v
```
All 19 tests pass.
