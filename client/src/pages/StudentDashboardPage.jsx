import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  FileCheck2,
  AlertCircle,
  Clock,
  Compass,
  ArrowRight,
  RefreshCw,
  Info,
  Shield,
  Layers,
  ArrowUpRight
} from 'lucide-react'
import { fetchDashboardData } from '../services/api'
import { SpatialCard } from '../components/common/SpatialCard'

export function StudentDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchDashboardData()
      setDashboard(res.data)
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const summary = dashboard?.summary || {
    totalAuditedApplications: 0,
    actionRequiredCount: 0,
    readyForReviewCount: 0,
    totalAuditExecutions: 0
  }

  const applications = dashboard?.recentApplications || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest px-2.5 py-1 rounded bg-navy-900 border border-cyan-500/30">
              TELEMETRY // STUDENT_DASHBOARD
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              AUDIT RECORD LEDGER
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-headline font-bold text-white tracking-tight">
            My Scholarship Audits
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
            Track verification history, missing documents summary, and readiness statuses across audited programs.
          </p>
        </div>

        <Link
          to="/scholarships"
          className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-headline font-semibold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all shrink-0"
        >
          <Compass className="w-4 h-4" />
          <span>Audit New Scholarship</span>
        </Link>
      </div>

      {/* Persistence Notice Banner */}
      <div className="p-4 bg-navy-900/80 border border-slate-800 rounded-xl text-xs font-mono text-slate-400 flex items-start space-x-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Session Storage Mode: </span>
          <span>
            {dashboard?.note ||
              'Demonstration records persist for this server session. External database integration can be linked via Supabase credentials.'}
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SpatialCard className="p-4 sm:p-5" cornerMarkers={false}>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">
            Audited Applications
          </span>
          <span className="text-2xl sm:text-3xl font-headline font-bold text-white mt-1 block">
            {summary.totalAuditedApplications}
          </span>
          <span className="text-[11px] font-mono text-slate-400 block mt-0.5">Programs checked</span>
        </SpatialCard>

        <SpatialCard className="p-4 sm:p-5" cornerMarkers={false}>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">
            Action Required
          </span>
          <span className={`text-2xl sm:text-3xl font-headline font-bold mt-1 block ${summary.actionRequiredCount > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
            {summary.actionRequiredCount}
          </span>
          <span className="text-[11px] font-mono text-slate-400 block mt-0.5">Critical deficiencies</span>
        </SpatialCard>

        <SpatialCard className="p-4 sm:p-5" cornerMarkers={false}>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">
            Ready for Review
          </span>
          <span className="text-2xl sm:text-3xl font-headline font-bold text-emerald-400 mt-1 block">
            {summary.readyForReviewCount}
          </span>
          <span className="text-[11px] font-mono text-slate-400 block mt-0.5">Complete packages</span>
        </SpatialCard>

        <SpatialCard className="p-4 sm:p-5" cornerMarkers={false}>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">
            Audit Executions
          </span>
          <span className="text-2xl sm:text-3xl font-headline font-bold text-cyan-400 mt-1 block">
            {summary.totalAuditExecutions}
          </span>
          <span className="text-[11px] font-mono text-slate-400 block mt-0.5">Total rule evaluations</span>
        </SpatialCard>
      </div>

      {/* Application Records Table */}
      <SpatialCard glow className="space-y-4 p-5 sm:p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-headline font-bold text-white tracking-tight">
              Audited Program History
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Persistent verification runs for the active browser session
            </p>
          </div>
          <button
            onClick={loadData}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white bg-navy-950 border border-slate-800 hover:border-cyan-400 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
            <p className="text-xs font-mono">Loading records...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <FileCheck2 className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-headline font-bold text-white">No Audited Scholarships Yet</h3>
              <p className="text-xs font-sans text-slate-400 max-w-sm mx-auto">
                Select a scholarship from the explorer and upload documents to view verification findings and status here.
              </p>
            </div>
            <Link
              to="/scholarships"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-headline font-semibold uppercase tracking-wider bg-cyan-500 text-navy-950"
            >
              <span>Explore Scholarships</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-navy-950 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Scholarship</th>
                  <th className="px-4 py-3">Readiness Status</th>
                  <th className="px-4 py-3">Uploaded</th>
                  <th className="px-4 py-3">Missing</th>
                  <th className="px-4 py-3">Findings</th>
                  <th className="px-4 py-3">Audited On</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {applications.map((app) => {
                  const isAction = app.auditStatus === 'Action Required'
                  const isVerify = app.auditStatus === 'Unable to Verify'
                  const badgeClass = isAction
                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                    : isVerify
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  return (
                    <tr key={app.applicationId} className="hover:bg-navy-800/40 transition-colors">
                      <td className="px-4 py-3 font-semibold font-headline text-white">
                        {app.scholarshipTitle}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] border uppercase font-semibold ${badgeClass}`}>
                          {app.auditStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{app.uploadedCount} docs</td>
                      <td className="px-4 py-3">
                        <span className={app.missingCount > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                          {app.missingCount}
                        </span>
                      </td>
                      <td className="px-4 py-3">{app.findingsCount}</td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(app.lastAuditedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Link
                          to={`/audit-results/${app.lastAuditId}`}
                          className="text-cyan-400 hover:text-cyan-300 font-semibold"
                        >
                          View Results
                        </Link>
                        <span className="text-slate-600">|</span>
                        <Link
                          to={`/report/${app.lastAuditId}`}
                          className="text-slate-400 hover:text-white"
                        >
                          Report
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </SpatialCard>
    </div>
  )
}
