import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, BookOpen, ExternalLink, Cpu, Lock } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-navy-950/95 border-t border-slate-800 text-slate-400 text-xs font-sans relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Academic Disclosure */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-navy-800 to-navy-900 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-headline font-bold text-xs shadow-[0_0_12px_rgba(0,240,255,0.2)]">
                QF
              </div>
              <span className="font-headline font-bold text-white tracking-tight text-base">
                QUESTFORGE <span className="text-cyan-400">AI</span>
              </span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed max-w-md font-sans">
              AI-Powered Scholarship Application Readiness and Document Verification Platform.
              An academic Skill Enhancement Course (SEC) project built to assist students with pre-submission document checks.
            </p>
            <div className="p-3.5 bg-navy-900/80 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-400 space-y-1 max-w-md">
              <strong className="text-slate-200 block font-headline">Academic Scope & Protocol Notice:</strong>
              QuestForge AI is a pre-submission auditing assistant. It does not approve scholarships, guarantee eligibility, or replace official state, central, or university scholarship portals.
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 font-mono">
            <h4 className="font-headline font-semibold text-white text-xs uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/scholarships" className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Scholarship Explorer
                </Link>
              </li>
              <li>
                <Link to="/upload" className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Upload & Audit Studio
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Architecture & Scope
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Student Account & Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance & Legal */}
          <div className="space-y-3 font-mono">
            <h4 className="font-headline font-semibold text-white text-xs uppercase tracking-wider">Compliance & Protocol</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/privacy" className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Contact Course Team
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} QuestForge AI. Academic SEC Project. All demonstration data is synthetic.</p>
          <div className="flex items-center space-x-5">
            <Link to="/about" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors">
              <Cpu className="w-3.5 h-3.5 mr-1.5" /> Multi-AI Failover Active
            </Link>
            <span className="inline-flex items-center text-slate-400">
              <Lock className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Client-Side Privacy Enclave
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
