-- =====================================================================
-- QUESTFORGE AI — SUPABASE DATABASE MIGRATION 002
-- File: 002_row_level_security.sql
-- Description: Strict Row-Level Security (RLS) policies enforcing multi-tenant
--              user isolation across all audit, document, and profile data.
-- =====================================================================

-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- 2. USER PROFILES POLICIES
-- Users can only view and update their own profile record
CREATE POLICY "Users can view own profile"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 3. AUDIT SESSIONS POLICIES
-- Users can only view, create, and delete their own audit sessions
CREATE POLICY "Users can view own audit sessions"
    ON public.audit_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audit sessions"
    ON public.audit_sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own audit sessions"
    ON public.audit_sessions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own audit sessions"
    ON public.audit_sessions
    FOR DELETE
    USING (auth.uid() = user_id);

-- 4. AUDIT DOCUMENTS POLICIES
-- Scoped to user_id (and session ownership)
CREATE POLICY "Users can view own audit documents"
    ON public.audit_documents
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audit documents"
    ON public.audit_documents
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own audit documents"
    ON public.audit_documents
    FOR DELETE
    USING (auth.uid() = user_id);

-- 5. AUDIT FINDINGS POLICIES
-- Scoped strictly to the authenticated user
CREATE POLICY "Users can view own audit findings"
    ON public.audit_findings
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audit findings"
    ON public.audit_findings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own audit findings"
    ON public.audit_findings
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 6. USER PREFERENCES POLICIES
CREATE POLICY "Users can view own preferences"
    ON public.user_preferences
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
    ON public.user_preferences
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
    ON public.user_preferences
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 7. CONTACT SUBMISSIONS POLICIES
-- Anyone (authenticated or anonymous guest) can submit an inquiry
CREATE POLICY "Anyone can insert contact submissions"
    ON public.contact_submissions
    FOR INSERT
    WITH CHECK (true);

-- Only service role / administrators can view contact submissions
CREATE POLICY "Only service role can view contact submissions"
    ON public.contact_submissions
    FOR SELECT
    USING (auth.jwt() ->> 'role' = 'service_role');

-- 8. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- Creates public.user_profiles row automatically when a new user registers via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name, email, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student User'),
        NEW.email,
        TIMEZONE('utc', NOW()),
        TIMEZONE('utc', NOW())
    );
    
    INSERT INTO public.user_preferences (user_id, theme, enable_3d_cursor, created_at, updated_at)
    VALUES (
        NEW.id,
        'dark-cyan',
        TRUE,
        TIMEZONE('utc', NOW()),
        TIMEZONE('utc', NOW())
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
