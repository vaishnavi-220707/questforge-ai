# QuestForge AI — Production Deployment Architecture & Hosting Report

**Document Version:** 2.0.0 (Corrected & Reconciled)  
**Phase:** 12 — Production Deployment Preparation & Final Security Audit  
**Date:** November 2026  
**Project:** QuestForge AI (Academic Skill Enhancement Course Project)  
**Database Reference:** `bwllksfjjxmumrrqaifa` (South Asia - Mumbai, `ap-south-1`, Free Plan)  
**Git Checkpoint:** master  

---

## Executive Summary

QuestForge AI is a production-engineered, pre-submission scholarship document auditing and readiness assistant. This report provides an authoritative, factual analysis of the production hosting architecture, strictly reconciling external provider model names, evaluating hosting platforms against concrete codebase requirements (Node.js buffer handling, Tesseract OCR memory, and PDF parsing), correcting database backup realities on Supabase Free tier, and presenting both a **Lowest-Cost Academic Demonstration Configuration** (\$0.00/mo) and a **Reliable Production Configuration** (\$5.00–\$10.00/mo).

```mermaid
flowchart TD
    subgraph Client Tier ["Frontend Application (Static CDN / Global Edge)"]
        Browser["Student Web Client (React 18 + Vite SPA)"]
        ThreeCanvas["Three.js Interactive 3D Viewport"]
        AuthContext["Supabase AuthContext (JWT Client)"]
    end

    subgraph CDN ["Edge Network (Cloudflare Pages / Vercel)"]
        Edge["Global Anycast CDN / SSL Termination"]
    end

    subgraph Server Tier ["Backend Engine (Container / Node.js Runtime)"]
        Express["Express.js Server (Port 5000 / $PORT)"]
        Helmet["Security Headers (Helmet) & CORS Guard"]
        Limiter["Express Rate Limiter (100 req/15min)"]
        AuthMiddleware["Cryptographic JWT Auth Middleware"]
        AuditEngine["Deterministic Audit & Rule Engine"]
        OCRService["Tesseract OCR & PDF Parser Buffer Engine"]
        AIFailover["Multi-Provider AI Orchestrator"]
    end

    subgraph Database Tier ["Supabase Cloud Managed Platform (Mumbai ap-south-1)"]
        SupaAuth["Supabase GoTrue Auth (JWT Signer)"]
        SupaDB[("PostgreSQL 17 Database (Free Tier)")]
        RLS["Row-Level Security (18 Policies Active)"]
        ManualBackup["Manual CLI Backup (supabase db dump)"]
    end

    subgraph Email Tier ["Production Email Infrastructure"]
        CustomSMTP["Custom SMTP Service (Resend / SendGrid)"]
    end

    subgraph AI Tier ["External AI Providers (Outbound HTTPS)"]
        Groq["Groq Cloud: openai/gpt-oss-120b (Live)"]
        NVIDIA["NVIDIA NIM: nvidia/nemotron-3-ultra-550b-a55b (Live)"]
        Gemini["Google Gemini: gemini-3.8-flash (Billing Restricted)"]
    end

    Browser --> CDN
    CDN --> Edge
    Edge --> Browser
    Browser -- "Direct Auth Handshake" --> SupaAuth
    SupaAuth -- "Transactional Emails" --> CustomSMTP
    Browser -- "REST API (Bearer JWT / Multipart Files)" --> Express
    Express --> Helmet --> Limiter --> AuthMiddleware
    AuthMiddleware -- "Verify Bearer Token" --> SupaAuth
    AuthMiddleware --> AuditEngine
    AuthMiddleware --> OCRService
    AuthMiddleware --> AIFailover
    AIFailover --> Groq
    AIFailover --> NVIDIA
    AIFailover --> Gemini
    Express -- "Persistent Data (Service Role)" --> SupaDB
    SupaDB --- RLS
    SupaDB -.-> ManualBackup
```

---

## 1. Concrete Architecture Inspection

Inspection of the actual codebase at `c:\SEC\` establishes the technical baselines:

| Component | Actual Technology | Implementation Details & Resource Profile |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite 6 | Single Page Application (SPA), React Router v6, Tailwind CSS. Pure Client-Side Rendering (CSR). |
| **Client Bundling** | Code-Split Production Build | 27 chunks (`client/dist/`), vendor payload 165 kB (gzip: 54 kB), Three.js isolated chunk (526 kB / gzip: 130 kB). |
| **3D Rendering** | Three.js | Canvases in `HeroCanvas.jsx` and `ModelCanvas.jsx`, with graceful WebGL fallback detection. |
| **Backend Engine** | Node.js 20+ (ES Modules) | Express.js, native ES modules (`"type": "module"`), Helmet security headers, rate limiting. |
| **File Processing** | Volatile RAM Buffer Engine | `multer.memoryStorage()` — files remain in volatile memory and are **never** written to disk; binary magic-byte verification. |
| **Text Extraction** | OCR & PDF Parsing | `pdf-parse` for digital PDFs, `tesseract.js` (v5.1.1) spawning Node worker threads for scanned document images. Peak memory under OCR processing: ~250MB–450MB RAM. |
| **AI Orchestration** | Multi-Provider Failover | Primary: `gemini-3.8-flash` (Key authenticates; generation blocked by Google Cloud billing `403 FREE_TIER_NOT_AVAILABLE`).<br>Secondary: `openai/gpt-oss-120b` via Groq Cloud (**Live Operational**, ~1.1s).<br>Tertiary: `nvidia/nemotron-3-ultra-550b-a55b` via NVIDIA NIM (**Live Operational**, ~4.3s with numeric coercion).<br>Quaternary: Deterministic rule-based engine for offline/unconfigured fallback. |
| **Cloud Database** | Supabase PostgreSQL 17 | Hosted in Mumbai (`bwllksfjjxmumrrqaifa`, `ap-south-1`). 6 production tables, 18 RLS policies, `handle_new_user` auth trigger. |
| **Database Backups** | **Manual CLI Only** | **CRITICAL CORRECTION:** Supabase Free tier projects do **NOT** include automated daily backups. Manual backup via `supabase db dump` required. |
| **Authentication** | Supabase Auth (GoTrue) | Cryptographic Bearer JWT tokens, server-side validation via Supabase Auth Admin API. |
| **Transactional Email** | **Custom SMTP Required** | Supabase default mailer is strictly rate-limited (3–4 emails/hr) and restricted. Custom SMTP (Resend/SendGrid) required for production delivery. |

---

## 2. In-Depth Hosting Architecture Evaluation

### 2.1 Frontend Hosting: Cloudflare Pages vs Vercel

| Evaluation Criterion | Cloudflare Pages *(Recommended)* | Vercel |
| :--- | :--- | :--- |
| **Current Pricing** | **\$0.00 / month** (Free tier) | **\$0.00 / month** (Hobby) or **\$20.00 / seat / mo** (Pro) |
| **Free-Tier Terms & Commercial Use** | **Commercial use permitted** on free tier. Unlimited bandwidth, unlimited requests. | **Restricted to non-commercial / personal use only**. Commercial production deployment violates Hobby ToS and requires Pro (\$20/mo). |
| **Bandwidth Quota** | **Unlimited** | 100 GB / month |
| **Build Limits** | 500 builds / month, 1 concurrent build | 6,000 build minutes / month, 1 concurrent build |
| **Custom Domains** | Unlimited custom domains, native integration with Cloudflare DNS, automatic universal SSL. | Free custom domains, Let's Encrypt SSL, requires CNAME to `cname.vercel-dns.com`. |
| **SPA Routing** | Seamless via `_redirects` file (`/* /index.html 200`) or single-page setting. | Seamless via `vercel.json` rewrites. |
| **Global Edge Network** | 330+ Anycast edge locations worldwide; sub-20ms latency across South Asia. | High-performance Anycast edge network. |
| **Recommendation** | **STRONGLY RECOMMENDED** for both Academic Demo and Production due to unlimited bandwidth, zero commercial licensing restrictions, and native DNS integration. | Suitable for personal academic demo, but restricted by non-commercial ToS. |

---

### 2.2 Backend Hosting: Railway vs Render

The QuestForge AI backend has unique operational requirements that disqualify serverless/edge runtimes and impose specific memory constraints:
- **Tesseract.js OCR Execution:** Spawns WebAssembly/Node.js worker threads requiring **250MB–450MB of volatile RAM** during image pixel matrix analysis.
- **Multipart In-Memory Uploads:** `multer.memoryStorage()` retains files up to 10MB in RAM buffers during verification.
- **Why Cloudflare Workers CANNOT run the Backend:**
  - Cloudflare Workers use V8 isolates, **not** a standard Node.js runtime.
  - Worker memory limit is **128 MB** on free tier (insufficient for `tesseract.js` which needs >250MB).
  - Worker CPU time limit is **50 ms** on free tier (Tesseract OCR requires 5,000ms–15,000ms CPU execution).
  - Native Node.js C++ bindings and thread worker models are unsupported.
  - **Conclusion:** A containerized or standard Node.js VM host (Railway or Render) is mandatory.

| Evaluation Criterion | Render (Free Tier) | Railway (Hobby Tier) |
| :--- | :--- | :--- |
| **Current Pricing** | **\$0.00 / month** (Free Web Service) | **~\$5.00 – \$7.00 / month** (\$5.00 base subscription + micro-usage) |
| **Cold Starts & Inactivity Sleep** | **SPINS DOWN after 15 minutes of inactivity.** Incoming requests incur a **50–90 second cold start delay**. | **ZERO SLEEP.** Container remains 24/7 warm and responsive. |
| **Anti-Pattern Warning** | *Do NOT use artificial keep-alive pings as a substitute for an appropriate hosting plan.* External pings are fragile, violate platform spirit, and fail to guarantee warm memory state. | Not needed; runs natively 24/7. |
| **Memory Allocation** | **512 MB RAM ceiling.** High risk of **OOM Kill (Exit Code 137)** if multiple concurrent students upload scanned documents simultaneously. | **Configurable / Scaleable RAM (1 GB–8 GB).** Generous headroom prevents OCR OOM crashes. |
| **Request Timeout** | 100 seconds | 300+ seconds (configurable) |
| **Storage Nature** | Ephemeral container filesystem (matches QuestForge's in-memory storage model). | Ephemeral container filesystem. |
| **Deployment Mechanism** | GitHub repository webhook, auto-build, Docker or native Node.js. | GitHub repository continuous deployment, Docker or Procfile. |
| **Environment Variable Management** | Encrypted dashboard variables, `.env` file injection. | Encrypted dashboard variables, secret references. |
| **Custom Domain & SSL** | Free custom domain with automated Let's Encrypt SSL. | Free custom domain with automated SSL. |

---

## 3. Recommended Hosting Configurations

### Configuration 1: Lowest-Cost Academic Demonstration Configuration (\$0.00 / month)
Designed strictly for coursework presentation, academic grading, and proof-of-concept demonstration where zero monetary expenditure is required.

- **Frontend:** **Cloudflare Pages** (Free Plan — \$0.00/mo, unlimited bandwidth, no commercial restrictions).
- **Backend:** **Render Free Web Service** (\$0.00/mo, 512 MB RAM, 0.1 vCPU).
- **Database:** **Supabase Free Project** (`bwllksfjjxmumrrqaifa`, Mumbai — \$0.00/mo, 500 MB DB).
- **Email:** **Supabase Shared Mailer** (Free — rate limited to ~3–4 emails/hr, suitable only for demo).
- **AI Extraction:** **Groq Cloud (`openai/gpt-oss-120b`)** + **NVIDIA NIM (`nvidia/nemotron-3-ultra-550b-a55b`)** on free developer quotas (\$0.00/mo).
- **Total Expected Monthly Cost:** **\$0.00 / month**

> [!WARNING]
> **Known Limitations of Academic Configuration:**
> 1. **Cold Start Latency:** If the application has been idle for >15 minutes, the first user audit or API call will experience a 50–90 second cold boot delay while Render spins up the container.
> 2. **Memory Constraint:** The 512 MB RAM limit cannot support heavy concurrent OCR processing. Testing must be serialized (one document audit at a time).
> 3. **No Automated Backups:** Supabase Free tier will not back up data. The administrator must execute manual CLI backups.
> 4. **Supabase Inactivity Pausing:** Free projects pause after 7 days of database inactivity (can be unpaused via dashboard).

---

### Configuration 2: Reliable Production Configuration (~$5.00 – \$7.00 / month)
Designed for reliable public operation, institutional evaluation, or external student traffic without cold start dropouts or memory failures.

- **Frontend:** **Cloudflare Pages** (Free Plan — \$0.00/mo, global Anycast CDN, DDoS protection).
- **Backend:** **Railway Hobby Plan** (**~\$5.00 – \$7.00 / mo** based on compute usage).
  - 24/7 warm container (0 second cold start delay).
  - 1 GB RAM allocation (ample headroom for Tesseract.js OCR and PDF buffer handling without OOM crashes).
- **Database:** **Supabase Free Project** (Mumbai `bwllksfjjxmumrrqaifa` — \$0.00/mo) coupled with automated manual CLI backup scripts. *(Optional: Supabase Pro at \$25/mo for daily auto-backups + 7-day PITR if budget permits).*
- **Email:** **Resend Free Tier** (\$0.00/mo, 3,000 emails/month, 100 emails/day, dedicated custom domain DKIM/SPF).
- **AI Extraction:** **Groq Cloud (`openai/gpt-oss-120b`)** + **NVIDIA NIM (`nvidia/nemotron-3-ultra-550b-a55b`)** (Free developer quotas / pay-as-you-go micro-cents).
- **Custom Domain:** Cloudflare Registrar / Namecheap (~**\$10.00 – \$14.00 / year**, approx \$1.00/mo).
- **Total Expected Monthly Cost:** **~\$5.00 – \$8.00 / month**

---

## 4. Supabase Database Backup Strategy (Free Tier)

> [!IMPORTANT]
> **Factual Correction:** Supabase Free tier projects do **NOT** receive automated daily database backups or Point-In-Time Recovery (PITR). Automated backups require the Supabase Pro plan (\$25/month). For QuestForge AI on the Free tier, data persistence and disaster recovery must follow this documented manual CLI protocol.

### 4.1 Prerequisites
Ensure the Supabase CLI is installed locally:
```bash
# Using npm
npm install -g supabase

# Or verify existing installation
supabase --version
```

### 4.2 Manual Backup Commands

Execute backups before any code deployment, database migration, or major evaluation:

```bash
# Set your Supabase Personal Access Token (stored in server/.env, never committed)
export SUPABASE_ACCESS_TOKEN="sbp_..."

# 1. Full Database Schema Dump (DDL, tables, policies, functions, triggers)
supabase db dump --project-ref bwllksfjjxmumrrqaifa --schema public -f backups/questforge_schema_$(date +%Y%m%d).sql

# 2. Database Data Dump (DML rows: user profiles, audit sessions, findings)
supabase db dump --project-ref bwllksfjjxmumrrqaifa --data-only --schema public -f backups/questforge_data_$(date +%Y%m%d).sql

# 3. Roles and Grants Dump
supabase db dump --project-ref bwllksfjjxmumrrqaifa --role-only -f backups/questforge_roles_$(date +%Y%m%d).sql
```

Direct PostgreSQL dump via connection string (alternative):
```bash
pg_dump "postgresql://postgres:[YOUR-DB-PASSWORD]@db.bwllksfjjxmumrrqaifa.supabase.co:5432/postgres" \
  --format=custom \
  --no-owner \
  --no-privileges \
  --file="backups/questforge_prod_$(date +%Y%m%d).dump"
```

### 4.3 Secure Storage of Backup Files
1. **Local Security:** Store backup files in a dedicated `backups/` directory located outside the web root.
2. **Git Exclusion:** Ensure `.gitignore` explicitly contains:
   ```gitignore
   backups/
   *.dump
   *.sql.gpg
   ```
   **Never commit SQL backup files to version control.**
3. **Encryption at Rest:** Encrypt backup dumps using GPG before archiving:
   ```bash
   gpg --symmetric --cipher-algo AES256 backups/questforge_prod_$(date +%Y%m%d).dump
   rm backups/questforge_prod_$(date +%Y%m%d).dump
   ```

### 4.4 Backup Verification Process
1. Test restore the dump into a local scratch PostgreSQL instance:
   ```bash
   createdb questforge_verify_test
   pg_restore -d questforge_verify_test backups/questforge_prod_20261122.dump
   ```
2. Run row count verification across all 6 production tables:
   ```sql
   SELECT 'user_profiles' AS tbl, count(*) FROM user_profiles
   UNION ALL SELECT 'user_preferences', count(*) FROM user_preferences
   UNION ALL SELECT 'audit_sessions', count(*) FROM audit_sessions
   UNION ALL SELECT 'audit_findings', count(*) FROM audit_findings
   UNION ALL SELECT 'audit_documents', count(*) FROM audit_documents
   UNION ALL SELECT 'contact_inquiries', count(*) FROM contact_inquiries;
   ```
3. Check JSONB metadata columns in `audit_sessions.raw_metadata` to confirm document structures are intact.

### 4.5 Restore Instructions
To restore a backup to the live database in disaster recovery:
```bash
# Restore schema and data via psql
psql "postgresql://postgres:[YOUR-DB-PASSWORD]@db.bwllksfjjxmumrrqaifa.supabase.co:5432/postgres" \
  -f backups/questforge_data_YYYYMMDD.sql
```
*Note: Restore operations must be executed inside a single transaction (`BEGIN; ... COMMIT;`) to prevent partial restores.*

### 4.6 Recommended Backup Schedule
- **Pre-Migration:** Mandatory before any database DDL change or schema migration.
- **Weekly Snapshot:** Every Friday during active testing/coursework evaluation.
- **Post-Milestone:** Immediately after grading or user demonstration events.
- **Off-Site Storage (Pending User Approval):** Off-site replication to an encrypted Cloudflare R2 or AWS S3 Glacier cold-storage bucket can be configured upon user authorization.

---

## 5. Production Transactional SMTP Configuration

### 5.1 The Default Mailer Problem
On Supabase Free tier:
- The default email service uses shared infrastructure (`noreply@mail.app.supabase.io`).
- **Rate Limit:** Strictly capped at **3–4 emails per hour**.
- **Delivery Risk:** Emails frequently land in spam folders or are blocked by institutional university mail firewalls.
- **Team Restriction:** Supabase free email is intended only for development and authorized project members.

### 5.2 Custom SMTP Comparison

| Feature | Resend *(Recommended)* | SendGrid |
| :--- | :--- | :--- |
| **Free Tier Allowance** | **3,000 emails / month** (100 / day) | **100 emails / day** forever |
| **Domain Authentication** | Simple DNS verification (DKIM, SPF via MX/TXT) | Requires 3 CNAME records for domain authentication |
| **Developer Experience** | Clean, modern dashboard, instant setup | Complex Twilio dashboard with legacy navigation |
| **Deliverability** | Top-tier inbox placement via Amazon SES backend | Good deliverability once verified |
| **SMTP Host** | `smtp.resend.com` (Port 465 or 587) | `smtp.sendgrid.net` (Port 587) |

### 5.3 Step-by-Step Custom SMTP Setup in Supabase
1. Create a free account at [Resend](https://resend.com).
2. Add your custom domain (e.g. `questforge.ai`) and add the provided DNS TXT/MX records to Cloudflare DNS.
3. Generate an API Key with "Sending access".
4. Open the [Supabase Dashboard for bwllksfjjxmumrrqaifa](https://supabase.com/dashboard/project/bwllksfjjxmumrrqaifa).
5. Navigate to **Project Settings &rarr; Authentication &rarr; SMTP Settings**.
6. Toggle **Enable Custom SMTP** to `ON`.
7. Fill the configuration:
   - **Sender Email:** `auth@questforge.ai` (or `noreply@yourdomain.com`)
   - **Sender Name:** `QuestForge AI Admissions`
   - **Host:** `smtp.resend.com`
   - **Port:** `465` (SSL) or `587` (TLS)
   - **Username:** `resend`
   - **Password:** `<YOUR_RESEND_API_KEY>`
8. Click **Save Changes**.

### 5.4 Email Template & Redirect URL Verification
In Supabase Dashboard &rarr; **Authentication &rarr; Email Templates**:
- **Reset Password Template:**
  Verify message body includes:
  ```html
  <h2>Reset Your Password</h2>
  <p>Follow this link to reset your QuestForge AI password:</p>
  <p><a href="{{ .SiteURL }}/reset-password?token_hash={{ .TokenHash }}&type=recovery">Reset Password</a></p>
  ```
- **Confirm Signup Template:**
  ```html
  <h2>Confirm Your Account</h2>
  <p><a href="{{ .SiteURL }}/login?token_hash={{ .TokenHash }}&type=signup">Confirm your email</a></p>
  ```
- **Redirect URLs Whitelist (Authentication &rarr; URL Configuration):**
  - Site URL: `https://questforge.ai` (or `https://app.questforge.ai`)
  - Additional Redirect URLs:
    - `https://questforge.ai/**`
    - `https://questforge.ai/reset-password`
    - `https://questforge.ai/login`
    - `http://localhost:5173/**` *(for local developer testing)*

---

## 6. Build, Start & Health Parameters

### 6.1 Frontend Client (Cloudflare Pages / Vercel)
- **Framework Preset:** Vite
- **Root Directory:** `client/`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:**
  - `VITE_API_URL`: Backend URL (e.g. `https://api.questforge.ai` or Railway URL)
  - `VITE_SUPABASE_URL`: `https://bwllksfjjxmumrrqaifa.supabase.co`
  - `VITE_SUPABASE_ANON_KEY`: Public publishable token (safe for browser)

### 6.2 Backend Server (Railway / Render)
- **Runtime:** Node.js 20+
- **Root Directory:** `server/`
- **Build Command:** `npm install --omit=dev`
- **Start Command:** `node src/index.js`
- **Port:** Automatically binds to `process.env.PORT` (defaults to 5000)
- **Health Probes:**
  - `GET /api/health` &rarr; HTTP 200 (reports active mode, uptime, and AI status)
  - `GET /api/persistence/status` &rarr; HTTP 200 (reports live Supabase connection status)
