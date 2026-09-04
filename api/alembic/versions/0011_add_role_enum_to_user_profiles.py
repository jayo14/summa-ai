"""Alembic migration to add role enum column to summa_ai.user_profiles.

Revision ID: 0011_add_role_enum
Revises: 0010_rls_and_security_policies
Create Date: 2026-09-04
"""

from alembic import op
import sqlalchemy as sa

revision = "0011_add_role_enum"
down_revision = "0010_rls_and_security_policies"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Create PostgreSQL ENUM type summa_ai.user_role_enum ('user', 'admin')
    op.execute(sa.text("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
                CREATE TYPE summa_ai.user_role_enum AS ENUM ('user', 'admin');
            END IF;
        END $$;
    """))

    # 2. Add role column to summa_ai.user_profiles with default 'user'
    op.execute(sa.text("""
        ALTER TABLE summa_ai.user_profiles
            ADD COLUMN IF NOT EXISTS role summa_ai.user_role_enum DEFAULT 'user'::summa_ai.user_role_enum NOT NULL;
    """))

    # 3. Update existing admin profiles (e.g. admin@summa.ai) to 'admin'
    op.execute(sa.text("""
        UPDATE summa_ai.user_profiles
        SET role = 'admin'::summa_ai.user_role_enum
        WHERE email = 'admin@summa.ai'
           OR email = 'codegallantx@gmail.com'
           OR (onboarding_data ->> 'role') = 'admin';
    """))

    # 4. Update handle_new_user trigger function to populate default role
    op.execute(sa.text("""
        CREATE OR REPLACE FUNCTION summa_ai.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
            INSERT INTO summa_ai.user_profiles (id, email, name, avatar, role)
            VALUES (
                NEW.id,
                NEW.email,
                NEW.raw_user_meta_data ->> 'name',
                NEW.raw_user_meta_data ->> 'avatar',
                CASE 
                    WHEN (NEW.raw_app_meta_data ->> 'role') = 'admin' THEN 'admin'::summa_ai.user_role_enum
                    ELSE 'user'::summa_ai.user_role_enum
                END
            )
            ON CONFLICT (id) DO NOTHING;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
    """))


def downgrade() -> None:
    op.execute(sa.text("ALTER TABLE summa_ai.user_profiles DROP COLUMN IF EXISTS role;"))
    op.execute(sa.text("DROP TYPE IF EXISTS summa_ai.user_role_enum;"))
