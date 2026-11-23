import React, { useEffect, useState } from 'react'
import { Cpu, CheckCircle2, XCircle, AlertCircle, RefreshCw, KeyRound, ShieldAlert } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function StatusBadge({ status }) {
  if (status === 'READY' || status === 'AUTHENTICATED' || status === 'VERIFIED') {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-400 border border-emerald-800">
        Authenticated & Ready
      </span>
    )
  }
  if (status === 'CONFIGURED') {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-cyan-950 text-cyan-400 border border-cyan-800">
        Configured (Untested)
      </span>
    )
  }
  if (status === 'AUTH_FAILED') {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-950 text-rose-400 border border-rose-800">
        Auth Failed
      </span>
    )
  }
  if (status === 'BILLING_REQUIRED') {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-950 text-amber-300 border border-amber-700" title="Key authenticated; Google Cloud project billing required for generation">
        Billing Required
      </span>
    )
  }
  if (status === 'MODEL_UNAVAILABLE') {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-950 text-rose-400 border border-rose-800">
        Model Unavailable
      </span>
    )
  }
  if (status === 'RATE_LIMITED' || status === 'COOLDOWN') {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-950 text-amber-400 border border-amber-800">
        Rate Limited / Cooldown
      </span>
    )
  }
  if (status === 'TEMPORARILY_UNAVAILABLE') {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-950 text-amber-400 border border-amber-800">
        Temporarily Unavailable
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
      Unconfigured
    </span>
  )
}

function ProviderRow({ provider, priorityIndex, isPrimary }) {
  const { name, isConfigured, model, status, cooldownRemainingSeconds } = provider

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 border-b border-slate-800 last:border-0 gap-2">
      <div className="flex items-center space-x-2.5">
        {isConfigured ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        ) : (
          <XCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />
        )}
        <div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-semibold ${isConfigured ? 'text-white' : 'text-slate-400'}`}>
              {name}
            </span>
            {isPrimary && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Primary
              </span>
            )}
            <span className="text-[11px] text-slate-500">
              Priority {priorityIndex + 1}
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            Model: {model || 'default'}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 self-start sm:self-center">
        {cooldownRemainingSeconds > 0 && (
          <span className="text-[10px] text-amber-400 font-mono">
            Retry in {cooldownRemainingSeconds}s
          </span>
        )}
        <StatusBadge status={status} />
      </div>
    </div>
  )
}

export function AIStatusPanel() {
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState(null)
  const [testFeedback, setTestFeedback] = useState(null)

  const fetchStatus = () => {
    setLoading(true)
    setError(null)
    fetch(`${API_BASE}/api/ai/status`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(json => {
        const payload = json.data || json
        setInfo(payload)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message || 'Failed to reach backend API')
        setLoading(false)
      })
  }

  const runLiveTest = () => {
    setTesting(true)
    setTestFeedback(null)
    fetch(`${API_BASE}/api/ai/test`, { method: 'POST' })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(json => {
        setTestFeedback(json.data?.testResults || null)
        fetchStatus()
        setTesting(false)
      })
      .catch(err => {
        setError('Verification test failed: ' + err.message)
        setTesting(false)
      })
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const priorityOrder = info?.priorityOrder || ['gemini', 'groq', 'nvidia']
  const providersObj = info?.providers || {}
  const providerList = priorityOrder
    .map(id => providersObj[id])
    .filter(Boolean)

  const configuredCount = providerList.filter(p => p.isConfigured).length
  const totalCount = providerList.length

  return (
    <div className="relative rounded-xl bg-navy-900/80 backdrop-blur-md border border-slate-800/90 hover:border-cyan-500/30 p-5 sm:p-6 space-y-4">
      {/* Corner Brackets */}
      <span className="absolute top-1.5 left-2 font-mono text-[9px] text-cyan-500/40 select-none">+</span>
      <span className="absolute top-1.5 right-2 font-mono text-[9px] text-cyan-500/40 select-none">+</span>
      <span className="absolute bottom-1.5 left-2 font-mono text-[9px] text-cyan-500/40 select-none">+</span>
      <span className="absolute bottom-1.5 right-2 font-mono text-[9px] text-cyan-500/40 select-none">+</span>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-navy-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-headline font-semibold text-white">AI Provider Infrastructure</h3>
            <p className="text-[11px] font-mono text-slate-400">Multi-provider failover: Gemini &rarr; Groq &rarr; NVIDIA NIM</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {configuredCount > 0 && (
            <button
              onClick={runLiveTest}
              disabled={testing || loading}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs text-cyan-400 hover:text-white bg-cyan-950/40 border border-cyan-500/40 hover:border-cyan-400 rounded transition font-mono"
              title="Execute minimal live synthetic verification probe"
            >
              <RefreshCw className={`w-3 h-3 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Probing...' : 'Verify Live Connectivity'}</span>
            </button>
          )}

          <button
            onClick={fetchStatus}
            disabled={loading || testing}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-white bg-navy-950 border border-slate-800 hover:border-slate-700 rounded transition"
            title="Refresh AI Provider Status"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {loading && !info && (
        <div className="py-4 text-center text-xs text-slate-500">
          Querying backend AI provider status...
        </div>
      )}

      {error && (
        <div className="flex items-start space-x-2.5 p-3 rounded bg-amber-950/20 border border-amber-900/40 text-xs text-amber-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Unable to fetch AI status:</span> {error}
            <p className="text-[11px] text-amber-400/80 mt-0.5">
              Ensure the backend server is running on <code className="font-mono bg-navy-950 px-1 py-0.5 rounded">{API_BASE}</code>.
            </p>
          </div>
        </div>
      )}

      {info && (
        <>
          <div className="flex items-center justify-between text-xs p-3 rounded bg-navy-950 border border-slate-800/80">
            <div>
              <span className="text-slate-400">Operating Mode: </span>
              {info.anyConfigured ? (
                <span className="text-emerald-400 font-semibold">Active AI Mode ({configuredCount}/{totalCount} Configured)</span>
              ) : (
                <span className="text-amber-400 font-semibold">Demonstration Mode (Deterministic Rules)</span>
              )}
            </div>
            <div className="text-slate-400">
              Failover: <span className={info.failoverEnabled ? 'text-teal-400' : 'text-slate-500'}>
                {info.failoverEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          {testFeedback && (
            <div className="p-3 rounded bg-navy-950/80 border border-cyan-500/30 text-xs space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-cyan-400 font-semibold">
                <span>Live Verification Probe Results:</span>
                <span className="text-[10px] text-slate-400">Just now</span>
              </div>
              {Object.entries(testFeedback).map(([id, res]) => (
                <div key={id} className="flex items-center justify-between text-[11px] py-0.5 border-b border-slate-800/50 last:border-0">
                  <span className="text-slate-300 capitalize font-medium">{id}:</span>
                  <span className={res.success ? 'text-emerald-400' : 'text-rose-400'}>
                    {res.status} {res.durationMs ? `(${res.durationMs}ms)` : ''} {res.error ? `// ${res.error}` : ''}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="divide-y divide-slate-800">
            {providerList.map((p, idx) => (
              <ProviderRow
                key={p.id}
                provider={p}
                priorityIndex={idx}
                isPrimary={p.id === info.primaryProvider}
              />
            ))}
          </div>

          {providerList.some(p => p.status === 'BILLING_REQUIRED') && (
            <div className="p-3 rounded bg-amber-950/30 border border-amber-800/50 text-[11px] text-amber-300 space-y-1">
              <div className="flex items-center space-x-1.5 font-medium text-amber-200">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Google Gemini Billing Entitlement Notice:</span>
              </div>
              <p className="leading-relaxed text-amber-300/90">
                The Gemini API key is valid and authenticated. However, Google Cloud requires billing enabled for the linked GCP project to generate content (<a href="https://aistudio.google.com/billing" target="_blank" rel="noreferrer" className="underline hover:text-white font-mono">aistudio.google.com/billing</a>). QuestForge AI's automatic multi-provider failover seamlessly uses Groq and NVIDIA NIM.
              </p>
            </div>
          )}

          <div className="p-3 rounded bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center space-x-1.5 font-medium text-slate-300">
              <KeyRound className="w-3.5 h-3.5 text-teal-400" />
              <span>How to add your API credentials:</span>
            </div>
            <p className="leading-relaxed">
              Open <code className="font-mono text-teal-300 bg-navy-950 px-1 py-0.5 rounded">server/.env</code> and supply your keys for{' '}
              <code className="font-mono text-slate-300">GEMINI_API_KEY</code>,{' '}
              <code className="font-mono text-slate-300">GROQ_API_KEY</code>, or{' '}
              <code className="font-mono text-slate-300">NVIDIA_API_KEY</code>.
              Restart the backend to activate. In demonstration mode, standard OCR and deterministic rules operate without any external API keys.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
