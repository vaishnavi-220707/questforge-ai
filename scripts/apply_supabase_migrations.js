import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '../server/.env')
const envContent = fs.readFileSync(envPath, 'utf8')

const tokenMatch = envContent.match(/SUPABASE_ACCESS_TOKEN=(.+)/)
if (!tokenMatch) {
  console.error('SUPABASE_ACCESS_TOKEN not found in server/.env')
  process.exit(1)
}
const token = tokenMatch[1].trim()
const PROJECT_REF = 'bwllksfjjxmumrrqaifa'

async function applyMigration(name, sql) {
  console.log(`Applying migration: ${name}...`)
  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/migrations`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: name,
      query: sql
    })
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Migration ${name} failed with HTTP ${res.status}: ${errorText}`)
  }

  const data = await res.json()
  console.log(`[PASS] Migration ${name} applied successfully!`)
  return data
}

async function verifyTables() {
  const checkSql = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: checkSql })
  })
  return await res.json()
}

async function verifyPolicies() {
  const checkSql = `
    SELECT tablename, policyname, permissive, roles, cmd 
    FROM pg_policies 
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname;
  `
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: checkSql })
  })
  return await res.json()
}

async function run() {
  try {
    // 1. Read Migration 001
    const sql1 = fs.readFileSync(path.join(__dirname, '../server/src/db/migrations/001_initial_schema.sql'), 'utf8')
    await applyMigration('001_initial_schema', sql1)

    // 2. Read Migration 002
    const sql2 = fs.readFileSync(path.join(__dirname, '../server/src/db/migrations/002_row_level_security.sql'), 'utf8')
    await applyMigration('002_row_level_security', sql2)

    // 3. Verify created tables
    const tables = await verifyTables()
    console.log('\n--- VERIFIED PUBLIC TABLES (' + tables.length + ' tables) ---')
    tables.forEach(t => console.log(`  - ${t.table_name}`))

    // 4. Verify RLS policies
    const policies = await verifyPolicies()
    console.log(`\n--- VERIFIED RLS POLICIES (${policies.length} total) ---`)
    policies.forEach(p => console.log(`  - [${p.tablename}] "${p.policyname}" (${p.cmd})`))

    console.log('\nAll migrations executed and verified cleanly in Mumbai project bwllksfjjxmumrrqaifa!')
  } catch (err) {
    console.error('Migration error:', err.message)
    process.exit(1)
  }
}

run()
