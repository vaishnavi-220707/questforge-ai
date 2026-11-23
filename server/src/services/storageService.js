import crypto from 'crypto'

/**
 * In-memory repository for Demonstration Mode.
 * Designed to seamlessly interface with Supabase PostgreSQL when credentials are provided.
 */
class StorageService {
  constructor() {
    this.documents = new Map() // docId -> Document Record
    this.audits = new Map()    // auditId -> Audit Session Record
    this.applications = new Map() // appId -> Application Record
  }

  saveDocument(doc) {
    const id = doc.id || crypto.randomUUID()
    const record = {
      id,
      userId: doc.userId || null,
      originalName: doc.originalName,
      mimetype: doc.mimetype,
      size: doc.size,
      categoryId: doc.categoryId || 'doc-unassigned',
      categoryName: doc.categoryName || 'Unassigned Document',
      extractedText: doc.extractedText || '',
      extractedFields: doc.extractedFields || {},
      extractionConfidence: doc.extractionConfidence || 0,
      createdAt: new Date().toISOString()
    }
    this.documents.set(id, record)
    return record
  }

  getDocument(id, userId = null) {
    const doc = this.documents.get(id) || null
    if (!doc) return null
    if (doc.userId && (!userId || doc.userId !== userId)) {
      return null // Scoped to another user
    }
    return doc
  }

  updateDocument(id, updates, userId = null) {
    const existing = this.getDocument(id, userId)
    if (!existing) return null
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() }
    this.documents.set(id, updated)
    return updated
  }

  deleteDocument(id, userId = null) {
    const existing = this.getDocument(id, userId)
    if (!existing) return false
    return this.documents.delete(id)
  }

  saveAudit(auditData) {
    const id = auditData.id || `audit-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`
    const record = {
      id,
      ...auditData,
      createdAt: new Date().toISOString()
    }
    this.audits.set(id, record)

    // Also register or update application in student dashboard (for guest / unauthenticated audits)
    if (!record.userId) {
      this.applications.set(record.scholarshipId, {
        applicationId: `app-${record.scholarshipId}`,
        scholarshipId: record.scholarshipId,
        scholarshipTitle: record.scholarshipTitle,
        lastAuditId: id,
        auditStatus: record.overallStatus,
        uploadedCount: record.uploadedCategories?.length || 0,
        missingCount: record.missingMandatory?.length || 0,
        findingsCount: record.findings?.length || 0,
        lastAuditedAt: record.createdAt
      })
    }

    return record
  }

  getAudit(id, userId = null) {
    const audit = this.audits.get(id) || null
    if (!audit) return null
    if (audit.userId && (!userId || audit.userId !== userId)) {
      return null // Scoped to another user
    }
    return audit
  }

  getAllAudits() {
    return Array.from(this.audits.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  getDashboardSummary() {
    const applications = Array.from(this.applications.values())
    const totalAudits = this.audits.size
    const actionRequiredCount = applications.filter(a => a.auditStatus === 'Action Required').length
    const readyForReviewCount = applications.filter(a => a.auditStatus === 'Ready for Review').length

    return {
      storageType: 'In-Memory Secure Session Repository (Demonstration Mode)',
      note: 'Data persists during server session. If server restarts, demonstration records are reset.',
      summary: {
        totalAuditedApplications: applications.length,
        actionRequiredCount,
        readyForReviewCount,
        totalAuditExecutions: totalAudits
      },
      recentApplications: applications
    }
  }
}

export const storage = new StorageService()
export const storageService = storage
export { StorageService }
