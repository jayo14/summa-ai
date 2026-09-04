"""Alembic migration for Phase 6 Notifications and Study Plan Approval."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(sa.text("""
        ALTER TABLE summa_ai.study_plans
            ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE;
    """))

    op.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS summa_ai.notifications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id VARCHAR(255) NOT NULL,
            type VARCHAR(100) NOT NULL,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """))
    op.execute(sa.text("""
        CREATE INDEX IF NOT EXISTS idx_notifications_user ON summa_ai.notifications(user_id, created_at DESC);
    """))


def downgrade() -> None:
    op.execute(sa.text("DROP TABLE IF EXISTS summa_ai.notifications;"))
    op.execute(sa.text("ALTER TABLE summa_ai.study_plans DROP COLUMN IF EXISTS approved;"))
