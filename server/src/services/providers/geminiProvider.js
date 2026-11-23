import { GoogleGenerativeAI } from '@google/generative-ai'
import { AI_PROVIDERS_CONFIG } from '../../config/aiProviders.js'

export class GeminiProvider {
  constructor(config = AI_PROVIDERS_CONFIG.gemini) {
    this.name = 'Google Gemini'
    this.id = 'gemini'
    this.config = config
    this.client = null
    if (this.config.apiKey) {
      try {
        this.client = new GoogleGenerativeAI(this.config.apiKey)
      } catch (err) {
        console.warn('[GeminiProvider] Client init warning:', err.message)
      }
    }
  }

  isConfigured() {
    return Boolean(this.config.apiKey && this.config.apiKey.trim() !== '')
  }

  /**
   * Verifies API key authentication against Google Generative Language API without generating content.
   * Probes GET /v1beta/models?pageSize=1 using the native x-goog-api-key header.
   */
  async checkAuthentication(timeout = 8000) {
    const startTime = Date.now()

    if (!this.isConfigured()) {
      return {
        authenticated: false,
        status: 'UNCONFIGURED',
        error: 'No Gemini API key configured.',
        durationMs: 0
      }
    }

    try {
      const cleanKey = this.config.apiKey.trim()
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1', {
        method: 'GET',
        headers: {
          'x-goog-api-key': cleanKey
        },
        signal: AbortSignal.timeout(timeout)
      })

      const durationMs = Date.now() - startTime

      if (res.ok) {
        return {
          authenticated: true,
          status: 'AUTHENTICATED',
          durationMs
        }
      }

      const errData = await res.json().catch(() => ({}))
      const errMsg = errData?.error?.message || `HTTP ${res.status}`

      if (res.status === 401 || (res.status === 400 && errMsg.toLowerCase().includes('api key not valid'))) {
        return {
          authenticated: false,
          status: 'AUTH_FAILED',
          errorCode: 'AUTHENTICATION_ERROR',
          error: 'Gemini API key is invalid or unrecognized by Google AI Studio.',
          durationMs
        }
      }

      if (res.status === 403) {
        return {
          authenticated: false,
          status: 'PERMISSION_DENIED',
          errorCode: 'PERMISSION_DENIED',
          error: `Gemini API access forbidden: ${errMsg}`,
          durationMs
        }
      }

      return {
        authenticated: false,
        status: 'ERROR',
        errorCode: 'PROVIDER_ERROR',
        error: errMsg,
        durationMs
      }
    } catch (err) {
      return {
        authenticated: false,
        status: 'ERROR',
        errorCode: err.name === 'TimeoutError' ? 'TIMEOUT' : 'PROVIDER_ERROR',
        error: err.name === 'TimeoutError' ? 'Gemini authentication check timed out.' : err.message,
        durationMs: Date.now() - startTime
      }
    }
  }

  /**
   * Executes structured JSON generation with native REST API and x-goog-api-key header.
   * Accurately distinguishes billing entitlement restrictions from authentication failures.
   */
  async generateStructuredResponse({ systemPrompt, userContent, timeout = 30000 }) {
    const startTime = Date.now()

    if (!this.isConfigured()) {
      return {
        success: false,
        provider: this.id,
        model: this.config.model,
        errorCode: 'MISSING_CREDENTIALS',
        error: 'Google Gemini API key is not configured in environment (GEMINI_API_KEY).',
        retryable: false,
        durationMs: Date.now() - startTime
      }
    }

    const cleanKey = this.config.apiKey.trim()
    const fullPrompt = `${systemPrompt ? systemPrompt + '\n\n' : ''}${userContent}`

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent`
      const payload = {
        contents: [
          {
            parts: [{ text: fullPrompt }]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': cleanKey
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(timeout)
      })

      const durationMs = Date.now() - startTime

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        const errMsg = errData?.error?.message || `HTTP ${res.status} ${res.statusText}`
        const errorReason = errData?.error?.details?.[0]?.reason || ''

        // Granular error classification
        if (
          res.status === 403 &&
          (errorReason === 'FREE_TIER_NOT_AVAILABLE' ||
            errMsg.toLowerCase().includes('free tier is not available') ||
            errMsg.toLowerCase().includes('billing'))
        ) {
          return {
            success: false,
            provider: this.id,
            model: this.config.model,
            errorCode: 'PROJECT_BILLING_REQUIRED',
            error: 'The Gemini API free tier is not available for this project. Set up billing to upgrade at https://aistudio.google.com/billing',
            retryable: false,
            durationMs
          }
        }

        if (
          res.status === 401 ||
          (res.status === 400 && (errMsg.includes('API_KEY_INVALID') || errMsg.toLowerCase().includes('api key not valid')))
        ) {
          return {
            success: false,
            provider: this.id,
            model: this.config.model,
            errorCode: 'AUTHENTICATION_ERROR',
            error: 'Gemini authentication failed (API key invalid or unauthorized).',
            retryable: false,
            durationMs
          }
        }

        if (
          res.status === 404 ||
          errMsg.toLowerCase().includes('not found') ||
          errMsg.toLowerCase().includes('unsupported model') ||
          errMsg.toLowerCase().includes('is not supported')
        ) {
          return {
            success: false,
            provider: this.id,
            model: this.config.model,
            errorCode: 'MODEL_UNSUPPORTED',
            error: `Gemini model "${this.config.model}" not found or unsupported: ${errMsg}`,
            retryable: false,
            durationMs
          }
        }

        if (
          res.status === 429 ||
          errorReason === 'RESOURCE_EXHAUSTED' ||
          errMsg.toLowerCase().includes('quota') ||
          errMsg.toLowerCase().includes('rate limit')
        ) {
          return {
            success: false,
            provider: this.id,
            model: this.config.model,
            errorCode: 'RATE_LIMITED',
            error: 'Gemini quota or rate limit exceeded.',
            retryable: false,
            durationMs
          }
        }

        if (res.status === 403) {
          return {
            success: false,
            provider: this.id,
            model: this.config.model,
            errorCode: 'PERMISSION_DENIED',
            error: `Gemini permission denied: ${errMsg}`,
            retryable: false,
            durationMs
          }
        }

        return {
          success: false,
          provider: this.id,
          model: this.config.model,
          errorCode: 'PROVIDER_ERROR',
          error: errMsg,
          retryable: true,
          durationMs
        }
      }

      // Success HTTP 200
      const data = await res.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

      let content
      try {
        content = JSON.parse(text)
      } catch (parseErr) {
        return {
          success: false,
          provider: this.id,
          model: this.config.model,
          errorCode: 'MALFORMED_JSON',
          error: `Gemini returned invalid JSON: ${parseErr.message}`,
          rawResponse: text,
          retryable: true,
          durationMs
        }
      }

      return {
        success: true,
        provider: this.id,
        model: this.config.model,
        content,
        usage: {
          promptTokens: data.usageMetadata?.promptTokenCount || null,
          completionTokens: data.usageMetadata?.candidatesTokenCount || null
        },
        durationMs
      }
    } catch (err) {
      const durationMs = Date.now() - startTime
      const errMsg = err.message || ''

      if (err.name === 'TimeoutError' || err.name === 'AbortError' || errMsg.includes('timed out')) {
        return {
          success: false,
          provider: this.id,
          model: this.config.model,
          errorCode: 'TIMEOUT',
          error: `Gemini request timed out after ${timeout}ms`,
          retryable: true,
          durationMs
        }
      }

      return {
        success: false,
        provider: this.id,
        model: this.config.model,
        errorCode: 'PROVIDER_ERROR',
        error: errMsg,
        retryable: true,
        durationMs
      }
    }
  }
}

export const geminiProvider = new GeminiProvider()
