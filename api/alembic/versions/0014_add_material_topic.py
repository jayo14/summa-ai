"""Add topic column to materials table.

Revision ID: 0014_add_material_topic
Revises: 0013_model_providers
Create Date: 2026-09-08
"""

from alembic import op
import sqlalchemy as sa

revision = "0014_add_material_topic"
down_revision = "0013_model_providers"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "materials",
        sa.Column("topic", sa.Text(), nullable=True),
        schema="summa_ai",
    )


def downgrade() -> None:
    op.drop_column("materials", "topic", schema="summa_ai")
