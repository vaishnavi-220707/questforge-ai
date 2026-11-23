import React from 'react'
import { AlertCircle, HelpCircle, CheckCircle2, BookOpen, Wrench, FileText } from 'lucide-react'

export function FindingItem({ finding }) {
  const isActionRequired = finding.verificationStatus === 'Action Required'
  const isUnableToVerify = finding.verificationStatus === 'Unable to Verify'

  const borderClass = isActionRequired
    ? 'border-rose-500/40 bg-rose-950/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]'
    : isUnableToVerify
    ? 'border-amber-500/40 bg-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
    : 'border-slate-800 bg-navy-900/60'

  const StatusIcon = isActionRequired ? AlertCircle : isUnableToVerify ? HelpCircle : CheckCircle2
  const iconColor = isActionRequired ? 'text-rose-400' : isUnableToVerify ? 'text-amber-400' : 'text-emerald-400'

  const statusBadge = isActionRequired
    ? 'bg-rose-950 text-rose-300 border-rose-800'
    : isUnableToVerify
    ? 'bg-amber-950 text-amber-300 border-amber-800'
    : 'bg-emerald-950 text-emerald-300 border-emerald-800'

  return (
    <div className={`relative rounded-xl border p-5 sm:p-6 space-y-4 transition-all ${borderClass}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <StatusIcon className={`w-5 h-5 shrink-0 ${iconColor}`} />
          <span className="text-xs font-mono text-cyan-400 font-semibold px-2 py-0.5 rounded bg-navy-950 border border-slate-800">
            {finding.findingId}
          </span>
          <span className="text-sm font-headline font-semibold text-white">
            {finding.category.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider font-semibold ${statusBadge}`}>
            {finding.verificationStatus}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-950 text-slate-300 border border-slate-800 uppercase">
            {finding.severity} SEVERITY
          </span>
        </div>
      </div>

      <div className="text-xs text-slate-300 font-mono flex items-center space-x-2">
        <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span className="text-slate-400">Affected Document:</span>
        <span className="font-semibold text-white">{finding.relevantDocument}</span>
      </div>

      <div className="bg-navy-950/90 rounded-xl border border-slate-800/90 p-4 space-y-3 text-xs font-mono">
        <div>
          <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block mb-1">
            Detected Evidence String:
          </span>
          <div className="text-cyan-300 font-mono bg-navy-900/90 px-3 py-1.5 rounded-lg border border-slate-800 overflow-x-auto">
            {finding.evidence}
          </div>
        </div>

        <div>
          <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block mb-1">
            Engine Determination:
          </span>
          <p className="text-slate-200 font-sans leading-relaxed text-xs sm:text-sm">{finding.explanation}</p>
        </div>

        {finding.guidelineReference && (
          <div className="flex items-start space-x-2 pt-2 border-t border-slate-800/80 text-slate-400">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-200">Official Clause Citation:</strong> {finding.guidelineReference}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-start space-x-3 bg-cyan-950/20 border border-cyan-500/30 rounded-xl p-3.5 text-xs text-cyan-200">
        <Wrench className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-headline font-semibold text-cyan-300 block mb-0.5">
            Recommended Corrective Action:
          </strong>
          <p className="text-slate-300 font-sans leading-relaxed">{finding.recommendedAction}</p>
        </div>
      </div>
    </div>
  )
}
