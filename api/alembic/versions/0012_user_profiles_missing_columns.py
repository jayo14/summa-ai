"""Add missing status and email_verified columns to summa_ai.user_profiles.

Revision ID: 0012_user_profiles_missing_columns
Revises: 0011_add_role_enum
Create Date: 2026-09-06
"""

from alembic import op
import sqlalchemy as sa

revision = "0012_user_profiles_missing_columns"
down_revision = "0011_add_role_enum"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(sa.text("""
        ALTER TABLE summa_ai.user_profiles
            ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
            ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;
    """))

    # Back-fill existing rows: anyone already in the table has a verified
    # email (they authenticated via Supabase) and is active.
    op.execute(sa.text("""
        UPDATE summa_ai.user_profiles
        SET status = 'active', email_verified = TRUE
        WHERE status = 'active' OR email_verified = FALSE;
    """))


def downgrade() -> None:
    op.execute(sa.text("""
        ALTER TABLE summa_ai.user_profiles
            DROP COLUMN IF EXISTS status,
            DROP COLUMN IF EXISTS email_verified;
    """))
