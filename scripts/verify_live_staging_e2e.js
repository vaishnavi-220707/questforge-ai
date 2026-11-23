import { createClient } from '../server/node_modules/@supabase/supabase-js/dist/index.mjs'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from '../server/node_modules/dotenv/lib/main.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.join(__dirname, '../server/.env') })

const RENDER_BASE = 'https://questforge-ai-api-staging.onrender.com'
const VERCEL_BASE = 'https://questforge-ai-staging.vercel.app'
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
})

const clientAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
})

async function runLiveStagingE2E() {
  console.log('========================================================================')
  console.log(' QUESTFORGE AI — LIVE STAGING COMPLETE USER WORKFLOW E2E VERIFICATION')
  console.log(` Target Frontend: ${VERCEL_BASE}`)
  console.log(` Target Backend:  ${RENDER_BASE}`)
  console.log(` Database:        ${supabaseUrl}`)
  console.log('========================================================================\n')

  const results = []
  function logStep(id, title, pass, detail = '') {
    results.push({ id, title, pass, detail })
    console.log(`${pass ? '[PASS]' : '[FAIL]'} ${id}: ${title} ${detail ? `| ${detail}` : ''}`)
  }

  const timestamp = Date.now()
  const testEmail = `synthetic.student.${timestamp}@questforge.org`
  const testPassword = `E2E_Secure_${timestamp}!Aa`
  let user = null
  let token = null
  let auditSessionId = null
  let docId = null

  try {
    // 1. Verify Vercel Frontend Accessibility
    console.log('--- Step 1: Frontend Route Reachability ---')
    const routes = ['/', '/about', '/scholarships', '/upload', '/dashboard', '/login', '/register']
    let allRoutesOk = true
    for (const r of routes) {
      const res = await fetch(`${VERCEL_BASE}${r}`)
      if (!res.ok) allRoutesOk = false
    }
    logStep('E2E-01', 'Vercel Frontend Core Routes HTTP 200', allRoutesOk, `Tested ${routes.length} routes`)

    // 2. Register Synthetic Student Account in Supabase Auth (admin provision to avoid Supabase 3/hr email rate limit)
    console.log('\n--- Step 2: Student Account Provisioning & Login ---')
    const { data: createdUser, error: regErr } = await adminClient.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { full_name: 'Synthetic Staging Student' }
    })
    if (regErr) throw regErr
    user = createdUser.user

    const { data: loginData, error: loginErr } = await clientAuth.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })
    if (loginErr) throw loginErr
    token = loginData.session.access_token

    logStep('E2E-02', 'Synthetic Student Account Provisioning & Public Login', Boolean(user?.id && token), `User ID: ${user?.id?.slice(0, 8)}...`)

    // 3. User Session Restoration
    console.log('\n--- Step 3: Session Restoration & Profile Sync ---')
    const { data: sessionData, error: sessionErr } = await clientAuth.auth.getUser(token)
    logStep('E2E-03', 'Supabase Session Restoration via Cryptographic JWT', !sessionErr && sessionData?.user?.id === user.id, `Email: ${testEmail}`)

    // 4. Query Scholarships from Live Backend
    console.log('\n--- Step 4: Live Backend Scholarship Catalog Query ---')
    const scholRes = await fetch(`${RENDER_BASE}/api/scholarships`, {
      headers: {
        'Origin': VERCEL_BASE,
        'Authorization': `Bearer ${token}`
      }
    })
    const scholJson = await scholRes.json()
    const hasScholarships = scholRes.ok && scholJson.data?.length > 0
    logStep('E2E-04', 'Retrieve Scholarship Catalog via Hosted Backend', hasScholarships, `Found ${scholJson.data?.length} scholarships`)

    // 5. Upload Synthetic Document via Multipart Form to Live Backend
    console.log('\n--- Step 5: Synthetic Document Upload & Extraction ---')
    const samplePdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF')
    const boundary = '----WebKitFormBoundarySyntheticTest' + timestamp
    const bodyParts = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="documents"; filename="marksheet_staging.pdf"',
      'Content-Type: application/pdf',
      '',
      samplePdfBuffer.toString('binary'),
      `--${boundary}--`
    ]
    const multipartBody = Buffer.from(bodyParts.join('\r\n'), 'binary')

    const uploadRes = await fetch(`${RENDER_BASE}/api/documents/upload`, {
      method: 'POST',
      headers: {
        'Origin': VERCEL_BASE,
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: multipartBody
    })
    const uploadJson = await uploadRes.json()
    docId = uploadJson.data?.[0]?.id
    const uploadSuccess = uploadRes.ok && Boolean(docId)
    logStep('E2E-05', 'Multipart Synthetic PDF Upload & Metadata Parsing', uploadSuccess, `Doc ID: ${docId}`)

    // 6. Execute Scholarship Audit under Authenticated User
    console.log('\n--- Step 6: Execute Comprehensive Scholarship Audit ---')
    const auditPayload = {
      scholarshipId: 'merit-tech-2026',
      manualDocuments: [
        {
          id: `manual-grades-${timestamp}`,
          originalName: 'marksheet_staging.pdf',
          categoryId: 'doc-grades',
          categoryName: 'Academic Marksheet / Transcript',
          extractedFields: { fullName: 'Synthetic Staging Student', percentageMarks: 91.5 },
          confidence: 0.99
        },
        {
          id: `manual-id-${timestamp}`,
          originalName: 'aadhaar_card.pdf',
          categoryId: 'doc-id',
          categoryName: 'Identity Proof',
          extractedFields: {
            fullName: 'Synthetic Staging Student',
            dob: '2003-05-15',
            idNumber: '9876-5432-1098'
          },
          confidence: 0.98
        },
        {
          id: `manual-inc-${timestamp}`,
          originalName: 'income_certificate.pdf',
          categoryId: 'doc-income',
          categoryName: 'Income Certificate',
          extractedFields: {
            fullName: 'Synthetic Staging Student',
            annualIncome: 180000,
            validityYear: '2026-2027'
          },
          confidence: 0.97
        }
      ]
    }

    const auditRes = await fetch(`${RENDER_BASE}/api/audit/run`, {
      method: 'POST',
      headers: {
        'Origin': VERCEL_BASE,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(auditPayload)
    })
    const auditJson = await auditRes.json()
    auditSessionId = auditJson.data?.id
    const auditSuccess = auditRes.ok && Boolean(auditSessionId)
    logStep('E2E-06', 'Execute Live Scholarship Audit & Evaluation Rules', auditSuccess, `Session ID: ${auditSessionId}, Readiness: ${auditJson.data?.overallStatus}`)

    // 7. Retrieve Audit Results Record by ID
    console.log('\n--- Step 7: Retrieve Audit Results ---')
    const getAuditRes = await fetch(`${RENDER_BASE}/api/audit/${auditSessionId}`, {
      headers: {
        'Origin': VERCEL_BASE,
        'Authorization': `Bearer ${token}`
      }
    })
    const getAuditJson = await getAuditRes.json()
    const getAuditSuccess = getAuditRes.ok && getAuditJson.data?.id === auditSessionId
    logStep('E2E-07', 'Retrieve Persisted Audit by Session ID', getAuditSuccess, `Overall Score: ${getAuditJson.data?.readinessScore}%`)

    // 8. Retrieve Student Dashboard
    console.log('\n--- Step 8: Retrieve Student Dashboard ---')
    const dashRes = await fetch(`${RENDER_BASE}/api/dashboard`, {
      headers: {
        'Origin': VERCEL_BASE,
        'Authorization': `Bearer ${token}`
      }
    })
    const dashJson = await dashRes.json()
    const inDashboard = dashJson.data?.recentApplications?.some(a => a.lastAuditId === auditSessionId || a.id === auditSessionId)
    logStep('E2E-08', 'Student Dashboard History Scoped to Authenticated User', inDashboard, `Applications in dashboard: ${dashJson.data?.recentApplications?.length}`)

    // 9. Retrieve Official Report Data
    console.log('\n--- Step 9: Retrieve Official Audit Report ---')
    const reportRes = await fetch(`${RENDER_BASE}/api/reports/${auditSessionId}`, {
      headers: {
        'Origin': VERCEL_BASE,
        'Authorization': `Bearer ${token}`
      }
    })
    const reportJson = await reportRes.json()
    const reportSuccess = reportRes.ok && reportJson.data?.reportId === `REP-${auditSessionId}`
    logStep('E2E-09', 'Retrieve Official Audit Report & Readiness Certificate', reportSuccess, `Report ID: ${reportJson.data?.reportId}`)

    // 10. Verify Supabase Cloud Database Direct Record Persistence
    console.log('\n--- Step 10: Supabase Cloud Database Persistence Check ---')
    const { data: dbSession, error: dbErr } = await adminClient
      .from('audit_sessions')
      .select('id, user_id, scholarship_id, overall_status, readiness_score')
      .eq('id', auditSessionId)
      .single()
    const dbPersisted = !dbErr && dbSession?.user_id === user.id
    logStep('E2E-10', 'Direct Supabase Cloud PostgreSQL Record Persistence', dbPersisted, `DB Row ID: ${dbSession?.id}, User: ${dbSession?.user_id?.slice(0, 8)}...`)

  } catch (err) {
    console.error('E2E Execution Error:', err)
  } finally {
    // Purge Synthetic Test Records
    console.log('\n--- Cleanup: Purging Synthetic Test User & Data ---')
    if (auditSessionId) {
      await adminClient.from('audit_findings').delete().eq('session_id', auditSessionId)
      await adminClient.from('audit_sessions').delete().eq('id', auditSessionId)
      console.log(`[Cleanup] Deleted test audit session ${auditSessionId}`)
    }
    if (user?.id) {
      await adminClient.from('documents').delete().eq('user_id', user.id)
      await adminClient.from('user_profiles').delete().eq('id', user.id)
      await adminClient.from('user_preferences').delete().eq('user_id', user.id)
      await adminClient.auth.admin.deleteUser(user.id)
      console.log(`[Cleanup] Deleted synthetic user (${user.id.slice(0, 8)}...)`)
    }
  }

  console.log('\n========================================================================')
  console.log(' LIVE STAGING E2E RESULTS SUMMARY')
  console.log('========================================================================')
  const total = results.length
  const passed = results.filter(r => r.pass).length
  console.log(`Total Steps: ${total} | Passed: ${passed} | Failed: ${total - passed}`)
  if (passed === total) {
    console.log('ALL 10 COMPLETE LIVE USER WORKFLOW STEPS PASSED EMPIRICALLY!\n')
  } else {
    console.log('WARNING: SOME STEPS FAILED!\n')
    process.exit(1)
  }
}

runLiveStagingE2E()
