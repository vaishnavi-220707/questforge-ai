import { AI_PROVIDERS_CONFIG } from '../../config/aiProviders.js'

export class NvidiaProvider {
  constructor(config = AI_PROVIDERS_CONFIG.nvidia) {
    this.name = 'NVIDIA NeMoTron 3 Ultra'
    this.id = 'nvidia'
    this.config = config
  }

  isConfigured() {
    return Boolean(this.config.apiKey && this.config.apiKey.trim() !== '')
  }

  getEndpoint() {
    const base = (this.config.baseUrl || 'https://integrate.api.nvidia.com/v1').replace(/\/+$/, '')
    return `${base}/chat/completions`
  }

  async generateStructuredResponse({ systemPrompt, userContent, timeout = 30000 }) {
    const startTime = Date.now()

    if (!this.isConfigured()) {
      return {
        success: false,
        provider: this.id,
        model: this.config.model,
        errorCode: 'MISSING_CREDENTIALS',
        error: `NVIDIA API key is not configured in environment (NVIDIA_API_KEY). Live execution of ${this.name} (${this.config.model}) is blocked pending valid endpoint and credentials.`,
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

      const endpoint = this.getEndpoint()
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          temperature: 0.1,
          max_tokens: 1024
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

        const msg = errorData.error?.message || errorData.message || errorText

        if (response.status === 401 || response.status === 403) {
          return {
            success: false,
            provider: this.id,
            model: this.config.model,
            errorCode: 'AUTHENTICATION_ERROR',
            error: `NVIDIA API authentication failed (${response.status}): ${msg}`,
            retryable: false,
            durationMs
          }
        }

        if (response.status === 404) {
          return {
            success: false,
            provider: this.id,
            model: this.config.model,
            errorCode: 'MODEL_UNSUPPORTED',
            error: `NVIDIA model "${this.config.model}" not found or unsupported at ${endpoint}: ${msg}. Live execution blocked pending valid model configuration.`,
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
            error: `NVIDIA API rate limit or quota exceeded: ${msg}`,
            retryable: false,
            durationMs
          }
        }

        return {
          success: false,
          provider: this.id,
          model: this.config.model,
          errorCode: 'PROVIDER_ERROR',
          error: `NVIDIA API returned error (${response.status}): ${msg}`,
          retryable: response.status >= 500,
          durationMs
        }
      }

      const data = await response.json()
      const rawText = data.choices?.[0]?.message?.content || ''

      // Clean markdown code blocks if the model wrapped JSON in ```json ... ```
      let jsonText = rawText.trim()
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }

      let content
      try {
        content = JSON.parse(jsonText)
      } catch (parseErr) {
        return {
          success: false,
          provider: this.id,
          model: this.config.model,
          errorCode: 'MALFORMED_JSON',
          error: `NVIDIA provider returned non-JSON content: ${parseErr.message}`,
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
          error: `NVIDIA API request timed out after ${timeout}ms`,
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

export const nvidiaProvider = new NvidiaProvider()
