"""Alembic migration for Phase 8 Outcome Loop (Post-exam feedback & prediction evaluation)."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = "0009"
down_revision = "0008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS summa_ai.exam_feedback (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            exam_id VARCHAR(255) NOT NULL,
            user_id VARCHAR(255) NOT NULL,
            outcome_rating VARCHAR(50) NOT NULL, -- Great, Okay, Difficult, Very difficult
            resembled_practice BOOLEAN,
            topics_appeared JSONB DEFAULT '[]'::jsonb,
            unprepared_topics JSONB DEFAULT '[]'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, exam_id)
        );

        CREATE TABLE IF NOT EXISTS summa_ai.prediction_evaluations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            exam_id VARCHAR(255) NOT NULL,
            user_id VARCHAR(255) NOT NULL,
            predicted_topic VARCHAR(255) NOT NULL,
            actually_appeared BOOLEAN NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """)


def downgrade() -> None:
    op.execute("""
        DROP TABLE IF EXISTS summa_ai.prediction_evaluations;
        DROP TABLE IF EXISTS summa_ai.exam_feedback;
    """)
