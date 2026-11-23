import app from './app.js'
import { config, validateEnv } from './config/env.js'

const { warnings } = validateEnv()

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`=======================================================`)
  console.log(` QuestForge AI Server is running on port ${config.port}`)
  console.log(` Mode: ${config.isDemonstrationMode ? 'Deterministic Demonstration Mode' : 'AI-Connected Mode'}`)
  console.log(` Environment: ${config.env}`)
  console.log(` Client URL: ${config.clientUrl}`)
  if (warnings.length > 0) {
    console.log(` Warnings:`)
    warnings.forEach(w => console.log(`   - ${w}`))
  }
  console.log(`=======================================================`)
})

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...')
  server.close(() => {
    console.log('Process terminated.')
  })
})
