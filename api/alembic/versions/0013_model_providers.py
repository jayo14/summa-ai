"""Add model_providers and model_usage_logs tables for multi-provider failover.

Revision ID: 0013_model_providers
Revises: 0012_user_profiles_missing_columns
Create Date: 2026-09-08
"""

from alembic import op
import sqlalchemy as sa

revision = "0013_model_providers"
down_revision = "0012_user_profiles_missing_columns"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS summa_ai.model_providers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            provider VARCHAR(50) NOT NULL UNIQUE,
            api_key_encrypted TEXT,
            model_name VARCHAR(100) NOT NULL,
            is_enabled BOOLEAN DEFAULT true,
            priority INT DEFAULT 0,
            rate_limit_rpm INT,
            rate_limit_tpd INT,
            last_health_check TIMESTAMPTZ,
            last_error TEXT,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
        );
    """))

    op.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS summa_ai.model_usage_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            provider VARCHAR(50) NOT NULL,
            model_name VARCHAR(100),
            request_type VARCHAR(50),
            latency_ms INT,
            tokens_in INT,
            tokens_out INT,
            success BOOLEAN,
            error_type VARCHAR(100),
            failover_from VARCHAR(50),
            created_at TIMESTAMPTZ DEFAULT now()
        );
    """))

    op.execute(sa.text("""
        CREATE INDEX IF NOT EXISTS idx_model_usage_logs_provider
        ON summa_ai.model_usage_logs (provider, created_at);
    """))

    op.execute(sa.text("""
        CREATE INDEX IF NOT EXISTS idx_model_usage_logs_created
        ON summa_ai.model_usage_logs (created_at);
    """))

    # Seed default providers from .env config
    op.execute(sa.text("""
        INSERT INTO summa_ai.model_providers (provider, model_name, priority, is_enabled)
        VALUES
            ('gemini',   'gemini-3.6-flash',  1, true),
            ('openai',   'gpt-4o-mini',       2, true),
            ('anthropic','claude-sonnet-4-20250514', 3, true),
            ('zai',      'glm-4.5',           4, true)
        ON CONFLICT (provider) DO NOTHING;
    """))


def downgrade() -> None:
    op.execute(sa.text("DROP TABLE IF EXISTS summa_ai.model_usage_logs;"))
    op.execute(sa.text("DROP TABLE IF EXISTS summa_ai.model_providers;"))
