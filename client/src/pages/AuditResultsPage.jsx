import React, { useState, useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import {
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  FileText,
  Printer,
  LayoutDashboard,
  ArrowRight,
  BookOpen,
  RefreshCw,
  RotateCcw,
  Compass,
  ArrowUpRight
} from 'lucide-react'
import { fetchAuditById } from '../services/api'
import { SpatialCard } from '../components/common/SpatialCard'
import { FindingItem } from '../components/common/FindingItem'

export function AuditResultsPage() {
  const { id } = useParams()
  const location = useLocation()

  const [audit, setAudit] = useState(location.state?.audit || null)
  const [loading, setLoading] = useState(!audit)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!audit && id) {
      async function loadAudit() {
        setLoading(true)
        try {
          const res = await fetchAuditById(id)
          setAudit(res.data)
        } catch (err) {
          setError(err.message || 'Failed to load audit results')
        } finally {
          setLoading(false)
        }
      }
      loadAudit()
    }
  }, [id, audit])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-3">
        <RefreshCw className="w-7 h-7 text-cyan-400 animate-spin mx-auto" />
        <p className="text-xs font-mono text-slate-400">Loading audit findings and verification status...</p>
      </div>
    )
  }

  if (error || !audit) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-xl font-headline font-bold text-white">Audit Record Not Found</h2>
        <p className="text-xs font-mono text-slate-300">{error || 'Unable to locate specified audit record.'}</p>
        <Link
          to="/upload"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-navy-950 font-headline font-semibold text-xs uppercase tracking-wider"
        >
          <span>Start New Audit</span>
        </Link>
      </div>
    )
  }

  const isActionRequired = audit.overallStatus === 'Action Required'
  const isUnableToVerify = audit.overallStatus === 'Unable to Verify'
  const isReady = audit.overallStatus === 'Ready for Review'

  const StatusIcon = isActionRequired ? AlertCircle : isUnableToVerify ? HelpCircle : CheckCircle2

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest px-2 py-0.5 rounded bg-navy-900 border border-cyan-500/30">
              AUDIT RUN // ID: {audit.id}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              STEP 3 OF 3: DETERMINISTIC REPORT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-headline font-bold text-white tracking-tight">
            Application Readiness Audit Results
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/report/${audit.id}`}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-mono bg-navy-900 hover:bg-navy-800 text-white border border-slate-700 hover:border-cyan-400 transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export / Print Report</span>
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-mono bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-semibold transition-all"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Primary Executive Status Card */}
      <SpatialCard
        glow
        className={`p-6 sm:p-8 space-y-6 ${
          isActionRequired
            ? 'border-rose-500/40'
            : isUnableToVerify
            ? 'border-amber-500/40'
            : 'border-emerald-500/40'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
              Overall Application Readiness Status:
            </span>
            <div className="flex items-center space-x-3 pt-1">
              <StatusIcon
                className={`w-7 h-7 shrink-0 ${
                  isActionRequired ? 'text-rose-400' : isUnableToVerify ? 'text-amber-400' : 'text-emerald-400'
                }`}
              />
              <span className="text-2xl sm:text-3xl font-headline font-bold text-white tracking-tight">
                {audit.overallStatus}
              </span>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-[11px] text-slate-400 block">Target Scholarship Program:</span>
            <span className="text-sm sm:text-base font-headline font-bold text-white block mt-0.5">
              {audit.scholarshipTitle}
            </span>
            <span className="text-xs text-cyan-400 block mt-0.5 font-semibold">
              {audit.scholarshipCode}
            </span>
          </div>
        </div>

        {/* Narrative Assessment */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-4 font-sans">
          {isActionRequired &&
            'The deterministic audit engine identified mandatory documentation deficiencies or critical parameter mismatches that must be resolved prior to official portal submission.'}
          {isUnableToVerify &&
            'Mandatory document categories are satisfied, but potential name variations or data ambiguities require manual student review to verify portal compliance.'}
          {isReady &&
            'All mandatory document categories are present, and cross-document entity comparisons revealed consistent candidate information matching configured rules.'}
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
          <div className="bg-navy-950/90 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block uppercase font-semibold text-[10px]">Mandatory Required</span>
            <span className="text-xl font-headline font-bold text-white mt-1 block">{audit.stats.mandatoryCount}</span>
          </div>
          <div className="bg-navy-950/90 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block uppercase font-semibold text-[10px]">Uploaded Documents</span>
            <span className="text-xl font-headline font-bold text-white mt-1 block">{audit.stats.uploadedCount}</span>
          </div>
          <div className="bg-navy-950/90 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block uppercase font-semibold text-[10px]">Missing Mandatory</span>
            <span className={`text-xl font-headline font-bold mt-1 block ${audit.stats.missingCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {audit.stats.missingCount}
            </span>
          </div>
          <div className="bg-navy-950/90 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block uppercase font-semibold text-[10px]">Action Items</span>
            <span className={`text-xl font-headline font-bold mt-1 block ${audit.stats.actionRequiredCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
              {audit.stats.actionRequiredCount}
            </span>
          </div>
        </div>
      </SpatialCard>

      {/* Missing Mandatory Documents Section */}
      {audit.missingMandatory?.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl font-headline font-bold text-white tracking-tight">
              Missing Mandatory Documents ({audit.missingMandatory.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {audit.missingMandatory.map((missing) => (
              <SpatialCard
                key={missing.categoryId}
                className="border-rose-500/40 bg-rose-950/15 space-y-3 p-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-headline font-bold text-white">{missing.name}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 uppercase font-semibold">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {missing.description}
                </p>
                {missing.guidelineReference && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-start space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-200">Mandate:</strong> {missing.guidelineReference}
                    </span>
                  </div>
                )}
                <div className="pt-2">
                  <Link
                    to={`/upload?scholarshipId=${audit.scholarshipId}`}
                    className="inline-flex items-center space-x-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 underline"
                  >
                    <span>Upload {missing.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </SpatialCard>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Itemized Findings Section */}
      <div className="space-y-5">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">Detailed Telemetry</span>
          <h2 className="text-xl sm:text-2xl font-headline font-bold text-white tracking-tight mt-0.5">
            Audit Findings & Consistency Checks ({audit.findings?.length || 0})
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Specific issues, cross-document inconsistencies, and evidence-backed recommendations.
          </p>
        </div>

        {audit.findings?.length === 0 ? (
          <SpatialCard className="p-8 text-center space-y-2 border-emerald-500/30 bg-emerald-950/10">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-headline font-bold text-white">No Issues or Inconsistencies Found</h3>
            <p className="text-xs text-slate-300 font-sans max-w-md mx-auto">
              Your uploaded document credentials satisfy all configured mandatory requirements without name or date conflicts.
            </p>
          </SpatialCard>
        ) : (
          <div className="space-y-4">
            {audit.findings.map((f) => (
              <FindingItem key={f.findingId} finding={f} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/upload"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-mono text-slate-300 hover:text-white bg-navy-900 border border-slate-800 hover:border-slate-600 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Re-Upload / Test Different Files</span>
        </Link>
        <Link
          to={`/report/${audit.id}`}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-headline font-semibold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Generate Printable Report</span>
        </Link>
      </div>
    </div>
  )
}
