import express from 'express'
import {
  runAudit,
  getAuditById,
  getDashboard,
  getReport
} from '../controllers/auditController.js'

const router = express.Router()

router.post('/audit/run', runAudit)
router.get('/audit/:id', getAuditById)
router.get('/dashboard', getDashboard)
router.get('/reports/:id', getReport)

export default router
