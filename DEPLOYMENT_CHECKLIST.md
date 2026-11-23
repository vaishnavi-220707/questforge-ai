# QUESTFORGE AI — PRODUCTION DEPLOYMENT & HOSTING ARCHITECTURE CHECKLIST

**Document Version:** 2.0.0 (Updated & Reconciled)  
**Effective Date:** November 2026  
**Status:** **READY FOR RELEASE DECISION (AWAITING USER DOMAIN & HOSTING APPROVAL)**  
**Target Database:** `bwllksfjjxmumrrqaifa` (Supabase Cloud Mumbai `ap-south-1`, Free Plan)  

---

## 1. CUSTOM DOMAIN CONFIGURATION GATES

QuestForge AI requires a custom production domain prior to public release. Until the user registers a domain, this phase remains marked **AWAITING USER SELECTION**.

### 1.1 DNS Configuration Matrix

When your custom domain (e.g., `questforge.ai`) is registered via Cloudflare or Namecheap:

| Record Type | Host / Name | Target / Value | Purpose |
|---|---|---|---|
| **CNAME** (or A) | `@` (Apex) | Cloudflare Pages or `cname.vercel-dns.com` | Routes apex traffic to static edge |
| **CNAME** | `www` | `questforge.ai.` | Canonical alias redirect |
| **CNAME** | `api` | Railway container URL (or Render Web Service) | Dedicated API gateway routing |
| **TXT** | `@` | Resend/SendGrid DKIM & SPF records | Transactional email deliverability |

---

## 2. HOSTING PLATFORM EVALUATION & SELECTION

| Subsystem | Lowest-Cost Academic Demo (\$0.00/mo) | Reliable Production Plan (~$5–\$8/mo) | Key Technical Limitations & Constraints |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Cloudflare Pages** (Free) | **Cloudflare Pages** (Free) or Vercel Pro | Vercel Hobby is restricted to non-commercial use. Cloudflare Pages allows commercial use with unlimited bandwidth. |
| **Backend** | **Render Free Web Service** | **Railway Hobby Container** | Render Free sleeps after 15 min inactivity (50–90s cold start delay) and has a 512MB RAM ceiling (OOM risk under concurrent Tesseract OCR). Railway runs 24/7 with scalable RAM. Cloudflare Workers cannot run the backend due to isolate CPU/memory limits. |
| **Database** | **Supabase Free Project** (Mumbai) | **Supabase Free Project** + CLI Backups | **Supabase Free tier does NOT include automated daily backups.** Manual backup via `supabase db dump` required. Free tier projects pause after 7 days of inactivity. |
| **Email / SMTP**| **Supabase Default Mailer** | **Resend Free Tier** (3,000/mo) | Supabase default mailer is capped at 3–4 emails/hr and restricted to authorized team testing. |

---

## 3. SUPABASE DATABASE BACKUP PROTOCOL (FREE TIER)

Because the Supabase Free plan does not provide automated daily snapshots:

1. **Manual Backup via Supabase CLI:**
   ```bash
   # Dump full schema DDL
   supabase db dump --project-ref bwllksfjjxmumrrqaifa --schema public -f backups/questforge_schema_$(date +%Y%m%d).sql

   # Dump database data rows
   supabase db dump --project-ref bwllksfjjxmumrrqaifa --data-only --schema public -f backups/questforge_data_$(date +%Y%m%d).sql
   ```
2. **Backup Storage Security:**
   - Store in `backups/` directory (strictly listed in `.gitignore`).
   - Encrypt at rest via GPG (`gpg --symmetric --cipher-algo AES256`).
   - **Never commit raw SQL dumps to Git.**
3. **Verification & Restore:**
   - Dry-run restore into a scratch database: `pg_restore -d test_db backups/questforge_prod.dump`.
   - Restore command for disaster recovery:
     ```bash
     psql "postgresql://postgres:[PASSWORD]@db.bwllksfjjxmumrrqaifa.supabase.co:5432/postgres" -f backups/questforge_data_YYYYMMDD.sql
     ```
4. **Recommended Frequency:**
   - Before every schema migration or code deployment.
   - Weekly during active student evaluation.

---

## 4. HTTPS, TLS & REVERSE PROXY SPECIFICATIONS

1. **Automatic Certificate Management:**
   - If deployed on **Cloudflare Pages** or **Vercel**, TLS 1.3 certificates are provisioned and renewed automatically.
2. **HSTS Header:**
   - Helmet security middleware on the Express backend enforces HTTP Strict Transport Security (`max-age=31536000; includeSubDomains`).
3. **Production Nginx Template (for self-hosted or dedicated VPS deployment):**

```nginx
server {
    listen 80;
    server_name questforge.ai www.questforge.ai;
    return 301 https://questforge.ai$request_uri;
}

server {
    listen 443 ssl http2;
    server_name questforge.ai;

    ssl_certificate /etc/letsencrypt/live/questforge.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/questforge.ai/privkey.pem;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Frontend Single-Page Application (Vite Build)
    location / {
        root /var/www/questforge-ai/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend Express REST API
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 15M;
    }
}
```

---

## 5. RECONCILED AI PROVIDERS & ENVIRONMENT CONFIGURATION

### Verified Production Models:
- **Primary:** `gemini-3.8-flash` (Google Gemini — authenticated; generation requires project billing).
- **Secondary:** `openai/gpt-oss-120b` (Groq Cloud — **Live Operational**, ~1.1s latency).
- **Tertiary:** `nvidia/nemotron-3-ultra-550b-a55b` (NVIDIA NIM — **Live Operational**, ~4.3s latency).
- **Quaternary:** Deterministic rules engine (offline fallback).

### Backend Production Environment (`server/.env.production`):
```bash
NODE_ENV=production
PORT=5000
CLIENT_URL=https://questforge.ai

# Supabase Cloud (Mumbai ap-south-1)
SUPABASE_URL=https://bwllksfjjxmumrrqaifa.supabase.co
SUPABASE_ANON_KEY=<PROD_PUBLIC_ANON_KEY>
SUPABASE_SERVICE_ROLE_KEY=<PROD_CONFIDENTIAL_SERVICE_ROLE_KEY>

# Multi-Provider AI Credentials
GEMINI_API_KEY=<PROD_GEMINI_KEY>
GROQ_API_KEY=<PROD_GROQ_KEY>
NVIDIA_API_KEY=<PROD_NVIDIA_KEY>
```

### Frontend Production Environment (`client/.env.production`):
```bash
VITE_API_URL=https://api.questforge.ai
VITE_SUPABASE_URL=https://bwllksfjjxmumrrqaifa.supabase.co
VITE_SUPABASE_ANON_KEY=<PROD_PUBLIC_ANON_KEY>
```
