import express from 'express'
import { upload } from '../middleware/uploadMiddleware.js'
import {
  uploadAndProcessDocuments,
  updateDocumentCategory,
  getDocumentById
} from '../controllers/documentController.js'

const router = express.Router()

router.post('/documents/upload', upload.array('documents', 10), uploadAndProcessDocuments)
router.patch('/documents/:id/category', updateDocumentCategory)
router.get('/documents/:id', getDocumentById)

export default router
