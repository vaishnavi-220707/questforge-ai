# QuestForge AI — Staging Deployment Configuration Guide

**Environment:** Academic Demonstration Staging (\$0/month)  
**Frontend Platform:** Vercel Hobby (Free Plan) &rarr; `https://questforge-ai-staging.vercel.app` (LIVE)  
**Backend Platform:** Render Web Service (Free Plan) &rarr; `https://questforge-ai-api-staging.onrender.com`  
**Database:** Supabase Cloud PostgreSQL 17 (Mumbai `bwllksfjjxmumrrqaifa`)  
**GitHub Repository:** [https://github.com/selfabhijeetkumar/questforge-ai](https://github.com/selfabhijeetkumar/questforge-ai) (PRIVATE)  

---

## 1. Vercel Frontend Deployment (COMPLETED & VERIFIED LIVE)

- **Production URL:** `https://questforge-ai-staging.vercel.app`
- **Framework:** Vite 6 + React 18 + Three.js
- **Routing:** Single Page Application (SPA) handled by `client/vercel.json` (`/* -> /index.html 200`)
- **Staging Robots Directive:** `X-Robots-Tag: noindex, nofollow` active on all responses
- **Configured Environment Variables (in Vercel):**
  - `VITE_API_URL` = `https://questforge-ai-api-staging.onrender.com`
  - `VITE_SUPABASE_URL` = `https://bwllksfjjxmumrrqaifa.supabase.co`
  - `VITE_SUPABASE_ANON_KEY` = *(safe public publishable key)*

---

## 2. Render Backend Deployment (`questforge-ai-api-staging`)

### Step-by-Step Deployment (2 Minutes):
1. Open [dashboard.render.com](https://dashboard.render.com) and log in (or click **Sign in with GitHub**).
2. Click **New +** &rarr; **Blueprint** (Recommended):
   - Connect your GitHub account and select repository `selfabhijeetkumar/questforge-ai`.
   - Render will automatically detect `render.yaml` in the root of the repository!
   - It will automatically prefill:
     - Name: `questforge-ai-api-staging`
     - Runtime: `Node`
     - Plan: `Free`
     - Region: `Singapore` (closest free tier region to Mumbai database)
     - Root Directory: `server`
     - Build Command: `npm install --omit=dev`
     - Start Command: `node src/index.js`
     - Health Check: `/api/health`
     - `NODE_ENV`: `production`
     - `CLIENT_URL`: `https://questforge-ai-staging.vercel.app`
3. Render will prompt you for the values of the un-synced environment variables.  
   **Copy these exact values from your local `server/.env` file:**

| Variable Key | Source in `server/.env` | Notes |
|---|---|---|
| `SUPABASE_URL` | `SUPABASE_URL` | `https://bwllksfjjxmumrrqaifa.supabase.co` |
| `SUPABASE_ANON_KEY` | `SUPABASE_ANON_KEY` | Public publishable token |
| `SUPABASE_SERVICE_ROLE_KEY` | `SUPABASE_SERVICE_ROLE_KEY` | Confidential server-only key |
| `GROQ_API_KEY` | `GROQ_API_KEY` | Live operational Groq Cloud key |
| `NVIDIA_API_KEY` | `NVIDIA_API_KEY` | Live operational NVIDIA NIM key |
| `GEMINI_API_KEY` | `GEMINI_API_KEY` | Authenticated Google AI Studio key |

4. Click **Apply** (or **Create Web Service**).
5. Render will provision and deploy your service at:  
   `https://questforge-ai-api-staging.onrender.com`
6. Once deployed, verify health at:  
   `https://questforge-ai-api-staging.onrender.com/api/health`

---

## 3. Supabase Auth Configuration (`bwllksfjjxmumrrqaifa`)

In the Supabase Dashboard ([supabase.com/dashboard/project/bwllksfjjxmumrrqaifa](https://supabase.com/dashboard/project/bwllksfjjxmumrrqaifa)):
1. Navigate to **Authentication** &rarr; **URL Configuration**.
2. Set **Site URL** to:
   ```
   https://questforge-ai-staging.vercel.app
   ```
3. Under **Redirect URLs**, add the following URLs:
   ```
   https://questforge-ai-staging.vercel.app/**
   https://questforge-ai-staging.vercel.app/login
   https://questforge-ai-staging.vercel.app/reset-password
   http://localhost:5173/**
   ```
   *(Note: `http://localhost:5173/**` preserves local development access).*
4. Click **Save**.

---

## 4. Render Free-Tier Characteristics to Keep in Mind

- **Inactivity Spin-Down:** Render spins down free web services after 15 minutes of inactivity.
- **Cold Start:** The first request after spin-down takes ~50–90 seconds while the container initializes.
- **Memory Ceiling:** 512 MB RAM limit. Tesseract OCR workers are explicitly terminated in `finally` blocks to release memory immediately.
- **No Keep-Alives:** As per policy, no artificial pings are implemented.
