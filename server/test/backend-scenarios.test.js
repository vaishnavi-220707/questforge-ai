import test from 'node:test'
import assert from 'node:assert/strict'
import app from '../src/app.js'
import { SCHOLARSHIPS } from '../src/data/scholarships.js'
import { runScholarshipAudit } from '../src/services/auditEngine.js'
import { compareNames, normalizeDate } from '../src/utils/stringSimilarity.js'
import { extractStructuredFieldsFromText } from '../src/services/ocrService.js'

let server
let baseUrl = ''

test.before(async () => {
  await new Promise(resolve => {
    server = app.listen(5002, () => {
      baseUrl = 'http://localhost:5002'
      resolve()
    })
  })
})

test.after(async () => {
  await new Promise(resolve => server.close(resolve))
})

test('API: GET /api/health returns 200 with operational mode', async () => {
  const res = await fetch(`${baseUrl}/api/health`)
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.status, 'ok')
  assert.equal(json.service, 'QuestForge AI Backend Engine')
})

test('API: GET /api/scholarships returns demonstration dataset', async () => {
  const res = await fetch(`${baseUrl}/api/scholarships`)
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.status, 'success')
  assert.ok(json.data.length >= 2)
  const demoScholarship = json.data.find(s => s.id === 'merit-tech-2026')
  assert.ok(demoScholarship)
  assert.equal(demoScholarship.isDemonstration, true)
  assert.equal(demoScholarship.mandatoryDocuments.length, 4)
})

test('API: GET /api/scholarships/:id returns specific scholarship or 404', async () => {
  const resValid = await fetch(`${baseUrl}/api/scholarships/merit-tech-2026`)
  assert.equal(resValid.status, 200)
  const jsonValid = await resValid.json()
  assert.equal(jsonValid.data.id, 'merit-tech-2026')

  const resInvalid = await fetch(`${baseUrl}/api/scholarships/non-existent-id`)
  assert.equal(resInvalid.status, 404)
})

test('Audit Engine: Scenario B - Missing Mandatory Document Detection', () => {
  const scholarship = SCHOLARSHIPS.find(s => s.id === 'merit-tech-2026')
  // Upload 3 out of 4 required: Identity, Marksheet, Institution (Missing: doc-income)
  const uploadedDocs = [
    {
      id: 'doc-1',
      originalName: 'aadhaar_card.pdf',
      categoryId: 'doc-id',
      categoryName: 'Identity Proof',
      extractedFields: { fullName: 'Rahul Sharma', dob: '15/08/2004' },
      confidence: 0.95
    },
    {
      id: 'doc-2',
      originalName: 'marksheet_12th.pdf',
      categoryId: 'doc-marksheet',
      categoryName: 'Academic Marksheet',
      extractedFields: { fullName: 'Rahul Sharma', percentageMarks: 84.5 },
      confidence: 0.95
    },
    {
      id: 'doc-3',
      originalName: 'bonafide_certificate.pdf',
      categoryId: 'doc-institution',
      categoryName: 'Institution Certificate',
      extractedFields: { fullName: 'Rahul Sharma', institutionName: 'NIT Surathkal' },
      confidence: 0.95
    }
  ]

  const audit = runScholarshipAudit(scholarship, uploadedDocs)

  assert.equal(audit.overallStatus, 'Action Required')
  assert.equal(audit.stats.missingCount, 1)
  assert.equal(audit.missingMandatory[0].categoryId, 'doc-income')
  assert.equal(audit.missingMandatory[0].name, 'Income Certificate')

  const missingFinding = audit.findings.find(f => f.category === 'MANDATORY_DOCUMENT_MISSING')
  assert.ok(missingFinding)
  assert.equal(missingFinding.verificationStatus, 'Action Required')
  assert.ok(missingFinding.guidelineReference.includes('NMTS Guidelines 2026'))
})

test('Audit Engine: Scenario C - Cross-Document Name Inconsistency (Rahul Sharma vs Rahul S.)', () => {
  const scholarship = SCHOLARSHIPS.find(s => s.id === 'merit-tech-2026')
  const uploadedDocs = [
    {
      id: 'doc-1',
      originalName: 'identity_card.pdf',
      categoryId: 'doc-id',
      categoryName: 'Identity Proof',
      extractedFields: { fullName: 'Rahul Sharma', dob: '15/08/2004' },
      confidence: 0.95
    },
    {
      id: 'doc-2',
      originalName: 'marksheet_12th.pdf',
      categoryId: 'doc-marksheet',
      categoryName: 'Academic Marksheet',
      extractedFields: { fullName: 'Rahul S', percentageMarks: 84.5 },
      confidence: 0.95
    },
    {
      id: 'doc-3',
      originalName: 'income_cert.pdf',
      categoryId: 'doc-income',
      categoryName: 'Income Certificate',
      extractedFields: { fullName: 'Rahul Sharma', annualIncome: 180000 },
      confidence: 0.95
    },
    {
      id: 'doc-4',
      originalName: 'institution_bonafide.pdf',
      categoryId: 'doc-institution',
      categoryName: 'Institution Certificate',
      extractedFields: { fullName: 'Rahul Sharma', institutionName: 'NIT' },
      confidence: 0.95
    }
  ]

  const audit = runScholarshipAudit(scholarship, uploadedDocs)

  const nameFinding = audit.findings.find(f => f.category === 'NAME_INCONSISTENCY')
  assert.ok(nameFinding, 'Should detect name inconsistency between Rahul Sharma and Rahul S.')
  assert.equal(nameFinding.verificationStatus, 'Unable to Verify')
  assert.ok(nameFinding.evidence.includes('Rahul Sharma'))
  assert.ok(nameFinding.evidence.includes('Rahul S'))
})

test('Audit Engine: Matching Documents produce Ready for Review status', () => {
  const scholarship = SCHOLARSHIPS.find(s => s.id === 'merit-tech-2026')
  const uploadedDocs = [
    {
      id: 'doc-1',
      originalName: 'identity_card.pdf',
      categoryId: 'doc-id',
      categoryName: 'Identity Proof',
      extractedFields: { fullName: 'Rahul Sharma', dob: '15/08/2004' },
      confidence: 0.95
    },
    {
      id: 'doc-2',
      originalName: 'marksheet_12th.pdf',
      categoryId: 'doc-marksheet',
      categoryName: 'Academic Marksheet',
      extractedFields: { fullName: 'Rahul Sharma', percentageMarks: 84.5 },
      confidence: 0.95
    },
    {
      id: 'doc-3',
      originalName: 'income_cert.pdf',
      categoryId: 'doc-income',
      categoryName: 'Income Certificate',
      extractedFields: { fullName: 'Rahul Sharma', annualIncome: 180000 },
      confidence: 0.95
    },
    {
      id: 'doc-4',
      originalName: 'institution_bonafide.pdf',
      categoryId: 'doc-institution',
      categoryName: 'Institution Certificate',
      extractedFields: { fullName: 'Rahul Sharma', institutionName: 'NIT' },
      confidence: 0.95
    }
  ]

  const audit = runScholarshipAudit(scholarship, uploadedDocs)

  assert.equal(audit.overallStatus, 'Ready for Review')
  assert.equal(audit.stats.missingCount, 0)
  assert.equal(audit.stats.satisfiedCount, 4)
  assert.equal(audit.stats.actionRequiredCount, 0)
})

test('API: POST /api/audit/run and GET /api/dashboard /api/reports/:id', async () => {
  const payload = {
    scholarshipId: 'merit-tech-2026',
    manualDocuments: [
      {
        id: 'doc-test-1',
        originalName: 'aadhaar.pdf',
        categoryId: 'doc-id',
        categoryName: 'Identity Proof',
        extractedFields: { fullName: 'Priya Patel', dob: '10/05/2005' },
        confidence: 0.95
      }
    ]
  }

  // 1. Run audit
  const runRes = await fetch(`${baseUrl}/api/audit/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  assert.equal(runRes.status, 200)
  const runJson = await runRes.json()
  assert.equal(runJson.status, 'success')
  const auditId = runJson.data.id
  assert.ok(auditId)

  // 2. Fetch specific audit
  const auditRes = await fetch(`${baseUrl}/api/audit/${auditId}`)
  assert.equal(auditRes.status, 200)
  const auditJson = await auditRes.json()
  assert.equal(auditJson.data.id, auditId)

  // 3. Fetch dashboard
  const dashRes = await fetch(`${baseUrl}/api/dashboard`)
  assert.equal(dashRes.status, 200)
  const dashJson = await dashRes.json()
  assert.ok(dashJson.data.summary.totalAuditedApplications >= 1)

  // 4. Fetch report
  const repRes = await fetch(`${baseUrl}/api/reports/${auditId}`)
  assert.equal(repRes.status, 200)
  const repJson = await repRes.json()
  assert.ok(repJson.data.reportId)
  assert.ok(repJson.data.disclaimer)
})

test('API: GET /api/persistence/status returns storage mode disclosure without secrets', async () => {
  const res = await fetch(`${baseUrl}/api/persistence/status`)
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.status, 'success')
  assert.ok(json.data.storageType)
  assert.ok(json.data.note)
  // Ensure no secrets leaked
  const str = JSON.stringify(json)
  assert.ok(!str.includes('serviceRoleKey'))
  assert.ok(!str.includes('secret'))
})

test('API: POST /api/contact validates input and records inquiry with delivery notice', async () => {
  // Test validation error
  const invalidRes = await fetch(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '', email: 'not-an-email', message: '' })
  })
  assert.equal(invalidRes.status, 400)

  // Test successful submission
  const validRes = await fetch(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. Jane Evaluator',
      email: 'jane.evaluator@institution.edu',
      topic: 'Course Evaluation Inquiry',
      message: 'Excellent demonstration of deterministic auditing and multi-provider failover.'
    })
  })
  assert.equal(validRes.status, 200)
  const validJson = await validRes.json()
  assert.equal(validJson.status, 'success')
  assert.equal(validJson.data.savedToLedger, true)
  assert.equal(validJson.data.emailDelivery, 'DISABLED_UNCONFIGURED')
  assert.ok(validJson.data.id)
})
