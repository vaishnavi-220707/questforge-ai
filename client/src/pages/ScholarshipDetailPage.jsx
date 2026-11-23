import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  FileText,
  Calendar,
  Award,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  AlertCircle,
  RefreshCw,
  Compass,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react'
import { fetchScholarshipById } from '../services/api'
import { SpatialCard } from '../components/common/SpatialCard'

export function ScholarshipDetailPage() {
  const { id } = useParams()
  const [scholarship, setScholarship] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetchScholarshipById(id)
        setScholarship(res.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-3">
        <RefreshCw className="w-7 h-7 text-cyan-400 animate-spin mx-auto" />
        <p className="text-xs font-mono text-slate-400">Retrieving scholarship rule specifications...</p>
      </div>
    )
  }

  if (error || !scholarship) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-xl font-headline font-bold text-white">Scholarship Not Found</h2>
        <p className="text-xs font-mono text-slate-300">{error || 'Unable to retrieve scholarship configuration.'}</p>
        <Link
          to="/scholarships"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono bg-navy-900 border border-slate-700 text-white hover:border-cyan-400"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Scholarships</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          to="/scholarships"
          className="inline-flex items-center text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Scholarship Explorer
        </Link>
      </div>

      {/* Program Summary Header */}
      <SpatialCard glow className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-navy-950 border border-cyan-500/20">
              {scholarship.code}
            </span>
            {scholarship.isDemonstration && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Synthetic Demonstration Scheme
              </span>
            )}
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
              {scholarship.category}
            </span>
          </div>
          <Link
            to={`/upload?scholarshipId=${scholarship.id}`}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-headline font-semibold uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-navy-950 shadow-[0_0_18px_rgba(0,240,255,0.3)] transition-all"
          >
            <span>Audit Documents for this Scheme</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-headline font-bold text-white tracking-tight leading-tight">
          {scholarship.title}
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed font-sans">
          {scholarship.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t border-slate-800/80 text-xs font-mono">
          <div>
            <span className="text-slate-400 block mb-0.5">Issuing Authority:</span>
            <span className="font-semibold text-white">{scholarship.provider}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Award Benefit:</span>
            <span className="font-semibold text-amber-300">{scholarship.awardAmount}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Application Deadline:</span>
            <span className="font-semibold text-white">{scholarship.deadline}</span>
          </div>
        </div>

        {scholarship.officialPortalUrl && (
          <div className="pt-2 text-xs font-mono text-slate-400 flex items-center space-x-2">
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Official Portal Reference: </span>
            <a
              href={scholarship.officialPortalUrl.split(' ')[0]}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline"
            >
              {scholarship.officialPortalUrl}
            </a>
          </div>
        )}
      </SpatialCard>

      {/* Mandatory Document Checklist */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">Compliance Matrix</span>
          <h2 className="text-xl sm:text-2xl font-headline font-bold text-white tracking-tight mt-0.5">
            Mandatory Documents Checklist ({scholarship.mandatoryDocuments?.length || 0})
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            These documents are strictly audited by the deterministic verification engine during upload.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scholarship.mandatoryDocuments?.map((doc) => (
            <SpatialCard key={doc.categoryId} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                  <h3 className="text-sm font-headline font-semibold text-white">{doc.name}</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  Mandatory
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {doc.description}
              </p>

              <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px] font-mono text-slate-400">
                <div>
                  <strong className="text-slate-300">Accepted Formats:</strong>{' '}
                  {doc.acceptedFormats.join(', ')}
                </div>
                {doc.guidelineReference && (
                  <div className="flex items-start space-x-1.5 text-slate-400 pt-0.5">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-300">Citation:</strong> {doc.guidelineReference}
                    </span>
                  </div>
                )}
              </div>
            </SpatialCard>
          ))}
        </div>
      </div>

      {/* Eligibility Rules */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">Formal Criteria</span>
          <h2 className="text-xl sm:text-2xl font-headline font-bold text-white tracking-tight mt-0.5">
            Configured Eligibility Rules
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Audit engine checks candidate records against these academic, demographic, and financial thresholds.
          </p>
        </div>

        <SpatialCard className="p-0 overflow-hidden" cornerMarkers={false}>
          <div className="divide-y divide-slate-800/80">
            {scholarship.eligibilityCriteria?.map((crit) => (
              <div key={crit.criterionId} className="p-4 sm:p-5 flex items-start space-x-3.5 hover:bg-navy-800/30 transition-colors">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <h4 className="font-headline font-semibold text-white text-sm">{crit.title}</h4>
                  <p className="text-slate-300 font-sans leading-relaxed">{crit.rule}</p>
                </div>
              </div>
            ))}
          </div>
        </SpatialCard>
      </div>

      {/* Start Audit CTA Box */}
      <SpatialCard glow className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-headline font-bold text-white">Ready to verify your documents?</h3>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Upload your PDF or image files to begin the automated deterministic readiness audit.
          </p>
        </div>
        <Link
          to={`/upload?scholarshipId=${scholarship.id}`}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-headline font-semibold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all shrink-0"
        >
          <span>Audit Application Documents</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </SpatialCard>
    </div>
  )
}
