import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

export const AI_PROVIDERS_CONFIG = {
  // Provider 1: Google Gemini
  gemini: {
    name: 'Google Gemini',
    id: 'gemini',
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    isConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ''),
  },

  // Provider 2: Groq
  groq: {
    name: 'Groq Cloud',
    id: 'groq',
    apiKey: process.env.GROQ_API_KEY || '',
    model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
    isConfigured: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== ''),
  },

  // Provider 3: NVIDIA NeMoTron (NVIDIA NIM)
  nvidia: {
    name: 'NVIDIA NeMoTron 3 Ultra',
    id: 'nvidia',
    apiKey: process.env.NVIDIA_API_KEY || '',
    baseUrl: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
    model: process.env.NVIDIA_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b',
    isConfigured: Boolean(process.env.NVIDIA_API_KEY && process.env.NVIDIA_API_KEY.trim() !== ''),
  },

  // Failover and Execution Settings
  primaryProvider: process.env.AI_PRIMARY_PROVIDER || 'gemini',
  failoverEnabled: process.env.AI_FAILOVER_ENABLED !== 'false',
  timeoutMs: parseInt(process.env.AI_REQUEST_TIMEOUT_MS, 10) || 45000,
  maxRetries: parseInt(process.env.AI_MAX_RETRIES, 10) || 1,
}

/**
 * Returns the ordered priority list of providers.
 * Places primaryProvider first, followed by remaining configured providers.
 */
export function getProviderPriorityList() {
  const all = ['gemini', 'groq', 'nvidia']
  const primary = (AI_PROVIDERS_CONFIG.primaryProvider || 'gemini').toLowerCase()

  const list = [primary]
  for (const p of all) {
    if (!list.includes(p)) {
      list.push(p)
    }
  }
  return list
}
