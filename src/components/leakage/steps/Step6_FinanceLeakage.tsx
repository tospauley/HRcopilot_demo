/**
 * Step6_FinanceLeakage.jsx
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 4 — Domain Sections
 * Org types supported: both
 * Dependencies: StepWizard
 * Demo IDs: none
 * Integration: OrganizationalIntelligenceWidget wizard
 */

import React, { useState } from 'react'
import { Field, NumberInput, StepNav, StepHeader, SuggestedBadge } from './StepWizard.jsx'

export default function Step6_FinanceLeakage({ inputs, profile, defaults, onUpdate, onNext, onBack }) {
  const [local, setLocal] = useState({
    financeTeamSalary: inputs.financeTeamSalary ?? defaults.financeTeamSalary ?? null,
    avgDaysToClose:    inputs.avgDaysToClose    ?? defaults.avgDaysToClose    ?? 10,
  })

  const set = (k, v) => setLocal(p => ({ ...p, [k]: v }))
  const handleNext = () => { onUpdate(local); onNext() }

  return (
    <div>
      <StepHeader
        step={6} total={8}
        icon="🏦"
        title="Finance & Accounting Leakage"
        description="Reconciliation waste, late payment penalties, duplicate payments, and slow financial close costs."
      />

      <div className="space-y-5">
        <Field
          label="Finance team total annual salary"
          hint="Combined gross salary of your finance and accounting function."
        >
          <NumberInput
            value={local.financeTeamSalary}
            onChange={v => set('financeTeamSalary', v)}
            placeholder={defaults.financeTeamSalary ? String(defaults.financeTeamSalary) : 'e.g. 150000'}
            min={0}
          />
          <SuggestedBadge
            value={defaults.financeTeamSalary}
            label={String(Math.round(defaults.financeTeamSalary || 0).toLocaleString())}
            onApply={() => set('financeTeamSalary', defaults.financeTeamSalary)}
          />
        </Field>

        <Field
          label="Average days to close monthly books"
          hint="How many business days after month-end to produce final accounts. Industry benchmark: 8.5 days. (Ventana Research)"
        >
          <NumberInput
            value={local.avgDaysToClose}
            onChange={v => set('avgDaysToClose', v)}
            placeholder="10"
            min={1} max={60} suffix="days"
          />
        </Field>
      </div>

      <div className="mt-5 p-4 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">What this calculates</p>
        <ul className="space-y-1 text-[10px] text-slate-500 dark:text-slate-400">
          <li>• Reconciliation waste — finance salary × 35% manual overhead (Blackline)</li>
          <li>• Late payment penalties — annual AP × 1.5% (industry average)</li>
          <li>• Duplicate payments — annual AP × 0.3% (IOFM)</li>
          <li>• Reporting delay cost — excess close days × daily revenue × 0.1% (Ventana)</li>
          <li>• Audit preparation waste — finance salary × 15% (PwC)</li>
        </ul>
      </div>

      <StepNav onBack={onBack} onNext={handleNext} onSkip={() => { onUpdate(local); onNext() }} />
    </div>
  )
}
