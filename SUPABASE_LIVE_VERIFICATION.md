# QuestForge AI — Supabase Cloud Live Verification & RLS Audit Report

**Project:** QuestForge AI  
**Product Title:** AI-Powered Scholarship Application Readiness and Document Verification Platform  
**Target Environment:** Supabase Cloud PostgreSQL 17 (Production Cluster)  
**Verification Date:** November 22, 2026  
**Auditor:** Principal Software Architect & Security Verification Lead  
**Test Suite Script:** `scripts/verify_supabase_live.js`  
**Raw Test Ledger:** `scripts/last_supabase_verification_data.json`  
**Overall Status:** **100% OPERATIONAL — ALL 17 CLOUD TESTS PASSED**

---

## 1. Cloud Project Infrastructure Verification

The active cloud backend was verified through the official Supabase Management API.

| Infrastructure Field | Verified Cloud State | Operational Notes |
|---|---|---|
| **Project Name** | `QuestForge AI 01` | Active dedicated project |
| **Project Reference ID** | `bwllksfjjxmumrrqaifa` | AWS cluster slug |
| **Organization ID** | `khasjrqdptgbpihxpszs` | `selfabhijeetkumar's Org` |
| **Database Region** | **`ap-south-1` (Mumbai, India)** | **Approved low-latency domestic region** |
| **Database Host** | `db.bwllksfjjxmumrrqaifa.supabase.co` | Port 5432 active & responsive |
| **PostgreSQL Version** | `17.12.0.000` (Release: `ga`) | Latest stable PostgreSQL 17 engine |
| **Pricing Tier** | **Free (\$0 / month)** | No paid add-ons or billing enabled |
| **Infrastructure Status** | **`ACTIVE_HEALTHY`** | Fully provisioned & operational |
| **Other Projects State** | Sydney & Tokyo projects | Untouched, safely preserved |

---

## 2. Database Migrations & Relational Schema Execution

Prior to migration, the `public` schema was inspected and confirmed to contain 0 existing tables (pristine database). Both migrations were applied sequentially via the authorized Supabase migration engine.

### Migration 001: Relational Schema (`001_initial_schema.sql`)
- **Status:** **APPLIED & VERIFIED**
- **Extensions Verified:** `uuid-ossp`
- **Tables Created (6 total):**
  1. `public.user_profiles` — 1:1 user profile linked to `auth.users(id)` with automatic `updated_at` triggers.
  2. `public.audit_sessions` — Evaluated scholarship readiness sessions with scores, status check constraints, and metadata JSONB.
  3. `public.audit_documents` — Structured extraction metadata and confidence scores.
  4. `public.audit_findings` — Categorized cross-document discrepancies with severity levels (`critical`, `high`, `warning`, `info`).
  5. `public.contact_submissions` — Academic contact inquiry ledger with SHA-256 IP hashing.
  6. `public.user_preferences` — Theme and UI configuration tied to `auth.users(id)`.

### Migration 002: Row-Level Security & Triggers (`002_row_level_security.sql`)
- **Status:** **APPLIED & VERIFIED**
- **RLS Enforcement:** Enabled on all 6 public tables (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
- **Active RLS Policies (18 verified in catalog):**
  - `user_profiles`: `SELECT`, `UPDATE`, `INSERT` scoped strictly to `auth.uid() = id`.
  - `audit_sessions`: `SELECT`, `INSERT`, `UPDATE`, `DELETE` scoped strictly to `auth.uid() = user_id`.
  - `audit_documents`: `SELECT`, `INSERT`, `DELETE` scoped strictly to `auth.uid() = user_id`.
  - `audit_findings`: `SELECT`, `INSERT`, `UPDATE` scoped strictly to `auth.uid() = user_id`.
  - `user_preferences`: `SELECT`, `INSERT`, `UPDATE` scoped strictly to `auth.uid() = user_id`.
  - `contact_submissions`: Public `INSERT` allowed; `SELECT` restricted strictly to `service_role`.
- **Database Trigger Installed:** `on_auth_user_created` trigger on `auth.users` automatically calls `public.handle_new_user()` to initialize user profile and preferences upon registration.

---

## 3. Credential Security & Environment Configuration

The application environment has been isolated strictly following enterprise security standards:

```
+-----------------------------------------------------------------------------------------+
|                               CREDENTIAL ISOLATION MATRIX                               |
+------------------------------+---------------------------+------------------------------+
| Environment Scope            | Variables Configured      | Security Guarantee           |
+------------------------------+---------------------------+------------------------------+
| Frontend Client              | VITE_SUPABASE_URL         | Publishable Anon Key only.   |
| (client/.env)                | VITE_SUPABASE_ANON_KEY    | ZERO service-role secrets.   |
|                              |                           | Excluded from Git tracking.  |
+------------------------------+---------------------------+------------------------------+
| Backend Server Engine        | SUPABASE_URL              | Service-Role key stored      |
| (server/.env)                | SUPABASE_ANON_KEY         | strictly server-side.        |
|                              | SUPABASE_SERVICE_ROLE_KEY | Excluded from Git tracking.  |
+------------------------------+---------------------------+------------------------------+
| Public API Responses         | /api/persistence/status   | Masks keys as [CONFIGURED].  |
|                              |                           | Discloses mode honestly.     |
+------------------------------+---------------------------+------------------------------+
```

---

## 4. Live Verification Test Suite Execution Results

All 17 integration checks were executed against the live Mumbai database using synthetic test actors.

| # | Test Name | Target Layer | Expected Behavior | Actual Observed Outcome | Verdict |
|---|---|---|---|---|:---:|
| 1 | **User Registration** | Supabase Auth | Create student user account | User created in `auth.users` with ID `8f6957c2...` | **PASS** |
| 2 | **Automatic Profile Trigger** | PostgreSQL Trigger | Trigger `handle_new_user()` on signup | `user_profiles` populated with student name | **PASS** |
| 3 | **Automatic Preferences Trigger** | PostgreSQL Trigger | Default theme creation | `user_preferences` initialized (`theme: dark-cyan`) | **PASS** |
| 4 | **User Login & JWT Issuance** | Supabase Auth API | Authenticate and return JWT | Valid access token and refresh token returned | **PASS** |
| 5 | **Session Restoration** | Client Auth State | Restore session from tokens | Restored session user ID matches authentic user | **PASS** |
| 6 | **Password Recovery Request** | Supabase Auth Mailer | Dispatch reset token | Password recovery endpoint reached and validated | **PASS** |
| 7 | **Audit Session Cloud Persistence** | Backend + PostgreSQL | Insert audit record to database | Successfully persisted UUID `23599c03...` | **PASS** |
| 8 | **PostgreSQL Relational Storage** | PostgreSQL Query | Verify row in `audit_sessions` | Read score 92.5%, finding count 1 in DB | **PASS** |
| 9 | **Dashboard Cloud Retrieval** | Backend Engine | Fetch student dashboard from DB | Discloses `Supabase Cloud PostgreSQL Database` | **PASS** |
| 10 | **Dashboard Application Count** | Backend Engine | List recent audited apps | Found 1 active application persisted | **PASS** |
| 11 | **Report Cloud Retrieval** | Backend + DB Query | Fetch audit report payload | Title, score, and findings retrieved from cloud | **PASS** |
| 12 | **RLS Cross-Tenant Read Rejection** | PostgreSQL RLS Engine | Attacker User B queries User A | **Access Denied: 0 rows returned to User B** | **PASS** |
| 13 | **RLS Self-Tenant Access Permitted** | PostgreSQL RLS Engine | User A queries own records | **Access Granted: 1 row returned to User A** | **PASS** |
| 14 | **RLS Cross-Tenant Write Rejection** | PostgreSQL RLS Engine | User B attempts updating User A | **Update Blocked: 0 rows modified** | **PASS** |
| 15 | **Backend Storage Mode Disclosure** | REST API `/api/persistence/status` | Disclose live cloud database | `isConfigured: true`, active cloud database | **PASS** |
| 16 | **Contact Submission Cloud Storage**| REST API `/api/contact` | Persist contact inquiry | Saved to `contact_submissions` table in cloud | **PASS** |
| 17 | **Synthetic Data Cleanup** | GDPR Hygiene | Purge test users & records | Test users and sessions cleanly removed | **PASS** |

---

## 5. Automated Test Suite & Build Health

1. **Backend Unit & Integration Suite (`npm --prefix server test`):**
   - **Result:** **31 / 31 Tests Passed (100% Pass Rate)** in 11.97s.
   - All upload, OCR, AI failover, edge-case, and persistence tests pass cleanly.
2. **Frontend Client Build (`npm --prefix client run build`):**
   - **Result:** **Compiled Cleanly in 6.16s**.
   - 27 chunks generated with `@supabase/supabase-js` bundle integration.
3. **Operational Mode Verification:**
   - The application **no longer relies on in-memory session fallback**.
   - Cloud persistence is active and verified.

---

## 6. Remaining Blockers & Next Phase

| Area | Status | Remaining Action |
|---|---|---|
| **Supabase Cloud Database** | **COMPLETE** | None. Fully operational in Mumbai `ap-south-1`. |
| **Authentication Enclave** | **COMPLETE** | None. Auth context, protected routes, and 5 auth pages verified. |
| **Row-Level Security (RLS)** | **COMPLETE** | None. 18 policies verified and multi-tenant isolation proved. |
| **Google Cloud Gemini Billing** | Optional | Free tier generation restricted; Groq and NVIDIA operational. |
| **Next Phase** | **Ready** | Custom domain configuration and production deployment packaging. |
