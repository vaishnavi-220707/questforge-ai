import { supabase, isSupabaseConfigured } from './supabaseClient'

/**
 * Centralized API client for QuestForge AI
 */

const RAW_API_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').trim()
const API_BASE = RAW_API_URL ? `${RAW_API_URL.replace(/\/+$/, '')}/api` : '/api'

/**
 * Dynamically extract cryptographic Bearer JWT from active Supabase session
 */
async function getAuthHeaders() {
  const headers = {}
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
    } catch {
      // Proceed unauthenticated
    }
  }
  return headers
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`)
  if (!res.ok) throw new Error(`Health check failed with status ${res.status}`)
  return res.json()
}

export async function fetchScholarships(params = {}) {
  const query = new URLSearchParams()
  if (params.search) query.append('search', params.search)
  if (params.category && params.category !== 'All') query.append('category', params.category)
  if (params.educationLevel && params.educationLevel !== 'All') query.append('educationLevel', params.educationLevel)

  const url = `${API_BASE}/scholarships${query.toString() ? `?${query.toString()}` : ''}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to load scholarships')
  return res.json()
}

export async function fetchScholarshipById(id) {
  const res = await fetch(`${API_BASE}/scholarships/${id}`)
  if (!res.ok) {
    if (res.status === 404) throw new Error(`Scholarship '${id}' was not found.`)
    throw new Error('Failed to load scholarship details')
  }
  return res.json()
}

export async function uploadDocuments(formData) {
  const authHeaders = await getAuthHeaders()
  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    headers: { ...authHeaders },
    body: formData
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Failed to upload documents')
  return json
}

export async function updateDocumentCategory(docId, categoryId, categoryName) {
  const authHeaders = await getAuthHeaders()
  const res = await fetch(`${API_BASE}/documents/${docId}/category`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders
    },
    body: JSON.stringify({ categoryId, categoryName })
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Failed to update category')
  return json
}

export async function executeAudit(payload) {
  const authHeaders = await getAuthHeaders()
  const res = await fetch(`${API_BASE}/audit/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders
    },
    body: JSON.stringify(payload)
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Failed to run audit')
  return json
}

export async function fetchAuditById(id) {
  const authHeaders = await getAuthHeaders()
  const res = await fetch(`${API_BASE}/audit/${id}`, {
    headers: { ...authHeaders }
  })
  if (!res.ok) {
    if (res.status === 404) throw new Error(`Audit record '${id}' not found or unauthorized.`)
    throw new Error('Failed to load audit record')
  }
  return res.json()
}

export async function fetchDashboardData() {
  const authHeaders = await getAuthHeaders()
  const res = await fetch(`${API_BASE}/dashboard`, {
    headers: { ...authHeaders }
  })
  if (!res.ok) throw new Error('Failed to load student dashboard')
  return res.json()
}

export async function fetchReportData(auditId) {
  const authHeaders = await getAuthHeaders()
  const res = await fetch(`${API_BASE}/reports/${auditId}`, {
    headers: { ...authHeaders }
  })
  if (!res.ok) {
    if (res.status === 404) throw new Error(`Audit report '${auditId}' not found or unauthorized.`)
    throw new Error('Failed to load audit report')
  }
  return res.json()
}

export async function fetchPersistenceStatus() {
  const res = await fetch(`${API_BASE}/persistence/status`)
  if (!res.ok) throw new Error('Failed to load persistence status')
  return res.json()
}

export async function submitContactForm(formData) {
  const res = await fetch(`${API_BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || `Server responded with HTTP ${res.status}`)
  return json
}
