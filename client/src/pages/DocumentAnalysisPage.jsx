import React, { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Eye,
  Cpu,
  ShieldCheck,
  RefreshCw,
  Terminal,
  Database,
  Layers,
  Check,
  X
} from 'lucide-react'
import { executeAudit } from '../services/api'
import { SpatialCard } from '../components/common/SpatialCard'

export function DocumentAnalysisPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const state = location.state || {}
  const { scholarshipId, scholarship, documents = [] } = state

  const [runningAudit, setRunningAudit] = useState(false)
  const [auditError, setAuditError] = useState(null)
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState(null)

  if (!scholarship || documents.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
        <h2 className="text-xl font-headline font-bold text-white">No Active Document Analysis Session</h2>
        <p className="text-xs font-mono text-slate-300">
          Please upload or select documents through the upload workflow first.
        </p>
        <Link
          to="/upload"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono bg-cyan-500 text-navy-950 font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Go To Document Upload</span>
        </Link>
      </div>
    )
  }

  const handleRunAudit = async () => {
    setRunningAudit(true)
    setAuditError(null)

    try {
      const payload = {
        scholarshipId: scholarship.id,
        documentIds: documents.map((d) => d.id),
        manualDocuments: documents
      }

      const res = await executeAudit(payload)
      const auditResult = res.data

      navigate(`/audit-results/${auditResult.id}`, {
        state: { audit: auditResult }
      })
    } catch (err) {
      setAuditError(err.message || 'Audit execution failed.')
    } finally {
      setRunningAudit(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest px-2.5 py-1 rounded bg-navy-900 border border-cyan-500/30">
              STEP 2 OF 3 // EXTRACTION_INSPECTOR
            </span>
            <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
              NORMALIZED
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-headline font-bold text-white tracking-tight">
            Document Extraction & Inspector
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
            Review OCR text extraction and structured field entity recognition before running the deterministic audit against{' '}
            <strong className="text-cyan-400">{scholarship.title}</strong>.
          </p>
        </div>

        <button
          disabled={runningAudit}
          onClick={handleRunAudit}
          className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-navy-950 font-headline font-semibold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all shrink-0"
        >
          {runningAudit ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Executing Rules Audit...</span>
            </>
          ) : (
            <>
              <span>Run Verification Audit</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {auditError && (
        <div className="p-4 bg-rose-950/50 border border-rose-900 rounded-xl text-xs font-mono text-rose-200">
          {auditError}
        </div>
      )}

      {/* Extracted Documents Cards */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-headline font-bold text-white tracking-tight">
            Ingested & Normalized Documents ({documents.length})
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Extraction Engine: Multi-AI / Tesseract OCR / PDF Stream
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {documents.map((doc, idx) => {
            const fields = doc.extractedFields || {}
            return (
              <SpatialCard key={doc.id || idx} glow className="space-y-4 p-5 sm:p-6">
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-navy-950 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-headline font-bold text-white break-all">
                        {doc.originalName}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400">
                        Category: <strong className="text-cyan-300">{doc.categoryName}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-950 text-slate-300 border border-slate-800">
                      {doc.extractionMethod || 'TEXT_PARSED'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      Confidence: {Math.round((doc.extractionConfidence || 0.8) * 100)}%
                    </span>
                    <button
                      onClick={() => setSelectedPreviewDoc(doc)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-mono text-slate-300 hover:text-white bg-navy-900 border border-slate-700 hover:border-cyan-400 rounded transition-colors"
                    >
                      <Eye className="w-3 h-3 text-cyan-400" />
                      <span>Inspect Buffer</span>
                    </button>
                  </div>
                </div>

                {/* Structured Fields Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs font-mono">
                  <div className="bg-navy-950/90 p-3 rounded-lg border border-slate-800/80">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">
                      Candidate Name
                    </span>
                    <span className="font-semibold text-white mt-1 block truncate">
                      {fields.fullName || <em className="text-slate-600">Not detected</em>}
                    </span>
                  </div>

                  <div className="bg-navy-950/90 p-3 rounded-lg border border-slate-800/80">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">
                      Date of Birth
                    </span>
                    <span className="font-semibold text-white mt-1 block">
                      {fields.dob || <em className="text-slate-600">Not detected</em>}
                    </span>
                  </div>

                  <div className="bg-navy-950/90 p-3 rounded-lg border border-slate-800/80">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">
                      Annual Income
                    </span>
                    <span className="font-semibold text-cyan-400 mt-1 block">
                      {fields.annualIncome ? `₹${fields.annualIncome.toLocaleString('en-IN')}` : <em className="text-slate-600">Not detected</em>}
                    </span>
                  </div>

                  <div className="bg-navy-950/90 p-3 rounded-lg border border-slate-800/80">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">
                      Academic Marks
                    </span>
                    <span className="font-semibold text-white mt-1 block">
                      {fields.percentageMarks ? `${fields.percentageMarks}%` : <em className="text-slate-600">Not detected</em>}
                    </span>
                  </div>

                  <div className="bg-navy-950/90 p-3 rounded-lg border border-slate-800/80">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">
                      Institution
                    </span>
                    <span className="font-semibold text-white mt-1 block truncate">
                      {fields.institutionName || <em className="text-slate-600">Not detected</em>}
                    </span>
                  </div>

                  <div className="bg-navy-950/90 p-3 rounded-lg border border-slate-800/80">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">
                      ID / Roll No
                    </span>
                    <span className="font-semibold text-white mt-1 block truncate">
                      {fields.idNumber || <em className="text-slate-600">Not detected</em>}
                    </span>
                  </div>
                </div>

                {doc.extractionWarning && (
                  <div className="p-2.5 bg-amber-950/30 border border-amber-900/60 rounded-lg text-xs font-mono text-amber-300">
                    {doc.extractionWarning}
                  </div>
                )}
              </SpatialCard>
            )
          })}
        </div>
      </div>

      {/* Raw Text Modal (Cybernetic Terminal Window) */}
      {selectedPreviewDoc && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-cyan-500/40 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col shadow-[0_0_40px_rgba(0,240,255,0.2)]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-headline font-bold text-white">
                  Buffer Inspector: {selectedPreviewDoc.originalName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPreviewDoc(null)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-navy-950 border border-slate-800 p-4 rounded-xl overflow-y-auto text-xs font-mono text-cyan-300 whitespace-pre-wrap flex-grow leading-relaxed">
              {selectedPreviewDoc.extractedText || 'No text extracted from this document buffer.'}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
              <span>SHA-256 Memory Buffer Safe</span>
              <button
                onClick={() => setSelectedPreviewDoc(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-mono bg-navy-800 border border-slate-700 text-white hover:border-cyan-400"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Bar */}
      <SpatialCard glow className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-headline font-bold text-white">Extraction Inspected</h3>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            Proceed to execute cross-document consistency checks and mandatory requirement audits.
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <Link
            to="/upload"
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-mono text-slate-300 hover:text-white bg-navy-900 border border-slate-700 hover:border-slate-500 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Modify Uploads</span>
          </Link>
          <button
            disabled={runningAudit}
            onClick={handleRunAudit}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-headline font-semibold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
          >
            {runningAudit ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Executing Audit...</span>
              </>
            ) : (
              <>
                <span>Execute Verification Audit</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </SpatialCard>
    </div>
  )
}
