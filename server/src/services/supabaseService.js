import { createClient } from '@supabase/supabase-js'
import { storageService } from './storageService.js'

export class SupabaseService {
  constructor() {
    this.url = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim() : null
    this.anonKey = process.env.SUPABASE_ANON_KEY ? process.env.SUPABASE_ANON_KEY.trim() : null
    this.serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.trim() : null

    this.client = null
    this.adminClient = null
    this.initialized = false

    if (this.url && (this.serviceRoleKey || this.anonKey)) {
      try {
        const key = this.serviceRoleKey || this.anonKey
        this.client = createClient(this.url, key, {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        })
        if (this.serviceRoleKey) {
          this.adminClient = this.client
        }
        this.initialized = true
        console.log('[SupabaseService] Initialized client for:', this.url)
      } catch (err) {
        console.warn('[SupabaseService] Initialization warning:', err.message)
      }
    }
  }

  isConfigured() {
    return Boolean(this.initialized && this.client)
  }

  /**
   * Verifies a Supabase JWT token and returns the authentic user object.
   * Validates cryptographic signature and session validity with Supabase Auth.
   * Never trusts client-supplied user IDs without cryptographic verification.
   */
  async getUserFromToken(token) {
    if (!this.isConfigured() || !token) return null
    try {
      const { data: { user }, error } = await this.client.auth.getUser(token)
      if (error || !user) return null
      return user
    } catch (err) {
      return null
    }
  }

  getStatus() {
    return {
      isConfigured: this.isConfigured(),
      hasServiceRole: Boolean(this.serviceRoleKey),
      hasAnonKey: Boolean(this.anonKey),
      storageType: this.isConfigured()
        ? 'Supabase Cloud PostgreSQL Database (Active)'
        : 'In-Memory Session Repository Fallback (Demonstration Mode)',
      note: this.isConfigured()
        ? 'Connected to configured Supabase database.'
        : 'SUPABASE_URL and SUPABASE_ANON_KEY are unconfigured. Operating in isolated in-memory session mode.'
    }
  }

  /**
   * Saves audit session and associated findings/documents.
   * If Supabase is connected, writes to database; otherwise falls back to memory.
   */
  async saveAudit(auditData, userId = null) {
    if (!this.isConfigured()) {
      return storageService.saveAudit({ ...auditData, userId })
    }

    try {
      const sessionPayload = {
        user_id: userId || null,
        scholarship_id: auditData.scholarshipId,
        scholarship_title: auditData.scholarshipTitle,
        readiness_score: auditData.readinessScore || 0,
        overall_status: auditData.overallStatus,
        total_requirements: auditData.totalRequirements || 0,
        fulfilled_requirements: auditData.fulfilledRequirements || 0,
        missing_mandatory_count: auditData.missingMandatory?.length || 0,
        findings_count: auditData.findings?.length || 0,
        summary_notice: auditData.summaryNotice || null,
        raw_metadata: {
          uploadedCategories: auditData.uploadedCategories || [],
          mode: auditData.mode,
          stats: auditData.stats || null,
          scholarshipCode: auditData.scholarshipCode || null,
          missingMandatory: auditData.missingMandatory || []
        }
      }

      const { data: session, error: sessionErr } = await this.client
        .from('audit_sessions')
        .insert(sessionPayload)
        .select()
        .single()

      if (sessionErr) throw sessionErr

      // Insert associated findings if any
      if (auditData.findings && auditData.findings.length > 0) {
        const findingsRows = auditData.findings.map(f => ({
          session_id: session.id,
          user_id: userId || null,
          issue_type: f.issueType || 'VERIFICATION_REQUIRED',
          severity: f.severity || 'warning',
          title: f.title,
          explanation: f.explanation,
          guideline_reference: f.guidelineReference || null,
          affected_documents: f.affectedDocuments || [],
          recommendation: f.recommendation || ''
        }))
        await this.client.from('audit_findings').insert(findingsRows)
      }

      // Also mirror to storageService for fast in-session cached reads
      storageService.saveAudit({ ...auditData, id: session.id, userId })

      return {
        ...auditData,
        id: session.id,
        userId: session.user_id || userId,
        createdAt: session.created_at
      }
    } catch (err) {
      console.warn('[SupabaseService] Error saving audit to cloud, falling back to memory:', err.message)
      return storageService.saveAudit({ ...auditData, userId })
    }
  }

  /**
   * Retrieves audit by ID.
   * If userId is supplied, enforces user-level authorization check.
   */
  async getAudit(auditId, userId = null) {
    if (!this.isConfigured()) {
      return storageService.getAudit(auditId, userId)
    }

    try {
      let query = this.client
        .from('audit_sessions')
        .select(`
          *,
          audit_findings (*),
          audit_documents (*)
        `)
        .eq('id', auditId)

      const { data, error } = await query.single()
      if (error || !data) {
        // Fallback check in local memory only if allowed
        return storageService.getAudit(auditId, userId)
      }

      // STRICT USER ISOLATION CHECK:
      // If the cloud record belongs to a registered user:
      if (data.user_id) {
        // Caller must be authenticated with the exact matching user ID
        if (!userId || data.user_id !== userId) {
          return null // Unauthorized access denied
        }
      }

      return {
        id: data.id,
        userId: data.user_id,
        scholarshipId: data.scholarship_id,
        scholarshipTitle: data.scholarship_title,
        scholarshipCode: data.raw_metadata?.scholarshipCode || null,
        readinessScore: Number(data.readiness_score),
        overallStatus: data.overall_status,
        totalRequirements: data.total_requirements,
        fulfilledRequirements: data.fulfilled_requirements,
        missingMandatory: data.raw_metadata?.missingMandatory || [],
        uploadedCategories: data.raw_metadata?.uploadedCategories || [],
        findings: data.audit_findings || [],
        stats: data.raw_metadata?.stats || {
          totalRequirements: data.total_requirements,
          satisfiedCount: data.fulfilled_requirements,
          missingCount: data.missing_mandatory_count,
          findingsCount: data.findings_count,
          actionRequiredCount: (data.audit_findings || []).filter(f => f.severity === 'critical' || f.severity === 'high').length,
          unableToVerifyCount: (data.audit_findings || []).filter(f => f.severity === 'warning').length
        },
        createdAt: data.created_at
      }
    } catch (err) {
      console.warn('[SupabaseService] Error fetching audit from cloud:', err.message)
      return storageService.getAudit(auditId, userId)
    }
  }

  /**
   * Retrieves dashboard summary and recent audit history.
   * Scoped to user if userId provided.
   */
  async getDashboardSummary(userId = null) {
    if (!this.isConfigured()) {
      return storageService.getDashboardSummary()
    }

    // Security: Unauthenticated users should only see their guest session applications,
    // NEVER the collective cloud audit sessions across all registered users!
    if (!userId) {
      return storageService.getDashboardSummary()
    }

    try {
      const { data: sessions, error } = await this.client
        .from('audit_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error || !sessions) {
        return storageService.getDashboardSummary()
      }

      const totalAudits = sessions.length
      const actionRequiredCount = sessions.filter(s => s.overall_status === 'Action Required').length
      const readyForReviewCount = sessions.filter(s => s.overall_status === 'Ready for Review').length

      return {
        storageType: 'Supabase Cloud PostgreSQL Database',
        note: 'Live persistent storage connected.',
        summary: {
          totalAuditedApplications: totalAudits,
          actionRequiredCount,
          readyForReviewCount,
          totalAuditExecutions: totalAudits
        },
        recentApplications: sessions.map(s => ({
          applicationId: `app-${s.scholarship_id}`,
          scholarshipId: s.scholarship_id,
          scholarshipTitle: s.scholarship_title,
          lastAuditId: s.id,
          auditStatus: s.overall_status,
          uploadedCount: s.fulfilled_requirements || 0,
          missingCount: s.missing_mandatory_count || 0,
          findingsCount: s.findings_count || 0,
          lastAuditedAt: s.created_at
        }))
      }
    } catch (err) {
      console.warn('[SupabaseService] Error fetching dashboard summary from cloud:', err.message)
      return storageService.getDashboardSummary()
    }
  }

  /**
   * Stores a contact/inquiry submission.
   */
  async saveContactSubmission({ name, email, topic, message, ipHash = null }) {
    const submissionId = `inq-${Date.now()}`
    const record = {
      id: submissionId,
      name,
      email,
      topic,
      message,
      ip_hash: ipHash,
      status: 'RECEIVED',
      created_at: new Date().toISOString()
    }

    if (!this.isConfigured()) {
      // In demonstration mode, record in memory storage ledger
      if (!this.inMemoryContacts) this.inMemoryContacts = []
      this.inMemoryContacts.push(record)
      return {
        success: true,
        savedToLedger: true,
        storage: 'IN_MEMORY_DEMO_LEDGER',
        id: submissionId,
        message: 'Inquiry registered in local demonstration ledger.'
      }
    }

    try {
      const { data, error } = await this.client
        .from('contact_submissions')
        .insert({
          name,
          email,
          topic,
          message,
          ip_hash: ipHash,
          status: 'RECEIVED'
        })
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        savedToLedger: true,
        storage: 'SUPABASE_DATABASE',
        id: data.id,
        message: 'Inquiry securely persisted to Supabase database.'
      }
    } catch (err) {
      console.warn('[SupabaseService] Failed to insert contact submission to Supabase:', err.message)
      if (!this.inMemoryContacts) this.inMemoryContacts = []
      this.inMemoryContacts.push(record)
      return {
        success: true,
        savedToLedger: true,
        storage: 'IN_MEMORY_DEMO_LEDGER_FALLBACK',
        id: submissionId,
        message: 'Inquiry registered in local demonstration ledger (cloud fallback).'
      }
    }
  }
}

export const supabaseService = new SupabaseService()
