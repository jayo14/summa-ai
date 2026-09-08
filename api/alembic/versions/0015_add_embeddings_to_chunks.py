"""Add vector embeddings to resource_chunks for RAG semantic search.

Revision ID: 0015_add_embeddings_to_chunks
Revises: 0014_add_material_topic
Create Date: 2026-09-09
"""

from alembic import op
import sqlalchemy as sa

revision = "0015_add_embeddings_to_chunks"
down_revision = "0014_add_material_topic"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Enable pgvector extension (safe to call multiple times)
    op.execute(sa.text("CREATE EXTENSION IF NOT EXISTS vector;"))

    # Add embedding column (1536 dims for text-embedding-3-small)
    op.execute(sa.text(
        "ALTER TABLE summa_ai.resource_chunks "
        "ADD COLUMN IF NOT EXISTS embedding vector(1536);"
    ))

    # Create HNSW index for fast approximate nearest neighbor search
    # HNSW is preferred over IVFFlat for small-to-medium datasets
    # with high query throughput (typical for a learning app).
    op.execute(sa.text("""
        CREATE INDEX IF NOT EXISTS idx_resource_chunks_embedding
        ON summa_ai.resource_chunks
        USING hnsw (embedding vector_cosine_ops)
        WITH (m = 16, ef_construction = 64);
    """))


def downgrade() -> None:
    op.execute(sa.text("DROP INDEX IF EXISTS summa_ai.idx_resource_chunks_embedding;"))
    op.execute(sa.text(
        "ALTER TABLE summa_ai.resource_chunks DROP COLUMN IF EXISTS embedding;"
    ))
