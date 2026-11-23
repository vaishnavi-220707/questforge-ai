import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck, KeyRound, RefreshCw } from 'lucide-react'
import { SpatialCard } from '../components/common/SpatialCard'
import { useAuth } from '../context/AuthContext'

export function RegisterPage() {
  const { signUp, isConfigured } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please complete all required fields.')
      return
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await signUp({ email, password, fullName })
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-14 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-navy-900 border border-cyan-500/30 text-[10px] font-mono text-cyan-400 tracking-widest uppercase">
          <ShieldCheck className="w-3 h-3" />
          <span>USER ENROLLMENT</span>
        </div>
        <h1 className="text-2xl font-headline font-bold text-white tracking-tight">
          Create Student Account
        </h1>
        <p className="text-xs text-slate-400 font-sans">
          Register to maintain permanent audit history and multi-scholarship tracking.
        </p>
      </div>

      {!isConfigured && (
        <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-800/50 text-[11px] text-amber-300 space-y-1.5 font-mono">
          <div className="flex items-center space-x-1.5 font-semibold text-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Supabase Cloud Auth Unconfigured</span>
          </div>
          <p className="text-amber-300/80 leading-relaxed font-sans text-xs">
            To enable production account registration, configure <code className="text-amber-200 bg-navy-950 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> and <code className="text-amber-200 bg-navy-950 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code>. You can explore all document verification features in guest mode.
          </p>
        </div>
      )}

      <SpatialCard title="Account Details" glow>
        {success ? (
          <div className="py-8 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-base font-headline font-bold text-white">Registration Submitted</h3>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              If email confirmation is required by your Supabase project settings, please check your inbox to activate your account.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-headline font-semibold text-xs uppercase tracking-wider"
            >
              <span>Proceed to Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
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
              <label className="text-slate-300 block uppercase font-semibold text-[10px]">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-navy-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 block uppercase font-semibold text-[10px]">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@institution.edu"
                  className="w-full bg-navy-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 block uppercase font-semibold text-[10px]">Password * (Min 8 Characters)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-navy-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 block uppercase font-semibold text-[10px]">Confirm Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-navy-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                  autoComplete="new-password"
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
                  <span>Registering Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-5 pt-4 border-t border-slate-800 text-center text-xs font-sans text-slate-400">
          <span>Already registered? </span>
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold font-mono">
            Sign in here
          </Link>
        </div>
      </SpatialCard>
    </div>
  )
}
