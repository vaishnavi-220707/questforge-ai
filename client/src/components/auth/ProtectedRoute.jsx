import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { user, loading, isConfigured } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 font-mono">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin mb-3" />
        <p className="text-xs text-slate-400 tracking-wider">Verifying Session Authorization...</p>
      </div>
    )
  }

  // When Supabase is configured, enforce strict authentication
  if (isConfigured && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // In unconfigured demonstration mode, allow access with demo notice
  return (
    <>
      {!isConfigured && (
        <div className="bg-amber-950/40 border-b border-amber-900/50 px-4 py-2 text-center text-xs font-mono text-amber-300">
          <span>Demonstration Session Mode: Cloud authentication unconfigured. Access granted under guest preview privileges.</span>
        </div>
      )}
      {children}
    </>
  )
}
