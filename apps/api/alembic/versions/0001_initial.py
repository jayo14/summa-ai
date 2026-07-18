"""Initial summa_ai schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-07-18

Mirrors db/migrate_to_supabase.sql so `alembic upgrade head` produces the
same schema that is otherwise applied manually via the Supabase SQL Editor.
The pgvector `embedding` column on public.user_memories is created only when
the `vector` extension is available, so this migration also runs on a stock
postgres:16 image (CI) that does not ship pgvector.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # The schema references auth.users (provided by Supabase in production).
    # On a plain Postgres (CI/dev without Supabase) create a minimal stub so
    # the foreign keys resolve. No-op when auth.users already exists.
    op.execute("CREATE SCHEMA IF NOT EXISTS auth")
    op.execute("CREATE TABLE IF NOT EXISTS auth.users (id UUID PRIMARY KEY)")

    op.execute("CREATE SCHEMA IF NOT EXISTS summa_ai")

    op.create_table(
        "user_profiles",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("email", sa.Text(), nullable=False),
        sa.Column("name", sa.Text(), nullable=True),
        sa.Column("avatar", sa.Text(), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("provider", sa.Text(), nullable=True, server_default="credentials"),
        sa.Column("onboarded", sa.Boolean(), nullable=True, server_default=sa.text("FALSE")),
        sa.Column("onboarding_data", sa.JSON(), nullable=True, server_default=sa.text("'{}'")),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=True, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), nullable=True, server_default=sa.text("NOW()")),
        schema="summa_ai",
    )

    op.create_table(
        "conversations",
        sa.Column("id", sa.UUID(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("title", sa.Text(), nullable=True, server_default="New chat"),
        sa.Column("snippet", sa.Text(), nullable=True),
        sa.Column("archived", sa.Boolean(), nullable=True, server_default=sa.text("FALSE")),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=True, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), nullable=True, server_default=sa.text("NOW()")),
        schema="summa_ai",
    )

    op.create_table(
        "messages",
        sa.Column("id", sa.UUID(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("conversation_id", sa.UUID(), nullable=False),
        sa.Column("role", sa.Text(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("reasoning", sa.Text(), nullable=True),
        sa.Column("components", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=True, server_default=sa.text("NOW()")),
        schema="summa_ai",
    )

    op.create_table(
        "artifacts",
        sa.Column("id", sa.UUID(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("conversation_id", sa.UUID(), nullable=True),
        sa.Column("title", sa.Text(), nullable=True),
        sa.Column("type", sa.Text(), nullable=True),
        sa.Column("source", sa.Text(), nullable=True),
        sa.Column("source_label", sa.Text(), nullable=True),
        sa.Column("parent_artifact_id", sa.UUID(), nullable=True),
        sa.Column("current_version", sa.Integer(), nullable=True, server_default=sa.text("1")),
        sa.Column("archived", sa.Boolean(), nullable=True, server_default=sa.text("FALSE")),
        sa.Column("pinned", sa.Boolean(), nullable=True, server_default=sa.text("FALSE")),
        sa.Column("component", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=True, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), nullable=True, server_default=sa.text("NOW()")),
        schema="summa_ai",
    )

    op.create_table(
        "timeline_events",
        sa.Column("id", sa.UUID(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("type", sa.Text(), nullable=False),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("metadata", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=True, server_default=sa.text("NOW()")),
        schema="summa_ai",
    )

    op.create_table(
        "settings",
        sa.Column("user_id", sa.UUID(), primary_key=True),
        sa.Column("theme", sa.Text(), nullable=True, server_default="system"),
        sa.Column("font_size", sa.Integer(), nullable=True, server_default=sa.text("14")),
        sa.Column("density", sa.Text(), nullable=True, server_default="comfortable"),
        sa.Column("exam_reminders", sa.Boolean(), nullable=True, server_default=sa.text("TRUE")),
        sa.Column("proactive_check_ins", sa.Boolean(), nullable=True, server_default=sa.text("TRUE")),
        sa.Column("weekly_progress", sa.Boolean(), nullable=True, server_default=sa.text("TRUE")),
        sa.Column("email_notifications", sa.Boolean(), nullable=True, server_default=sa.text("TRUE")),
        sa.Column("thinking_mode", sa.Boolean(), nullable=True, server_default=sa.text("TRUE")),
        sa.Column("response_style", sa.Text(), nullable=True, server_default="balanced"),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), nullable=True, server_default=sa.text("NOW()")),
        schema="summa_ai",
    )

    op.create_table(
        "materials",
        sa.Column("id", sa.UUID(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("type", sa.Text(), nullable=True),
        sa.Column("title", sa.Text(), nullable=True),
        sa.Column("source", sa.Text(), nullable=True),
        sa.Column("size", sa.Integer(), nullable=True),
        sa.Column("duration", sa.Integer(), nullable=True),
        sa.Column("concepts_extracted", sa.Integer(), nullable=True, server_default=sa.text("0")),
        sa.Column("status", sa.Text(), nullable=True, server_default="processing"),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=True, server_default=sa.text("NOW()")),
        schema="summa_ai",
    )

    op.create_table(
        "concepts",
        sa.Column("id", sa.UUID(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("category", sa.Text(), nullable=True),
        sa.Column("mastery", sa.Text(), nullable=True),
        sa.Column("material_id", sa.UUID(), nullable=True),
        sa.Column("related_count", sa.Integer(), nullable=True, server_default=sa.text("0")),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=True, server_default=sa.text("NOW()")),
        schema="summa_ai",
    )

    op.create_table(
        "artifact_versions",
        sa.Column("id", sa.UUID(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("artifact_id", sa.UUID(), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("title", sa.Text(), nullable=True),
        sa.Column("component", sa.JSON(), nullable=True),
        sa.Column("change_note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=True, server_default=sa.text("NOW()")),
        schema="summa_ai",
    )

    op.create_table(
        "study_plans",
        sa.Column("id", sa.UUID(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("progress", sa.Float(), nullable=True, server_default=sa.text("0.0")),
        sa.Column("days_left", sa.Integer(), nullable=True, server_default=sa.text("0")),
        sa.Column("streak", sa.Integer(), nullable=True, server_default=sa.text("0")),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=True, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), nullable=True, server_default=sa.text("NOW()")),
        schema="summa_ai",
    )

    op.create_table(
        "study_sessions",
        sa.Column("id", sa.UUID(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("plan_id", sa.UUID(), nullable=False),
        sa.Column("day", sa.Text(), nullable=False),
        sa.Column("topic", sa.Text(), nullable=False),
        sa.Column("status", sa.Text(), nullable=True, server_default="upcoming"),
        sa.Column("duration", sa.Text(), nullable=True, server_default="30 min"),
        sa.Column("sort_order", sa.Integer(), nullable=True, server_default=sa.text("0")),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=True, server_default=sa.text("NOW()")),
        schema="summa_ai",
    )

    op.create_table(
        "flashcards",
        sa.Column("id", sa.UUID(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("front", sa.Text(), nullable=False),
        sa.Column("back", sa.Text(), nullable=False),
        sa.Column("mastered", sa.Boolean(), nullable=True, server_default=sa.text("FALSE")),
        sa.Column("ease_factor", sa.Float(), nullable=True, server_default=sa.text("2.5")),
        sa.Column("interval_days", sa.Integer(), nullable=True, server_default=sa.text("0")),
        sa.Column("repetitions", sa.Integer(), nullable=True, server_default=sa.text("0")),
        sa.Column("next_review_at", sa.TIMESTAMP(timezone=True), nullable=True, server_default=sa.text("NOW()")),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=True, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), nullable=True, server_default=sa.text("NOW()")),
        schema="summa_ai",
    )

    op.create_table(
        "exams",
        sa.Column("id", sa.UUID(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("exam_date", sa.Date(), nullable=False),
        sa.Column("readiness", sa.Integer(), nullable=True, server_default=sa.text("0")),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=True, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), nullable=True, server_default=sa.text("NOW()")),
        schema="summa_ai",
    )

    op.create_index("idx_conversations_user_id", "conversations", ["user_id"], schema="summa_ai")
    op.create_index("idx_messages_conversation_id", "messages", ["conversation_id"], schema="summa_ai")
    op.create_index("idx_artifacts_user_id", "artifacts", ["user_id"], schema="summa_ai")
    op.create_index("idx_timeline_events_user_id", "timeline_events", ["user_id"], schema="summa_ai")
    op.create_index("idx_materials_user_id", "materials", ["user_id"], schema="summa_ai")
    op.create_index("idx_concepts_user_id", "concepts", ["user_id"], schema="summa_ai")
    op.create_index("idx_artifact_versions_artifact_id", "artifact_versions", ["artifact_id", "version"], schema="summa_ai")
    op.create_index("idx_study_plans_user_id", "study_plans", ["user_id"], schema="summa_ai")
    op.create_index("idx_study_sessions_plan_id", "study_sessions", ["plan_id"], schema="summa_ai")
    op.create_index("idx_flashcards_user_id", "flashcards", ["user_id"], schema="summa_ai")
    op.create_index("idx_exams_user_id", "exams", ["user_id"], schema="summa_ai")

    # Foreign keys are added with raw DDL because the referenced table
    # (auth.users) lives in a different schema than the one SQLAlchemy's
    # metadata knows about.
    _fk_statements = [
        "ALTER TABLE summa_ai.conversations ADD CONSTRAINT fk_conversations_user "
        "FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE",
        "ALTER TABLE summa_ai.messages ADD CONSTRAINT fk_messages_conversation "
        "FOREIGN KEY (conversation_id) REFERENCES summa_ai.conversations(id) ON DELETE CASCADE",
        "ALTER TABLE summa_ai.artifacts ADD CONSTRAINT fk_artifacts_user "
        "FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE",
        "ALTER TABLE summa_ai.artifacts ADD CONSTRAINT fk_artifacts_conversation "
        "FOREIGN KEY (conversation_id) REFERENCES summa_ai.conversations(id) ON DELETE CASCADE",
        "ALTER TABLE summa_ai.artifacts ADD CONSTRAINT fk_artifacts_parent "
        "FOREIGN KEY (parent_artifact_id) REFERENCES summa_ai.artifacts(id)",
        "ALTER TABLE summa_ai.timeline_events ADD CONSTRAINT fk_timeline_user "
        "FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE",
        "ALTER TABLE summa_ai.settings ADD CONSTRAINT fk_settings_user "
        "FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE",
        "ALTER TABLE summa_ai.materials ADD CONSTRAINT fk_materials_user "
        "FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE",
        "ALTER TABLE summa_ai.concepts ADD CONSTRAINT fk_concepts_user "
        "FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE",
        "ALTER TABLE summa_ai.concepts ADD CONSTRAINT fk_concepts_material "
        "FOREIGN KEY (material_id) REFERENCES summa_ai.materials(id)",
        "ALTER TABLE summa_ai.artifact_versions ADD CONSTRAINT fk_artifact_versions_artifact "
        "FOREIGN KEY (artifact_id) REFERENCES summa_ai.artifacts(id) ON DELETE CASCADE",
        "ALTER TABLE summa_ai.study_plans ADD CONSTRAINT fk_study_plans_user "
        "FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE",
        "ALTER TABLE summa_ai.study_sessions ADD CONSTRAINT fk_study_sessions_plan "
        "FOREIGN KEY (plan_id) REFERENCES summa_ai.study_plans(id) ON DELETE CASCADE",
        "ALTER TABLE summa_ai.flashcards ADD CONSTRAINT fk_flashcards_user "
        "FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE",
        "ALTER TABLE summa_ai.exams ADD CONSTRAINT fk_exams_user "
        "FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE",
    ]
    for _stmt in _fk_statements:
        op.execute(_stmt)

    # public.user_memories — shared with SummaStudy. The embedding column
    # requires the pgvector extension; create the table always, then add the
    # embedding column only when the extension is available so this migration
    # also applies on a stock postgres image (CI) without pgvector.
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS public.user_memories (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            memory_type TEXT NOT NULL DEFAULT 'fact',
            content TEXT NOT NULL,
            confidence FLOAT DEFAULT 1.0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            last_accessed_at TIMESTAMPTZ DEFAULT NOW()
        );
        """
    )
    # The embedding column requires the pgvector extension, which is not
    # present on a stock postgres image (CI). Best-effort: add it only when
    # the extension can be created, otherwise leave it out (Supabase has it).
    # Run on a separate autocommit connection in its own thread/event-loop so
    # a failure here (extension unavailable) does not abort the enclosing
    # migration transaction.
    import asyncio
    import threading

    from app.config import settings as _settings
    from sqlalchemy.ext.asyncio import create_async_engine

    def _maybe_add_embedding():
        async def _run():
            _url = _settings.DATABASE_URL.replace(
                "postgresql://", "postgresql+asyncpg://", 1
            )
            _engine = create_async_engine(_url, poolclass=sa.pool.NullPool)
            async with _engine.connect() as _c:
                _c = _c.execution_options(isolation_level="AUTOCOMMIT")
                try:
                    await _c.execute(sa.text("CREATE EXTENSION IF NOT EXISTS vector"))
                    await _c.execute(
                        sa.text(
                            "ALTER TABLE public.user_memories "
                            "ADD COLUMN IF NOT EXISTS embedding vector(1536)"
                        )
                    )
                except Exception:
                    pass
            await _engine.dispose()

        asyncio.run(_run())

    _thread = threading.Thread(target=_maybe_add_embedding)
    _thread.start()
    _thread.join()
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_user_memories_user_id ON public.user_memories(user_id)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_user_memories_type ON public.user_memories(user_id, memory_type)"
    )

    # Auto-create user profile on first Supabase login.
    op.execute(
        """
        CREATE OR REPLACE FUNCTION summa_ai.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
            INSERT INTO summa_ai.user_profiles (id, email, name, avatar)
            VALUES (
                NEW.id,
                NEW.email,
                NEW.raw_user_meta_data ->> 'name',
                NEW.raw_user_meta_data ->> 'avatar'
            )
            ON CONFLICT (id) DO NOTHING;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        """
    )
    op.execute("DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users")
    op.execute(
        """
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION summa_ai.handle_new_user();
        """
    )


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users")
    op.execute("DROP FUNCTION IF EXISTS summa_ai.handle_new_user()")
    op.execute("DROP TABLE IF EXISTS public.user_memories")

    op.drop_index("idx_exams_user_id", "exams", schema="summa_ai")
    op.drop_index("idx_flashcards_user_id", "flashcards", schema="summa_ai")
    op.drop_index("idx_study_sessions_plan_id", "study_sessions", schema="summa_ai")
    op.drop_index("idx_study_plans_user_id", "study_plans", schema="summa_ai")
    op.drop_index("idx_artifact_versions_artifact_id", "artifact_versions", schema="summa_ai")
    op.drop_index("idx_concepts_user_id", "concepts", schema="summa_ai")
    op.drop_index("idx_materials_user_id", "materials", schema="summa_ai")
    op.drop_index("idx_timeline_events_user_id", "timeline_events", schema="summa_ai")
    op.drop_index("idx_artifacts_user_id", "artifacts", schema="summa_ai")
    op.drop_index("idx_messages_conversation_id", "messages", schema="summa_ai")
    op.drop_index("idx_conversations_user_id", "conversations", schema="summa_ai")

    op.drop_table("exams", schema="summa_ai")
    op.drop_table("flashcards", schema="summa_ai")
    op.drop_table("study_sessions", schema="summa_ai")
    op.drop_table("study_plans", schema="summa_ai")
    op.drop_table("artifact_versions", schema="summa_ai")
    op.drop_table("concepts", schema="summa_ai")
    op.drop_table("materials", schema="summa_ai")
    op.drop_table("settings", schema="summa_ai")
    op.drop_table("timeline_events", schema="summa_ai")
    op.drop_table("artifacts", schema="summa_ai")
    op.drop_table("messages", schema="summa_ai")
    op.drop_table("conversations", schema="summa_ai")
    op.drop_table("user_profiles", schema="summa_ai")

    # Drop the auth stub only if no other objects depend on it.
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.tables
                WHERE table_schema = 'auth' AND table_name <> 'users'
            ) THEN
                DROP TABLE IF EXISTS auth.users;
                DROP SCHEMA IF EXISTS auth;
            END IF;
        END $$;
        """
    )
