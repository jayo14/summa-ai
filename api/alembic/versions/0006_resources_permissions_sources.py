"""Alembic migration for Phase 4 resource storage, consent permissions, and provenance."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS summa_ai.resource_chunks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            resource_id VARCHAR(255) NOT NULL,
            user_id VARCHAR(255) NOT NULL,
            chunk_text TEXT NOT NULL,
            location VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_resource_chunks_user_resource ON summa_ai.resource_chunks(user_id, resource_id);

        CREATE TABLE IF NOT EXISTS summa_ai.resource_permissions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id VARCHAR(255) NOT NULL,
            resource_id VARCHAR(255) NOT NULL,
            scope VARCHAR(50) NOT NULL, -- session, subject, always
            granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, resource_id, scope)
        );
        CREATE INDEX IF NOT EXISTS idx_resource_permissions_user_resource ON summa_ai.resource_permissions(user_id, resource_id);

        CREATE TABLE IF NOT EXISTS summa_ai.message_sources (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            message_id VARCHAR(255) NOT NULL,
            user_id VARCHAR(255) NOT NULL,
            claim_snippet TEXT NOT NULL,
            resource_id VARCHAR(255) NOT NULL,
            chunk_id VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """)


def downgrade() -> None:
    op.execute("""
        DROP TABLE IF EXISTS summa_ai.message_sources;
        DROP TABLE IF EXISTS summa_ai.resource_permissions;
        DROP TABLE IF EXISTS summa_ai.resource_chunks;
    """)
