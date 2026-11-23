import { AI_PROVIDERS_CONFIG } from '../../config/aiProviders.js'

export class GroqProvider {
  constructor(config = AI_PROVIDERS_CONFIG.groq) {
    this.name = 'Groq Cloud'
    this.id = 'groq'
    this.config = config
    this.endpoint = 'https://api.groq.com/openai/v1/chat/completions'
  }

  isConfigured() {
    return Boolean(this.config.apiKey && this.config.apiKey.trim() !== '')
  }

  async generateStructuredResponse({ systemPrompt, userContent, timeout = 30000 }) {
    const startTime = Date.now()

    if (!this.isConfigured()) {
      return {
        success: false,
        provider: this.id,
        model: this.config.model,
        errorCode: 'MISSING_CREDENTIALS',
        error: 'Groq API key is not configured in environment (GROQ_API_KEY).',
        retryable: false,
        durationMs: Date.now() - startTime
      }
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const messages = []
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt })
      }
      messages.push({ role: 'user', content: userContent })

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          response_format: { type: 'json_object' },
          temperature: 0.1
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      const durationMs = Date.now() - startTime

      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch (e) {
          errorData = { error: { message: errorText } }
        }

        const msg = errorData.error?.message || errorText

        if (response.status === 401 || response.status === 403) {
          return {
            success: false,
            provider: this.id,
            model: this.config.model,
            errorCode: 'AUTHENTICATION_ERROR',
            error: `Groq authentication failed (${response.status}): ${msg}`,
            retryable: false,
            durationMs
          }
        }

        if (response.status === 404 || msg.toLowerCase().includes('model') && msg.toLowerCase().includes('not found')) {
          return {
            success: false,
            provider: this.id,
            model: this.config.model,
            errorCode: 'MODEL_UNSUPPORTED',
            error: `Groq model "${this.config.model}" not found or decommissioned: ${msg}`,
            retryable: false,
            durationMs
          }
        }

        if (response.status === 429) {
          return {
            success: false,
            provider: this.id,
            model: this.config.model,
            errorCode: 'RATE_LIMITED',
            error: `Groq rate limit or quota exceeded: ${msg}`,
            retryable: false,
            durationMs
          }
        }

        if (response.status >= 500) {
          return {
            success: false,
            provider: this.id,
            model: this.config.model,
            errorCode: 'SERVICE_UNAVAILABLE',
            error: `Groq server error (${response.status}): ${msg}`,
            retryable: true,
            durationMs
          }
        }

        return {
          success: false,
          provider: this.id,
          model: this.config.model,
          errorCode: 'PROVIDER_ERROR',
          error: `Groq API error (${response.status}): ${msg}`,
          retryable: response.status >= 500,
          durationMs
        }
      }

      const data = await response.json()
      const rawText = data.choices?.[0]?.message?.content || ''

      let content
      try {
        content = JSON.parse(rawText)
      } catch (parseErr) {
        return {
          success: false,
          provider: this.id,
          model: this.config.model,
          errorCode: 'MALFORMED_JSON',
          error: `Groq returned non-JSON content: ${parseErr.message}`,
          rawResponse: rawText,
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
          promptTokens: data.usage?.prompt_tokens || null,
          completionTokens: data.usage?.completion_tokens || null
        },
        durationMs
      }
    } catch (err) {
      clearTimeout(timeoutId)
      const durationMs = Date.now() - startTime

      if (err.name === 'AbortError') {
        return {
          success: false,
          provider: this.id,
          model: this.config.model,
          errorCode: 'TIMEOUT',
          error: `Groq request timed out after ${timeout}ms`,
          retryable: true,
          durationMs
        }
      }

      return {
        success: false,
        provider: this.id,
        model: this.config.model,
        errorCode: 'NETWORK_FAILURE',
        error: err.message,
        retryable: true,
        durationMs
      }
    }
  }
}

export const groqProvider = new GroqProvider()
