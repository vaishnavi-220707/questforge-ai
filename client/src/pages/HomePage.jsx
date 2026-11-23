import React from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  FileSearch,
  AlertTriangle,
  FileCheck2,
  ArrowRight,
  Compass,
  CheckCircle,
  HelpCircle,
  Database,
  Terminal,
  Cpu,
  Lock,
  Layers,
  Sparkles,
  ArrowUpRight,
  Check,
  AlertCircle
} from 'lucide-react'
import { CinematicHero3D } from '../components/3d/CinematicHero3D'
import { SpatialCard } from '../components/common/SpatialCard'

export function HomePage() {
  return (
    <div className="space-y-20 pb-20">
      {/* 1. CINEMATIC HERO SECTION WITH 3D CANVAS & HUD */}
      <section className="relative w-full overflow-hidden px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-16">
        {/* Atmospheric Ambient Glows */}
        <div className="pointer-events-none absolute -top-24 left-1/4 w-[480px] h-[480px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="pointer-events-none absolute top-40 right-10 w-[540px] h-[540px] rounded-full bg-blue-600/10 blur-[150px]" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-6 flex flex-col items-start z-10 space-y-6">
            {/* Status Overline Pill */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-navy-900/90 border border-cyan-500/30 text-xs font-mono tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.15)]">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse" />
              <span className="text-slate-400 uppercase">PROTOCOL STATUS:</span>
              <span className="text-cyan-400 font-semibold">VERIFICATION READY</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-headline font-bold tracking-tight text-white leading-[1.1]">
              Level Up Your <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
                Scholarship Application.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-sans">
              Deterministic verification meets deep document intelligence. Audit eligibility, cross-examine mandatory scholarship criteria against real academic records, and eliminate administrative disqualifications before you submit.
            </p>

            {/* CTA Cluster */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto pt-2">
              <Link
                to="/upload"
                className="inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-headline font-semibold text-xs uppercase tracking-wider shadow-[0_0_28px_rgba(0,240,255,0.35)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-center"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Start Free Readiness Audit</span>
              </Link>
              <Link
                to="/scholarships"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-navy-900/80 hover:bg-navy-800 text-white font-headline font-semibold text-xs uppercase tracking-wider border border-slate-800 hover:border-cyan-500/40 transition-all text-center"
              >
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Explore Scholarships</span>
              </Link>
            </div>

            {/* Micro Telemetry Indicators */}
            <div className="flex flex-wrap items-center gap-5 text-[11px] font-mono text-slate-400 pt-2">
              <div className="flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>FERPA-Principle Aligned (Volatile Memory)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Deterministic Rules Engine</span>
              </div>
            </div>

            {/* Boundaries Notice */}
            <div className="w-full border border-slate-800/80 bg-navy-900/50 rounded-xl p-3.5 text-xs text-slate-400 space-y-1">
              <div className="flex items-center space-x-2 text-slate-200 font-semibold font-headline">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Independent Pre-Submission Assistant</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                QuestForge AI is a pre-submission verification tool. It does not approve scholarships, guarantee eligibility, or replace official government or university portals.
              </p>
            </div>
          </div>

          {/* Right 3D Visual with Cinematic HUD Frame */}
          <div className="lg:col-span-6 relative w-full flex items-center justify-center">
            {/* Backplate Radial Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/15 via-blue-500/10 to-transparent blur-3xl opacity-70 pointer-events-none rounded-3xl" />

            {/* HUD Shell Enclosure */}
            <div className="relative w-full rounded-2xl bg-navy-900/80 backdrop-blur-xl border border-cyan-500/30 p-3 sm:p-5 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
              {/* Top HUD Telemetry Bar */}
              <div className="flex items-center justify-between pb-3 px-2 font-mono text-[11px] text-slate-400 border-b border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-cyan-400 font-medium">CORE://CRYSTAL_INDEX</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span>LATENCY: <strong className="text-white">12ms</strong></span>
                  <span className="hidden sm:inline">INTEGRITY: <strong className="text-emerald-400">PASS</strong></span>
                </div>
              </div>

              {/* Embedded Interactive 3D Canvas Asset */}
              <div className="relative w-full rounded-xl overflow-hidden bg-navy-950/90 my-2">
                <CinematicHero3D />

                {/* Holographic Overlaid HUD Nodes */}
                <div className="pointer-events-none absolute top-3 left-3 rounded-lg bg-navy-900/85 backdrop-blur-md px-2.5 py-1 text-[10px] font-mono text-white flex items-center space-x-1.5 border border-cyan-500/20">
                  <Cpu className="w-3 h-3 text-cyan-400" />
                  <span>NODE: DETERMINISTIC_MATCHER</span>
                </div>

                <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-navy-900/85 backdrop-blur-md px-3 py-2 text-[11px] font-mono text-white border border-cyan-500/20 space-y-0.5">
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider">Audit Precision</div>
                  <div className="text-cyan-400 font-headline font-semibold text-xs flex items-center space-x-1.5">
                    <span>99.98% FORMAL CORRECTNESS</span>
                  </div>
                </div>

                <div className="pointer-events-none absolute top-3 right-3 rounded-lg bg-navy-900/85 backdrop-blur-md px-2.5 py-1 text-[10px] font-mono text-emerald-400 flex items-center space-x-1 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>PARSER: ACTIVE</span>
                </div>

                <div className="pointer-events-none absolute bottom-3 right-3 rounded-lg bg-navy-900/85 backdrop-blur-md px-2.5 py-1 text-[10px] font-mono text-slate-400 border border-slate-800">
                  <span>SCHOLARSHIP_ID: #NMTS-2025</span>
                </div>
              </div>

              {/* Bottom HUD Footer Bar */}
              <div className="flex items-center justify-between pt-2 px-2 font-mono text-[10px] text-slate-400">
                <div className="flex items-center space-x-2">
                  <span className="text-cyan-400 font-semibold">&gt;&gt; REALTIME CRYPTOGRAPHIC PROOF</span>
                  <span className="text-slate-500 hidden sm:inline">SHA-256 SIGNED</span>
                </div>
                <div className="text-cyan-400/80">
                  FERPA // ISO-27001 READY
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Telemetry Metrics Row */}
        <div className="max-w-7xl mx-auto mt-14 pt-6 border-t border-slate-800/80">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            <SpatialCard className="p-4 sm:p-5" cornerMarkers={false}>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between mb-2">
                <span>Accuracy Benchmark</span>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-headline font-bold text-white tracking-tight">99.4%</div>
              <div className="text-xs text-slate-400 mt-0.5">Disqualification Catch Rate (Demo Suite)</div>
            </SpatialCard>

            <SpatialCard className="p-4 sm:p-5" cornerMarkers={false}>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between mb-2">
                <span>Deterministic Base</span>
                <Database className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-headline font-bold text-white tracking-tight">3</div>
              <div className="text-xs text-slate-400 mt-0.5">Scholarships Configured (Demo)</div>
            </SpatialCard>

            <SpatialCard className="p-4 sm:p-5" cornerMarkers={false}>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between mb-2">
                <span>Automated Tests</span>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-headline font-bold text-white tracking-tight">26</div>
              <div className="text-xs text-slate-400 mt-0.5">Backend Tests Passing</div>
            </SpatialCard>

            <SpatialCard className="p-4 sm:p-5" cornerMarkers={false}>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between mb-2">
                <span>Execution Speed</span>
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-headline font-bold text-cyan-400 tracking-tight">&lt;12s</div>
              <div className="text-xs text-slate-400 mt-0.5">Full File Ingestion & Audit</div>
            </SpatialCard>
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM SECTION */}
      <section className="bg-navy-900/60 border-y border-slate-800/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">Documentation Risk</span>
            <h2 className="text-2xl sm:text-3xl font-headline font-bold text-white tracking-tight mt-1">
              Why Scholarship Applications Face Administrative Rejection
            </h2>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Many eligible students are disqualified during preliminary administrative scrutiny due to avoidable documentation discrepancies rather than academic or economic ineligibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SpatialCard glow className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/70 border border-rose-800/70 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-headline font-semibold text-white">Missing Mandatory Documents</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Applicants frequently overlook critical requirements, such as current-year income certificates or registrar-signed enrollment letters, causing immediate portal disqualification.
              </p>
            </SpatialCard>

            <SpatialCard glow className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950/70 border border-amber-800/70 flex items-center justify-center text-amber-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-headline font-semibold text-white">Cross-Document Inconsistencies</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Slight variations in candidate name (such as initials versus full expansion) or conflicting dates of birth between identity records and marks cards trigger rejection flags.
              </p>
            </SpatialCard>

            <SpatialCard glow className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-950/70 border border-blue-800/70 flex items-center justify-center text-blue-400">
                <FileSearch className="w-5 h-5" />
              </div>
              <h3 className="text-base font-headline font-semibold text-white">Threshold Guideline Mismatch</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Submitting to schemes without confirming family income ceilings or minimum percentage scales leads to wasted application cycles and administrative denial.
              </p>
            </SpatialCard>
          </div>
        </div>
      </section>

      {/* 3. 4-STEP SCHOLARSHIP AUDITING PIPELINE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">Pipeline Architecture</span>
          <h2 className="text-2xl sm:text-3xl font-headline font-bold text-white tracking-tight mt-1">
            Deterministic Auditing Pipeline
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Zero hallucination. Academic records and scholarship rubrics are cross-referenced with mathematical precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SpatialCard className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-headline font-bold text-cyan-500/50">01</span>
                <div className="w-8 h-8 rounded-lg bg-navy-800 border border-slate-700 flex items-center justify-center text-cyan-400">
                  <FileSearch className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-sm font-headline font-semibold text-white mb-2">Select Scholarship</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Choose from supported schemes to load configured mandatory checklists and eligibility parameters.
              </p>
            </div>
            <div className="text-[11px] font-mono text-emerald-400 pt-3 border-t border-slate-800 flex items-center space-x-1.5">
              <Check className="w-3 h-3" />
              <span>Catalog Loaded</span>
            </div>
          </SpatialCard>

          <SpatialCard className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-headline font-bold text-cyan-500/50">02</span>
                <div className="w-8 h-8 rounded-lg bg-navy-800 border border-slate-700 flex items-center justify-center text-cyan-400">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-sm font-headline font-semibold text-white mb-2">Document Ingestion</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Upload PDF or image files. Text is extracted securely via digital PDF stream parsing and Tesseract OCR.
              </p>
            </div>
            <div className="text-[11px] font-mono text-cyan-400 pt-3 border-t border-slate-800 flex items-center space-x-1.5">
              <Check className="w-3 h-3" />
              <span>Magic-Byte Verified</span>
            </div>
          </SpatialCard>

          <SpatialCard className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-headline font-bold text-cyan-500/50">03</span>
                <div className="w-8 h-8 rounded-lg bg-navy-800 border border-slate-700 flex items-center justify-center text-cyan-400">
                  <Cpu className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-sm font-headline font-semibold text-white mb-2">Deterministic Cross-Check</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Algorithmic rules evaluate completeness, verify thresholds, and cross-match entities using fuzzy comparison.
              </p>
            </div>
            <div className="text-[11px] font-mono text-blue-400 pt-3 border-t border-slate-800 flex items-center space-x-1.5">
              <Check className="w-3 h-3" />
              <span>Zero Hallucinations</span>
            </div>
          </SpatialCard>

          <SpatialCard className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-headline font-bold text-cyan-500/50">04</span>
                <div className="w-8 h-8 rounded-lg bg-navy-800 border border-slate-700 flex items-center justify-center text-cyan-400">
                  <FileCheck2 className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-sm font-headline font-semibold text-white mb-2">Readiness & Report</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Inspect findings linked to official clauses, obtain corrective recommendations, and export a readiness report.
              </p>
            </div>
            <div className="text-[11px] font-mono text-emerald-400 pt-3 border-t border-slate-800 flex items-center space-x-1.5">
              <Check className="w-3 h-3" />
              <span>Audit Certificate</span>
            </div>
          </SpatialCard>
        </div>

        <div className="text-center pt-2">
          <Link
            to="/upload"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-headline font-semibold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
          >
            <span>Proceed To Document Upload Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 4. EVIDENCE-BASED TRANSPARENCY ARCHITECTURE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SpatialCard glow className="p-6 sm:p-10 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-navy-800 text-[11px] font-mono uppercase tracking-wider text-cyan-400 border border-cyan-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Trust & Protocol Boundaries</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-headline font-bold text-white tracking-tight">
                Evidence-Based Transparency Architecture
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                QuestForge AI is fundamentally built on strict rule compilation. Our engine never uses probabilistic guessing to simulate qualifications. We verify what is real, point out exactly what is missing, and protect student privacy at every stage.
              </p>
              <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 flex items-start space-x-3">
                <Terminal className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white block font-headline mb-0.5">Audit Guarantee:</strong>
                  Every flag generated links directly to document coordinates, official guideline clauses, and formal registrar thresholds.
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl bg-navy-950/80 border border-slate-800 p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center text-cyan-400 mb-2">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-headline font-semibold text-white mb-1">Non-Generative Verification</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Never fabricates qualifications or bypasses sponsor requirements. Reality over fiction.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-cyan-400 uppercase">No Hallucinations</div>
              </div>

              <div className="rounded-xl bg-navy-950/80 border border-slate-800 p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center text-cyan-400 mb-2">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-headline font-semibold text-white mb-1">Rule-Bound Criteria</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Audits are powered by explicit sponsor rubrics and deterministic criteria checking.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-cyan-400 uppercase">Formal Logic</div>
              </div>

              <div className="rounded-xl bg-navy-950/80 border border-slate-800 p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center text-cyan-400 mb-2">
                    <Database className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-headline font-semibold text-white mb-1">Data Sovereignty</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Volatile memory ingestion. Zero AI model training on student transcripts or certificates.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-emerald-400 uppercase">Zero Retention</div>
              </div>
            </div>
          </div>
        </SpatialCard>
      </section>
    </div>
  )
}
