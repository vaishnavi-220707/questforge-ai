import express from 'express'
import crypto from 'crypto'
import { supabaseService } from '../services/supabaseService.js'

const router = express.Router()

/**
 * GET /api/persistence/status
 * Returns sanitized persistence status, cloud DB configuration, and mode info.
 */
router.get('/persistence/status', (req, res) => {
  const status = supabaseService.getStatus()
  res.status(200).json({
    status: 'success',
    data: status
  })
})

/**
 * POST /api/contact
 * Handles academic inquiries and course evaluation feedback.
 * Persists to Supabase when configured, or demonstration ledger when in session mode.
 */
router.post('/contact', async (req, res) => {
  const { name, email, topic, message } = req.body

  // Validation
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Name is required.'
    })
  }

  if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({
      status: 'error',
      message: 'A valid email address is required.'
    })
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Message content is required.'
    })
  }

  // Hash IP address for privacy-compliant anti-abuse tracking
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || ''
  const ipHash = clientIp ? crypto.createHash('sha256').update(clientIp).digest('hex').slice(0, 16) : null

  try {
    const result = await supabaseService.saveContactSubmission({
      name: name.trim().slice(0, 100),
      email: email.trim().toLowerCase().slice(0, 150),
      topic: (topic || 'General Inquiry').trim().slice(0, 100),
      message: message.trim().slice(0, 3000),
      ipHash
    })

    res.status(200).json({
      status: 'success',
      data: {
        id: result.id,
        savedToLedger: result.savedToLedger,
        storage: result.storage,
        emailDelivery: 'DISABLED_UNCONFIGURED',
        emailNotice: 'Direct SMTP/email dispatch is unconfigured in this environment. Your inquiry has been securely registered in the application ledger.',
        timestamp: new Date().toISOString()
      }
    })
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to process inquiry: ' + err.message
    })
  }
})

export default router
