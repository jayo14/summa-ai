-- Summa AI — Schema migration for Supabase Postgres
-- Run this in the Supabase Dashboard SQL Editor.
-- This creates the summa_ai schema and initial tables.
-- Uses separate schema (summa_ai.*) per INTEGRATION_STRATEGY.md Decision 2.

-- Step 1: Create the schema
CREATE SCHEMA IF NOT EXISTS summa_ai;

-- Step 2: User profiles (mirrors auth.users via the shared id)
CREATE TABLE IF NOT EXISTS summa_ai.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    avatar TEXT,
    bio TEXT,
    provider TEXT DEFAULT 'credentials',
    onboarded BOOLEAN DEFAULT FALSE,
    onboarding_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Conversations
CREATE TABLE IF NOT EXISTS summa_ai.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New chat',
    snippet TEXT,
    archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Messages
CREATE TABLE IF NOT EXISTS summa_ai.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES summa_ai.conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    reasoning TEXT,
    components JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Artifacts
CREATE TABLE IF NOT EXISTS summa_ai.artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES summa_ai.conversations(id),
    title TEXT,
    type TEXT,
    source TEXT,
    source_label TEXT,
    parent_artifact_id UUID REFERENCES summa_ai.artifacts(id),
    current_version INT DEFAULT 1,
    archived BOOLEAN DEFAULT FALSE,
    pinned BOOLEAN DEFAULT FALSE,
    component JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 6: Timeline events
CREATE TABLE IF NOT EXISTS summa_ai.timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 7: Settings
CREATE TABLE IF NOT EXISTS summa_ai.settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'system',
    font_size INT DEFAULT 14,
    density TEXT DEFAULT 'comfortable',
    exam_reminders BOOLEAN DEFAULT TRUE,
    proactive_check_ins BOOLEAN DEFAULT TRUE,
    weekly_progress BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    thinking_mode BOOLEAN DEFAULT TRUE,
    response_style TEXT DEFAULT 'balanced',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 8: Materials
CREATE TABLE IF NOT EXISTS summa_ai.materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT,
    title TEXT,
    source TEXT,
    size INT,
    duration INT,
    concepts_extracted INT DEFAULT 0,
    status TEXT DEFAULT 'processing',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 9: Concepts
CREATE TABLE IF NOT EXISTS summa_ai.concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    mastery TEXT,
    material_id UUID REFERENCES summa_ai.materials(id),
    related_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 10: Hybrid memory — user_memories table (shared with SummaStudy)
-- Stores typed atomic facts extracted from conversations.
-- Compatible with SummaStudy's memory_service schema for cross-product memory sharing.
CREATE TABLE IF NOT EXISTS public.user_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    memory_type TEXT NOT NULL DEFAULT 'fact',
    content TEXT NOT NULL,
    embedding vector(1536),
    confidence FLOAT DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_memories_user_id ON public.user_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memories_type ON public.user_memories(user_id, memory_type);

-- Step 11: Artifact versions (immutable history of artifact snapshots)
CREATE TABLE IF NOT EXISTS summa_ai.artifact_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artifact_id UUID NOT NULL REFERENCES summa_ai.artifacts(id) ON DELETE CASCADE,
    version INT NOT NULL,
    title TEXT,
    component JSONB,
    change_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artifact_versions_artifact_id ON summa_ai.artifact_versions(artifact_id, version);

-- Step 12: Indexes (renumbered after Step 11 insertion)
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON summa_ai.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON summa_ai.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_user_id ON summa_ai.artifacts(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_user_id ON summa_ai.timeline_events(user_id);
CREATE INDEX IF NOT EXISTS idx_materials_user_id ON summa_ai.materials(user_id);
CREATE INDEX IF NOT EXISTS idx_concepts_user_id ON summa_ai.concepts(user_id);

-- Step 15: Study plans
CREATE TABLE IF NOT EXISTS summa_ai.study_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    progress FLOAT DEFAULT 0.0,
    days_left INT DEFAULT 0,
    streak INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON summa_ai.study_plans(user_id);

-- Step 16: Study plan sessions
CREATE TABLE IF NOT EXISTS summa_ai.study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES summa_ai.study_plans(id) ON DELETE CASCADE,
    day TEXT NOT NULL,
    topic TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'upcoming',
    duration TEXT DEFAULT '30 min',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_sessions_plan_id ON summa_ai.study_sessions(plan_id);

-- Step 17: Flashcards
CREATE TABLE IF NOT EXISTS summa_ai.flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    mastered BOOLEAN DEFAULT FALSE,
    ease_factor FLOAT DEFAULT 2.5,
    interval_days INT DEFAULT 0,
    repetitions INT DEFAULT 0,
    next_review_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON summa_ai.flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON summa_ai.flashcards(user_id, next_review_at);

-- Step 18: Exams
CREATE TABLE IF NOT EXISTS summa_ai.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    exam_date DATE NOT NULL,
    readiness INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exams_user_id ON summa_ai.exams(user_id);

-- Step 13: Auto-create user profile on first Supabase login (via trigger)
CREATE OR REPLACE FUNCTION summa_ai.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO summa_ai.user_profiles (id, email, name, avatar)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data ->> 'name',
        NEW.raw_user_meta_data ->> 'avatar'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION summa_ai.handle_new_user();

-- Step 14: Row Level Security
-- Note: The trigger above (SECURITY DEFINER) bypasses RLS for auto-creation.
-- These policies apply when users connect via Supabase's anon/authenticated keys.

-- user_profiles: each user manages their own profile
ALTER TABLE summa_ai.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_profiles_select ON summa_ai.user_profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY user_profiles_insert ON summa_ai.user_profiles
    FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY user_profiles_update ON summa_ai.user_profiles
    FOR UPDATE USING (id = auth.uid());

-- conversations: owned by user_id
ALTER TABLE summa_ai.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY conversations_select ON summa_ai.conversations
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY conversations_insert ON summa_ai.conversations
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY conversations_update ON summa_ai.conversations
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY conversations_delete ON summa_ai.conversations
    FOR DELETE USING (user_id = auth.uid());

-- messages: inherit ownership via conversation
ALTER TABLE summa_ai.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY messages_select ON summa_ai.messages
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM summa_ai.conversations WHERE id = conversation_id AND user_id = auth.uid())
    );

CREATE POLICY messages_insert ON summa_ai.messages
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM summa_ai.conversations WHERE id = conversation_id AND user_id = auth.uid())
    );

CREATE POLICY messages_delete ON summa_ai.messages
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM summa_ai.conversations WHERE id = conversation_id AND user_id = auth.uid())
    );

-- artifacts: owned by user_id
ALTER TABLE summa_ai.artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY artifacts_select ON summa_ai.artifacts
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY artifacts_insert ON summa_ai.artifacts
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY artifacts_update ON summa_ai.artifacts
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY artifacts_delete ON summa_ai.artifacts
    FOR DELETE USING (user_id = auth.uid());

-- timeline_events: owned by user_id
ALTER TABLE summa_ai.timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY timeline_events_select ON summa_ai.timeline_events
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY timeline_events_insert ON summa_ai.timeline_events
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY timeline_events_delete ON summa_ai.timeline_events
    FOR DELETE USING (user_id = auth.uid());

-- settings: one per user, keyed by user_id
ALTER TABLE summa_ai.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY settings_select ON summa_ai.settings
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY settings_insert ON summa_ai.settings
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY settings_update ON summa_ai.settings
    FOR UPDATE USING (user_id = auth.uid());

-- materials: owned by user_id
ALTER TABLE summa_ai.materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY materials_select ON summa_ai.materials
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY materials_insert ON summa_ai.materials
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY materials_delete ON summa_ai.materials
    FOR DELETE USING (user_id = auth.uid());

-- concepts: owned by user_id
ALTER TABLE summa_ai.concepts ENABLE ROW LEVEL SECURITY;

CREATE POLICY concepts_select ON summa_ai.concepts
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY concepts_insert ON summa_ai.concepts
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY concepts_delete ON summa_ai.concepts
    FOR DELETE USING (user_id = auth.uid());
