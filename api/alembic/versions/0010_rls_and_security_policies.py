"""Alembic migration for Row Level Security (RLS) policies and table security on Supabase.

Revision ID: 0010_rls_and_security_policies
Revises: 0009
Create Date: 2026-09-04
"""

from alembic import op
import sqlalchemy as sa

revision = "0010_rls_and_security_policies"
down_revision = "0009"
branch_labels = None
depends_on = None

# List of tables in the summa_ai schema that store user-owned data where column is user_id.
SUMMA_TABLES_WITH_USER_ID = [
    "conversations",
    "artifacts",
    "timeline_events",
    "settings",
    "materials",
    "concepts",
    "study_plans",
    "flashcards",
    "exams",
    "quiz_results",
    "memory_entries",
    "mastery_records",
    "activity_attempts",
    "misconceptions",
    "resource_chunks",
    "resource_permissions",
    "message_sources",
    "past_question_sets",
    "past_questions",
    "notifications",
    "exam_feedback",
    "prediction_evaluations",
]


def upgrade() -> None:
    # 1. Grant usage on schema summa_ai to anon, authenticated, and service_role
    op.execute(sa.text("GRANT USAGE ON SCHEMA summa_ai TO anon, authenticated, service_role;"))
    op.execute(sa.text("GRANT ALL ON ALL TABLES IN SCHEMA summa_ai TO authenticated, service_role;"))
    op.execute(sa.text("GRANT ALL ON ALL SEQUENCES IN SCHEMA summa_ai TO authenticated, service_role;"))
    op.execute(sa.text("ALTER DEFAULT PRIVILEGES IN SCHEMA summa_ai GRANT ALL ON TABLES TO authenticated, service_role;"))

    # 2. Enable RLS and add owner policy for user_profiles (where PK `id` corresponds to auth.uid())
    op.execute(sa.text("ALTER TABLE summa_ai.user_profiles ENABLE ROW LEVEL SECURITY;"))
    op.execute(sa.text("DROP POLICY IF EXISTS owner_manage_user_profiles ON summa_ai.user_profiles;"))
    op.execute(sa.text("""
        CREATE POLICY owner_manage_user_profiles ON summa_ai.user_profiles
        FOR ALL
        TO authenticated
        USING ( (SELECT auth.uid())::text = id::text )
        WITH CHECK ( (SELECT auth.uid())::text = id::text );
    """))

    # 3. Enable RLS and add strict user-isolation policies for user-owned tables (user_id column)
    for table in SUMMA_TABLES_WITH_USER_ID:
        op.execute(sa.text(f"ALTER TABLE summa_ai.{table} ENABLE ROW LEVEL SECURITY;"))
        op.execute(sa.text(f"DROP POLICY IF EXISTS owner_manage_{table} ON summa_ai.{table};"))
        op.execute(sa.text(f"""
            CREATE POLICY owner_manage_{table} ON summa_ai.{table}
            FOR ALL
            TO authenticated
            USING ( (SELECT auth.uid())::text = user_id::text )
            WITH CHECK ( (SELECT auth.uid())::text = user_id::text );
        """))

    # 4. Enable RLS and add owner-linked policies for messages (via conversations)
    op.execute(sa.text("ALTER TABLE summa_ai.messages ENABLE ROW LEVEL SECURITY;"))
    op.execute(sa.text("DROP POLICY IF EXISTS owner_manage_messages ON summa_ai.messages;"))
    op.execute(sa.text("""
        CREATE POLICY owner_manage_messages ON summa_ai.messages
        FOR ALL
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM summa_ai.conversations c
                WHERE c.id = messages.conversation_id
                AND c.user_id::text = (SELECT auth.uid())::text
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM summa_ai.conversations c
                WHERE c.id = messages.conversation_id
                AND c.user_id::text = (SELECT auth.uid())::text
            )
        );
    """))

    # 5. Enable RLS and add owner-linked policies for artifact_versions (via artifacts)
    op.execute(sa.text("ALTER TABLE summa_ai.artifact_versions ENABLE ROW LEVEL SECURITY;"))
    op.execute(sa.text("DROP POLICY IF EXISTS owner_manage_artifact_versions ON summa_ai.artifact_versions;"))
    op.execute(sa.text("""
        CREATE POLICY owner_manage_artifact_versions ON summa_ai.artifact_versions
        FOR ALL
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM summa_ai.artifacts a
                WHERE a.id = artifact_versions.artifact_id
                AND a.user_id::text = (SELECT auth.uid())::text
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM summa_ai.artifacts a
                WHERE a.id = artifact_versions.artifact_id
                AND a.user_id::text = (SELECT auth.uid())::text
            )
        );
    """))

    # 6. Enable RLS and add owner-linked policies for study_sessions (via study_plans)
    op.execute(sa.text("ALTER TABLE summa_ai.study_sessions ENABLE ROW LEVEL SECURITY;"))
    op.execute(sa.text("DROP POLICY IF EXISTS owner_manage_study_sessions ON summa_ai.study_sessions;"))
    op.execute(sa.text("""
        CREATE POLICY owner_manage_study_sessions ON summa_ai.study_sessions
        FOR ALL
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM summa_ai.study_plans p
                WHERE p.id = study_sessions.plan_id
                AND p.user_id::text = (SELECT auth.uid())::text
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM summa_ai.study_plans p
                WHERE p.id = study_sessions.plan_id
                AND p.user_id::text = (SELECT auth.uid())::text
            )
        );
    """))

    # 7. Enable RLS on rate_limit_hits
    op.execute(sa.text("ALTER TABLE summa_ai.rate_limit_hits ENABLE ROW LEVEL SECURITY;"))
    op.execute(sa.text("DROP POLICY IF EXISTS service_manage_rate_limits ON summa_ai.rate_limit_hits;"))
    op.execute(sa.text("""
        CREATE POLICY service_manage_rate_limits ON summa_ai.rate_limit_hits
        FOR ALL
        TO authenticated, service_role
        USING (true)
        WITH CHECK (true);
    """))


def downgrade() -> None:
    op.execute(sa.text("DROP POLICY IF EXISTS owner_manage_user_profiles ON summa_ai.user_profiles;"))
    op.execute(sa.text("ALTER TABLE summa_ai.user_profiles DISABLE ROW LEVEL SECURITY;"))
    for table in SUMMA_TABLES_WITH_USER_ID:
        op.execute(sa.text(f"DROP POLICY IF EXISTS owner_manage_{table} ON summa_ai.{table};"))
        op.execute(sa.text(f"ALTER TABLE summa_ai.{table} DISABLE ROW LEVEL SECURITY;"))
    op.execute(sa.text("DROP POLICY IF EXISTS owner_manage_messages ON summa_ai.messages;"))
    op.execute(sa.text("DROP POLICY IF EXISTS owner_manage_artifact_versions ON summa_ai.artifact_versions;"))
    op.execute(sa.text("DROP POLICY IF EXISTS owner_manage_study_sessions ON summa_ai.study_sessions;"))
    op.execute(sa.text("DROP POLICY IF EXISTS service_manage_rate_limits ON summa_ai.rate_limit_hits;"))
