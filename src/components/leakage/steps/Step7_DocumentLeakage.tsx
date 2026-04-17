/**
 * Step7_DocumentLeakage.jsx
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 4 — Domain Sections
 * Org types supported: both
 * Dependencies: StepWizard
 * Demo IDs: none
 * Integration: OrganizationalIntelligenceWidget wizard
 */

import React, { useState } from 'react'
import { Field, NumberInput, StepNav, StepHeader, SuggestedBadge } from './StepWizard.jsx'

export default function Step7_DocumentLeakage({ inputs, profile, defaults, onUpdate, onNext, onBack }) {
  const [local, setLocal] = useState({
    knowledgeWorkerCount: inputs.knowledgeWorkerCount ?? defaults.knowledgeWorkerCount ?? null,
  })

  const set = (k, v) => setLocal(p => ({ ...p, [k]: v }))
  const handleNext = () => { onUpdate(local); onNext() }

  const estimatedKW = defaults.knowledgeWorkerCount || Math.round((profile.headcount || 0) * 0.4)

  return (
    <div>
      <StepHeader
        step={7} total={8}
        icon="📁"
        title="Document & Knowledge Leakage"
        description="Document search time, recreation costs, and institutional knowledge lost when employees leave."
      />

      <div className="space-y-5">
        <Field
          label="Knowledge workers (desk-based staff)"
          hint="Employees who primarily work with information — analysts, managers, coordinators, finance, HR. They spend 1.5hrs/day searching for documents. (IDC)"
        >
          <NumberInput
            value={local.knowledgeWorkerCount}
            onChange={v => set('knowledgeWorkerCount', v)}
            placeholder={String(estimatedKW)}
            min={0}
            max={profile.headcount || 9999}
          />
          <SuggestedBadge
            value={estimatedKW}
            label={`${estimatedKW} (40% of headcount)`}
            onApply={() => set('knowledgeWorkerCount', estimatedKW)}
          />
        </Field>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-700/30">
          <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2">IDC Research Finding</p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Knowledge workers spend <strong>1.5 hours per day</strong> searching for documents they cannot find.
            Operational workers spend <strong>20 minutes per day</strong> on the same problem.
            That is 11% of your payroll, wasted on search alone.
          </p>
        </div>
      </div>

      <div className="mt-5 p-4 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">What this calculates</p>
        <ul className="space-y-1 text-[10px] text-slate-500 dark:text-slate-400">
          <li>• Document search cost — KW × 1.5hrs + ops × 0.33hrs × 260 days × hourly rate (IDC)</li>
          <li>• Document recreation — search cost × 25% (AIIM)</li>
          <li>• Knowledge loss at exit — turnover × avg salary × 42% × 50% (Deloitte)</li>
        </ul>
      </div>

      <StepNav onBack={onBack} onNext={handleNext} onSkip={() => { onUpdate(local); onNext() }} />
    </div>
  )
}
