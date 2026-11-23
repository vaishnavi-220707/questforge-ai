import React from 'react'
import { SpatialCard } from '../components/common/SpatialCard'

export function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest px-2.5 py-1 rounded bg-navy-900 border border-cyan-500/30">
            TERMS & CONDITIONS
          </span>
          <span className="text-xs font-mono text-slate-400">Effective Date: November 2026</span>
        </div>
        <h1 className="text-3xl font-headline font-bold text-white tracking-tight">
          Terms and Conditions
        </h1>
        <p className="text-sm text-slate-300 font-sans leading-relaxed">
          Please read these terms carefully before utilizing QuestForge AI for scholarship application readiness checks.
        </p>
      </div>

      <div className="space-y-6 text-xs text-slate-300 leading-relaxed font-sans">
        <SpatialCard title="1. Acceptance of Terms" className="space-y-2" cornerMarkers={false}>
          <p>
            By accessing or using QuestForge AI, you acknowledge that you understand and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you should not utilize the system.
          </p>
        </SpatialCard>

        <SpatialCard title="2. Educational and Demonstration Nature" className="space-y-2" cornerMarkers={false}>
          <p>
            QuestForge AI is an academic Skill Enhancement Course (SEC) project developed for educational and demonstration purposes. Scholarship datasets, guideline excerpts, and eligibility rules included in this platform are synthetic or sample representations created to demonstrate deterministic verification architectures.
          </p>
          <p>
            Users must always verify current, official scholarship eligibility requirements and submission deadlines directly on official government or institutional scholarship portals.
          </p>
        </SpatialCard>

        <SpatialCard title="3. No Guarantee of Scholarship Sanction" className="space-y-2" cornerMarkers={false}>
          <p>
            QuestForge AI is an advisory pre-screening tool. Achieving a status of "Ready for Review" does not guarantee that your application will be approved, funded, or accepted by any official awarding committee.
          </p>
          <p>
            Conversely, an audit finding of "Action Required" or "Unable to Verify" reflects discrepancies against configured demonstration rules and is intended to guide student preparation.
          </p>
        </SpatialCard>

        <SpatialCard title="4. Prohibited Uses" className="space-y-2" cornerMarkers={false}>
          <p>Users agree not to:</p>
          <ul className="list-disc list-inside space-y-1 font-mono">
            <li>Upload malicious files, executables, or corrupted archives.</li>
            <li>Attempt to reverse-engineer or circumvent backend rate limits or security headers.</li>
            <li>Misrepresent synthetic demonstration results as official government approvals.</li>
            <li>Upload documents belonging to individuals without explicit consent.</li>
          </ul>
        </SpatialCard>

        <SpatialCard title="5. Limitation of Liability" className="space-y-2" cornerMarkers={false}>
          <p>
            To the maximum extent permitted by applicable law, the authors and contributors of QuestForge AI shall not be held liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use this platform, including missed deadlines or administrative rejection of scholarship applications on external portals.
          </p>
        </SpatialCard>
      </div>
    </div>
  )
}
