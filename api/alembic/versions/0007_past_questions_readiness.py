"""Alembic migration for Phase 5 Past Questions & Exam Readiness."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = "0007"
down_revision = "0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS summa_ai.past_question_sets (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id VARCHAR(255) NOT NULL,
            exam_id VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            year INT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """))

    op.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS summa_ai.past_questions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            set_id VARCHAR(255) NOT NULL,
            exam_id VARCHAR(255) NOT NULL,
            user_id VARCHAR(255) NOT NULL,
            year INT,
            topic VARCHAR(255) NOT NULL,
            question_type VARCHAR(100),
            question_text TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """))
    op.execute(sa.text("""
        CREATE INDEX IF NOT EXISTS idx_past_questions_exam ON summa_ai.past_questions(exam_id, user_id);
    """))


def downgrade() -> None:
    op.execute(sa.text("DROP TABLE IF EXISTS summa_ai.past_questions;"))
    op.execute(sa.text("DROP TABLE IF EXISTS summa_ai.past_question_sets;"))
