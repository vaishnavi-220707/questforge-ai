import { compareNames, normalizeDate } from '../utils/stringSimilarity.js'

/**
 * Deterministic Rules-Based Scholarship Application Audit Engine.
 * Conforms to academic SEC project specification.
 */
export function runScholarshipAudit(scholarship, uploadedDocuments = []) {
  if (!scholarship) {
    throw new Error('Valid scholarship definition is required to execute audit.')
  }

  const findings = []
  const uploadedCategoryIds = new Set(uploadedDocuments.map(d => d.categoryId))
  const uploadedCategoriesList = uploadedDocuments.map(d => ({
    documentId: d.id,
    originalName: d.originalName,
    categoryId: d.categoryId,
    categoryName: d.categoryName,
    confidence: d.extractionConfidence || d.confidence || 0.8,
    extractedFields: d.extractedFields || {}
  }))

  // 1. Mandatory Category Completeness Check
  const missingMandatory = []
  const satisfiedMandatory = []

  for (const mandatoryCat of scholarship.mandatoryDocuments) {
    if (!uploadedCategoryIds.has(mandatoryCat.categoryId)) {
      missingMandatory.push(mandatoryCat)

      findings.push({
        findingId: `F-MISSING-${mandatoryCat.categoryId}`,
        category: 'MANDATORY_DOCUMENT_MISSING',
        severity: 'HIGH',
        relevantDocument: mandatoryCat.name,
        evidence: `No document was uploaded or assigned to mandatory category "${mandatoryCat.name}".`,
        explanation: `The selected scholarship (${scholarship.title}) requires this document under mandatory verification rules. Applications submitted without it are typically rejected at administrative screening.`,
        guidelineReference: mandatoryCat.guidelineReference || 'General Scholarship Administration Guidelines, Mandatory Documents List',
        recommendedAction: `Upload the required ${mandatoryCat.name} before submitting your application through the official portal.`,
        verificationStatus: 'Action Required'
      })
    } else {
      satisfiedMandatory.push(mandatoryCat)
    }
  }

  // 2. Cross-Document Consistency Checks
  const documentsWithNames = uploadedDocuments.filter(d => d.extractedFields?.fullName)

  // Compare names pairwise across distinct uploaded documents
  for (let i = 0; i < documentsWithNames.length; i++) {
    for (let j = i + 1; j < documentsWithNames.length; j++) {
      const docA = documentsWithNames[i]
      const docB = documentsWithNames[j]

      const nameA = docA.extractedFields.fullName
      const nameB = docB.extractedFields.fullName

      const comparison = compareNames(nameA, nameB)

      if (comparison.matchType === 'INITIAL_ABBREVIATION') {
        findings.push({
          findingId: `F-NAME-ABBREV-${docA.id}-${docB.id}`,
          category: 'NAME_INCONSISTENCY',
          severity: 'MEDIUM',
          relevantDocument: `${docA.categoryName} and ${docB.categoryName}`,
          evidence: `Extracted "${nameA}" from ${docA.categoryName} (${docA.originalName}) vs "${nameB}" from ${docB.categoryName} (${docB.originalName}).`,
          explanation: `Possible name inconsistency detected between documents. One document uses an abbreviated initial while the other contains the expanded name.`,
          guidelineReference: 'Scholarship Application Verification Norms, Section on Identity Consistency',
          recommendedAction: `Verify whether your scholarship portal requires an exact character-by-character match or accepts an identity certificate/affidavit for name expansion.`,
          verificationStatus: 'Unable to Verify'
        })
      } else if (comparison.matchType === 'SLIGHT_TYPO_OR_TRANSLITERATION') {
        findings.push({
          findingId: `F-NAME-TYPO-${docA.id}-${docB.id}`,
          category: 'NAME_SPELLING_VARIATION',
          severity: 'MEDIUM',
          relevantDocument: `${docA.categoryName} and ${docB.categoryName}`,
          evidence: `Extracted "${nameA}" in ${docA.categoryName} vs "${nameB}" in ${docB.categoryName}.`,
          explanation: `Minor spelling variation or transliteration difference detected between candidate names.`,
          guidelineReference: 'Guidelines on Transliteration and Document Identity Matching',
          recommendedAction: `Check if your official documents match your school registry. Manual verification is recommended before submission.`,
          verificationStatus: 'Unable to Verify'
        })
      } else if (comparison.matchType === 'SUBSTANTIAL_DIFFERENCE') {
        findings.push({
          findingId: `F-NAME-MISMATCH-${docA.id}-${docB.id}`,
          category: 'CRITICAL_NAME_MISMATCH',
          severity: 'HIGH',
          relevantDocument: `${docA.categoryName} and ${docB.categoryName}`,
          evidence: `Extracted "${nameA}" in ${docA.categoryName} vs "${nameB}" in ${docB.categoryName}.`,
          explanation: `Substantial discrepancy observed between applicant names across documents.`,
          guidelineReference: 'Scholarship Document Integrity Guidelines: Applicant Name Verification',
          recommendedAction: `Ensure that all uploaded documents belong to the same applicant. Replace any accidentally misfiled document.`,
          verificationStatus: 'Action Required'
        })
      }
    }
  }

  // 3. Date of Birth Consistency Check
  const documentsWithDob = uploadedDocuments.filter(d => d.extractedFields?.dob)
  for (let i = 0; i < documentsWithDob.length; i++) {
    for (let j = i + 1; j < documentsWithDob.length; j++) {
      const docA = documentsWithDob[i]
      const docB = documentsWithDob[j]

      const dobA = normalizeDate(docA.extractedFields.dob)
      const dobB = normalizeDate(docB.extractedFields.dob)

      if (dobA && dobB && dobA !== dobB) {
        findings.push({
          findingId: `F-DOB-MISMATCH-${docA.id}-${docB.id}`,
          category: 'DOB_INCONSISTENCY',
          severity: 'HIGH',
          relevantDocument: `${docA.categoryName} and ${docB.categoryName}`,
          evidence: `Extracted date of birth "${docA.extractedFields.dob}" (${dobA}) vs "${docB.extractedFields.dob}" (${dobB}).`,
          explanation: `Date of birth appears inconsistent across documents. Official portals cross-verify DOB against identity databases.`,
          guidelineReference: 'Date of Birth Verification Standards, Section 3.2',
          recommendedAction: `Inspect your original documents to determine which record has the discrepancy. Contact the issuing institution for correction if necessary.`,
          verificationStatus: 'Action Required'
        })
      }
    }
  }

  // 4. Scholarship-Specific Eligibility Threshold Checks
  // Check Income Ceiling if income document uploaded
  const incomeDoc = uploadedDocuments.find(d => d.categoryId === 'doc-income')
  if (incomeDoc && incomeDoc.extractedFields?.annualIncome) {
    const extractedIncome = incomeDoc.extractedFields.annualIncome
    const incomeLimit = 250000 // Configured demo threshold

    if (extractedIncome > incomeLimit) {
      findings.push({
        findingId: 'F-ELIG-INCOME-CEILING',
        category: 'INCOME_CEILING_EXCEEDED',
        severity: 'HIGH',
        relevantDocument: 'Income Certificate',
        evidence: `Extracted annual family income: ₹${extractedIncome.toLocaleString('en-IN')}. Configured maximum threshold: ₹${incomeLimit.toLocaleString('en-IN')}.`,
        explanation: `The income stated on the certificate appears to exceed the maximum family income limit configured for this scholarship program.`,
        guidelineReference: 'NMTS Scheme Guidelines, Clause 3(b) (Family Income Ceiling)',
        recommendedAction: `Review whether you are eligible under this specific category or if an alternative merit-only scholarship applies.`,
        verificationStatus: 'Action Required'
      })
    }
  }

  // Check Academic Percentage if marksheet uploaded
  const marksheetDoc = uploadedDocuments.find(d => d.categoryId === 'doc-marksheet')
  if (marksheetDoc && marksheetDoc.extractedFields?.percentageMarks) {
    const extractedMarks = marksheetDoc.extractedFields.percentageMarks
    const minMarksRequired = 75.0 // Demo requirement

    if (extractedMarks < minMarksRequired) {
      findings.push({
        findingId: 'F-ELIG-MARKS-BELOW',
        category: 'ACADEMIC_THRESHOLD_DEFICIT',
        severity: 'HIGH',
        relevantDocument: 'Academic Marksheet',
        evidence: `Extracted aggregate marks: ${extractedMarks}%. Required minimum for eligibility: ${minMarksRequired}%.`,
        explanation: `The extracted qualifying examination percentage appears to be lower than the minimum eligibility requirement for this scholarship.`,
        guidelineReference: 'NMTS Academic Merit Norms, Clause 2(a)',
        recommendedAction: `Check whether category-based relaxations (SC/ST/OBC/PWD) apply to your application.`,
        verificationStatus: 'Action Required'
      })
    }
  }

  // 5. Determine Overall Audit Status
  let overallStatus = 'Ready for Review'
  const hasActionRequired = findings.some(f => f.verificationStatus === 'Action Required')
  const hasUnableToVerify = findings.some(f => f.verificationStatus === 'Unable to Verify')

  if (hasActionRequired) {
    overallStatus = 'Action Required'
  } else if (hasUnableToVerify) {
    overallStatus = 'Unable to Verify'
  } else {
    overallStatus = 'Ready for Review'
  }

  return {
    scholarshipId: scholarship.id,
    scholarshipTitle: scholarship.title,
    scholarshipCode: scholarship.code,
    auditedAt: new Date().toISOString(),
    overallStatus,
    stats: {
      mandatoryCount: scholarship.mandatoryDocuments.length,
      uploadedCount: uploadedDocuments.length,
      satisfiedCount: satisfiedMandatory.length,
      missingCount: missingMandatory.length,
      findingsCount: findings.length,
      actionRequiredCount: findings.filter(f => f.verificationStatus === 'Action Required').length,
      unableToVerifyCount: findings.filter(f => f.verificationStatus === 'Unable to Verify').length
    },
    missingMandatory: missingMandatory.map(m => ({
      categoryId: m.categoryId,
      name: m.name,
      description: m.description,
      guidelineReference: m.guidelineReference
    })),
    satisfiedMandatory: satisfiedMandatory.map(s => ({
      categoryId: s.categoryId,
      name: s.name
    })),
    uploadedCategories: uploadedCategoriesList,
    findings
  }
}
