import express from 'express'
import { getAllScholarships, getScholarshipById } from '../controllers/scholarshipController.js'

const router = express.Router()

router.get('/scholarships', getAllScholarships)
router.get('/scholarships/:id', getScholarshipById)

export default router
