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

## Step 2: Update user_store.py to use Postgres

After the schema is applied, `user_store.py` needs to be updated to connect to Supabase Postgres instead of SQLite. The file to edit is `apps/api/app/services/user_store.py`.

### What needs to change:

1. **Connection**: Replace `sqlite3.connect()` with `asyncpg` or `psycopg2` connecting to the Supabase Postgres instance using `DATABASE_URL`.

2. **Schema prefix**: All table references need `summa_ai.` prefix.

3. **SQL dialect**: Postgres uses `$1` instead of `?` for parameter placeholders. `UUID` type instead of `TEXT PRIMARY KEY`. `BOOLEAN` instead of `INTEGER`.

4. **Add dependency**: Add `asyncpg` or `psycopg2-binary` to `apps/api/app/requirements.txt`.

### Connection string (from SummaStudy's .env):
```
postgresql://postgres:XpRANBdQVBIxtntB@db.qzynckcdexotmoxtgzuz.supabase.co:5432/postgres
```

Add this as `DATABASE_URL` in production env vars.

### Key changes file-by-file:

| File | Change |
|---|---|
| `apps/api/app/config.py` | Update `DATABASE_URL` default to point at Supabase |
| `apps/api/app/services/user_store.py` | Replace `sqlite3` with `asyncpg`; add `summa_ai.` schema prefix; update parameter style |
| `apps/api/app/requirements.txt` | Add `asyncpg` |

### Note
Currently the backend stores user profiles, artifacts, conversations, etc. in **in-memory dicts** (in `data_routes.py`) or **SQLite** (in `user_store.py`). After the Supabase migration:
- `user_store.py` → Supabase Postgres, `summa_ai.user_profiles` table
- `data_routes.py` in-memory stores → Supabase Postgres tables (optional — in-memory works for demo)

The trigger in step 1 handles auto-creating user profiles on first Supabase Auth login, so `user_store.create_user()` and `authenticate_credentials()` become unnecessary.

### Testing after migration
```bash
cd apps/api && venv/bin/python -m pytest tests/ -v
```
All 19 tests should still pass (they mock the data layer, not the real database).
