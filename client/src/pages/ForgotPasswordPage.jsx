import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, KeyRound, RefreshCw } from 'lucide-react'
import { SpatialCard } from '../components/common/SpatialCard'
import { useAuth } from '../context/AuthContext'

export function ForgotPasswordPage() {
  const { resetPassword, isConfigured } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Please provide your registered email address.')
      return
    }

    setLoading(true)
    try {
      await resetPassword(email)
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Failed to dispatch recovery email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-navy-900 border border-cyan-500/30 text-[10px] font-mono text-cyan-400 tracking-widest uppercase">
          <KeyRound className="w-3 h-3" />
          <span>CREDENTIAL RECOVERY</span>
        </div>
        <h1 className="text-2xl font-headline font-bold text-white tracking-tight">
          Reset Password
        </h1>
        <p className="text-xs text-slate-400 font-sans">
          Enter your email address to receive a secure password recovery link.
        </p>
      </div>

      <SpatialCard title="Password Recovery" glow>
        {submitted ? (
          <div className="py-6 text-center space-y-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-headline font-bold text-white">Recovery Link Dispatched</h3>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              If an account is associated with <code className="text-cyan-300 font-mono">{email}</code>, an activation link has been sent.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            {error && (
              <div className="p-3 bg-rose-950/40 border border-rose-900 rounded-lg text-rose-200 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-slate-300 block uppercase font-semibold text-[10px]">Registered Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@institution.edu"
                  className="w-full bg-navy-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-navy-950 font-headline font-semibold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.25)] transition-all mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Send Recovery Instructions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-5 pt-4 border-t border-slate-800 text-center text-xs font-sans text-slate-400">
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-mono inline-flex items-center space-x-1">
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Login</span>
          </Link>
        </div>
      </SpatialCard>
    </div>
  )
}
