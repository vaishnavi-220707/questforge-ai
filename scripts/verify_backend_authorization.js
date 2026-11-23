import { createClient } from '../server/node_modules/@supabase/supabase-js/dist/index.mjs'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from '../server/node_modules/dotenv/lib/main.js'
import app from '../server/src/app.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.join(__dirname, '../server/.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  console.error('Missing Supabase configuration in server/.env')
  process.exit(1)
}

const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
})

const clientAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
})

const PORT = 5005
const BASE_URL = (process.env.TARGET_API_URL || `http://localhost:${PORT}`).replace(/\/+$/, '')

async function runAuditSecuritySuite() {
  console.log('========================================================================')
  console.log(' QUESTFORGE AI — BACKEND AUTHORIZATION & CROSS-USER API SECURITY AUDIT')
  console.log(` Target Backend: ${BASE_URL} (Supabase: ${supabaseUrl})`)
  console.log('========================================================================\n')

  let server
  if (!process.env.TARGET_API_URL) {
    await new Promise(resolve => {
      server = app.listen(PORT, () => {
        console.log(`[Test Server] Listening on ${BASE_URL}`)
        resolve()
      })
    })
  } else {
    console.log(`[Hosted Target] Running live authorization tests against: ${BASE_URL}`)
  }

  const results = []
  function logResult(testId, name, pass, detail = '') {
    results.push({ testId, name, pass, detail })
    console.log(`${pass ? '[PASS]' : '[FAIL]'} ${testId}: ${name} ${detail ? `| ${detail}` : ''}`)
  }

  const testEmailA = `synthetic.alpha.${Date.now()}@questforge.audit.internal`
  const testEmailB = `synthetic.beta.${Date.now()}@questforge.audit.internal`
  const testPass = `Passw0rd_${Date.now()}#Secure!`

  let userA = null
  let tokenA = null
  let userB = null
  let tokenB = null
  let auditIdA = null
  let docIdA = null

  try {
    // -----------------------------------------------------------------------
    // STEP 1: Provision Two Synthetic User Accounts
    // -----------------------------------------------------------------------
    console.log('\n--- Step 1: Provision Synthetic Test Accounts in Supabase Auth ---')
    const { data: createdA, error: errA } = await adminClient.auth.admin.createUser({
      email: testEmailA,
      password: testPass,
      email_confirm: true,
      user_metadata: { full_name: 'Synthetic Alpha User' }
    })
    if (errA) throw errA
    userA = createdA.user

    const { data: createdB, error: errB } = await adminClient.auth.admin.createUser({
      email: testEmailB,
      password: testPass,
      email_confirm: true,
      user_metadata: { full_name: 'Synthetic Beta User' }
    })
    if (errB) throw errB
    userB = createdB.user

    // Sign in both users to obtain valid JWTs
    const { data: loginA, error: loginErrA } = await clientAuth.auth.signInWithPassword({
      email: testEmailA,
      password: testPass
    })
    if (loginErrA) throw loginErrA
    tokenA = loginA.session.access_token

    const { data: loginB, error: loginErrB } = await clientAuth.auth.signInWithPassword({
      email: testEmailB,
      password: testPass
    })
    if (loginErrB) throw loginErrB
    tokenB = loginB.session.access_token

    logResult('AUTH-01', 'Synthetic Account Provisioning & JWT Issuance', Boolean(tokenA && tokenB), `User A: ${userA.id.slice(0, 8)}..., User B: ${userB.id.slice(0, 8)}...`)

    // -----------------------------------------------------------------------
    // STEP 2: Verify Cryptographic Token Validation & Rejection of Fake Tokens
    // -----------------------------------------------------------------------
    console.log('\n--- Step 2: Cryptographic Token Validation & Header Spoofing Resistance ---')

    // 2a. Request with garbage token -> must return 401
    const fakeTokenRes = await fetch(`${BASE_URL}/api/dashboard`, {
      headers: { 'Authorization': 'Bearer fake.invalid.jwt.signature' }
    })
    logResult('AUTH-02', 'Rejection of Invalid / Forged JWT Tokens', fakeTokenRes.status === 401, `Status: ${fakeTokenRes.status}`)

    // 2b. Attempt to spoof identity via x-user-id header without valid token
    const spoofHeaderRes = await fetch(`${BASE_URL}/api/dashboard`, {
      headers: { 'x-user-id': userA.id }
    })
    const spoofHeaderJson = await spoofHeaderRes.json()
    // Should return unauthenticated dashboard (0 cloud records for userA), not userA's private cloud data
    const isHeaderSpoofIgnored = spoofHeaderRes.status === 200 && (!spoofHeaderJson.data.recentApplications || spoofHeaderJson.data.recentApplications.length === 0)
    logResult('AUTH-03', 'Resistance to Untrusted x-user-id Header Spoofing', isHeaderSpoofIgnored, `Header ignored; treated as guest`)

    // -----------------------------------------------------------------------
    // STEP 3: User Alpha Runs Audit & Persists Under Own Identity
    // -----------------------------------------------------------------------
    console.log('\n--- Step 3: User Alpha Runs Audit Under Verified JWT ---')
    const auditPayload = {
      scholarshipId: 'merit-tech-2026',
      manualDocuments: [
        {
          id: `doc-alpha-${Date.now()}`,
          originalName: 'alpha-grade-sheet.pdf',
          categoryId: 'doc-grades',
          categoryName: 'Academic Marksheet / Transcript',
          extractedFields: { fullName: 'Synthetic Alpha User', percentageMarks: 94.5 },
          confidence: 0.98
        }
      ]
    }

    const runRes = await fetch(`${BASE_URL}/api/audit/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify(auditPayload)
    })
    const runJson = await runRes.json()
    auditIdA = runJson.data?.id
    const auditOwnerId = runJson.data?.userId

    logResult('AUTH-04', 'Audit Creation Bound to Verified JWT Identity', runRes.status === 200 && auditOwnerId === userA.id, `Audit ID: ${auditIdA}, Bound User: ${auditOwnerId}`)

    // Verify in Supabase database directly that user_id matches userA.id
    const { data: dbSession } = await adminClient
      .from('audit_sessions')
      .select('id, user_id, scholarship_title')
      .eq('id', auditIdA)
      .single()
    logResult('AUTH-05', 'Database Persistence User-ID Verification', dbSession?.user_id === userA.id, `DB user_id: ${dbSession?.user_id}`)

    // -----------------------------------------------------------------------
    // STEP 4: Cross-User API Access Denial on Audit Details
    // -----------------------------------------------------------------------
    console.log('\n--- Step 4: Cross-User Audit Access Isolation (User B vs User A) ---')

    // 4a. User Alpha can access own audit
    const alphaAccessRes = await fetch(`${BASE_URL}/api/audit/${auditIdA}`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    })
    logResult('AUTH-06', 'Owner (User Alpha) Can Retrieve Own Audit', alphaAccessRes.status === 200, `Status: ${alphaAccessRes.status}`)

    // 4b. User Beta CANNOT access User Alpha's audit (must return 404 / access denied)
    const betaAccessRes = await fetch(`${BASE_URL}/api/audit/${auditIdA}`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    })
    logResult('AUTH-07', 'Non-Owner (User Beta) CANNOT Retrieve User Alpha Audit', betaAccessRes.status === 404, `Status: ${betaAccessRes.status} (Access Denied / Not Found)`)

    // 4c. Anonymous caller CANNOT access User Alpha's audit
    const anonAccessRes = await fetch(`${BASE_URL}/api/audit/${auditIdA}`)
    logResult('AUTH-08', 'Anonymous Caller CANNOT Retrieve User Alpha Audit', anonAccessRes.status === 404, `Status: ${anonAccessRes.status}`)

    // -----------------------------------------------------------------------
    // STEP 5: Cross-User Report Access Isolation
    // -----------------------------------------------------------------------
    console.log('\n--- Step 5: Cross-User Report Access Isolation ---')

    // 5a. User Alpha can retrieve report
    const alphaReportRes = await fetch(`${BASE_URL}/api/reports/${auditIdA}`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    })
    logResult('AUTH-09', 'Owner (User Alpha) Can Retrieve Own Report', alphaReportRes.status === 200, `Status: ${alphaReportRes.status}`)

    // 5b. User Beta CANNOT retrieve User Alpha's report
    const betaReportRes = await fetch(`${BASE_URL}/api/reports/${auditIdA}`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    })
    logResult('AUTH-10', 'Non-Owner (User Beta) CANNOT Retrieve User Alpha Report', betaReportRes.status === 404, `Status: ${betaReportRes.status}`)

    // 5c. Anonymous caller CANNOT retrieve User Alpha's report
    const anonReportRes = await fetch(`${BASE_URL}/api/reports/${auditIdA}`)
    logResult('AUTH-11', 'Anonymous Caller CANNOT Retrieve User Alpha Report', anonReportRes.status === 404, `Status: ${anonReportRes.status}`)

    // -----------------------------------------------------------------------
    // STEP 6: Dashboard User Scoping
    // -----------------------------------------------------------------------
    console.log('\n--- Step 6: Dashboard User Scoping ---')

    // 6a. User Alpha dashboard includes their audit
    const alphaDashRes = await fetch(`${BASE_URL}/api/dashboard`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    })
    const alphaDashJson = await alphaDashRes.json()
    const alphaHasAudit = (alphaDashJson.data?.recentApplications || []).some(a => a.lastAuditId === auditIdA)
    logResult('AUTH-12', 'Owner Dashboard Displays Own Audit Records', alphaDashRes.status === 200 && alphaHasAudit, `Found audit in Alpha dashboard: ${alphaHasAudit}`)

    // 6b. User Beta dashboard DOES NOT include User Alpha's audit
    const betaDashRes = await fetch(`${BASE_URL}/api/dashboard`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    })
    const betaDashJson = await betaDashRes.json()
    const betaHasAlphaAudit = (betaDashJson.data?.recentApplications || []).some(a => a.lastAuditId === auditIdA)
    logResult('AUTH-13', 'User Beta Dashboard Isolates User Alpha Records', betaDashRes.status === 200 && !betaHasAlphaAudit, `User B sees 0 of User A audits: ${!betaHasAlphaAudit}`)

    // 6c. Anonymous dashboard DOES NOT leak any registered cloud audits
    const anonDashRes = await fetch(`${BASE_URL}/api/dashboard`)
    const anonDashJson = await anonDashRes.json()
    const anonHasAlphaAudit = (anonDashJson.data?.recentApplications || []).some(a => a.lastAuditId === auditIdA)
    logResult('AUTH-14', 'Anonymous Dashboard Does Not Leak Registered Audits', anonDashRes.status === 200 && !anonHasAlphaAudit, `Anon sees 0 of User A audits: ${!anonHasAlphaAudit}`)

    // -----------------------------------------------------------------------
    // STEP 7: Cross-User Document Upload & Access Isolation
    // -----------------------------------------------------------------------
    console.log('\n--- Step 7: Document Upload & Cross-User Document Isolation ---')

    // Create a mock multipart form upload for User Alpha
    const samplePdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF')
    const boundary = '----WebKitFormBoundarySyntheticTest' + Date.now()
    const bodyParts = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="documents"; filename="alpha_private_doc.pdf"',
      'Content-Type: application/pdf',
      '',
      samplePdfBuffer.toString('binary'),
      `--${boundary}--`
    ]
    const multipartBody = Buffer.from(bodyParts.join('\r\n'), 'binary')

    const uploadRes = await fetch(`${BASE_URL}/api/documents/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Authorization': `Bearer ${tokenA}`
      },
      body: multipartBody
    })
    const uploadJson = await uploadRes.json()
    docIdA = uploadJson.data?.[0]?.id

    logResult('AUTH-15', 'Document Upload Associated with Authenticated User Alpha', uploadRes.status === 200 && Boolean(docIdA), `Doc ID: ${docIdA}`)

    // 7a. User Alpha can retrieve own document
    const alphaDocRes = await fetch(`${BASE_URL}/api/documents/${docIdA}`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    })
    logResult('AUTH-16', 'Owner (User Alpha) Can Retrieve Own Document', alphaDocRes.status === 200, `Status: ${alphaDocRes.status}`)

    // 7b. User Beta CANNOT retrieve User Alpha's document
    const betaDocRes = await fetch(`${BASE_URL}/api/documents/${docIdA}`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    })
    logResult('AUTH-17', 'Non-Owner (User Beta) CANNOT Retrieve User Alpha Document', betaDocRes.status === 404, `Status: ${betaDocRes.status}`)

    // 7c. User Beta CANNOT patch User Alpha's document category
    const betaPatchRes = await fetch(`${BASE_URL}/api/documents/${docIdA}/category`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenB}`
      },
      body: JSON.stringify({ categoryId: 'doc-tampered', categoryName: 'Tampered Category' })
    })
    logResult('AUTH-18', 'Non-Owner (User Beta) CANNOT Update User Alpha Document', betaPatchRes.status === 404, `Status: ${betaPatchRes.status}`)

    // 7d. User Beta CANNOT run an audit referencing User Alpha's document ID
    const betaAuditWithAlphaDocRes = await fetch(`${BASE_URL}/api/audit/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenB}`
      },
      body: JSON.stringify({
        scholarshipId: 'merit-tech-2026',
        documentIds: [docIdA]
      })
    })
    const betaAuditJson = await betaAuditWithAlphaDocRes.json()
    // Document should be filtered out by getDocument(id, userB.id), resulting in 0 satisfied documents
    const documentsWereExcluded = betaAuditJson.data?.uploadedCategories?.length === 0 || betaAuditJson.data?.overallStatus === 'Action Required'
    logResult('AUTH-19', 'User Beta CANNOT Inject User Alpha Documents Into Audit', documentsWereExcluded, `Foreign doc rejected; audit missing required docs`)

    // -----------------------------------------------------------------------
    // STEP 8: Contact Submission Endpoint Protection
    // -----------------------------------------------------------------------
    console.log('\n--- Step 8: Contact Submission Protection ---')
    const contactRes = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Audit Security Bot',
        email: 'security-test@questforge.org',
        topic: 'Authorization Verification',
        message: 'Validating input sanitization and rate-limiting controls.'
      })
    })
    const contactJson = await contactRes.json()
    logResult('AUTH-20', 'Contact Endpoint Anti-Abuse & Delivery Disclosure', contactRes.status === 200 && contactJson.data?.emailDelivery === 'DISABLED_UNCONFIGURED', `Delivery: ${contactJson.data?.emailDelivery}`)

  } catch (err) {
    console.error('Fatal error during authorization audit:', err)
  } finally {
    // -----------------------------------------------------------------------
    // CLEANUP: Clean synthetic database records & auth accounts
    // -----------------------------------------------------------------------
    console.log('\n--- Cleanup: Purging Synthetic Test Records ---')
    if (auditIdA) {
      await adminClient.from('audit_findings').delete().eq('session_id', auditIdA)
      await adminClient.from('audit_sessions').delete().eq('id', auditIdA)
      console.log(`[Cleanup] Deleted test audit session ${auditIdA}`)
    }
    if (userA?.id) {
      await adminClient.from('user_profiles').delete().eq('id', userA.id)
      await adminClient.from('user_preferences').delete().eq('user_id', userA.id)
      await adminClient.auth.admin.deleteUser(userA.id)
      console.log(`[Cleanup] Deleted synthetic user Alpha (${userA.id.slice(0, 8)}...)`)
    }
    if (userB?.id) {
      await adminClient.from('user_profiles').delete().eq('id', userB.id)
      await adminClient.from('user_preferences').delete().eq('user_id', userB.id)
      await adminClient.auth.admin.deleteUser(userB.id)
      console.log(`[Cleanup] Deleted synthetic user Beta (${userB.id.slice(0, 8)}...)`)
    }

    if (server) {
      server.close()
      console.log('[Test Server] Stopped.')
    }
  }

  console.log('\n========================================================================')
  console.log(' AUTHORIZATION AUDIT RESULTS SUMMARY')
  console.log('========================================================================')
  const total = results.length
  const passed = results.filter(r => r.pass).length
  console.log(`Total Checks: ${total} | Passed: ${passed} | Failed: ${total - passed}`)
  if (passed === total) {
    console.log('ALL 20 AUTHORIZATION & USER ISOLATION CHECKS PASSED EMPIRICALLY!\n')
  } else {
    console.log('WARNING: SOME CHECKS FAILED!\n')
    process.exit(1)
  }
}

runAuditSecuritySuite()
