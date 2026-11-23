import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Shield, Database, Download, Trash2, LogOut, CheckCircle2, AlertCircle, RefreshCw, KeyRound, HardDrive } from 'lucide-react'
import { SpatialCard } from '../components/common/SpatialCard'
import { useAuth } from '../context/AuthContext'
import { fetchDashboardData, fetchPersistenceStatus } from '../services/api'

export function ProfilePage() {
  const { user, signOut, isConfigured } = useAuth()
  const navigate = useNavigate()
  const [persistenceInfo, setPersistenceInfo] = useState(null)
  const [purged, setPurged] = useState(false)

  useEffect(() => {
    fetchPersistenceStatus()
      .then(json => setPersistenceInfo(json.data))
      .catch(() => {})
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const handleExportData = () => {
    fetchDashboardData()
      .then(json => {
        const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `questforge-audit-export-${new Date().toISOString().slice(0, 10)}.json`
        a.click()
        URL.revokeObjectURL(url)
      })
      .catch(() => alert('Failed to export audit data.'))
  }

  const handlePurgeData = () => {
    if (window.confirm('Are you sure you want to purge your active session data? This will reset all current in-session demonstration audits.')) {
      setPurged(true)
      setTimeout(() => setPurged(false), 4000)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest px-2.5 py-1 rounded bg-navy-900 border border-cyan-500/30">
            STUDENT PROFILE & DATA CONTROL
          </span>
          <span className="text-xs font-mono text-slate-400">Security & Preferences</span>
        </div>
        <h1 className="text-3xl font-headline font-bold text-white tracking-tight">
          Account & Privacy Settings
        </h1>
        <p className="text-sm text-slate-300 font-sans leading-relaxed">
          Manage your student profile, cloud database persistence, and document privacy preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Identity Card */}
        <div className="space-y-4">
          <SpatialCard title="Student Identity" glow>
            <div className="text-center py-4 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-navy-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto shadow-[0_0_20px_rgba(0,240,255,0.15)]">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-headline font-bold text-white">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Demonstration Student'}
                </h3>
                <p className="text-xs font-mono text-slate-400">{user?.email || 'guest@demonstration.local'}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                  <Shield className="w-3 h-3" />
                  <span>{user ? 'Authenticated Session' : 'Guest Demonstration Mode'}</span>
                </span>
              </div>
            </div>

            {user && (
              <button
                onClick={handleSignOut}
                className="w-full mt-2 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 text-xs font-mono transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </SpatialCard>
        </div>

        {/* Persistence & Privacy Details */}
        <div className="md:col-span-2 space-y-6">
          <SpatialCard title="Persistence & Database Architecture">
            <div className="space-y-4 text-xs font-mono">
              <div className="flex items-start justify-between p-3 rounded-lg bg-navy-950 border border-slate-800">
                <div className="space-x-2 flex items-start">
                  <HardDrive className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-white block font-sans">Storage Architecture</strong>
                    <span className="text-slate-400 text-[11px]">
                      {persistenceInfo?.storageType || 'In-Memory Session Repository Fallback'}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] ${persistenceInfo?.isConfigured ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'}`}>
                  {persistenceInfo?.isConfigured ? 'Cloud Connected' : 'Session Memory'}
                </span>
              </div>

              <p className="text-slate-300 font-sans text-xs leading-relaxed">
                {persistenceInfo?.note || 'Operating in high-fidelity in-memory session mode. When Supabase credentials are provided, audit records persist permanently.'}
              </p>
            </div>
          </SpatialCard>

          <SpatialCard title="Data Control & DPDP Principles">
            <div className="space-y-4 text-xs font-sans">
              <p className="text-slate-300 leading-relaxed">
                In compliance with data minimization and the Digital Personal Data Protection (DPDP) principles, QuestForge AI processes document buffers strictly in volatile memory. Only explicit factual fields required for eligibility checks are retained.
              </p>

              {purged && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded-lg text-emerald-300 flex items-center space-x-2 font-mono text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Session ledger cleared successfully.</span>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExportData}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-navy-950 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-mono transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Audit Data (JSON)</span>
                </button>

                <button
                  type="button"
                  onClick={handlePurgeData}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-navy-950 border border-rose-900/50 hover:border-rose-500 text-rose-400 text-xs font-mono transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge Local History</span>
                </button>
              </div>
            </div>
          </SpatialCard>
        </div>
      </div>
    </div>
  )
}
