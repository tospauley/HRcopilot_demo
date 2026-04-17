/**
 * Step3_PerformanceLeakage.jsx
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 4 — Domain Sections
 * Org types supported: both
 * Dependencies: StepWizard
 * Demo IDs: none
 * Integration: OrganizationalIntelligenceWidget wizard
 */

import React, { useState } from 'react'
import { Field, NumberInput, StepNav, StepHeader, SuggestedBadge } from './StepWizard.jsx'

export default function Step3_PerformanceLeakage({ inputs, profile, defaults, onUpdate, onNext, onBack }) {
  const [local, setLocal] = useState({
    lowPerformerPercent:    inputs.lowPerformerPercent    ?? 15,
    managerCount:           inputs.managerCount           ?? defaults.managerCount ?? null,
    appraisalCyclesPerYear: inputs.appraisalCyclesPerYear ?? 2,
    topTalentLostPerYear:   inputs.topTalentLostPerYear   ?? null,
  })

  const set = (k, v) => setLocal(p => ({ ...p, [k]: v }))

  const handleNext = () => { onUpdate(local); onNext() }

  return (
    <div>
      <StepHeader
        step={3} total={8}
        icon="📊"
        title="Performance Leakage"
        description="Underperformance, disengagement, appraisal waste, and top talent loss. The hidden productivity tax."
      />

      <div className="space-y-5">
        <Field
          label="Low performer percentage (%)"
          hint="Employees consistently performing below expectations. Global average: 15%. (McKinsey)"
        >
          <NumberInput
            value={local.lowPerformerPercent}
            onChange={v => set('lowPerformerPercent', v)}
            placeholder="15"
            min={0} max={100} suffix="%"
          />
        </Field>

        <Field
          label="Number of managers"
          hint="Managers who conduct performance appraisals. Used to calculate appraisal time cost."
        >
          <NumberInput
            value={local.managerCount}
            onChange={v => set('managerCount', v)}
            placeholder={defaults.managerCount ? String(defaults.managerCount) : 'e.g. 10'}
            min={0}
          />
          <SuggestedBadge
            value={defaults.managerCount}
            label={String(defaults.managerCount)}
            onApply={() => set('managerCount', defaults.managerCount)}
          />
        </Field>

        <Field
          label="Appraisal cycles per year"
          hint="How many formal performance review cycles run annually. Typical: 1–2."
        >
          <NumberInput
            value={local.appraisalCyclesPerYear}
            onChange={v => set('appraisalCyclesPerYear', v)}
            placeholder="2"
            min={1} max={12}
          />
        </Field>

        <Field
          label="Top talent lost per year"
          hint="High performers (top 10%) who resigned in the last 12 months. Each costs 2× their salary to replace. (SHRM)"
        >
          <NumberInput
            value={local.topTalentLostPerYear}
            onChange={v => set('topTalentLostPerYear', v)}
            placeholder="e.g. 2"
            min={0}
          />
        </Field>
      </div>

      <div className="mt-5 p-4 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">What this calculates</p>
        <ul className="space-y-1 text-[10px] text-slate-500 dark:text-slate-400">
          <li>• Underperformance — low performers × 30% productivity gap × avg salary (McKinsey)</li>
          <li>• Disengagement — 34% of staff × avg salary × 34% productivity loss (Gallup)</li>
          <li>• Appraisal waste — managers × hours per cycle × cycles × manager rate (Deloitte)</li>
          <li>• Top talent loss — exits × avg salary × 2.0 (SHRM)</li>
        </ul>
      </div>

      <StepNav onBack={onBack} onNext={handleNext} onSkip={() => { onUpdate(local); onNext() }} />
    </div>
  )
}
