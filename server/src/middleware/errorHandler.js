export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  // Log detailed error in non-test environments
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[ERROR] ${req.method} ${req.url} - ${statusCode}: ${message}`)
    if (err.stack && process.env.NODE_ENV === 'development') {
      console.error(err.stack)
    }
  }

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}
