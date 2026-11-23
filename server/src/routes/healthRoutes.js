import express from 'express'
import { config, validateEnv } from '../config/env.js'

const router = express.Router()

router.get('/health', (req, res) => {
  const { warnings } = validateEnv()
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'QuestForge AI Backend Engine',
    version: '1.0.0',
    mode: config.isDemonstrationMode ? 'Deterministic Demonstration Mode' : 'AI-Connected Mode',
    warnings: warnings.length > 0 ? warnings : undefined
  })
})

export default router
