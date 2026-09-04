"""Alembic migration for mastery model and learner state.

Revision ID: 0005
Revises: 0004
Create Date: 2026-09-04
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(sa.text("""
        ALTER TABLE summa_ai.concepts
            ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES summa_ai.concepts(id) ON DELETE SET NULL,
            ADD COLUMN IF NOT EXISTS subject VARCHAR(255),
            ADD COLUMN IF NOT EXISTS course VARCHAR(255);
    """))

    op.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS summa_ai.mastery_records (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id VARCHAR(255) NOT NULL,
            concept_id VARCHAR(255) NOT NULL,
            depth FLOAT,
            problem_solving FLOAT,
            speed FLOAT,
            consistency FLOAT,
            confidence FLOAT,
            creativity FLOAT,
            evidence_count INT DEFAULT 0,
            last_evidence_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, concept_id)
        );
    """))
    op.execute(sa.text("""
        CREATE INDEX IF NOT EXISTS idx_mastery_records_user_concept ON summa_ai.mastery_records(user_id, concept_id);
    """))

    op.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS summa_ai.activity_attempts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            activity_id VARCHAR(255),
            user_id VARCHAR(255) NOT NULL,
            concept_ids JSONB DEFAULT '[]'::jsonb,
            correct BOOLEAN NOT NULL,
            score FLOAT,
            difficulty VARCHAR(50),
            response_time_ms INT,
            confidence_rating INT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """))
    op.execute(sa.text("""
        CREATE INDEX IF NOT EXISTS idx_activity_attempts_user_created ON summa_ai.activity_attempts(user_id, created_at DESC);
    """))

    op.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS summa_ai.misconceptions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id VARCHAR(255) NOT NULL,
            concept_id VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            confidence VARCHAR(50) DEFAULT 'medium',
            occurrences INT DEFAULT 1,
            last_observed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, concept_id, description)
        );
    """))
    op.execute(sa.text("""
        CREATE INDEX IF NOT EXISTS idx_misconceptions_user_concept ON summa_ai.misconceptions(user_id, concept_id);
    """))


def downgrade() -> None:
    op.execute(sa.text("DROP TABLE IF EXISTS summa_ai.misconceptions;"))
    op.execute(sa.text("DROP TABLE IF EXISTS summa_ai.activity_attempts;"))
    op.execute(sa.text("DROP TABLE IF EXISTS summa_ai.mastery_records;"))
    op.execute(sa.text("""
        ALTER TABLE summa_ai.concepts
            DROP COLUMN IF EXISTS course,
            DROP COLUMN IF EXISTS subject,
            DROP COLUMN IF EXISTS parent_id;
    """))
