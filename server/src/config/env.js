import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { AI_PROVIDERS_CONFIG } from './aiProviders.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  // Database
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',

  // File constraints
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10,
  allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'application/pdf,image/jpeg,image/png').split(','),

  // Multi-Provider AI status
  isDemonstrationMode: !AI_PROVIDERS_CONFIG.gemini.isConfigured &&
                       !AI_PROVIDERS_CONFIG.groq.isConfigured &&
                       !AI_PROVIDERS_CONFIG.nvidia.isConfigured
}

export function validateEnv() {
  const warnings = []
  const configuredProviders = []

  if (AI_PROVIDERS_CONFIG.gemini.isConfigured) configuredProviders.push('Google Gemini')
  if (AI_PROVIDERS_CONFIG.groq.isConfigured) configuredProviders.push('Groq Cloud')
  if (AI_PROVIDERS_CONFIG.nvidia.isConfigured) configuredProviders.push('NVIDIA NeMoTron')

  if (configuredProviders.length === 0) {
    warnings.push('No AI API keys configured. Running in High-Fidelity Deterministic Demonstration Mode.')
  } else {
    warnings.push(`AI Providers active: ${configuredProviders.join(', ')} (Primary: ${AI_PROVIDERS_CONFIG.primaryProvider})`)
  }

  if (!config.supabaseUrl) {
    warnings.push('SUPABASE_URL is not set. Using secure in-memory/session storage fallback.')
  }

  return { valid: true, warnings, configuredProviders }
}
