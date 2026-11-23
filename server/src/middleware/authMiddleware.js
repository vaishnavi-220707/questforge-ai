import { supabaseService } from '../services/supabaseService.js'

/**
 * Middleware: authenticateUser
 * Inspects incoming Authorization header for Supabase Bearer JWT token.
 * Validates cryptographic signature against Supabase Auth.
 * Populates req.user with verified user identity.
 * Rejects invalid/malformed tokens with 401.
 * Allows anonymous requests through with req.user = null for guest/demonstration paths.
 */
export async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers['authorization']
    
    // Explicitly strip any untrusted client-supplied identity overrides
    delete req.headers['x-user-id']
    req.user = null

    if (!authHeader) {
      return next()
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Malformed authorization header. Expected "Bearer <token>".'
      })
    }

    const token = authHeader.substring(7).trim()
    if (!token) {
      return res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Empty bearer token provided.'
      })
    }

    // Verify token cryptographically via Supabase Auth
    const user = await supabaseService.getUserFromToken(token)
    if (!user) {
      return res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Invalid, expired, or revoked authentication token.'
      })
    }

    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}

/**
 * Middleware: requireUser
 * Strictly requires an authenticated user identity.
 */
export function requireUser(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      statusCode: 401,
      message: 'Authentication required. Please log in to perform this operation.'
    })
  }
  next()
}
