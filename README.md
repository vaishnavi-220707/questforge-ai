# QUESTFORGE AI
> **Tagline:** Level Up Your Scholarship Application  
> **Course:** Skill Enhancement Course (SEC)  
> **Project Title:** AI-Powered Scholarship Application Readiness and Document Verification Platform  
> **Workspace:** `C:\SEC\`

---

## 1. EXECUTIVE SUMMARY & PURPOSE

QuestForge AI is an advanced pre-submission document auditing and application-readiness assistant designed to help students evaluate their scholarship documentation before submitting it to official state, central, or university scholarship portals.

### Core Value Proposition
- **Pre-Submission Readiness Auditing:** Eliminates administrative rejections caused by missing mandatory affidavits, unreadable scans, or cross-document name spelling discrepancies.
- **Evidence-Based Audit Engine:** Evaluates uploaded PDF and image documents against deterministic eligibility criteria and published guidelines.
- **Cross-Document Entity Verification:** Compares student name, date of birth, educational institution, and income thresholds across multiple certificates using fuzzy string matching (Levenshtein distance & token sort ratios).
- **Multi-Provider AI Failover:** Integrates Google Gemini (`gemini-3.8-flash`), Groq Cloud (`openai/gpt-oss-120b`), and NVIDIA NIM (`nvidia/nemotron-3-ultra-550b-a55b`) with an offline deterministic rule engine fallback.
- **Supabase Hybrid Persistence:** Architecture prepared for Supabase PostgreSQL relational storage and authentication with an isolated in-memory session repository fallback.

> [!IMPORTANT]
> **Operational Boundary Notice:**  
> QuestForge AI is an advisory pre-screening assistant. It does not approve scholarships, disburse funds, guarantee eligibility, or replace official government or university submission portals.

---

## 2. TECHNOLOGY STACK

- **Frontend:** React 18, Vite 6, Tailwind CSS 3, Three.js (WebGL), Lucide React Icons, React Router v6
- **Backend:** Node.js (v26 verified), Express.js 4 REST API
- **Document Processing:** Tesseract.js (Optical Character Recognition), `pdf-parse` (Digital PDF Extraction) with zlib FlateDecode stream recovery
- **AI Infrastructure:** Multi-provider priority failover:
  1. **Google Gemini** (`gemini-3.8-flash`) — Native REST API with `'x-goog-api-key'`
  2. **Groq Cloud** (`openai/gpt-oss-120b`) — Ultra-low latency hosted inference
  3. **NVIDIA NIM** (`nvidia/nemotron-3-ultra-550b-a55b`) — Hosted 550B MoE model
  4. **Deterministic Fallback Engine** — Zero external API keys required for full functionality
- **Database & Authentication:** Supabase PostgreSQL 15+, Supabase Auth, Row-Level Security (RLS) policies, and in-memory session persistence fallback
- **Security:** Helmet security headers, CORS whitelist, IP rate limiting, magic-byte binary inspection (`%PDF`, `\x89PNG`, `\xFF\xD8\xFF`), filename path traversal sanitization, and volatile RAM processing

---

## 3. QUICK START & DEVELOPER GUIDE

### Prerequisites
- Node.js (v18+ recommended; verified on Node v26.13.1)
- npm (v9+; verified on npm 11.21.0)
- Git

### Installation
Install dependencies across root, server, and client:
```bash
# From workspace root (C:\SEC\)
npm install --prefix server
npm install --prefix client
```

### Environment Configuration
1. Copy `server/.env.example` to `server/.env`:
   ```bash
   cp server/.env.example server/.env
   ```
2. Configure credentials as available:
   ```bash
   PORT=5000
   CLIENT_URL=http://localhost:5173

   # Multi-Provider AI (Optional — platform runs in deterministic mode without keys)
   AI_PRIMARY_PROVIDER=gemini
   AI_FAILOVER_ENABLED=true
   AI_REQUEST_TIMEOUT_MS=45000
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-3.8-flash
   GROQ_API_KEY=your_groq_api_key_here
   GROQ_MODEL=openai/gpt-oss-120b
   NVIDIA_API_KEY=your_nvidia_nim_api_key_here
   NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
   NVIDIA_MODEL=nvidia/nemotron-3-ultra-550b-a55b

   # Supabase Persistence & Auth (Optional — platform runs in session memory mode without keys)
   SUPABASE_URL=
   SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```

### Running the Application
To run the full stack concurrently:
```bash
npm run dev
```

Or run frontend and backend individually in separate terminals:
```bash
# Terminal 1: Backend Server (http://localhost:5000)
npm run dev:server

# Terminal 2: Frontend Client (http://localhost:5173)
npm run dev:client
```
Access the client application in your browser at **http://localhost:5173**.

---

## 4. APPLICATION ROUTE MAP (19 ROUTES)

| Route | Page Component | Description |
|---|---|---|
| `/` | `HomePage` | Cinematic 3D hero crystal, product explanation, workflow overview, and CTAs |
| `/scholarships` | `ScholarshipExplorerPage` | Scholarship scheme search, education filters, category tags, and requirement summaries |
| `/scholarships/:id` | `ScholarshipDetailPage` | Detailed scheme criteria, award amounts, deadlines, and mandatory documents checklist |
| `/upload` | `DocumentUploadPage` | Drag-and-drop file ingestion, scenario presets (Alpha/Beta/Gamma), and audit initiation |
| `/analysis` | `DocumentAnalysisPage` | Real-time extraction inspector, OCR output, and multi-AI entity normalization |
| `/audit-results/:id` | `AuditResultsPage` | Itemized audit findings, readiness score, guideline citations, and recommendations |
| `/dashboard` | `StudentDashboardPage` | Application status, readiness metrics, audit history, and report download access |
| `/report/:id` | `ReportPage` | Formal printable readiness audit report with black-and-white `@media print` layout |
| `/about` | `AboutPage` | SEC academic architecture, deterministic vs AI boundaries, and live AI provider status panel |
| `/login` | `LoginPage` | Student authentication, credential validation, and demonstration mode fallback |
| `/register` | `RegisterPage` | Account enrollment with auto-provisioned student profile and preferences |
| `/forgot-password` | `ForgotPasswordPage` | Password recovery link dispatch |
| `/reset-password` | `ResetPasswordPage` | Secure token-verified password update |
| `/profile` | `ProfilePage` | Protected student profile, storage architecture status, JSON data export, and session purge |
| `/privacy` | `PrivacyPolicyPage` | Data protection notice, DPDP principles, volatile RAM processing, and legal notice |
| `/terms` | `TermsPage` | Advisory scope, no-guarantee disclaimer, and acceptable use guidelines |
| `/cookies` | `CookiePolicyPage` | Functional session tokens and browser preference storage disclosures |
| `/contact` | `ContactPage` | Academic feedback form with real backend persistence and delivery notice |
| `*` | `NotFoundPage` | Cybernetic 404 screen with navigation options and browser back button |

---

## 5. AUTOMATED TESTING SUITE

QuestForge AI includes an automated suite of **31 unit, integration, and security tests**:
```bash
npm --prefix server test
```

### Covered Test Categories:
- **Provider Failover (Scenarios J, K, L, M):**
  - Quota failure (429) -> Groq handoff
  - Auth failure (401) -> Groq (500) -> NVIDIA handoff
  - Gemini billing requirement (`PROJECT_BILLING_REQUIRED`) -> instant Groq handoff
  - NVIDIA schema coercion (`"250000 INR"`, `"89.2%"` -> `number`)
  - Full provider exhaustion -> deterministic rule fallback
- **Security & Integrity:**
  - Filename path traversal sanitization (`../../etc/passwd` -> `passwd`)
  - Binary magic-byte validation (rejection of disguised `.exe` and `.html` files)
  - Zero-leakage verification of `/api/ai/status` and `/api/persistence/status`
- **Audit Engine Core:**
  - Matching documents -> `Ready for Review`
  - Missing mandatory documents -> `Action Required`
  - Cross-document name discrepancy -> `INCONSISTENCY`
- **REST Endpoints:**
  - Health check, scholarships index, scholarship detail, audit execution, dashboard summary, and report generation
  - Contact submission input validation and persistence confirmation

---

## 6. PRODUCTION BUILD & COMPILATION

Compile the frontend production bundle:
```bash
npm --prefix client run build
```
- **Output:** 27 code-split chunks optimized for fast initial paint.
- **Rollup Compatibility:** Verified with WebAssembly fallback (`@rollup/wasm-node`) for Windows AppLocker environments.

---

## 7. DOCUMENTATION DIRECTORY

For in-depth specifications, refer to:
- [`FINAL_REQUIREMENTS_TRACEABILITY.md`](./FINAL_REQUIREMENTS_TRACEABILITY.md) — Master requirements audit matrix
- [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) — Database schema, SQL migrations, and RLS policies
- [`AUTHENTICATION_SETUP.md`](./AUTHENTICATION_SETUP.md) — AuthContext, protected routes, and user scoping
- [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md) — Custom domain, Nginx proxy, and TLS setup
- [`PRELAUNCH_CHECKLIST.md`](./PRELAUNCH_CHECKLIST.md) — Pre-launch compliance and operational gating
- [`AI_PROVIDER_LIVE_VERIFICATION.md`](./AI_PROVIDER_LIVE_VERIFICATION.md) — Empirical multi-provider test report
- [`QUESTFORGE_AI_FINAL_COMPLETION_REPORT.md`](./QUESTFORGE_AI_FINAL_COMPLETION_REPORT.md) — Consolidated completion report

---
*QuestForge AI — Skill Enhancement Course (SEC) Academic Project.*
