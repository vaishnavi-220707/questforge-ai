import React from 'react'
import { SpatialCard } from '../components/common/SpatialCard'

export function CookiePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest px-2.5 py-1 rounded bg-navy-900 border border-cyan-500/30">
            COMPLIANCE & COOKIES
          </span>
          <span className="text-xs font-mono text-slate-400">Effective Date: November 2026</span>
        </div>
        <h1 className="text-3xl font-headline font-bold text-white tracking-tight">
          Cookie Policy
        </h1>
        <p className="text-sm text-slate-300 font-sans leading-relaxed">
          Information regarding cookie usage and client-side storage within QuestForge AI.
        </p>
      </div>

      <div className="space-y-6 text-xs text-slate-300 leading-relaxed font-sans">
        <SpatialCard title="1. Strictly Functional Session Operation" className="space-y-2" cornerMarkers={false}>
          <p>
            QuestForge AI does not utilize third-party advertising cookies, cross-site trackers, or commercial telemetry beacons.
          </p>
          <p>
            The application operates as a Single-Page Application (SPA) where session state is maintained in local application memory to coordinate multi-step document uploads and audit result views.
          </p>
        </SpatialCard>

        <SpatialCard title="2. Local Storage and Session Tokens" className="space-y-2" cornerMarkers={false}>
          <p>
            The platform uses client-side web storage exclusively for strictly functional application purposes:
          </p>
          <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-slate-300">
            <li><strong className="text-cyan-300">Supabase Auth Session Token:</strong> When user accounts are enabled, authentication tokens (<code className="text-slate-200">sb-*-auth-token</code>) are stored in browser local storage to maintain your authenticated session.</li>
            <li><strong className="text-cyan-300">Application Preferences:</strong> Browser local storage preserves functional preferences such as your active 3D cursor setting and filter states.</li>
            <li><strong className="text-cyan-300">Demonstration Session Ledger:</strong> In unconfigured demonstration mode, uploaded document metadata exists only in volatile memory during the browser session.</li>
          </ul>
        </SpatialCard>

        <SpatialCard title="3. Managing Local Data" className="space-y-2" cornerMarkers={false}>
          <p>
            You can clear browser local storage and cache at any time through your browser settings. Clearing local data will not affect the operation of the verification engine upon your next visit.
          </p>
        </SpatialCard>
      </div>
    </div>
  )
}
