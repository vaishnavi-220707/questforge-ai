# QuestForge AI — Phase 13 Staging Deployment Report

**Date:** November 22, 2026  
**Auditor / Deployer:** Antigravity Autonomous Security & Release Engineer  
**Status:** FRONTEND LIVE / BACKEND BLUEPRINT READY  
**Approved Architecture:** Configuration 1 — \$0/month Academic Demonstration Staging  

---

## 1. Executive Summary

QuestForge AI has been prepared and deployed for Phase 13 Academic Demonstration Staging under the approved **\$0/month free-tier architecture**:

- **Frontend Platform:** Vercel Hobby (Free Tier)  
  - **Live URL:** [https://questforge-ai-staging.vercel.app](https://questforge-ai-staging.vercel.app)
  - **Status:** **LIVE & OPERATIONAL** (HTTP 200 OK across all core SPA routes)
  - **Deployment ID:** `dpl_FBGZDgwggJDf2hETfGdwGLTkWMiS`
  - **Deployment Branch:** `master`
- **Backend Platform:** Render Web Service (Free Tier)  
  - **Target URL:** `https://questforge-ai-api-staging.onrender.com`
  - **Configuration:** Fully automated via `render.yaml` Blueprint in repository root
  - **Runtime & Region:** Node.js (Singapore region, closest free tier to Mumbai database)
- **Database & Auth:** Supabase Cloud PostgreSQL 17  
  - **Project Reference:** `bwllksfjjxmumrrqaifa` (Mumbai, `ap-south-1`)
  - **Security:** 18 active Row-Level Security (RLS) policies verified
- **AI Engine:** Multi-Provider Failover Sequence  
  - Groq Cloud (`openai/gpt-oss-120b`): Live operational
  - NVIDIA NIM (`nvidia/nemotron-3-ultra-550b-a55b`): Live operational
  - Google Gemini (`gemini-3.8-flash`): Authenticated, billing restricted (graceful instant failover to Groq)
- **Source Repository:** [https://github.com/selfabhijeetkumar/questforge-ai](https://github.com/selfabhijeetkumar/questforge-ai)  
  - **Visibility:** **Strictly PRIVATE** (verified via GitHub API)

---

## 2. Preflight Security & Quality Verification

Prior to remote publishing, the complete codebase and its historical Git object database were subjected to rigorous security and regression testing:

| Verification Suite | Target | Test Cases | Result | Status |
|---|---|---|---|---|
| **Git History Secret Scan** | All 22 commits (`git log -p`) | API keys, tokens, DB passwords | **0 Leaks** | **PASS** |
| **Backend Regression Suite** | `npm --prefix server test` | 31 unit & integration tests | **31 / 31** | **PASS** |
| **Authorization & RLS Suite** | `verify_backend_authorization.js` | 20 cross-user security checks | **20 / 20** | **PASS** |
| **Frontend Production Build** | `npm --prefix client run build` | 27 code-split chunks (Vite 6) | Built in 10.7s | **PASS** |
| **Bundle Secret Scan** | `client/dist/` assets | Service role keys, private tokens | **0 Leaks** | **PASS** |

---

## 3. Vercel Frontend Deployment Details

### 3.1 Project Setup
- **Project Name:** `questforge-ai-staging`
- **Root Directory:** `client`
- **Framework Preset:** `Vite`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### 3.2 Single Page Application (SPA) Routing & Search Exclusion
The frontend routing was configured via `client/vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Robots-Tag", "value": "noindex, nofollow" }
      ]
    }
  ]
}
```

### 3.3 Empirical Live Route Verification
Direct navigation to SPA routes was tested against the live Vercel edge:
- `GET /` &rarr; **HTTP 200 OK** (Cache: HIT, Server: Vercel Mumbai `bom1`)
- `GET /about` &rarr; **HTTP 200 OK** (`index.html` served)
- `GET /scholarships` &rarr; **HTTP 200 OK** (`index.html` served)
- `GET /dashboard` &rarr; **HTTP 200 OK** (`index.html` served)
- `GET /upload` &rarr; **HTTP 200 OK** (`index.html` served)
- **Robots Policy:** Confirmed `X-Robots-Tag: noindex, nofollow` on all responses to prevent public search engine indexing.

### 3.4 Configured Vercel Environment Variables
| Variable Name | Type | Value / Source |
|---|---|---|
| `VITE_API_URL` | Config (Public) | `https://questforge-ai-api-staging.onrender.com` |
| `VITE_SUPABASE_URL` | Config (Public) | `https://bwllksfjjxmumrrqaifa.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Config (Public) | Public publishable token (safe for browser) |

*Note: Zero private credentials, service-role keys, or backend secrets were injected into Vercel.*

---

## 4. Render Backend Blueprint Configuration

A complete declarative infrastructure-as-code specification was authored and pushed to the repository root at `render.yaml`:

```yaml
services:
  - type: web
    name: questforge-ai-api-staging
    runtime: node
    plan: free
    region: singapore
    rootDir: server
    buildCommand: npm install --omit=dev
    startCommand: node src/index.js
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: CLIENT_URL
        value: https://questforge-ai-staging.vercel.app
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: GROQ_API_KEY
        sync: false
      - key: NVIDIA_API_KEY
        sync: false
      - key: GEMINI_API_KEY
        sync: false
```

### 4.1 Backend Security & Memory Protection
1. **Dynamic CORS Support:** `server/src/app.js` was updated to accept:
   - Configured `CLIENT_URL` (`https://questforge-ai-staging.vercel.app`)
   - Any `*.vercel.app` staging deployment
   - Localhost (`http://localhost:5173`)
2. **Render 512MB RAM Ceiling Defense:**
   - In `server/src/services/ocrService.js`, Tesseract OCR worker instances are wrapped in `try...finally { await worker.terminate(); }` to ensure worker threads are immediately destroyed upon extraction completion, preventing process out-of-memory errors on Render Free.
3. **Graceful Shutdown & Host Binding:**
   - Server binds explicitly to `0.0.0.0` on `process.env.PORT`.
   - `SIGTERM` handlers gracefully shut down active connections.

---

## 5. Supabase Auth Configuration Guide

To enable user registration and password recovery on the live staging domain, update the Supabase project `bwllksfjjxmumrrqaifa` configuration in the Supabase Dashboard:

1. **Site URL:**
   ```
   https://questforge-ai-staging.vercel.app
   ```
2. **Redirect URLs:**
   ```
   https://questforge-ai-staging.vercel.app/**
   https://questforge-ai-staging.vercel.app/login
   https://questforge-ai-staging.vercel.app/reset-password
   http://localhost:5173/**
   ```

---

## 6. Render Free-Tier Operational Constraints

As QuestForge AI operates under free academic hosting, the following behaviors are expected and normal:

1. **Inactivity Sleep:** Render spins down free web services after 15 minutes of inactivity.
2. **Cold Start Wake-up:** The initial request after spin-down requires **50–90 seconds** while Render provisions the container. The frontend API client is built to gracefully handle connecting states without throwing unhandled exceptions.
3. **No Keep-Alives:** In strict accordance with the user instructions, no artificial keep-alive pings or cron jobs have been implemented.
4. **Ephemeral Filesystem:** All document uploads and processing are streamed or temporarily buffered in memory; persistent state is securely maintained within Supabase Cloud PostgreSQL in Mumbai.

---

## 7. Next Actions for Final Live Staging Acceptance

1. **Deploy Render Service:** In [dashboard.render.com](https://dashboard.render.com), click **New +** &rarr; **Blueprint** &rarr; Select `questforge-ai`, and enter the secrets from `server/.env`.
2. **Save Supabase Redirects:** Update the redirect URLs in the Supabase dashboard.
3. **Live End-to-End Test:** Open [https://questforge-ai-staging.vercel.app](https://questforge-ai-staging.vercel.app), register a synthetic user, upload a test PDF, and review the live audit results.
