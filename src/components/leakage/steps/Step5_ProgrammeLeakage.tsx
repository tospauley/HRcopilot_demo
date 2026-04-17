/**
 * Step5_ProgrammeLeakage.jsx
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 4 — Domain Sections
 * Org types supported: ngo
 * Dependencies: StepWizard
 * Demo IDs: none
 * Integration: OrganizationalIntelligenceWidget wizard
 */

import React, { useState } from 'react'
import { Field, NumberInput, StepNav, StepHeader, SuggestedBadge } from './StepWizard.jsx'

export default function Step5_ProgrammeLeakage({ inputs, profile, defaults, onUpdate, onNext, onBack }) {
  const [local, setLocal] = useState({
    programmeBudget:    inputs.programmeBudget    ?? defaults.programmeBudget    ?? null,
    numberOfProjects:   inputs.numberOfProjects   ?? null,
    avgGrantValue:      inputs.avgGrantValue      ?? null,
    grantReportsPerYear:inputs.grantReportsPerYear ?? defaults.grantReportsPerYear ?? null,
  })

  const set = (k, v) => setLocal(p => ({ ...p, [k]: v }))
  const handleNext = () => { onUpdate(local); onNext() }
  const fmt = (n) => n ? `${Math.round(n).toLocaleString()}` : null

  return (
    <div>
      <StepHeader
        step={5} total={8}
        icon="🎯"
        title="Programme Delivery Leakage"
        description="Beneficiary targeting errors, project overruns, unverified outcomes, and donor fund leakage."
      />

      <div className="space-y-5">
        <Field
          label="Programme budget"
          hint="Total budget allocated to programme delivery (excluding admin). Typically 70–80% of total budget."
        >
          <NumberInput
            value={local.programmeBudget}
            onChange={v => set('programmeBudget', v)}
            placeholder={defaults.programmeBudget ? String(defaults.programmeBudget) : 'e.g. 2000000'}
            min={0}
          />
          <SuggestedBadge
            value={defaults.programmeBudget}
            label={String(Math.round(defaults.programmeBudget || 0).toLocaleString())}
            onApply={() => set('programmeBudget', defaults.programmeBudget)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Number of active projects" hint="Concurrent programmes or projects running.">
            <NumberInput
              value={local.numberOfProjects}
              onChange={v => set('numberOfProjects', v)}
              placeholder="e.g. 5"
              min={0}
            />
          </Field>
          <Field label="Average grant value" hint="Typical grant size received.">
            <NumberInput
              value={local.avgGrantValue}
              onChange={v => set('avgGrantValue', v)}
              placeholder="e.g. 200000"
              min={0}
            />
          </Field>
        </div>

        <Field
          label="Grant reports submitted per year"
          hint="Each report takes ~160 hours of finance staff time. (BOND NGO Network)"
        >
          <NumberInput
            value={local.grantReportsPerYear}
            onChange={v => set('grantReportsPerYear', v)}
            placeholder={defaults.grantReportsPerYear ? String(defaults.grantReportsPerYear) : 'e.g. 8'}
            min={0}
          />
          <SuggestedBadge
            value={defaults.grantReportsPerYear}
            label={String(defaults.grantReportsPerYear)}
            onApply={() => set('grantReportsPerYear', defaults.grantReportsPerYear)}
          />
        </Field>
      </div>

      <div className="mt-5 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-100 dark:border-teal-700/30">
        <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest mb-2">What this calculates</p>
        <ul className="space-y-1 text-[10px] text-teal-700 dark:text-teal-400">
          <li>• Beneficiary targeting errors — programme budget × 12% (World Bank)</li>
          <li>• Project overruns — programme budget × 30% (PMI)</li>
          <li>• Unverified outcomes — programme budget × 15% (DFID)</li>
          <li>• Donor fund leakage — excess admin ratio + grant risk + duplicates (GuideStar)</li>
          <li>• Grant reporting cost — reports × 160hrs × finance hourly rate (BOND)</li>
        </ul>
      </div>

      <StepNav onBack={onBack} onNext={handleNext} onSkip={() => { onUpdate(local); onNext() }} />
    </div>
  )
}
