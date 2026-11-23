import { config } from '../server/node_modules/dotenv/lib/main.js'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.join(__dirname, '../server/.env') })

// Import providers and manager
const { geminiProvider } = await import('../server/src/services/providers/geminiProvider.js')
const { groqProvider } = await import('../server/src/services/providers/groqProvider.js')
const { nvidiaProvider } = await import('../server/src/services/providers/nvidiaProvider.js')
const { AIProviderManager } = await import('../server/src/services/aiProviderManager.js')

const BASE_URL = 'http://localhost:5000'

async function run() {
  const report = {
    timestamp: new Date().toISOString(),
    providers: {},
    failover: {},
    endpoints: [],
    workflow: {},
    defects: []
  }

  console.log('========================================================================')
  console.log(' QUESTFORGE AI — COMPREHENSIVE LIVE API INTEGRATION & HEALTH VERIFICATION')
  console.log('========================================================================\n')

  // ---------------------------------------------------------------------------
  // 1. INDEPENDENT AI PROVIDER VERIFICATION
  // ---------------------------------------------------------------------------
  console.log('>>> SECTION 1: INDEPENDENT AI PROVIDERS LIVE TESTING <<<\n')

  // 1.1 Google Gemini
  console.log('Testing Google Gemini (Model: gemini-3.8-flash)...')
  const geminiStart = Date.now()
  const geminiAuth = await geminiProvider.checkAuthentication(8000)
  const geminiAuthLatency = Date.now() - geminiStart

  let geminiGenResult = null
  if (geminiAuth.authenticated) {
    geminiGenResult = await geminiProvider.generateStructuredResponse({
      systemPrompt: 'Respond strictly with valid JSON: {"ping": "pong"}',
      userContent: 'ping',
      timeout: 10000
    })
  }

  report.providers.gemini = {
    name: 'Google Gemini',
    model: geminiProvider.config.model,
    isConfigured: geminiProvider.isConfigured(),
    authResult: geminiAuth,
    authLatencyMs: geminiAuthLatency,
    generationResult: geminiGenResult,
    generationLatencyMs: geminiGenResult?.durationMs || null,
    classification: geminiGenResult?.errorCode === 'PROJECT_BILLING_REQUIRED'
      ? 'AUTHENTICATED BUT BILLING BLOCKED'
      : (geminiAuth.authenticated ? 'LIVE AND OPERATIONAL' : 'AUTH_FAILED')
  }

  console.log(`- Key Auth: ${geminiAuth.authenticated ? 'SUCCESS (HTTP 200)' : 'FAILED'} (${geminiAuthLatency}ms)`)
  console.log(`- Generation: ${geminiGenResult?.success ? 'SUCCESS' : 'FAILED'} (Status: ${geminiGenResult?.errorCode || 'N/A'})`)
  console.log(`- Error classification: ${geminiGenResult?.error || 'None'}`)
  console.log(`- Final Provider Classification: ${report.providers.gemini.classification}\n`)

  // 1.2 Groq Cloud
  console.log('Testing Groq Cloud (Model: openai/gpt-oss-120b)...')
  const groqStart = Date.now()
  const groqTestPrompt = {
    systemPrompt: 'You are a strict data extraction assistant. Return valid JSON matching: {"status": "ok", "provider": "groq", "numberVal": number, "echo": string}',
    userContent: 'Data: number is 42, echo is live-verification',
    timeout: 15000
  }
  const groqGenResult = await groqProvider.generateStructuredResponse(groqTestPrompt)
  const groqLatency = Date.now() - groqStart

  const groqSchemaValid = Boolean(
    groqGenResult.success &&
    groqGenResult.content &&
    groqGenResult.content.status === 'ok' &&
    typeof groqGenResult.content.numberVal === 'number'
  )

  report.providers.groq = {
    name: 'Groq Cloud',
    model: groqProvider.config.model,
    isConfigured: groqProvider.isConfigured(),
    generationResult: groqGenResult,
    generationLatencyMs: groqLatency,
    schemaValidation: groqSchemaValid ? 'PASS' : 'FAIL',
    classification: groqGenResult.success ? 'LIVE AND OPERATIONAL' : 'FAILED'
  }

  console.log(`- Generation: ${groqGenResult.success ? 'SUCCESS' : 'FAILED'} (${groqLatency}ms)`)
  console.log(`- Content: ${JSON.stringify(groqGenResult.content)}`)
  console.log(`- Schema Validation: ${report.providers.groq.schemaValidation}`)
  console.log(`- Final Provider Classification: ${report.providers.groq.classification}\n`)

  // 1.3 NVIDIA NIM
  console.log('Testing NVIDIA NIM (Model: nvidia/nemotron-3-ultra-550b-a55b)...')
  const nvidiaStart = Date.now()
  const nvidiaTestPrompt = {
    systemPrompt: 'You are a strict document extraction assistant. Return valid JSON strictly matching: {"fullName": string, "annualIncome": string, "percentageMarks": string, "summary": string}',
    userContent: 'Candidate: Aditi Rao, Annual Income: 2,50,000 INR, Marks: 89.2%',
    timeout: 30000
  }
  const nvidiaGenResult = await nvidiaProvider.generateStructuredResponse(nvidiaTestPrompt)
  const nvidiaLatency = Date.now() - nvidiaStart

  // Coercion test
  let nvidiaCoercedIncome = null
  let nvidiaCoercedMarks = null
  if (nvidiaGenResult.success && nvidiaGenResult.content) {
    const rawIncome = String(nvidiaGenResult.content.annualIncome || '')
    const matchInc = rawIncome.replace(/,/g, '').match(/[0-9]+(?:\.[0-9]+)?/)
    if (matchInc) nvidiaCoercedIncome = parseFloat(matchInc[0])

    const rawMarks = String(nvidiaGenResult.content.percentageMarks || '')
    const matchMks = rawMarks.match(/[0-9]+(?:\.[0-9]+)?/)
    if (matchMks) nvidiaCoercedMarks = parseFloat(matchMks[0])
  }

  const nvidiaCoercionValid = (nvidiaCoercedIncome === 250000 && nvidiaCoercedMarks === 89.2)

  report.providers.nvidia = {
    name: 'NVIDIA NIM',
    model: nvidiaProvider.config.model,
    isConfigured: nvidiaProvider.isConfigured(),
    generationResult: nvidiaGenResult,
    generationLatencyMs: nvidiaLatency,
    coercionTest: {
      rawIncome: nvidiaGenResult?.content?.annualIncome,
      coercedIncome: nvidiaCoercedIncome,
      rawMarks: nvidiaGenResult?.content?.percentageMarks,
      coercedMarks: nvidiaCoercedMarks,
      coercionValid: nvidiaCoercionValid
    },
    classification: nvidiaGenResult.success ? 'LIVE AND OPERATIONAL' : 'FAILED'
  }

  console.log(`- Generation: ${nvidiaGenResult.success ? 'SUCCESS' : 'FAILED'} (${nvidiaLatency}ms)`)
  console.log(`- Content: ${JSON.stringify(nvidiaGenResult.content)}`)
  console.log(`- Numeric Coercion: income -> ${nvidiaCoercedIncome}, marks -> ${nvidiaCoercedMarks} (${nvidiaCoercionValid ? 'VALID' : 'INVALID'})`)
  console.log(`- Final Provider Classification: ${report.providers.nvidia.classification}\n`)

  // ---------------------------------------------------------------------------
  // 2. AUTOMATIC PROVIDER FAILOVER VERIFICATION
  // ---------------------------------------------------------------------------
  console.log('>>> SECTION 2: LIVE & CONTROLLED AUTOMATIC FAILOVER VERIFICATION <<<\n')

  // Failover Test 1: Real Live Failover (Gemini billing blocked -> Groq succeeds live)
  console.log('Test 2.1: Live Failover from Gemini (billing blocked) to Groq...')
  const liveManager = new AIProviderManager({
    gemini: geminiProvider,
    groq: groqProvider,
    nvidia: nvidiaProvider
  })

  const failoverDoc = 'GOVERNMENT OF KARNATAKA\nINCOME CERTIFICATE\nApplicant: RAJESH KUMAR\nDOB: 12/04/2004\nIncome: Rs. 1,60,000\nMarks: 87.5%\nCollege: Bangalore University\nID: RD-88991'
  const failoverRes1 = await liveManager.extractDocumentEntities(failoverDoc, 'Income Certificate')

  console.log(`- Result Source: ${failoverRes1.source}`)
  console.log(`- Provider Info: ${failoverRes1.providerInfo?.provider} (${failoverRes1.providerInfo?.model})`)
  console.log(`- Extracted: Name=${failoverRes1.fields.fullName}, Income=${failoverRes1.fields.annualIncome}, Marks=${failoverRes1.fields.percentageMarks}`)

  report.failover.geminiToGroqLive = {
    testType: 'LIVE RUNTIME FAILOVER',
    source: failoverRes1.source,
    provider: failoverRes1.providerInfo?.provider,
    success: failoverRes1.aiAvailable && failoverRes1.source === 'AI_GROQ',
    extractedFields: failoverRes1.fields
  }

  // Failover Test 2: Groq Cooldown / Failure -> NVIDIA NIM Live
  console.log('\nTest 2.2: Live Failover to NVIDIA NIM when Gemini is billing blocked and Groq is in cooldown...')
  const simulatedGroqOutage = {
    name: 'Groq Cloud (Simulated 429)',
    id: 'groq',
    config: groqProvider.config,
    isConfigured: () => true,
    generateStructuredResponse: async () => ({
      success: false,
      provider: 'groq',
      errorCode: 'RATE_LIMITED',
      error: 'Simulated 429 quota exhaustion for failover testing',
      retryable: false,
      durationMs: 25
    })
  }

  const managerForNvidiaFailover = new AIProviderManager({
    gemini: geminiProvider,
    groq: simulatedGroqOutage,
    nvidia: nvidiaProvider
  })

  const failoverRes2 = await managerForNvidiaFailover.extractDocumentEntities(failoverDoc, 'Income Certificate')
  console.log(`- Result Source: ${failoverRes2.source}`)
  console.log(`- Provider Info: ${failoverRes2.providerInfo?.provider} (${failoverRes2.providerInfo?.model})`)
  console.log(`- Extracted: Name=${failoverRes2.fields.fullName}, Income=${failoverRes2.fields.annualIncome}, Marks=${failoverRes2.fields.percentageMarks}`)

  report.failover.groqToNvidiaLive = {
    testType: 'CONTROLLED INJECTION -> LIVE NVIDIA INFERENCE',
    source: failoverRes2.source,
    provider: failoverRes2.providerInfo?.provider,
    success: failoverRes2.aiAvailable && failoverRes2.source === 'AI_NVIDIA',
    extractedFields: failoverRes2.fields
  }

  // Failover Test 3: All AI Providers Unavailable -> Graceful Deterministic Fallback
  console.log('\nTest 2.3: Deterministic Fallback when all AI providers are exhausted...')
  const managerAllFailing = new AIProviderManager({
    gemini: { isConfigured: () => true, generateStructuredResponse: async () => ({ success: false, errorCode: 'PROJECT_BILLING_REQUIRED', error: 'Billing required' }) },
    groq: { isConfigured: () => true, generateStructuredResponse: async () => ({ success: false, errorCode: 'RATE_LIMITED', error: 'Rate limit' }) },
    nvidia: { isConfigured: () => true, generateStructuredResponse: async () => ({ success: false, errorCode: 'TIMEOUT', error: 'Timeout' }) }
  })

  const deterministicRes = await managerAllFailing.extractDocumentEntities(failoverDoc, 'Income Certificate')
  console.log(`- Result Source: ${deterministicRes.source}`)
  console.log(`- Mode: ${deterministicRes.mode}`)
  console.log(`- Deterministic Name: ${deterministicRes.fields.fullName}, Income: ${deterministicRes.fields.annualIncome}`)

  report.failover.deterministicFallback = {
    testType: 'CONTROLLED OUTAGE -> DETERMINISTIC FALLBACK',
    source: deterministicRes.source,
    success: !deterministicRes.aiAvailable && deterministicRes.source === 'DETERMINISTIC_RULES',
    extractedFields: deterministicRes.fields
  }

  // ---------------------------------------------------------------------------
  // 3. BACKEND API ENDPOINTS COMPREHENSIVE INVENTORY & PROBING
  // ---------------------------------------------------------------------------
  console.log('\n>>> SECTION 3: BACKEND API ENDPOINTS SYSTEMATIC TESTING <<<\n')

  async function testEndpoint({ method, path: urlPath, body, headers = {}, expectedStatus, description, isInvalidCase = false }) {
    const start = Date.now()
    const opts = {
      method,
      headers: { ...headers }
    }
    if (body) {
      if (body instanceof FormData) {
        opts.body = body
      } else if (typeof body === 'object') {
        opts.headers['Content-Type'] = 'application/json'
        opts.body = JSON.stringify(body)
      } else {
        opts.body = body
      }
    }

    try {
      const res = await fetch(`${BASE_URL}${urlPath}`, opts)
      const durationMs = Date.now() - start
      let json = null
      let text = null
      const contentType = res.headers.get('content-type') || ''

      if (contentType.includes('application/json')) {
        json = await res.json()
      } else {
        text = await res.text()
      }

      const pass = res.status === expectedStatus
      const record = {
        method,
        path: urlPath,
        description,
        isInvalidCase,
        expectedStatus,
        actualStatus: res.status,
        durationMs,
        pass,
        responsePreview: json ? JSON.stringify(json).slice(0, 150) + '...' : text?.slice(0, 150)
      }

      report.endpoints.push(record)
      console.log(`[${pass ? 'PASS' : 'FAIL'}] ${method} ${urlPath} -> HTTP ${res.status} (Expected ${expectedStatus}) [${durationMs}ms] // ${description}`)
      return { res, json, text, durationMs }
    } catch (err) {
      const durationMs = Date.now() - start
      report.endpoints.push({
        method,
        path: urlPath,
        description,
        isInvalidCase,
        expectedStatus,
        actualStatus: 'NETWORK_ERROR',
        durationMs,
        pass: false,
        error: err.message
      })
      console.log(`[FAIL] ${method} ${urlPath} -> NETWORK ERROR: ${err.message}`)
      return { error: err }
    }
  }

  // Group 1: Health & System Status
  await testEndpoint({
    method: 'GET',
    path: '/api/health',
    expectedStatus: 200,
    description: 'System health check & operational mode'
  })

  await testEndpoint({
    method: 'GET',
    path: '/api/ai/status',
    expectedStatus: 200,
    description: 'Multi-provider AI status & zero-secret health reporting'
  })

  await testEndpoint({
    method: 'GET',
    path: '/api/persistence/status',
    expectedStatus: 200,
    description: 'Storage & Supabase persistence mode disclosure'
  })

  // Group 2: AI Testing Probes
  await testEndpoint({
    method: 'POST',
    path: '/api/ai/test',
    expectedStatus: 200,
    description: 'Execute synthetic verification probe for all configured AI providers'
  })

  await testEndpoint({
    method: 'POST',
    path: '/api/ai/test/gemini',
    expectedStatus: 200,
    description: 'Execute synthetic verification probe for Google Gemini'
  })

  await testEndpoint({
    method: 'POST',
    path: '/api/ai/test/groq',
    expectedStatus: 200,
    description: 'Execute synthetic verification probe for Groq Cloud'
  })

  await testEndpoint({
    method: 'POST',
    path: '/api/ai/test/nvidia',
    expectedStatus: 200,
    description: 'Execute synthetic verification probe for NVIDIA NIM'
  })

  await testEndpoint({
    method: 'POST',
    path: '/api/ai/test/nonexistent-ai',
    expectedStatus: 200, // returns success: false in payload with 200 or 404
    description: 'Attempt verification probe for unknown provider identifier',
    isInvalidCase: true
  })

  // Group 3: Scholarships
  await testEndpoint({
    method: 'GET',
    path: '/api/scholarships',
    expectedStatus: 200,
    description: 'Retrieve scholarship schemes catalog'
  })

  await testEndpoint({
    method: 'GET',
    path: '/api/scholarships/merit-tech-2026',
    expectedStatus: 200,
    description: 'Retrieve specific scholarship scheme criteria by ID'
  })

  await testEndpoint({
    method: 'GET',
    path: '/api/scholarships/non-existent-scholarship-id',
    expectedStatus: 404,
    description: 'Attempt retrieve non-existent scholarship scheme',
    isInvalidCase: true
  })

  // Group 4: Document Uploads & File Validation
  // We need to create a synthetic valid PDF in memory
  const validPdfHeader = '%PDF-1.4\n%âãÏÓ\n1 0 obj\n<< /Title (Synthetic Test Document) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n'
  const pdfBlob = new Blob([validPdfHeader], { type: 'application/pdf' })

  const validForm = new FormData()
  validForm.append('documents', pdfBlob, 'synthetic-id-card.pdf')
  validForm.append('categories', 'doc-identity')

  const uploadRes = await testEndpoint({
    method: 'POST',
    path: '/api/documents/upload',
    body: validForm,
    expectedStatus: 200,
    description: 'Upload valid synthetic PDF with category classification'
  })

  const uploadedDocId = uploadRes?.json?.data?.[0]?.id

  // Invalid File Upload: Disguised .exe
  const fakeExeForm = new FormData()
  fakeExeForm.append('documents', new Blob(['MZ\x90\x00\x03\x00\x00\x00'], { type: 'application/x-dosexec' }), 'virus.exe')
  await testEndpoint({
    method: 'POST',
    path: '/api/documents/upload',
    body: fakeExeForm,
    expectedStatus: 400,
    description: 'Upload rejection for unsupported/dangerous executable MIME',
    isInvalidCase: true
  })

  // Empty payload
  await testEndpoint({
    method: 'POST',
    path: '/api/documents/upload',
    body: new FormData(),
    expectedStatus: 400,
    description: 'Upload rejection for empty document multipart payload',
    isInvalidCase: true
  })

  // Document inspection & category update
  if (uploadedDocId) {
    await testEndpoint({
      method: 'GET',
      path: `/api/documents/${uploadedDocId}`,
      expectedStatus: 200,
      description: 'Retrieve uploaded document metadata by document ID'
    })

    await testEndpoint({
      method: 'PATCH',
      path: `/api/documents/${uploadedDocId}/category`,
      body: { categoryId: 'doc-income', categoryName: 'Income Certificate' },
      expectedStatus: 200,
      description: 'Update uploaded document category classification'
    })
  }

  await testEndpoint({
    method: 'GET',
    path: '/api/documents/non-existent-doc-id',
    expectedStatus: 404,
    description: 'Attempt fetch non-existent document metadata',
    isInvalidCase: true
  })

  // Group 5: Auditing, Dashboard, and Reports
  let executedAuditId = null
  const auditRes = await testEndpoint({
    method: 'POST',
    path: '/api/audit/run',
    body: {
      scholarshipId: 'merit-tech-2026',
      documentIds: uploadedDocId ? [uploadedDocId] : [],
      manualDocuments: [
        {
          id: 'doc-marks',
          categoryName: 'Marks Card',
          extractedFields: { fullName: 'Rajesh Kumar', percentageMarks: 88.0 }
        }
      ]
    },
    expectedStatus: 200,
    description: 'Execute deterministic scholarship readiness audit'
  })

  executedAuditId = auditRes?.json?.data?.id

  // Invalid audit: missing scholarshipId
  await testEndpoint({
    method: 'POST',
    path: '/api/audit/run',
    body: {},
    expectedStatus: 400,
    description: 'Audit rejection for missing scholarshipId payload',
    isInvalidCase: true
  })

  if (executedAuditId) {
    await testEndpoint({
      method: 'GET',
      path: `/api/audit/${executedAuditId}`,
      expectedStatus: 200,
      description: 'Retrieve executed audit record by audit session ID'
    })

    await testEndpoint({
      method: 'GET',
      path: `/api/reports/${executedAuditId}`,
      expectedStatus: 200,
      description: 'Retrieve print-ready audit report structure by audit ID'
    })
  }

  await testEndpoint({
    method: 'GET',
    path: '/api/audit/non-existent-audit-id',
    expectedStatus: 404,
    description: 'Attempt retrieve non-existent audit record',
    isInvalidCase: true
  })

  await testEndpoint({
    method: 'GET',
    path: '/api/reports/non-existent-report-id',
    expectedStatus: 404,
    description: 'Attempt retrieve report for non-existent audit ID',
    isInvalidCase: true
  })

  await testEndpoint({
    method: 'GET',
    path: '/api/dashboard',
    expectedStatus: 200,
    description: 'Retrieve student dashboard metrics and recent applications'
  })

  // Group 6: Contact & Wildcard Routes
  await testEndpoint({
    method: 'POST',
    path: '/api/contact',
    body: {
      name: 'Synthetic API Verifier',
      email: 'api-verifier@academic.local',
      topic: 'Live API Audit Check',
      message: 'Automated live testing verifying backend route integrity.'
    },
    expectedStatus: 200,
    description: 'Submit academic contact feedback and verify ledger confirmation'
  })

  await testEndpoint({
    method: 'POST',
    path: '/api/contact',
    body: { name: '', email: 'invalid-email', message: '' },
    expectedStatus: 400,
    description: 'Contact form validation rejection on empty/invalid inputs',
    isInvalidCase: true
  })

  await testEndpoint({
    method: 'GET',
    path: '/api/unknown-route-test',
    expectedStatus: 404,
    description: 'Wildcard 404 error handler response structure',
    isInvalidCase: true
  })

  // ---------------------------------------------------------------------------
  // 4. SUMMARY METRICS
  // ---------------------------------------------------------------------------
  const totalEndpoints = report.endpoints.length
  const passedEndpoints = report.endpoints.filter(e => e.pass).length
  const failedEndpoints = totalEndpoints - passedEndpoints

  console.log('\n========================================================================')
  console.log(` TOTAL ENDPOINTS TESTED: ${totalEndpoints} | PASSED: ${passedEndpoints} | FAILED: ${failedEndpoints}`)
  console.log('========================================================================\n')

  return report
}

run().then(res => {
  fs.writeFileSync(path.join(__dirname, 'last_api_verification_data.json'), JSON.stringify(res, null, 2))
  console.log('Saved raw diagnostic data to scripts/last_api_verification_data.json')
}).catch(console.error)
