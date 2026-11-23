import multer from 'multer'
import { config } from '../config/env.js'

// Using memory storage for secure processing without leaving unencrypted files on disk
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
  if (allowed.includes(file.mimetype.toLowerCase())) {
    cb(null, true)
  } else {
    const error = new Error(`Unsupported file type: ${file.mimetype}. Only PDF, JPG, and PNG documents are supported.`)
    error.statusCode = 400
    cb(error, false)
  }
}

export const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSizeMb * 1024 * 1024 // 10 MB
  },
  fileFilter
})
