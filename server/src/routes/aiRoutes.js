import express from 'express'
import { aiProviderManager } from '../services/aiProviderManager.js'

const router = express.Router()

/**
 * GET /api/ai/status
 * Returns sanitized status and health information for all configured AI providers.
 * Strictly avoids leaking secret API keys or internal infrastructure credentials.
 */
router.get('/ai/status', (req, res) => {
  const status = aiProviderManager.getStatus()
  res.status(200).json({
    status: 'success',
    data: status
  })
})

/**
 * POST /api/ai/test
 * Triggers a minimal live verification probe for all configured AI providers.
 */
router.post('/ai/test', async (req, res) => {
  try {
    const results = await aiProviderManager.testAllConfiguredProviders()
    const updatedStatus = aiProviderManager.getStatus()
    res.status(200).json({
      status: 'success',
      data: {
        testResults: results,
        providers: updatedStatus.providers
      }
    })
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to execute provider verification probes: ' + err.message
    })
  }
})

/**
 * POST /api/ai/test/:providerId
 * Triggers a minimal live verification probe for a specific provider.
 */
router.post('/ai/test/:providerId', async (req, res) => {
  const { providerId } = req.params
  try {
    const result = await aiProviderManager.testProvider(providerId)
    const updatedStatus = aiProviderManager.getStatus()
    res.status(200).json({
      status: 'success',
      data: {
        testResult: result,
        provider: updatedStatus.providers[providerId]
      }
    })
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: `Failed to test provider ${providerId}: ${err.message}`
    })
  }
})

export default router
