import test from 'node:test'
import assert from 'node:assert/strict'
import app from '../src/app.js'

let server
let baseUrl = ''

test.before(async () => {
  await new Promise(resolve => {
    server = app.listen(5004, () => {
      baseUrl = 'http://localhost:5004'
      resolve()
    })
  })
})

test.after(async () => {
  await new Promise(resolve => server.close(resolve))
})

test('E2E SCENARIO A: Full Verification of Matching Documents', async () => {
  // Step 1: Query scholarship
  const schRes = await fetch(`${baseUrl}/api/scholarships/merit-tech-2026`)
  assert.equal(schRes.status, 200)
  const { data: scholarship } = await schRes.json()
  assert.equal(scholarship.id, 'merit-tech-2026')

  // Step 2: Upload matching documents
  const matchingDocs = [
    {
      id: 'doc-id-1',
      originalName: 'national_id_card.pdf',
      categoryId: 'doc-id',
      categoryName: 'Identity Proof',
      extractedFields: { fullName: 'Rahul Sharma', dob: '15/08/2004', idNumber: '9988 7766 5544' },
      confidence: 0.95
    },
    {
      id: 'doc-income-1',
      originalName: 'income_certificate.pdf',
      categoryId: 'doc-income',
      categoryName: 'Income Certificate',
      extractedFields: { fullName: 'Rahul Sharma', annualIncome: 180000 },
      confidence: 0.92
    },
    {
      id: 'doc-marks-1',
      originalName: '12th_board_marksheet.pdf',
      categoryId: 'doc-marksheet',
      categoryName: 'Academic Marksheet',
      extractedFields: { fullName: 'Rahul Sharma', percentageMarks: 85.5 },
      confidence: 0.95
    },
    {
      id: 'doc-inst-1',
      originalName: 'bonafide_letter.pdf',
      categoryId: 'doc-institution',
      categoryName: 'Institution Certificate',
      extractedFields: { fullName: 'Rahul Sharma', institutionName: 'NIT Surathkal' },
      confidence: 0.90
    }
  ]

  // Step 3: Run Audit
  const auditRes = await fetch(`${baseUrl}/api/audit/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scholarshipId: scholarship.id,
      manualDocuments: matchingDocs
    })
  })
  assert.equal(auditRes.status, 200)
  const { data: audit } = await auditRes.json()

  assert.equal(audit.overallStatus, 'Ready for Review')
  assert.equal(audit.stats.missingCount, 0)
  assert.equal(audit.stats.satisfiedCount, 4)
  assert.equal(audit.stats.actionRequiredCount, 0)
})

test('E2E SCENARIO B: Missing Document Detection (Income Certificate)', async () => {
  const threeDocs = [
    {
      id: 'doc-id-1',
      originalName: 'aadhaar.pdf',
      categoryId: 'doc-id',
      categoryName: 'Identity Proof',
      extractedFields: { fullName: 'Rahul Sharma' }
    },
    {
      id: 'doc-marks-1',
      originalName: 'marksheet.pdf',
      categoryId: 'doc-marksheet',
      categoryName: 'Academic Marksheet',
      extractedFields: { fullName: 'Rahul Sharma', percentageMarks: 82.0 }
    },
    {
      id: 'doc-inst-1',
      originalName: 'inst.pdf',
      categoryId: 'doc-institution',
      categoryName: 'Institution Certificate',
      extractedFields: { fullName: 'Rahul Sharma' }
    }
  ]

  const auditRes = await fetch(`${baseUrl}/api/audit/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scholarshipId: 'merit-tech-2026',
      manualDocuments: threeDocs
    })
  })
  assert.equal(auditRes.status, 200)
  const { data: audit } = await auditRes.json()

  assert.equal(audit.overallStatus, 'Action Required')
  assert.equal(audit.stats.missingCount, 1)
  assert.equal(audit.missingMandatory[0].categoryId, 'doc-income')
  assert.equal(audit.missingMandatory[0].name, 'Income Certificate')

  const missingFinding = audit.findings.find(f => f.category === 'MANDATORY_DOCUMENT_MISSING')
  assert.ok(missingFinding)
  assert.equal(missingFinding.verificationStatus, 'Action Required')
  assert.ok(missingFinding.recommendedAction.includes('Upload the required Income Certificate'))
})

test('E2E SCENARIO C: Name Inconsistency (Rahul Sharma vs Rahul S.)', async () => {
  const docsWithInconsistency = [
    {
      id: 'doc-id-1',
      originalName: 'aadhaar.pdf',
      categoryId: 'doc-id',
      categoryName: 'Identity Proof',
      extractedFields: { fullName: 'Rahul Sharma', dob: '15/08/2004' }
    },
    {
      id: 'doc-marks-1',
      originalName: 'marksheet.pdf',
      categoryId: 'doc-marksheet',
      categoryName: 'Academic Marksheet',
      extractedFields: { fullName: 'Rahul S', percentageMarks: 85.0 }
    },
    {
      id: 'doc-income-1',
      originalName: 'income.pdf',
      categoryId: 'doc-income',
      categoryName: 'Income Certificate',
      extractedFields: { fullName: 'Rahul Sharma', annualIncome: 150000 }
    },
    {
      id: 'doc-inst-1',
      originalName: 'bonafide.pdf',
      categoryId: 'doc-institution',
      categoryName: 'Institution Certificate',
      extractedFields: { fullName: 'Rahul Sharma' }
    }
  ]

  const auditRes = await fetch(`${baseUrl}/api/audit/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scholarshipId: 'merit-tech-2026',
      manualDocuments: docsWithInconsistency
    })
  })
  assert.equal(auditRes.status, 200)
  const { data: audit } = await auditRes.json()

  // Status should be Unable to Verify due to name discrepancy requiring manual review
  assert.equal(audit.overallStatus, 'Unable to Verify')
  const nameFinding = audit.findings.find(f => f.category === 'NAME_INCONSISTENCY')
  assert.ok(nameFinding)
  assert.equal(nameFinding.verificationStatus, 'Unable to Verify')
  assert.ok(nameFinding.evidence.includes('Rahul S'))
  assert.ok(nameFinding.evidence.includes('Rahul Sharma'))
})

test('E2E SCENARIO D: Unsupported File Upload Rejection', async () => {
  const formData = new FormData()
  formData.append('documents', new Blob(['binary-executable-code'], { type: 'application/x-dosexec' }), 'virus.exe')

  const res = await fetch(`${baseUrl}/api/documents/upload`, {
    method: 'POST',
    body: formData
  })
  assert.equal(res.status, 400)
  const json = await res.json()
  assert.equal(json.status, 'error')
  assert.ok(json.message.includes('Unsupported file type'))
})

test('E2E SCENARIO E: Mode Disclosure — Demonstration or AI-Connected', async () => {
  const res = await fetch(`${baseUrl}/api/health`)
  const json = await res.json()
  assert.equal(json.status, 'ok')
  // Mode is Deterministic Demonstration Mode when no keys configured,
  // or AI-Connected Mode when provider keys are present.
  const validModes = ['Deterministic Demonstration Mode', 'AI-Connected Mode']
  assert.ok(
    validModes.includes(json.mode),
    `Expected mode to be one of ${validModes.join(' | ')}, got: ${json.mode}`
  )
  // Warnings array must exist and be non-empty
  assert.ok(Array.isArray(json.warnings) && json.warnings.length > 0)
})

test('E2E SCENARIO F: Dashboard and Report Generation', async () => {
  // Query dashboard
  const dashRes = await fetch(`${baseUrl}/api/dashboard`)
  assert.equal(dashRes.status, 200)
  const { data: dashboard } = await dashRes.json()

  assert.ok(dashboard.summary.totalAuditedApplications >= 1)
  assert.ok(dashboard.recentApplications.length >= 1)

  const latestApp = dashboard.recentApplications[0]
  assert.ok(latestApp.lastAuditId)

  // Query report
  const repRes = await fetch(`${baseUrl}/api/reports/${latestApp.lastAuditId}`)
  assert.equal(repRes.status, 200)
  const { data: report } = await repRes.json()

  assert.equal(report.reportId, `REP-${latestApp.lastAuditId}`)
  assert.ok(report.executiveSummary)
  assert.ok(report.disclaimer.includes('Skill Enhancement Course'))
})
