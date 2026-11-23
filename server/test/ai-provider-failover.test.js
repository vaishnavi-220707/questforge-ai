import test from 'node:test'
import assert from 'node:assert/strict'
import app from '../src/app.js'
import { AIProviderManager } from '../src/services/aiProviderManager.js'
import { getProviderPriorityList } from '../src/config/aiProviders.js'
import { validateFileSignature, sanitizeFilename } from '../src/utils/securityHelpers.js'

let server
let baseUrl = ''

test.before(async () => {
  await new Promise(resolve => {
    server = app.listen(5005, () => {
      baseUrl = 'http://localhost:5005'
      resolve()
    })
  })
})

test.after(async () => {
  await new Promise(resolve => server.close(resolve))
})

// -----------------------------------------------------------------------------
// 1. PROVIDER CONFIGURATION & STATUS ENDPOINT TESTS
// -----------------------------------------------------------------------------

test('AI Provider: Priority list orders primary provider first', () => {
  const priority = getProviderPriorityList()
  assert.equal(priority.length, 3)
  assert.equal(priority[0], 'gemini')
  assert.ok(priority.includes('groq'))
  assert.ok(priority.includes('nvidia'))
})

test('AI Status API: GET /api/ai/status returns sanitized provider information without secrets', async () => {
  const res = await fetch(`${baseUrl}/api/ai/status`)
  assert.equal(res.status, 200)
  const json = await res.json()

  assert.equal(json.status, 'success')
  assert.ok(json.data.primaryProvider)
  assert.ok(json.data.priorityOrder)
  assert.ok(json.data.providers.gemini)
  assert.ok(json.data.providers.groq)
  assert.ok(json.data.providers.nvidia)

  // Verify security: No API keys leaked
  const stringified = JSON.stringify(json)
  assert.ok(!stringified.includes('apiKey'))
  assert.ok(!stringified.includes('secret'))
  assert.ok(!stringified.includes('token'))
})

test('AI Status API: POST /api/ai/test returns probe structure without exposing secrets', async () => {
  const res = await fetch(`${baseUrl}/api/ai/test`, { method: 'POST' })
  assert.equal(res.status, 200)
  const json = await res.json()

  assert.equal(json.status, 'success')
  assert.ok(json.data.testResults)
  assert.ok(json.data.providers)

  const stringified = JSON.stringify(json)
  assert.ok(!stringified.includes('apiKey'))
  assert.ok(!stringified.includes('secret'))
})

// -----------------------------------------------------------------------------
// 2. MOCKED MULTI-PROVIDER FAILOVER SEQUENCE TESTS
// (Controlled testing of failure detection and provider handoff)
// -----------------------------------------------------------------------------

test('Failover Sequence (Scenario J): Gemini Quota Failure (429) -> Groq Success', async () => {
  const mockGemini = {
    name: 'Google Gemini',
    id: 'gemini',
    config: { model: 'gemini-3.8-flash' },
    isConfigured: () => true,
    generateStructuredResponse: async () => ({
      success: false,
      provider: 'gemini',
      model: 'gemini-3.8-flash',
      errorCode: 'RATE_LIMITED',
      error: 'Resource has been exhausted (e.g. check quota).',
      retryable: false,
      durationMs: 45
    })
  }

  const mockGroq = {
    name: 'Groq Cloud',
    id: 'groq',
    config: { model: 'openai/gpt-oss-120b' },
    isConfigured: () => true,
    generateStructuredResponse: async () => ({
      success: true,
      provider: 'groq',
      model: 'openai/gpt-oss-120b',
      content: {
        fullName: 'Rahul Sharma',
        dob: '15/08/2004',
        annualIncome: 180000,
        percentageMarks: 85.5,
        institutionName: 'NIT Surathkal',
        idNumber: '9988 7766 5544',
        summary: 'Official marksheet and identity record.'
      },
      usage: { promptTokens: 120, completionTokens: 40 },
      durationMs: 62
    })
  }

  const mockNvidia = {
    name: 'NVIDIA NeMoTron 3 Ultra',
    id: 'nvidia',
    config: { model: 'nvidia/nemotron-3-ultra-550b-a55b' },
    isConfigured: () => true,
    generateStructuredResponse: async () => ({
      success: false,
      provider: 'nvidia',
      errorCode: 'NOT_REACHED',
      durationMs: 0
    })
  }

  const manager = new AIProviderManager({
    gemini: mockGemini,
    groq: mockGroq,
    nvidia: mockNvidia
  })

  const result = await manager.executeWithFailover({
    systemPrompt: 'Extract document data',
    userContent: 'Name: Rahul Sharma, DOB: 15/08/2004'
  })

  // Should succeed through Groq failover
  assert.equal(result.success, true)
  assert.equal(result.provider, 'groq')
  assert.equal(result.content.fullName, 'Rahul Sharma')

  // Verify attempts trail records Gemini failure followed by Groq success
  assert.equal(result.attempts.length, 2)
  assert.equal(result.attempts[0].provider, 'gemini')
  assert.equal(result.attempts[0].errorCode, 'RATE_LIMITED')
  assert.equal(result.attempts[1].provider, 'groq')
  assert.equal(result.attempts[1].success, true)

  // Verify Gemini was placed in cooldown after 429
  assert.equal(manager.isProviderInCooldown('gemini'), true)
})

test('Failover Sequence (Scenario K): Gemini (401) -> Groq (500) -> NVIDIA Success', async () => {
  const mockGemini = {
    name: 'Google Gemini',
    id: 'gemini',
    config: { model: 'gemini-3.8-flash' },
    isConfigured: () => true,
    generateStructuredResponse: async () => ({
      success: false,
      provider: 'gemini',
      errorCode: 'AUTHENTICATION_ERROR',
      error: 'Invalid API Key',
      retryable: false,
      durationMs: 20
    })
  }

  const mockGroq = {
    name: 'Groq Cloud',
    id: 'groq',
    config: { model: 'openai/gpt-oss-120b' },
    isConfigured: () => true,
    generateStructuredResponse: async () => ({
      success: false,
      provider: 'groq',
      errorCode: 'SERVICE_UNAVAILABLE',
      error: 'Internal 500 error',
      retryable: false,
      durationMs: 35
    })
  }

  const mockNvidia = {
    name: 'NVIDIA NeMoTron 3 Ultra',
    id: 'nvidia',
    config: { model: 'nvidia/nemotron-3-ultra-550b-a55b' },
    isConfigured: () => true,
    generateStructuredResponse: async () => ({
      success: true,
      provider: 'nvidia',
      model: 'nvidia/nemotron-3-ultra-550b-a55b',
      content: {
        fullName: 'Priya Patel',
        dob: '22/11/2003',
        annualIncome: 120000,
        percentageMarks: 91.0,
        institutionName: 'IIT Bombay',
        idNumber: '1122 3344 5566',
        summary: 'Income and academic certificate.'
      },
      durationMs: 88
    })
  }

  const manager = new AIProviderManager({
    gemini: mockGemini,
    groq: mockGroq,
    nvidia: mockNvidia
  })

  const result = await manager.executeWithFailover({
    systemPrompt: 'Extract data',
    userContent: 'Priya Patel, 22/11/2003'
  })

  assert.equal(result.success, true)
  assert.equal(result.provider, 'nvidia')
  assert.equal(result.content.fullName, 'Priya Patel')
  assert.equal(result.attempts.length, 3)
})

test('Failover Sequence (Scenario M): Gemini Billing Required (403 FREE_TIER_NOT_AVAILABLE) -> Instant Failover to Groq', async () => {
  let geminiCalls = 0
  const mockGemini = {
    name: 'Google Gemini',
    id: 'gemini',
    config: { model: 'gemini-3.8-flash' },
    isConfigured: () => true,
    checkAuthentication: async () => ({
      authenticated: true,
      status: 'AUTHENTICATED',
      durationMs: 40
    }),
    generateStructuredResponse: async () => {
      geminiCalls++
      return {
        success: false,
        provider: 'gemini',
        model: 'gemini-3.8-flash',
        errorCode: 'PROJECT_BILLING_REQUIRED',
        error: 'The Gemini API free tier is not available for this project. Set up billing at https://aistudio.google.com/billing',
        retryable: false,
        durationMs: 30
      }
    }
  }

  const mockGroq = {
    name: 'Groq Cloud',
    id: 'groq',
    config: { model: 'openai/gpt-oss-120b' },
    isConfigured: () => true,
    generateStructuredResponse: async () => ({
      success: true,
      provider: 'groq',
      model: 'openai/gpt-oss-120b',
      content: {
        fullName: 'Aarav Mehta',
        dob: '10/05/2004',
        annualIncome: 150000,
        percentageMarks: 94.2,
        institutionName: 'BITS Pilani',
        idNumber: 'AARAV1234',
        summary: 'Merit scholarship application.'
      },
      durationMs: 45
    })
  }

  const manager = new AIProviderManager({
    gemini: mockGemini,
    groq: mockGroq,
    nvidia: { isConfigured: () => false }
  })

  // Test provider status check: should flag BILLING_REQUIRED while acknowledging key authentication
  const testRes = await manager.testProvider('gemini')
  assert.equal(testRes.status, 'BILLING_REQUIRED')
  assert.equal(testRes.keyAuthenticated, true)
  assert.equal(testRes.errorCode, 'PROJECT_BILLING_REQUIRED')

  // Reset counter before failover execution test
  geminiCalls = 0

  // Execute extraction with failover
  const result = await manager.executeWithFailover({
    systemPrompt: 'Extract fields',
    userContent: 'Aarav Mehta, BITS Pilani'
  })

  assert.equal(result.success, true)
  assert.equal(result.provider, 'groq')
  assert.equal(result.content.fullName, 'Aarav Mehta')
  assert.equal(geminiCalls, 1, 'Gemini must not be retried when billing is required')
  assert.equal(result.attempts[0].errorCode, 'PROJECT_BILLING_REQUIRED')
})

test('NVIDIA Schema Coercion: String-formatted units ("250000 INR", "89.2%") cleanly coerce to numbers', async () => {
  const mockNvidia = {
    name: 'NVIDIA NeMoTron 3 Ultra',
    id: 'nvidia',
    config: { model: 'nvidia/nemotron-3-ultra-550b-a55b' },
    isConfigured: () => true,
    generateStructuredResponse: async () => ({
      success: true,
      provider: 'nvidia',
      model: 'nvidia/nemotron-3-ultra-550b-a55b',
      content: {
        fullName: 'Devika Nair',
        dob: '14/02/2004',
        annualIncome: '250000 INR',
        percentageMarks: '89.2%',
        institutionName: 'NIT Calicut',
        idNumber: 'DOC-99881',
        summary: 'Income and academic certificate with string formatted units.'
      },
      durationMs: 120
    })
  }

  const manager = new AIProviderManager({
    gemini: { isConfigured: () => false },
    groq: { isConfigured: () => false },
    nvidia: mockNvidia
  })

  const extracted = await manager.extractDocumentEntities('Devika Nair, Annual Income: 2,50,000 INR, Marks: 89.2%', 'Income Certificate')

  assert.equal(extracted.aiAvailable, true)
  assert.equal(extracted.source, 'AI_NVIDIA')
  assert.equal(extracted.fields.annualIncome, 250000)
  assert.equal(typeof extracted.fields.annualIncome, 'number')
  assert.equal(extracted.fields.percentageMarks, 89.2)
  assert.equal(typeof extracted.fields.percentageMarks, 'number')
})

test('Failover Sequence (Scenario L): All Providers Fail -> Graceful Fallback to Deterministic Rules', async () => {
  const failingProvider = (id, name, errCode) => ({
    name,
    id,
    config: { model: 'test-model' },
    isConfigured: () => true,
    generateStructuredResponse: async () => ({
      success: false,
      provider: id,
      errorCode: errCode,
      error: `Failure on ${name}`,
      retryable: false,
      durationMs: 15
    })
  })

  const manager = new AIProviderManager({
    gemini: failingProvider('gemini', 'Google Gemini', 'RATE_LIMITED'),
    groq: failingProvider('groq', 'Groq Cloud', 'TIMEOUT'),
    nvidia: failingProvider('nvidia', 'NVIDIA NeMoTron 3 Ultra', 'MODEL_UNSUPPORTED')
  })

  // Test full document entity extraction with fallback
  const rawText = 'Name of Applicant: Rahul Sharma\nDate of Birth: 15/08/2004\nTotal Income: Rs. 1,75,000\nPercentage: 88.0%'
  const result = await manager.extractDocumentEntities(rawText, 'Income Certificate')

  // Overall result should gracefully fall back to deterministic pattern extraction
  assert.equal(result.aiAvailable, false)
  assert.equal(result.source, 'DETERMINISTIC_RULES')
  assert.equal(result.mode, 'Deterministic Demonstration Fallback')
  assert.ok(result.notice.includes('All configured AI providers failed'))

  // Verify extracted fields still populated deterministically
  assert.equal(result.fields.fullName, 'Rahul Sharma')
  assert.equal(result.fields.dob, '15/08/2004')
  assert.equal(result.fields.annualIncome, 175000)
  assert.equal(result.fields.percentageMarks, 88.0)
})

// -----------------------------------------------------------------------------
// 3. SECURITY & SIGNATURE VALIDATION TESTS
// -----------------------------------------------------------------------------

test('Security: Filename sanitization strips path traversal and invalid characters', () => {
  assert.equal(sanitizeFilename('../../etc/passwd'), 'passwd')
  assert.equal(sanitizeFilename('..\\..\\windows\\system32\\cmd.exe'), 'cmd.exe')
  assert.equal(sanitizeFilename('my_document<script>.pdf'), 'my_document_script_.pdf')
  assert.equal(sanitizeFilename(''), 'document_upload')
})

test('Security: Binary file signature verification rejects disguised executables and HTML', () => {
  // 1. Disguised HTML
  const htmlBuffer = Buffer.from('<!DOCTYPE html><html><body>malicious script</body></html>')
  assert.equal(validateFileSignature(htmlBuffer, 'application/pdf'), false)

  // 2. Disguised Windows Executable (MZ header)
  const exeBuffer = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00])
  assert.equal(validateFileSignature(exeBuffer, 'application/pdf'), false)
  assert.equal(validateFileSignature(exeBuffer, 'image/png'), false)
  assert.equal(validateFileSignature(exeBuffer, 'image/jpeg'), false)

  // 3. Valid Standard PDF Header (%PDF)
  const validPdfBuffer = Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj\n')
  assert.equal(validateFileSignature(validPdfBuffer, 'application/pdf'), true)

  // 4. Valid PNG Header (89 50 4E 47)
  const validPngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00])
  assert.equal(validateFileSignature(validPngBuffer, 'image/png'), true)

  // 5. Valid JPEG Header (FF D8 FF)
  const validJpgBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46])
  assert.equal(validateFileSignature(validJpgBuffer, 'image/jpeg'), true)
})
