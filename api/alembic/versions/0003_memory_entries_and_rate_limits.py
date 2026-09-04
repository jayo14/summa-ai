"""Create memory_entries and rate_limit_hits tables for persistence.

Revision ID: 0003
Revises: 0002
Create Date: 2026-09-04
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB, TIMESTAMP

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS summa_ai.memory_entries (
            id UUID PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            dataset VARCHAR(255) NOT NULL,
            text TEXT NOT NULL,
            metadata JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_memory_entries_user_dataset ON summa_ai.memory_entries(user_id, dataset);

        CREATE TABLE IF NOT EXISTS summa_ai.rate_limit_hits (
            client_ip VARCHAR(255) NOT NULL,
            window_start BIGINT NOT NULL,
            hit_count INT DEFAULT 1,
            PRIMARY KEY (client_ip, window_start)
        );
    """)


def downgrade() -> None:
    op.execute("""
        DROP TABLE IF EXISTS summa_ai.rate_limit_hits;
        DROP TABLE IF EXISTS summa_ai.memory_entries;
    """)
