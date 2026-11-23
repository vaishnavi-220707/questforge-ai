# QUESTFORGE AI — AUTHENTICATION & AUTHORIZATION SPECIFICATION

**Document Version:** 1.0.0  
**Effective Date:** November 2026  
**Security Standard:** OAuth2 / Supabase JWT / Multi-Tenant RLS  

---

## 1. ARCHITECTURAL OVERVIEW

QuestForge AI incorporates end-to-end user authentication via **Supabase Auth**, layered with backend Row-Level Security (RLS) enforcement.

### Key Capabilities
1. **User Registration (`/register`):** Creates an account in Supabase `auth.users` and automatically initializes a linked `public.user_profiles` record via an automated database trigger.
2. **User Login (`/login`):** Validates credentials, issues JWT access tokens, and securely manages session refreshment in browser local storage.
3. **Password Recovery (`/forgot-password` & `/reset-password`):** Dispatches secure time-limited recovery links to user email.
4. **Student Profile & Data Control (`/profile`):** Enables students to view account details, review storage architecture, export their audit history in machine-readable JSON format, and purge local sessions.
5. **Protected Route Enclave (`<ProtectedRoute>`):** Ensures that private resources (such as `/profile`) cannot be accessed without an active session when cloud auth is enabled.

---

## 2. CLIENT-SIDE ARCHITECTURE

### 2.1 The `AuthContext` API
Located in `client/src/context/AuthContext.jsx`, the context provides:

```javascript
import { useAuth } from '../context/AuthContext'

function MyComponent() {
  const { 
    user,         // Supabase User object or null
    session,      // Active JWT session or null
    loading,      // Boolean: true during session hydration
    isConfigured, // Boolean: true if VITE_SUPABASE_URL is set
    signIn,       // async ({ email, password })
    signUp,       // async ({ email, password, fullName })
    signOut,      // async ()
    resetPassword // async (email)
  } = useAuth()
}
```

### 2.2 Demonstration Mode Fallback
When `isConfigured` is `false`:
- The application never crashes or displays blank screens.
- Authentication pages render informative cybernetic status panels explaining that cloud authentication is unconfigured, and inviting the user to explore the platform in guest demonstration mode.
- Protected routes allow guest access with a top notification banner:
  > *"Demonstration Session Mode: Cloud authentication unconfigured. Access granted under guest preview privileges."*

---

## 3. MULTI-TENANT AUTHORIZATION & DATA ISOLATION

### 3.1 Backend Ownership Scoping
When an audit is executed via `POST /api/audit/run`:
1. The client sends user identity tokens (or `x-user-id` header).
2. The audit session is stamped with the authenticated `user_id`.
3. In `auditController.js`, queries for specific audit reports (`GET /api/audit/:id` and `GET /api/reports/:id`) verify that the requesting user owns the record. If an ID from another user is requested, the server returns `404 Not Found` or `403 Forbidden`.

### 3.2 Database-Level RLS Enforcement
Frontend security is never solely trusted:
- If a malicious client bypasses API routing and interacts directly with the Supabase client, PostgreSQL RLS policies enforce `auth.uid() = user_id`.
- Users cannot `SELECT`, `UPDATE`, or `DELETE` rows belonging to another student account.

---

## 4. SETUP CHECKLIST FOR DEPLOYMENT

1. Enable **Email Auth** in Supabase Dashboard (**Authentication > Providers > Email**).
2. Configure **Site URL** and **Redirect URLs** in Supabase (**Authentication > URL Configuration**):
   - Site URL: `https://your-production-domain.com`
   - Redirect URL: `https://your-production-domain.com/reset-password`
3. Add environment variables to `client/.env`:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_public_key
   ```
4. Restart the development or production server to apply.
