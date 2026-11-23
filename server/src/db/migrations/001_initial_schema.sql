-- =====================================================================
-- QUESTFORGE AI — SUPABASE DATABASE MIGRATION 001
-- File: 001_initial_schema.sql
-- Description: Core relational schema for profiles, audit sessions,
--              documents, findings, contact submissions, and preferences.
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USER PROFILES
-- Linked 1:1 with Supabase Auth users (auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    institution TEXT,
    course_of_study TEXT,
    graduation_year INTEGER,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- 3. AUDIT SESSIONS
-- Represents an evaluation execution for a specific scholarship program
CREATE TABLE IF NOT EXISTS public.audit_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    scholarship_id TEXT NOT NULL,
    scholarship_title TEXT NOT NULL,
    readiness_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    overall_status TEXT NOT NULL CHECK (overall_status IN ('Ready for Review', 'Action Required', 'Unable to Verify')),
    total_requirements INTEGER NOT NULL DEFAULT 0,
    fulfilled_requirements INTEGER NOT NULL DEFAULT 0,
    missing_mandatory_count INTEGER NOT NULL DEFAULT 0,
    findings_count INTEGER NOT NULL DEFAULT 0,
    summary_notice TEXT,
    raw_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for audit session queries
CREATE INDEX IF NOT EXISTS idx_audit_sessions_user_id ON public.audit_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_sessions_scholarship_id ON public.audit_sessions(scholarship_id);
CREATE INDEX IF NOT EXISTS idx_audit_sessions_created_at ON public.audit_sessions(created_at DESC);

-- 4. AUDIT DOCUMENTS (Metadata & Structured Extraction)
-- Note: Raw uploaded binary buffers are discarded or stored in secure storage buckets with TTL.
-- Only sanitized metadata and validated structured entity extractions are persisted.
CREATE TABLE IF NOT EXISTS public.audit_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.audit_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL,
    category_name TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    sha256_hash TEXT,
    extraction_method TEXT NOT NULL, -- e.g. 'PDF_PARSE', 'TESSERACT_OCR', 'AI_GROQ', 'AI_NVIDIA'
    extraction_confidence NUMERIC(4, 2) DEFAULT 0.00,
    extracted_fields JSONB NOT NULL DEFAULT '{}'::jsonb, -- fullName, dob, annualIncome, percentageMarks, etc.
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for document lookups
CREATE INDEX IF NOT EXISTS idx_audit_documents_session_id ON public.audit_documents(session_id);
CREATE INDEX IF NOT EXISTS idx_audit_documents_user_id ON public.audit_documents(user_id);

-- 5. AUDIT FINDINGS
-- Itemized deterministic and cross-document validation rules results
CREATE TABLE IF NOT EXISTS public.audit_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.audit_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    issue_type TEXT NOT NULL, -- 'CRITICAL_MISSING', 'INCONSISTENCY', 'INFO_MISMATCH', 'VERIFICATION_REQUIRED'
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'warning', 'info')),
    title TEXT NOT NULL,
    explanation TEXT NOT NULL,
    guideline_reference TEXT,
    affected_documents TEXT[] DEFAULT ARRAY[]::TEXT[],
    recommendation TEXT NOT NULL,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- Index for finding resolution and session lookup
CREATE INDEX IF NOT EXISTS idx_audit_findings_session_id ON public.audit_findings(session_id);
CREATE INDEX IF NOT EXISTS idx_audit_findings_severity ON public.audit_findings(severity);

-- 6. CONTACT SUBMISSIONS
-- Secure academic inquiry and evaluation feedback records
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    topic TEXT NOT NULL,
    message TEXT NOT NULL,
    ip_hash TEXT,
    status TEXT NOT NULL DEFAULT 'RECEIVED' CHECK (status IN ('RECEIVED', 'REVIEWED', 'ARCHIVED')),
    response_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);

-- 7. USER PREFERENCES
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT NOT NULL DEFAULT 'dark-cyan',
    enable_3d_cursor BOOLEAN NOT NULL DEFAULT TRUE,
    data_retention_consent BOOLEAN NOT NULL DEFAULT TRUE,
    ai_processing_consent BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 8. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS set_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER set_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_audit_sessions_updated_at ON public.audit_sessions;
CREATE TRIGGER set_audit_sessions_updated_at
BEFORE UPDATE ON public.audit_sessions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER set_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
