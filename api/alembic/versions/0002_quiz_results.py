"""Add quiz_results table

Revision ID: 0002_quiz_results
Revises: 0001_initial
Create Date: 2026-08-20

Backs the POST /interactions/quiz-result endpoint (Phase 4: the
interaction -> memory -> next-response feedback loop). Mirrors
db/migrate_to_supabase.sql's "Step 19: Quiz results" block so both sources
stay in sync, per this repo's existing convention of hand-mirroring the two
(see 0001_initial's docstring).
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0002_quiz_results"
down_revision: Union[str, None] = "0001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "quiz_results",
        sa.Column(
            "id",
            sa.UUID(),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("artifact_id", sa.UUID(), nullable=True),
        sa.Column("topic", sa.Text(), nullable=False),
        sa.Column("score", sa.Float(), nullable=False),
        sa.Column("answers", sa.JSON(), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=True,
            server_default=sa.text("NOW()"),
        ),
        schema="summa_ai",
    )

    op.create_index(
        "idx_quiz_results_user_id", "quiz_results", ["user_id"], schema="summa_ai"
    )
    op.create_index(
        "idx_quiz_results_user_topic",
        "quiz_results",
        ["user_id", "topic"],
        schema="summa_ai",
    )

    op.execute(
        "ALTER TABLE summa_ai.quiz_results ADD CONSTRAINT fk_quiz_results_user "
        "FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE"
    )
    op.execute(
        "ALTER TABLE summa_ai.quiz_results ADD CONSTRAINT fk_quiz_results_artifact "
        "FOREIGN KEY (artifact_id) REFERENCES summa_ai.artifacts(id) ON DELETE SET NULL"
    )


def downgrade() -> None:
    op.drop_index("idx_quiz_results_user_topic", "quiz_results", schema="summa_ai")
    op.drop_index("idx_quiz_results_user_id", "quiz_results", schema="summa_ai")
    op.drop_table("quiz_results", schema="summa_ai")
