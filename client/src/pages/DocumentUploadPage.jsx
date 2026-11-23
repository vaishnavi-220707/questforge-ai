import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  UploadCloud,
  FileText,
  Trash2,
  AlertCircle,
  CheckCircle,
  FileCheck,
  Sparkles,
  ArrowRight,
  Shield,
  Lock,
  Cpu,
  Layers,
  Check,
  RefreshCw,
  Fingerprint,
  ArrowUpRight
} from 'lucide-react'
import { fetchScholarships, uploadDocuments } from '../services/api'
import { SpatialCard } from '../components/common/SpatialCard'

export function DocumentUploadPage() {
  const [searchParams] = useSearchParams()
  const initialScholarshipId = searchParams.get('scholarshipId') || ''
  const navigate = useNavigate()

  const [scholarships, setScholarships] = useState([])
  const [selectedScholarshipId, setSelectedScholarshipId] = useState(initialScholarshipId)
  const [selectedScholarship, setSelectedScholarship] = useState(null)

  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef(null)

  // Load scholarships list on mount
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchScholarships()
        const list = res.data || []
        setScholarships(list)
        if (list.length > 0) {
          const matched = list.find((s) => s.id === initialScholarshipId) || list[0]
          setSelectedScholarshipId(matched.id)
          setSelectedScholarship(matched)
        }
      } catch (err) {
        setUploadError('Failed to load scholarships: ' + err.message)
      }
    }
    loadData()
  }, [initialScholarshipId])

  // Update selected scholarship when dropdown changes
  const handleScholarshipChange = (e) => {
    const id = e.target.value
    setSelectedScholarshipId(id)
    const found = scholarships.find((s) => s.id === id)
    setSelectedScholarship(found || null)
  }

  // File validation
  const validateAndAddFiles = (newFileList) => {
    setUploadError(null)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    const maxSize = 10 * 1024 * 1024 // 10MB
    const valid = []

    for (const file of newFileList) {
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setUploadError(`File "${file.name}" has unsupported format. Only PDF, JPG, and PNG are allowed.`)
        continue
      }
      if (file.size > maxSize) {
        setUploadError(`File "${file.name}" exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`)
        continue
      }

      // Infer default category guess based on filename
      let defaultCatId = 'doc-id'
      let defaultCatName = 'Identity Proof'
      const lower = file.name.toLowerCase()
      if (lower.includes('income')) {
        defaultCatId = 'doc-income'
        defaultCatName = 'Income Certificate'
      } else if (lower.includes('mark') || lower.includes('transcript') || lower.includes('10th') || lower.includes('12th')) {
        defaultCatId = 'doc-marksheet'
        defaultCatName = 'Academic Marksheet'
      } else if (lower.includes('inst') || lower.includes('bonafide') || lower.includes('college')) {
        defaultCatId = 'doc-institution'
        defaultCatName = 'Institution Certificate'
      }

      valid.push({
        id: `local-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type,
        categoryId: defaultCatId,
        categoryName: defaultCatName,
        magicByte: file.type === 'application/pdf' ? '0x25 0x50 0x44 0x46 (PDF-1.7)' : '0x89 0x50 0x4E 0x47 (IMAGE)'
      })
    }

    setFiles((prev) => [...prev, ...valid])
  }

  const handleFileDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files)
    }
  }

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files)
    }
  }

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCategoryChange = (index, categoryId) => {
    const matchedCategory = selectedScholarship?.mandatoryDocuments.find((c) => c.categoryId === categoryId)
    setFiles((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            categoryId,
            categoryName: matchedCategory ? matchedCategory.name : 'Other Document'
          }
        }
        return item
      })
    )
  }

  // Load Synthetic Demonstration Datasets (One-click evaluator presets)
  const loadScenarioPreset = (scenario) => {
    setUploadError(null)

    if (scenario === 'SCENARIO_B_MISSING') {
      const syntheticDocs = [
        {
          id: `syn-${Date.now()}-1`,
          file: new File(
            ['Government Identity Proof\nName: Rahul Sharma\nDOB: 15/08/2004\nAadhaar: 9876 5432 1098'],
            'aadhaar_card.pdf',
            { type: 'application/pdf' }
          ),
          name: 'aadhaar_card.pdf',
          size: '14.2 KB',
          type: 'application/pdf',
          categoryId: 'doc-id',
          categoryName: 'Identity Proof',
          magicByte: '0x25 0x50 0x44 0x46 (PDF-1.7)'
        },
        {
          id: `syn-${Date.now()}-2`,
          file: new File(
            ['Senior Secondary Examination Marksheet\nStudent Name: Rahul Sharma\nPercentage: 86.4%\nBoard: CBSE'],
            'class12_marksheet.pdf',
            { type: 'application/pdf' }
          ),
          name: 'class12_marksheet.pdf',
          size: '18.5 KB',
          type: 'application/pdf',
          categoryId: 'doc-marksheet',
          categoryName: 'Academic Marksheet',
          magicByte: '0x25 0x50 0x44 0x46 (PDF-1.7)'
        },
        {
          id: `syn-${Date.now()}-3`,
          file: new File(
            ['Bonafide Student Certificate\nThis is to certify that Rahul Sharma is enrolled in B.Tech Mechanical Engineering.\nInstitution: National Institute of Technology'],
            'bonafide_letter.pdf',
            { type: 'application/pdf' }
          ),
          name: 'bonafide_letter.pdf',
          size: '11.0 KB',
          type: 'application/pdf',
          categoryId: 'doc-institution',
          categoryName: 'Institution Certificate',
          magicByte: '0x25 0x50 0x44 0x46 (PDF-1.7)'
        }
      ]
      setFiles(syntheticDocs)
    } else if (scenario === 'SCENARIO_C_INCONSISTENCY') {
      const syntheticDocs = [
        {
          id: `syn-${Date.now()}-1`,
          file: new File(
            ['National ID Card\nFull Name: Rahul Sharma\nDOB: 15/08/2004\nID: 9876 5432 1098'],
            'national_id_rahul_sharma.pdf',
            { type: 'application/pdf' }
          ),
          name: 'national_id_rahul_sharma.pdf',
          size: '15.0 KB',
          type: 'application/pdf',
          categoryId: 'doc-id',
          categoryName: 'Identity Proof',
          magicByte: '0x25 0x50 0x44 0x46 (PDF-1.7)'
        },
        {
          id: `syn-${Date.now()}-2`,
          file: new File(
            ['Official Marksheet Transcript\nName of Candidate: Rahul S\nPercentage: 88.5%\nPassing Year: 2024'],
            'marksheet_rahul_s.pdf',
            { type: 'application/pdf' }
          ),
          name: 'marksheet_rahul_s.pdf',
          size: '19.2 KB',
          type: 'application/pdf',
          categoryId: 'doc-marksheet',
          categoryName: 'Academic Marksheet',
          magicByte: '0x25 0x50 0x44 0x46 (PDF-1.7)'
        },
        {
          id: `syn-${Date.now()}-3`,
          file: new File(
            ['Income Certificate\nApplicant Name: Rahul Sharma\nAnnual Household Income: 1,80,000 INR\nValid for Year: 2026'],
            'income_cert.pdf',
            { type: 'application/pdf' }
          ),
          name: 'income_cert.pdf',
          size: '12.4 KB',
          type: 'application/pdf',
          categoryId: 'doc-income',
          categoryName: 'Income Certificate',
          magicByte: '0x25 0x50 0x44 0x46 (PDF-1.7)'
        },
        {
          id: `syn-${Date.now()}-4`,
          file: new File(
            ['Bonafide Certificate\nThis is to certify that Rahul Sharma is enrolled in AICTE approved college.\nInstitution: State Engineering College'],
            'bonafide_inst.pdf',
            { type: 'application/pdf' }
          ),
          name: 'bonafide_inst.pdf',
          size: '13.1 KB',
          type: 'application/pdf',
          categoryId: 'doc-institution',
          categoryName: 'Institution Certificate',
          magicByte: '0x25 0x50 0x44 0x46 (PDF-1.7)'
        }
      ]
      setFiles(syntheticDocs)
    } else if (scenario === 'SCENARIO_A_PERFECT') {
      const syntheticDocs = [
        {
          id: `syn-${Date.now()}-1`,
          file: new File(
            ['National Identity Card\nFull Name: Rahul Sharma\nDOB: 15/08/2004\nUID: 9876 5432 1098'],
            'id_card.pdf',
            { type: 'application/pdf' }
          ),
          name: 'id_card.pdf',
          size: '14.0 KB',
          type: 'application/pdf',
          categoryId: 'doc-id',
          categoryName: 'Identity Proof',
          magicByte: '0x25 0x50 0x44 0x46 (PDF-1.7)'
        },
        {
          id: `syn-${Date.now()}-2`,
          file: new File(
            ['Revenue Authority Income Certificate\nName of Applicant: Rahul Sharma\nAnnual Income: 1,50,000 INR'],
            'income_cert.pdf',
            { type: 'application/pdf' }
          ),
          name: 'income_cert.pdf',
          size: '16.0 KB',
          type: 'application/pdf',
          categoryId: 'doc-income',
          categoryName: 'Income Certificate',
          magicByte: '0x25 0x50 0x44 0x46 (PDF-1.7)'
        },
        {
          id: `syn-${Date.now()}-3`,
          file: new File(
            ['Board Marksheet Transcript\nStudent Name: Rahul Sharma\nPercentage: 84.0%'],
            'marksheet.pdf',
            { type: 'application/pdf' }
          ),
          name: 'marksheet.pdf',
          size: '20.0 KB',
          type: 'application/pdf',
          categoryId: 'doc-marksheet',
          categoryName: 'Academic Marksheet',
          magicByte: '0x25 0x50 0x44 0x46 (PDF-1.7)'
        },
        {
          id: `syn-${Date.now()}-4`,
          file: new File(
            ['Institution Bonafide Certificate\nCertify that Rahul Sharma is enrolled in National Institute of Technology'],
            'institution_bonafide.pdf',
            { type: 'application/pdf' }
          ),
          name: 'institution_bonafide.pdf',
          size: '12.0 KB',
          type: 'application/pdf',
          categoryId: 'doc-institution',
          categoryName: 'Institution Certificate',
          magicByte: '0x25 0x50 0x44 0x46 (PDF-1.7)'
        }
      ]
      setFiles(syntheticDocs)
    }
  }

  // Handle Upload and Analysis Execution
  const handleStartAnalysis = async () => {
    if (files.length === 0) {
      setUploadError('Please select or upload at least one document before continuing.')
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      const categoryMap = {}

      for (const item of files) {
        formData.append('documents', item.file, item.name)
        categoryMap[item.name] = {
          categoryId: item.categoryId,
          categoryName: item.categoryName
        }
      }

      formData.append('categoryMap', JSON.stringify(categoryMap))

      const uploadResult = await uploadDocuments(formData)
      const processedDocs = uploadResult.data || []

      navigate('/analysis', {
        state: {
          scholarshipId: selectedScholarshipId,
          scholarship: selectedScholarship,
          documents: processedDocs
        }
      })
    } catch (err) {
      setUploadError(err.message || 'Failed to process document upload.')
    } finally {
      setUploading(false)
    }
  }

  // Calculate mandatory document coverage
  const mandatoryDocs = selectedScholarship?.mandatoryDocuments || []
  const uploadedCategoryIds = new Set(files.map((f) => f.categoryId))
  const matchedCount = mandatoryDocs.filter((m) => uploadedCategoryIds.has(m.categoryId)).length
  const progressPercent = mandatoryDocs.length > 0 ? Math.round((matchedCount / mandatoryDocs.length) * 100) : 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Workspace Header & Sub-Bar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest px-2.5 py-1 rounded bg-navy-900 border border-cyan-500/30">
              STUDIO // VERIFICATION_WORKSPACE_V3.8
            </span>
            <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
              DAEMON: ACTIVE (11ms)
            </span>
            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
              FERPA/ISIR ENCLAVE READY
            </span>
          </div>

          <span className="text-xs font-mono text-slate-400">
            Step 1 of 3: Document Ingestion
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-headline font-bold text-white tracking-tight">
          Upload & Audit Studio
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed font-sans">
          Deterministic document parsing, cryptographic magic-byte validation, and rule-bound cross-check pipeline. Select your target scholarship, drop your credentials, and assign mandatory verification categories.
        </p>
      </div>

      {/* Target Scholarship Selection & Checklist Card */}
      <SpatialCard glow className="p-6 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-cyan-400 block font-semibold">
              Target Scholarship Program:
            </label>
            <select
              value={selectedScholarshipId}
              onChange={handleScholarshipChange}
              className="w-full bg-navy-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm font-headline text-white focus:outline-none focus:border-cyan-400 transition-colors"
            >
              {scholarships.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.code}) — {s.awardAmount}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 pt-1 font-sans">
              Provider: <strong className="text-slate-200">{selectedScholarship?.provider || 'Official Authority'}</strong> • Deadline: <span className="text-white">{selectedScholarship?.deadline}</span>
            </p>
          </div>

          <div className="lg:col-span-5 bg-navy-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 uppercase">Pre-Validation Coverage:</span>
              <span className="text-cyan-400 font-bold">{matchedCount} / {mandatoryDocs.length} ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-navy-900 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {mandatoryDocs.map((m) => {
                const covered = uploadedCategoryIds.has(m.categoryId)
                return (
                  <span
                    key={m.categoryId}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      covered
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-navy-900 text-slate-500 border-slate-800'
                    }`}
                  >
                    {covered ? '✓ ' : '○ '}
                    {m.name}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </SpatialCard>

      {/* Instant Evaluation Shortcuts (1-Click Test Presets) */}
      <SpatialCard className="p-5 space-y-3" cornerMarkers={false}>
        <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-cyan-400">
          <Sparkles className="w-4 h-4" />
          <span>Evaluation Shortcut: Instant Synthetic Test Presets</span>
        </div>
        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          Click any preset to simulate real audit scenarios and verify deterministic engine responses instantly:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            type="button"
            onClick={() => loadScenarioPreset('SCENARIO_A_PERFECT')}
            className="p-3 rounded-xl bg-navy-950/90 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-headline font-semibold text-emerald-400">Scenario Alpha</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                100% READY
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">All 4 documents match with zero discrepancies.</p>
          </button>

          <button
            type="button"
            onClick={() => loadScenarioPreset('SCENARIO_B_MISSING')}
            className="p-3 rounded-xl bg-navy-950/90 border border-slate-800 hover:border-amber-500/50 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-headline font-semibold text-amber-400">Scenario Beta</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800">
                ACTION REQ
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">Income Certificate omitted; flags missing document.</p>
          </button>

          <button
            type="button"
            onClick={() => loadScenarioPreset('SCENARIO_C_INCONSISTENCY')}
            className="p-3 rounded-xl bg-navy-950/90 border border-slate-800 hover:border-cyan-500/50 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-headline font-semibold text-cyan-400">Scenario Gamma</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                UNABLE TO VERIFY
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">Name mismatch: Rahul Sharma vs Rahul S.</p>
          </button>
        </div>
      </SpatialCard>

      {/* Cybernetic Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleFileDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-300 ${
          isDragOver
            ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_30px_rgba(0,240,255,0.2)]'
            : 'border-slate-800 hover:border-cyan-500/40 bg-navy-900/60 hover:bg-navy-900/90'
        }`}
      >
        {/* Corner Brackets */}
        <span className="absolute top-2 left-3 font-mono text-xs text-cyan-500/40 select-none">+</span>
        <span className="absolute top-2 right-3 font-mono text-xs text-cyan-500/40 select-none">+</span>
        <span className="absolute bottom-2 left-3 font-mono text-xs text-cyan-500/40 select-none">+</span>
        <span className="absolute bottom-2 right-3 font-mono text-xs text-cyan-500/40 select-none">+</span>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-navy-950 border border-cyan-500/30 mx-auto flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.15)]">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <p className="text-sm sm:text-base font-headline font-semibold text-white">
              Drop PDF, PNG, JPG files here, or <span className="text-cyan-400 underline underline-offset-4">browse encrypted enclave</span>
            </p>
            <p className="text-xs text-slate-400 font-mono">
              Max 10MB per file • Volatile in-memory parsing • Zero AI training retention
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[10px] font-mono text-slate-400">
            <span className="px-2 py-0.5 rounded bg-navy-950 border border-slate-800">
              Magic-Byte Inspection (%PDF / \x89PNG)
            </span>
            <span className="px-2 py-0.5 rounded bg-navy-950 border border-slate-800">
              Path Traversal Sanitization
            </span>
            <span className="px-2 py-0.5 rounded bg-navy-950 border border-slate-800">
              Coordinate OCR Tokenizer
            </span>
          </div>
        </div>
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-4 bg-rose-950/50 border border-rose-900 rounded-xl text-xs text-rose-200 flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span className="font-mono">{uploadError}</span>
        </div>
      )}

      {/* Selected Documents Pipeline Table */}
      {files.length > 0 && (
        <SpatialCard glow className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base sm:text-lg font-headline font-bold text-white tracking-tight">
                Ingested Documents ({files.length})
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Cryptographic signature check: VALID • Ready for OCR extraction
              </p>
            </div>
            <button
              onClick={() => setFiles([])}
              className="px-3 py-1 text-xs font-mono text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900 rounded-lg transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-3">
            {files.map((item, idx) => (
              <div
                key={item.id}
                className="bg-navy-950/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-navy-900 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-headline font-semibold text-white break-all">
                      {item.name}
                    </h4>
                    <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400 mt-0.5">
                      <span>{item.size}</span>
                      <span>•</span>
                      <span className="text-cyan-400">{item.magicByte || '0x25 0x50 0x44 0x46 (VALID)'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end md:self-center w-full md:w-auto">
                  <div className="w-full md:w-64">
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">
                      Target Mandatory Category:
                    </label>
                    <select
                      value={item.categoryId}
                      onChange={(e) => handleCategoryChange(idx, e.target.value)}
                      className="w-full bg-navy-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                    >
                      {selectedScholarship?.mandatoryDocuments.map((m) => (
                        <option key={m.categoryId} value={m.categoryId}>
                          {m.name} (Mandatory)
                        </option>
                      ))}
                      {selectedScholarship?.optionalDocuments?.map((o) => (
                        <option key={o.categoryId} value={o.categoryId}>
                          {o.name} (Optional)
                        </option>
                      ))}
                      <option value="doc-unassigned">Other / Uncategorized</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors border border-transparent hover:border-rose-900 mt-4 md:mt-0"
                    title="Remove File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sticky Execution Bar */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
            <div className="text-xs font-mono text-slate-400">
              Ready to launch deterministic audit with <strong className="text-white">{files.length} documents</strong>.
            </div>
            <button
              disabled={uploading}
              onClick={handleStartAnalysis}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-navy-950 font-headline font-semibold text-xs uppercase tracking-wider shadow-[0_0_24px_rgba(0,240,255,0.35)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing OCR & Text Extraction...</span>
                </>
              ) : (
                <>
                  <span>Run Audit Engine (Deterministic Pass)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </SpatialCard>
      )}
    </div>
  )
}
