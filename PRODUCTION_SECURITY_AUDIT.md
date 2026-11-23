# QuestForge AI — Production Security Audit & Authorization Verification

**Document Version:** 1.0.0  
**Phase:** 12 — Production Deployment Preparation & Final Security Audit  
**Date:** November 2026  
**Auditor:** QuestForge AI Security & Autonomous Verification Agent  
**Environment:** Staging / Production Preparation  
**Target Database:** `bwllksfjjxmumrrqaifa` (Supabase Cloud, Mumbai `ap-south-1`)  
**Status:** **SECURE & VERIFIED** (All 20 Authorization Checks Passed)  

---

## 1. Executive Summary

A comprehensive security audit of QuestForge AI was conducted, covering server-side authentication, cross-user authorization boundaries, database Row-Level Security (RLS), file upload memory lifecycle, privacy compliance, dependency vulnerabilities, and client bundle secret leakage.

During the initial inspection, a **critical authorization vulnerability** was identified: backend endpoints relied on an untrusted `x-user-id` HTTP header while utilizing a Supabase `service-role` key that bypassed database RLS. This vulnerability has been **completely eliminated** through cryptographic Bearer JWT validation, explicit server-side user scoping, and memory repository isolation. An automated end-to-end test suite (`scripts/verify_backend_authorization.js`) was executed against the live cloud database, empirically confirming **20 out of 20** security controls pass.

---

## 2. Backend Authorization Audit & Vulnerability Remediation

### 2.1 The Vulnerability (Identified & Remediated)
- **Root Cause:** The backend server initializes its Supabase client using `SUPABASE_SERVICE_ROLE_KEY` to enable system-level persistence and administrative triggers. Because service-role requests bypass PostgreSQL Row-Level Security, the database cannot enforce tenant isolation automatically.
- **Flaw:** Endpoints in `auditController.js` and `documentController.js` previously read user identity from `req.headers['x-user-id']`. An attacker could supply an arbitrary UUID or omit the header to access data belonging to other registered users.
- **Risk Level:** **CRITICAL** (Insecure Direct Object Reference / IDOR, potential data leakage across students).

### 2.2 The Remediation Applied
1. **Cryptographic JWT Middleware (`server/src/middleware/authMiddleware.js`):**
   - Automatically extracts the `Authorization: Bearer <token>` header on all `/api/*` routes.
   - Cryptographically verifies the JWT against Supabase Auth (`supabaseService.getUserFromToken(token)`).
   - Explicitly deletes any client-supplied `x-user-id` header (`delete req.headers['x-user-id']`).
   - Populates `req.user` with verified identity (`req.user.id`, email, role) or sets `req.user = null` for anonymous/guest sessions.
2. **Controller Hardening (`auditController.js`):**
   - Replaced all instances of `req.headers['x-user-id']` with `req.user?.id || null`.
   - Verified that `runAudit`, `getAuditById`, `getDashboard`, and `getReport` consume only verified user identity.
3. **Database Layer Enforcement (`supabaseService.js`):**
   - `getAudit(auditId, userId)`: Before returning any cloud record, checks `if (data.user_id && (!userId || data.user_id !== userId)) return null;`.
   - `getDashboardSummary(userId)`: If `!userId`, returns only guest demonstration metrics; never queries the registered cloud `audit_sessions` table across users. When `userId` is present, strictly enforces `.eq('user_id', userId)`.
4. **Volatile Document Scoping (`documentController.js` & `storageService.js`):**
   - Documents saved in memory store `userId: req.user?.id || null`.
   - `getDocument(id, userId)` rejects queries where `doc.userId` does not match the requester's `userId`.
   - Cross-user document injection in `runAudit` is blocked (foreign document IDs are discarded).
5. **Frontend API Client Integration (`client/src/services/api.js`):**
   - Client automatically extracts the active session access token from Supabase Auth (`supabase.auth.getSession()`) and transmits `Authorization: Bearer <token>` with all mutation and retrieval requests.

---

## 3. Empirical Cross-User Authorization Test Matrix

The test script `scripts/verify_backend_authorization.js` was executed against a live test server with two synthetic accounts (`User Alpha` and `User Beta`) in Supabase Mumbai:

| Check ID | Security Control Tested | Test Action | Expected Result | Verified Result | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **AUTH-01** | Account Provisioning & JWT Issuance | Created User Alpha & User Beta in Supabase Auth | Valid tokens generated | Alpha: `ff9e65d9...`, Beta: `bef76fef...` | **PASS** |
| **AUTH-02** | Forged JWT Token Rejection | Sent `Authorization: Bearer fake.jwt` to `/api/dashboard` | HTTP 401 Unauthorized | HTTP 401 | **PASS** |
| **AUTH-03** | `x-user-id` Header Spoofing Resistance | Sent `x-user-id: <userA_id>` without JWT | Request treated as guest; 0 Alpha records returned | Treated as guest; no Alpha data leaked | **PASS** |
| **AUTH-04** | Audit Binding to Verified JWT | User Alpha created audit with Bearer Token | `userId` strictly matches `userA.id` | Audit bound to `ff9e65d9...` | **PASS** |
| **AUTH-05** | Database Persistence Verification | Inspected row in Supabase `audit_sessions` | `user_id` column matches `userA.id` | Verified in cloud database | **PASS** |
| **AUTH-06** | Owner Retrieval of Audit | User Alpha queried `GET /api/audit/:id` | HTTP 200 with audit details | HTTP 200 | **PASS** |
| **AUTH-07** | Cross-User Audit Denial | User Beta queried User Alpha's `auditId` | HTTP 404 (Not Found / Denied) | HTTP 404 | **PASS** |
| **AUTH-08** | Anonymous Caller Audit Denial | Unauthenticated caller queried Alpha's `auditId` | HTTP 404 (Not Found / Denied) | HTTP 404 | **PASS** |
| **AUTH-09** | Owner Report Retrieval | User Alpha queried `GET /api/reports/:id` | HTTP 200 with structured report | HTTP 200 | **PASS** |
| **AUTH-10** | Cross-User Report Denial | User Beta queried User Alpha's `reportId` | HTTP 404 (Not Found / Denied) | HTTP 404 | **PASS** |
| **AUTH-11** | Anonymous Caller Report Denial | Unauthenticated caller queried Alpha's `reportId`| HTTP 404 (Not Found / Denied) | HTTP 404 | **PASS** |
| **AUTH-12** | Owner Dashboard Scope | User Alpha fetched `/api/dashboard` | Shows User Alpha's audit session | Audit visible in Alpha dashboard | **PASS** |
| **AUTH-13** | Cross-User Dashboard Isolation | User Beta fetched `/api/dashboard` | 0 of User Alpha's audits visible | 0 Alpha audits visible to Beta | **PASS** |
| **AUTH-14** | Anonymous Dashboard Isolation | Unauthenticated caller fetched `/api/dashboard` | 0 registered cloud audits visible | 0 cloud audits leaked | **PASS** |
| **AUTH-15** | Document User Binding | User Alpha uploaded PDF document | Document record tagged with `userA.id` | Document tagged with `ff9e65d9...` | **PASS** |
| **AUTH-16** | Owner Document Retrieval | User Alpha queried `GET /api/documents/:id` | HTTP 200 with document metadata | HTTP 200 | **PASS** |
| **AUTH-17** | Cross-User Document Denial | User Beta queried User Alpha's document ID | HTTP 404 (Not Found / Denied) | HTTP 404 | **PASS** |
| **AUTH-18** | Cross-User Category Patch Denial| User Beta patched category of Alpha's document | HTTP 404 (Not Found / Denied) | HTTP 404 | **PASS** |
| **AUTH-19** | Foreign Document Injection Denial| User Beta ran audit with Alpha's document ID | Document rejected; missing reqs | Foreign doc rejected | **PASS** |
| **AUTH-20** | Contact Anti-Abuse & Disclosure | Submitted contact inquiry | Input validated; SMTP notice shown | `emailDelivery: DISABLED_UNCONFIGURED` | **PASS** |

---

## 4. File Upload Lifecycle & Privacy Review

| Aspect | Concrete Architecture Finding | Privacy Policy Alignment |
| :--- | :--- | :--- |
| **Storage Engine** | Multer configured with `memoryStorage()` (`server/src/middleware/uploadMiddleware.js`). Files reside in volatile Node.js `Buffer` objects in RAM. | **100% Aligned:** Matches Section 2 ("Volatile Memory Processing"). |
| **Disk Retention** | `fs.writeFile`, `fs.createWriteStream`, or disk storage are **never** invoked for uploaded documents. Zero files written to server disk. | **100% Aligned:** Matches Section 2 & 4 ("Zero disk retention"). |
| **Session Lifecycle** | Document records in `storageService.js` are held in an in-memory `Map`. They persist only while the server process runs and are cleared on restart. | **100% Aligned:** Matches Section 2 ("Cleared upon server restart"). |
| **External AI Transmission** | Extracted text (not raw binaries) is transmitted over outbound TLS/HTTPS to Groq (`openai/gpt-oss-120b`) or NVIDIA NIM (`nvidia/nemotron-3-ultra-550b-a55b`) or Gemini (`gemini-3.8-flash`, billing restricted) exclusively for structured entity extraction. Documents are never sent directly from client browsers to third parties. | **100% Aligned:** Matches Section 3 ("Controlled Field Extraction via backend proxy"). |
| **Binary Verification** | Binary magic bytes (PDF `%PDF-`, JPEG `\xFF\xD8\xFF`, PNG `\x89PNG`) are inspected in memory to reject disguised files before processing. | **100% Aligned:** Strict file validation enforced. |
| **Data Erasure & Export** | Student profile allows JSON data export (`/api/dashboard`) and active session purging. | **100% Aligned:** Meets DPDP guidelines for access and erasure. |

---

## 5. Secret Management & Bundle Verification

- **Frontend Bundle (`client/dist/`):**
  - Inspected all JavaScript chunks in `dist/assets/`.
  - Confirmed **0 secret keys** present.
  - `SUPABASE_SERVICE_ROLE_KEY`: **ABSENT**
  - `GROQ_API_KEY`: **ABSENT**
  - `NVIDIA_API_KEY`: **ABSENT**
  - `GEMINI_API_KEY`: **ABSENT**
  - `sbp_` personal access tokens: **ABSENT**
  - Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (public anon key) are embedded, matching Supabase's documented client model.
- **Git Repository & History:**
  - `server/.env` and `client/.env` are listed in `.gitignore`.
  - Credentials reside exclusively on local server files and are never committed.
- **Credential Rotation Status:**
  - Production deployment will use fresh environment variables configured directly in the hosting provider's secret vault (e.g. Vercel / Railway environment settings).

---

## 6. HTTP Security Headers & Network Defense

- **Helmet (`server/src/app.js`):**
  - Active on all responses: `crossOriginResourcePolicy: { policy: "cross-origin" }`, X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN.
- **CORS Allowlist:**
  - Explicitly restricts origins to `config.clientUrl`, `http://localhost:5173`, `http://127.0.0.1:5173`. When custom domain is deployed, updated to `https://app.questforge.ai`.
- **Rate Limiting:**
  - `express-rate-limit` active on all `/api/*` endpoints (100 requests per 15-minute window per IP).
- **Error Handling:**
  - Production error handler in `server/src/middleware/errorHandler.js` suppresses stack traces when `NODE_ENV === 'production'`.
- **Input Sanitization:**
  - Filename sanitization via `sanitizeFilename()` removes path traversal (`../`) and illegal filesystem characters.

---

## 7. Dependency Security Review (`npm audit`)

| Scope | Package | Vulnerability | Severity | Impact on QuestForge AI |
| :--- | :--- | :--- | :---: | :--- |
| **Frontend** | `react-router` / `react-router-dom` | GHSA-wrjc-x8rr-h8h6 / GHSA-337j-9hxr-rhxg | Moderate | **Zero impact:** Advisory concerns SSR hydration deserialization and backslash redirects; QuestForge AI is purely Client-Side Rendered (CSR) with static routing. |
| **Backend** | `minimatch` (via `nodemon`) | GHSA-g3hv-75wg-m249 | Moderate | **Zero impact in production:** `nodemon` is a development dependency (`devDependencies`). Production runs via `node src/index.js` (`--omit=dev`). |

---

## 8. Supabase Cloud Configuration Audit

- **Project:** `bwllksfjjxmumrrqaifa` (Mumbai, `ap-south-1`, Status: `ACTIVE_HEALTHY`, Plan: `Free`).
- **Database Tables:** 6 active tables (`user_profiles`, `user_preferences`, `audit_sessions`, `audit_documents`, `audit_findings`, `contact_inquiries`).
- **Row-Level Security:** 18 active policies across all 6 tables.
- **Database Backup Reality on Free Tier:**
  - Automated daily backups are **NOT** provided on the Supabase Free plan (requires Pro plan at \$25/mo).
  - Disaster recovery is secured via manual CLI dumps (`supabase db dump --project-ref bwllksfjjxmumrrqaifa`).
  - Dumps must be encrypted locally (GPG AES256) and excluded from Git. See `PRODUCTION_DEPLOYMENT_REPORT.md` Section 4 for complete CLI backup, verification, and restore procedures.
- **Email Delivery / SMTP Security & Limitations:**
  - Supabase free-tier built-in SMTP has strict rate limits (typically 3–4 emails per hour) and delivery is restricted to development/team testing.
  - Password reset endpoint dispatches correctly, but for reliable inbox delivery on a custom domain, custom SMTP (e.g., Resend or SendGrid) must be configured in the Supabase Dashboard.
  - Email templates and redirect URL whitelists must be verified as documented in `PRODUCTION_DEPLOYMENT_REPORT.md` and `DOMAIN_CONFIGURATION_GUIDE.md`.
