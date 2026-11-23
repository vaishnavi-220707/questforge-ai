import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Cpu, BookOpen, Layers, CheckCircle2, Lock, ArrowRight, ArrowUpRight } from 'lucide-react'
import { SpatialCard } from '../components/common/SpatialCard'
import { AIStatusPanel } from '../components/AIStatusPanel'

export function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title & Header */}
      <div className="max-w-3xl space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest px-2.5 py-1 rounded bg-navy-900 border border-cyan-500/30">
            SEC ACADEMIC ARCHITECTURE
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            SYSTEM SPECIFICATION & SCOPE
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-headline font-bold text-white tracking-tight">
          About QuestForge AI
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
          QuestForge AI is an academic Skill Enhancement Course (SEC) project designed to demonstrate the application of optical character recognition, multi-model AI extraction, and deterministic rule validation in higher education technology.
        </p>
      </div>

      {/* Core Mission & Boundaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SpatialCard title="System Mission & Purpose" className="space-y-3" glow>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Scholarship application processes are often complex, requiring multiple official documents from diverse authorities. Students frequently face disqualification due to administrative documentation oversights such as missing affidavits, minor name spelling discrepancies, or expired certificates.
          </p>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            QuestForge AI provides a pre-submission auditing environment where students can test their document package against configured requirements before submitting to official government or university portals.
          </p>
        </SpatialCard>

        <SpatialCard title="System Scope & Legal Boundaries" className="space-y-3" glow>
          <div className="bg-amber-950/30 border border-amber-900/60 rounded-xl p-3.5 text-xs text-amber-200 font-mono">
            <strong>Important Operational Notice:</strong>
            <p className="mt-1 text-slate-300 font-sans">
              QuestForge AI is an advisory pre-screening platform. It does not possess authority to grant scholarships, determine official eligibility, or communicate with governmental awarding bodies.
            </p>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            All verification results are advisory suggestions intended to help students improve their application readiness and resolve documentation ambiguities prior to formal review.
          </p>
        </SpatialCard>
      </div>

      {/* Technical Stack Architecture */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">Architecture</span>
          <h2 className="text-2xl font-headline font-bold text-white tracking-tight mt-1">
            Technology Stack & Design Principles
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SpatialCard className="space-y-3">
            <div className="flex items-center space-x-2 text-white font-headline font-semibold text-sm">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Frontend Architecture</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside font-sans">
              <li>React 18 with Vite for high performance</li>
              <li>Tailwind CSS + Space Grotesk & Inter typography</li>
              <li>Lucide React for consistent icons</li>
              <li>Three.js for interactive crystalline 3D graphics</li>
              <li>Strict accessibility & reduced-motion fallbacks</li>
            </ul>
          </SpatialCard>

          <SpatialCard className="space-y-3">
            <div className="flex items-center space-x-2 text-white font-headline font-semibold text-sm">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Backend & Ingestion</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside font-sans">
              <li>Node.js and Express RESTful API</li>
              <li>Tesseract.js for scanned document OCR</li>
              <li>pdf-parse + zlib flate stream recovery</li>
              <li>Multi-Provider AI: Gemini &rarr; Groq &rarr; NVIDIA</li>
              <li>Deterministic fuzzy string matching</li>
            </ul>
          </SpatialCard>

          <SpatialCard className="space-y-3">
            <div className="flex items-center space-x-2 text-white font-headline font-semibold text-sm">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Security & Privacy</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside font-sans">
              <li>Magic-byte file header validation</li>
              <li>Filename path-traversal sanitization</li>
              <li>Strict Helmet security headers & rate limiting</li>
              <li>Volatile in-memory processing pipeline</li>
              <li>Zero tracking cookies or model training</li>
            </ul>
          </SpatialCard>
        </div>
      </div>

      {/* Deterministic Audit vs AI Assistance */}
      <SpatialCard className="space-y-4 p-6 sm:p-8" glow>
        <div className="flex items-center space-x-2.5">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base sm:text-lg font-headline font-semibold text-white">
            Deterministic Rule Authority vs AI Assistance
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          In QuestForge AI, scholarship requirement rules and document completeness are strictly managed by a deterministic rules engine, not probabilistic large language models. This design ensures absolute reproducibility, transparency, and compliance with published guidelines:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-navy-950/90 p-4 rounded-xl border border-slate-800">
            <strong className="text-cyan-400 block mb-1 font-headline">Deterministic Rules Engine:</strong>
            <span className="text-slate-300 font-sans leading-relaxed block">
              Evaluates mandatory document checklists, cross-references candidate names and dates of birth, calculates income threshold limits, and enforces official guidelines.
            </span>
          </div>
          <div className="bg-navy-950/90 p-4 rounded-xl border border-slate-800">
            <strong className="text-emerald-400 block mb-1 font-headline">AI Structured Extraction:</strong>
            <span className="text-slate-300 font-sans leading-relaxed block">
              Assists in normalizing extracted document text into structured fields. If AI is unavailable or unconfigured, the system automatically runs in deterministic demonstration mode.
            </span>
          </div>
        </div>
      </SpatialCard>

      {/* Live AI Provider Status & Failover */}
      <AIStatusPanel />

      {/* CTA Box */}
      <SpatialCard glow className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-headline font-semibold text-white">Ready to test your application readiness?</h3>
          <p className="text-xs text-slate-400 mt-1 font-sans">Explore available demonstration scholarships and initiate an audit.</p>
        </div>
        <Link
          to="/scholarships"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-headline font-semibold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all shrink-0"
        >
          <span>Explore Scholarships</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </SpatialCard>
    </div>
  )
}
