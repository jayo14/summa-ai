"""Extend artifacts table for LearningActivity fields.

Revision ID: 0004
Revises: 0003
Create Date: 2026-09-04
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        ALTER TABLE summa_ai.artifacts
            ADD COLUMN IF NOT EXISTS purpose TEXT,
            ADD COLUMN IF NOT EXISTS concept_ids JSONB DEFAULT '[]'::jsonb,
            ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50),
            ADD COLUMN IF NOT EXISTS estimated_minutes INT,
            ADD COLUMN IF NOT EXISTS learning_signals JSONB DEFAULT '{}'::jsonb;
    """)


def downgrade() -> None:
    op.execute("""
        ALTER TABLE summa_ai.artifacts
            DROP COLUMN IF EXISTS learning_signals,
            DROP COLUMN IF EXISTS estimated_minutes,
            DROP COLUMN IF EXISTS difficulty,
            DROP COLUMN IF EXISTS concept_ids,
            DROP COLUMN IF EXISTS purpose;
    """)
