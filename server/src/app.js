import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { config } from './config/env.js'
import { apiLimiter } from './middleware/rateLimiter.js'
import { authenticateUser } from './middleware/authMiddleware.js'
import { errorHandler } from './middleware/errorHandler.js'
import healthRoutes from './routes/healthRoutes.js'
import scholarshipRoutes from './routes/scholarshipRoutes.js'
import documentRoutes from './routes/documentRoutes.js'
import auditRoutes from './routes/auditRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import persistenceRoutes from './routes/persistenceRoutes.js'

const app = express()

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// Explicit CORS with Vercel, Cloudflare Pages Staging & Localhost Support
const configuredOrigins = (config.clientUrl || 'http://localhost:5173')
  .split(',')
  .map(url => url.trim().replace(/\/+$/, ''))

const allowedOrigins = [...new Set([
  ...configuredOrigins,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
])]

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile, curl, server-to-server)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin) || origin.endsWith('.pages.dev') || origin.endsWith('.vercel.app')) {
      return callback(null, true)
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// JSON & URL-encoded Body Parsers
app.use(express.json({ limit: '15mb' }))
app.use(express.urlencoded({ extended: true, limit: '15mb' }))

// Root Service Index & Health Discovery
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'QuestForge AI Backend Engine',
    status: 'operational',
    version: '1.0.0',
    mode: config.isDemonstrationMode ? 'Deterministic Demonstration Mode' : 'AI-Connected Mode',
    healthCheck: '/api/health',
    frontendUrl: config.clientUrl || 'https://questforge-ai-staging.vercel.app'
  })
})

// Rate limiting on /api routes
app.use('/api', apiLimiter)

// Cryptographic JWT authentication middleware for all API routes
app.use('/api', authenticateUser)

// Mount Routes
app.use('/api', healthRoutes)
app.use('/api', scholarshipRoutes)
app.use('/api', documentRoutes)
app.use('/api', auditRoutes)
app.use('/api', aiRoutes)
app.use('/api', persistenceRoutes)

// 404 handler for unmatched API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    status: 'error',
    statusCode: 404,
    message: `API endpoint ${req.method} ${req.originalUrl} not found.`
  })
})

// Centralized error handler
app.use(errorHandler)

export default app
