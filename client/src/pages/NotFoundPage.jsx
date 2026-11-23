import React from 'react'
import { Link } from 'react-router-dom'
import { FileQuestion, ArrowLeft, Compass, AlertCircle } from 'lucide-react'
import { SpatialCard } from '../components/common/SpatialCard'

export function NotFoundPage() {
  React.useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]')
    const originalContent = meta ? meta.getAttribute('content') : 'index, follow'
    if (meta) {
      meta.setAttribute('content', 'noindex, nofollow')
    }
    return () => {
      if (meta) meta.setAttribute('content', originalContent)
    }
  }, [])

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <SpatialCard glow className="max-w-md w-full text-center space-y-6 p-8">
        <div className="w-16 h-16 rounded-2xl bg-navy-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto shadow-[0_0_24px_rgba(0,240,255,0.2)]">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest px-2.5 py-1 rounded bg-navy-950 border border-cyan-500/20">
            ERROR 404 // INVALID_ROUTE
          </span>
          <h1 className="text-3xl font-headline font-bold text-white tracking-tight pt-2">
            Page Not Found
          </h1>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            The verification route or document enclave you requested does not exist or has been relocated within the architecture.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-mono bg-navy-950 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-mono bg-navy-950 border border-slate-700 hover:border-cyan-400 text-white transition-colors"
          >
            <span>Home</span>
          </Link>
          <Link
            to="/scholarships"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-headline font-semibold uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-navy-950 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explorer</span>
          </Link>
        </div>
      </SpatialCard>
    </div>
  )
}
