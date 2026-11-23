import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Printer,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  RefreshCw,
  BookOpen
} from 'lucide-react'
import { fetchReportData } from '../services/api'
import { SpatialCard } from '../components/common/SpatialCard'

export function ReportPage() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadReport() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetchReportData(id)
        setReport(res.data)
      } catch (err) {
        setError(err.message || 'Failed to load report data')
      } finally {
        setLoading(false)
      }
    }
    loadReport()
  }, [id])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-3">
        <RefreshCw className="w-7 h-7 text-cyan-400 animate-spin mx-auto" />
        <p className="text-xs font-mono text-slate-400">Compiling official audit certificate report...</p>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-xl font-headline font-bold text-white">Report Not Found</h2>
        <p className="text-xs font-mono text-slate-300">{error || 'Unable to retrieve report records.'}</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-navy-950 font-headline font-semibold text-xs uppercase tracking-wider"
        >
          <span>Return to Dashboard</span>
        </Link>
      </div>
    )
  }

  const { scholarship, executiveSummary, documentInventory, findings, disclaimer } = report
  const isAction = executiveSummary.overallStatus === 'Action Required'
  const isVerify = executiveSummary.overallStatus === 'Unable to Verify'

  const verdictBadge = isAction
    ? 'bg-rose-950 text-rose-300 border-rose-800'
    : isVerify
    ? 'bg-amber-950 text-amber-300 border-amber-800'
    : 'bg-emerald-950 text-emerald-300 border-emerald-800'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Print Controls (Hidden on paper/PDF export) */}
      <div className="print:hidden flex items-center justify-between border-b border-slate-800 pb-4">
        <Link
          to={`/audit-results/${id}`}
          className="inline-flex items-center text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Interactive Results
        </Link>
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-headline font-semibold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Official Report Document Body */}
      <div className="bg-navy-900/90 print:bg-white print:text-black border border-slate-800 print:border-gray-300 rounded-2xl p-8 sm:p-12 space-y-8 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        {/* Header Block */}
        <div className="flex items-start justify-between border-b border-slate-800 print:border-gray-300 pb-6">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="font-headline font-bold text-2xl tracking-tight text-white print:text-black">
                QUESTFORGE <span className="text-cyan-400 print:text-black">AI</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-950 print:bg-gray-200 text-cyan-300 print:text-black border border-cyan-500/20 print:border-transparent font-semibold">
                SEC Academic Verification Engine
              </span>
            </div>
            <h1 className="text-xs font-mono text-slate-400 print:text-gray-600 mt-1 uppercase tracking-wider">
              Application Readiness Audit Report
            </h1>
          </div>

          <div className="text-right text-xs font-mono text-slate-400 print:text-gray-600 space-y-0.5">
            <div>
              <strong className="text-slate-300 print:text-gray-800">Report Ref:</strong> {report.reportId}
            </div>
            <div>
              <strong className="text-slate-300 print:text-gray-800">Generated:</strong>{' '}
              {new Date(report.generatedAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Target Scheme & Executive Verdict */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-mono">
          <div className="sm:col-span-2 space-y-1">
            <span className="text-slate-400 print:text-gray-600 uppercase font-semibold text-[10px] block">
              Audited Program:
            </span>
            <span className="text-base sm:text-lg font-headline font-bold text-white print:text-black block">
              {scholarship.title}
            </span>
            <span className="text-cyan-400 print:text-gray-600">{scholarship.code}</span>
          </div>

          <div className="bg-navy-950 print:bg-gray-100 p-4 rounded-xl border border-slate-800 print:border-gray-300 space-y-1.5">
            <span className="text-slate-400 print:text-gray-600 uppercase font-semibold text-[10px] block">
              Readiness Verdict:
            </span>
            <div className="pt-0.5">
              <span className={`px-2 py-0.5 rounded text-[10px] border uppercase font-bold tracking-wider ${verdictBadge}`}>
                {executiveSummary.overallStatus}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 print:text-gray-600 block mt-1 font-sans">
              {executiveSummary.isReadyForSubmission
                ? 'All mandatory requirements satisfied.'
                : 'Action items required prior to portal submission.'}
            </span>
          </div>
        </div>

        {/* Document Inventory Table */}
        <div className="space-y-3 font-mono">
          <h2 className="text-xs font-bold text-white print:text-black uppercase tracking-wider font-headline">
            1. Uploaded Document Inventory ({documentInventory?.length || 0})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 print:border-gray-300">
              <thead className="bg-navy-950 print:bg-gray-100 border-b border-slate-800 print:border-gray-300 text-slate-400 print:text-gray-700 text-[10px] uppercase">
                <tr>
                  <th className="p-3">Document Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Extracted Name</th>
                  <th className="p-3">Date of Birth</th>
                  <th className="p-3">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-200 text-slate-300 print:text-gray-800">
                {documentInventory.map((doc, i) => (
                  <tr key={i} className="hover:bg-navy-950/40 print:hover:bg-transparent">
                    <td className="p-3 font-medium text-white print:text-black">{doc.filename}</td>
                    <td className="p-3 text-cyan-300 print:text-gray-700">{doc.category}</td>
                    <td className="p-3">{doc.extractedName}</td>
                    <td className="p-3">{doc.extractedDob}</td>
                    <td className="p-3">{doc.extractionConfidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Missing Documents Alert if applicable */}
        {executiveSummary.missingMandatoryDocuments?.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-rose-400 print:text-red-700 uppercase tracking-wider font-headline">
              2. Missing Mandatory Document List
            </h2>
            <div className="p-4 bg-rose-950/20 print:bg-red-50 border border-rose-900/60 print:border-red-300 rounded-xl text-xs space-y-1 text-slate-200 print:text-red-900 font-sans">
              <p className="font-semibold font-headline">The following required documents are not present in your submission:</p>
              <ul className="list-disc list-inside space-y-0.5 font-mono">
                {executiveSummary.missingMandatoryDocuments.map((m, i) => (
                  <li key={i} className="font-medium">{m}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Findings and Recommendations */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-white print:text-black uppercase tracking-wider font-headline">
            3. Itemized Audit Findings & Corrective Action Plan ({findings?.length || 0})
          </h2>

          {findings.length === 0 ? (
            <p className="text-xs text-slate-400 print:text-gray-600 italic font-sans">
              No findings or inconsistencies identified. Documentation package satisfies configured criteria.
            </p>
          ) : (
            <div className="space-y-3 text-xs">
              {findings.map((f, i) => (
                <div
                  key={f.findingId || i}
                  className="p-4 rounded-xl border border-slate-800 print:border-gray-300 bg-navy-950/60 print:bg-gray-50 space-y-2.5 font-mono"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400 print:text-gray-900">
                      {f.findingId}: {f.category.replace(/_/g, ' ')}
                    </span>
                    <span className="font-semibold px-2 py-0.5 rounded text-[10px] bg-navy-900 print:bg-gray-200 text-slate-200 print:text-black border border-slate-800 print:border-transparent">
                      {f.verificationStatus}
                    </span>
                  </div>

                  <p className="text-slate-300 print:text-gray-800 font-sans leading-relaxed">
                    <strong className="text-slate-400 print:text-gray-600 font-mono">Explanation: </strong>
                    {f.explanation}
                  </p>

                  <div className="bg-navy-900 print:bg-white p-3 rounded-lg border border-slate-800 print:border-gray-200 text-slate-300 print:text-gray-900 font-sans">
                    <strong className="text-cyan-300 print:text-blue-800 block mb-0.5 font-headline">
                      Corrective Recommendation:
                    </strong>
                    {f.recommendedAction}
                  </div>

                  {f.guidelineReference && (
                    <span className="text-[11px] text-slate-400 print:text-gray-600 block">
                      <strong>Guideline Reference: </strong> {f.guidelineReference}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Disclaimer Footer */}
        <div className="border-t border-slate-800 print:border-gray-300 pt-6 text-[11px] text-slate-400 print:text-gray-600 space-y-1 font-sans">
          <strong className="text-slate-300 print:text-gray-800 block font-headline">Official Disclaimer:</strong>
          <p className="leading-relaxed">{disclaimer}</p>
        </div>
      </div>
    </div>
  )
}
