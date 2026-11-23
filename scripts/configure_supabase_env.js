import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const serverEnvPath = path.join(__dirname, '../server/.env')
const clientEnvPath = path.join(__dirname, '../client/.env')
const envContent = fs.readFileSync(serverEnvPath, 'utf8')

const tokenMatch = envContent.match(/SUPABASE_ACCESS_TOKEN=(.+)/)
if (!tokenMatch) {
  console.error('SUPABASE_ACCESS_TOKEN not found in server/.env')
  process.exit(1)
}
const token = tokenMatch[1].trim()
const PROJECT_REF = 'bwllksfjjxmumrrqaifa'
const PROJECT_URL = `https://${PROJECT_REF}.supabase.co`

async function run() {
  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch api-keys: HTTP ${res.status}`)
    }

    const keys = await res.json()
    // Identify anon and service_role
    let anonKey = null
    let serviceRoleKey = null

    for (const k of keys) {
      if (k.name === 'anon' || k.tags === 'anon') {
        anonKey = k.api_key
      } else if (k.name === 'service_role' || k.tags === 'service_role') {
        serviceRoleKey = k.api_key
      }
    }

    if (!anonKey) {
      throw new Error('Could not identify anon key from API response')
    }
    if (!serviceRoleKey) {
      throw new Error('Could not identify service_role key from API response')
    }

    // 1. Update server/.env
    let currentServerEnv = fs.readFileSync(serverEnvPath, 'utf8')
    // Replace existing SUPABASE_URL=... or append
    if (currentServerEnv.includes('SUPABASE_URL=')) {
      currentServerEnv = currentServerEnv.replace(/^SUPABASE_URL=.*/m, `SUPABASE_URL=${PROJECT_URL}`)
    } else {
      currentServerEnv += `\nSUPABASE_URL=${PROJECT_URL}`
    }

    if (currentServerEnv.includes('SUPABASE_ANON_KEY=')) {
      currentServerEnv = currentServerEnv.replace(/^SUPABASE_ANON_KEY=.*/m, `SUPABASE_ANON_KEY=${anonKey}`)
    } else {
      currentServerEnv += `\nSUPABASE_ANON_KEY=${anonKey}`
    }

    if (currentServerEnv.includes('SUPABASE_SERVICE_ROLE_KEY=')) {
      currentServerEnv = currentServerEnv.replace(/^SUPABASE_SERVICE_ROLE_KEY=.*/m, `SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}`)
    } else {
      currentServerEnv += `\nSUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}`
    }

    fs.writeFileSync(serverEnvPath, currentServerEnv, 'utf8')
    console.log('[PASS] server/.env configured with SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY')

    // 2. Write client/.env (ONLY VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY - NEVER service_role)
    const clientEnvContent = `# QuestForge AI Client Supabase Configuration
VITE_SUPABASE_URL=${PROJECT_URL}
VITE_SUPABASE_ANON_KEY=${anonKey}
`
    fs.writeFileSync(clientEnvPath, clientEnvContent, 'utf8')
    console.log('[PASS] client/.env configured with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (no secret keys)')

    // 3. Double-check client/.env does not contain serviceRoleKey
    const writtenClient = fs.readFileSync(clientEnvPath, 'utf8')
    if (writtenClient.includes(serviceRoleKey)) {
      throw new Error('FATAL SECURITY VIOLATION: serviceRoleKey found in client/.env!')
    }
    console.log('[SECURITY VERIFIED] Client environment contains ZERO service role or administrative secrets.')

  } catch (err) {
    console.error('Configuration error:', err.message)
    process.exit(1)
  }
}

run()
