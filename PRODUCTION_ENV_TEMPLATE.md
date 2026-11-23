# QuestForge AI — Production Environment Variables Template

**Document Version:** 1.0.0  
**Phase:** 12 — Production Deployment Preparation & Final Security Audit  
**Date:** November 2026  
**Security Level:** Public Documentation (Zero Secrets Embedded)  

> [!WARNING]
> Never commit populated `.env` files to Git. Populate these variables directly within the deployment platform's secret manager (e.g. Vercel Project Settings, Railway Variables, or Render Environment settings).

---

## 1. Backend Environment Variables (`server/.env.production`)

Configure these variables in your backend hosting platform (e.g. Railway, Render, or Docker container environment):

```ini
# ==============================================================================
# SERVER CORE CONFIGURATION
# ==============================================================================
NODE_ENV=production
PORT=5000

# Primary client origin allowed by CORS middleware (no trailing slash)
CLIENT_URL=https://questforge.ai

# ==============================================================================
# SUPABASE POSTGRESQL & AUTH PERSISTENCE (MUMBAI ap-south-1)
# ==============================================================================
# Project URL from Supabase Settings -> API
SUPABASE_URL=https://bwllksfjjxmumrrqaifa.supabase.co

# Public Publishable / Anon Key (Safe for client, used for public auth queries)
SUPABASE_ANON_KEY=eyJhbGciOi...[REPLACE_WITH_YOUR_ANON_KEY]

# Secret Service-Role Key (CONFIDENTIAL: Never expose to frontend or chat)
# Used server-side for administrative tasks and trusted auth verification
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...[REPLACE_WITH_YOUR_SERVICE_ROLE_KEY]

# Optional Management Token (Used only for CLI migrations / administrative scripts)
SUPABASE_ACCESS_TOKEN=sbp_...[OPTIONAL_CLI_MANAGEMENT_TOKEN]

# ==============================================================================
# MULTI-PROVIDER AI EXTRACTION ENGINE (FAILOVER SEQUENCE)
# Sequence: Gemini (Priority 1) -> Groq (Priority 2) -> NVIDIA (Priority 3) -> Deterministic
# ==============================================================================
# Primary Provider: Google Gemini API (Model: gemini-3.8-flash, requires project billing)
GEMINI_API_KEY=AIzaSy...[REPLACE_WITH_GEMINI_KEY]

# Secondary Provider: Groq Cloud (Model: openai/gpt-oss-120b, live operational)
GROQ_API_KEY=gsk_...[REPLACE_WITH_GROQ_KEY]

# Tertiary Provider: NVIDIA NIM (Model: nvidia/nemotron-3-ultra-550b-a55b, live operational)
NVIDIA_API_KEY=nvapi-...[REPLACE_WITH_NVIDIA_KEY]
```

### 1.1 Backend Variable Sensitivity Matrix

| Variable | Sensitivity | Exposed to Frontend? | Where to Obtain |
| :--- | :---: | :---: | :--- |
| `NODE_ENV` | Low | No | Set to `production` |
| `PORT` | Low | No | Managed by host or set to `5000` |
| `CLIENT_URL` | Low | No | Your production frontend URL (`https://questforge.ai`) |
| `SUPABASE_URL` | Low | Yes | Supabase Project Settings &rarr; API |
| `SUPABASE_ANON_KEY` | Medium | Yes | Supabase Project Settings &rarr; API (anon public) |
| `SUPABASE_SERVICE_ROLE_KEY` | **RESTRICTED** | **STRICTLY NO** | Supabase Project Settings &rarr; API (service_role secret) |
| `SUPABASE_ACCESS_TOKEN` | **RESTRICTED** | **STRICTLY NO** | Supabase Account &rarr; Access Tokens |
| `GEMINI_API_KEY` | **CONFIDENTIAL** | **STRICTLY NO** | Google AI Studio (`aistudio.google.com`) |
| `GROQ_API_KEY` | **CONFIDENTIAL** | **STRICTLY NO** | Groq Cloud Console (`console.groq.com`) |
| `NVIDIA_API_KEY` | **CONFIDENTIAL** | **STRICTLY NO** | NVIDIA NGC / NIM Portal (`build.nvidia.com`) |

---

## 2. Frontend Environment Variables (`client/.env.production`)

Configure these variables in your frontend hosting platform (e.g. Vercel Environment Variables or Cloudflare Pages):

```ini
# ==============================================================================
# FRONTEND CLIENT ENVIRONMENT (BUNDLED AT BUILD TIME)
# All VITE_* variables are embedded into the client browser bundle
# NEVER put secret or service-role keys in this file
# ==============================================================================

# Backend API Base URL (Leave empty if using a reverse proxy on the same domain)
VITE_API_URL=https://api.questforge.ai

# Supabase Cloud Project Configuration (Safe public credentials)
VITE_SUPABASE_URL=https://bwllksfjjxmumrrqaifa.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...[REPLACE_WITH_YOUR_ANON_KEY]
```

### 2.1 Frontend Variable Sensitivity Matrix

| Variable | Sensitivity | Exposed to Browser? | Notes |
| :--- | :---: | :---: | :--- |
| `VITE_API_URL` | Low | Yes | Production backend URL. If omitted, frontend falls back to relative `/api` paths. |
| `VITE_SUPABASE_URL` | Low | Yes | Safe public endpoint for Supabase Auth & PostgreSQL. |
| `VITE_SUPABASE_ANON_KEY` | Medium | Yes | Public publishable token. Safe because PostgreSQL tables are guarded by Row-Level Security (RLS). |

---

## 3. Platform Setup Quick-Start Instructions

### Vercel (Frontend)
1. In Vercel Project Dashboard, navigate to **Settings &rarr; Environment Variables**.
2. Add `VITE_API_URL`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY`.
3. Check the **Production** and **Preview** environments.
4. Trigger a new deployment to embed variables.

### Railway / Render (Backend)
1. In the Service Settings, open **Variables** or **Environment**.
2. Add all variables from Section 1 above.
3. Save changes; the service will automatically perform a zero-downtime rolling restart.
4. Verify by accessing `https://api.yourdomain.com/api/health`.
