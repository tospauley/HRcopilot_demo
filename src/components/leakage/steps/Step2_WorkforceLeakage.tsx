/**
 * Step2_WorkforceLeakage.jsx
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 4 — Domain Sections
 * Org types supported: both
 * Dependencies: StepWizard
 * Demo IDs: none
 * Integration: OrganizationalIntelligenceWidget wizard
 */

import React, { useState } from 'react'
import { Field, NumberInput, StepNav, StepHeader, SuggestedBadge } from './StepWizard.jsx'

export default function Step2_WorkforceLeakage({ inputs, profile, defaults, onUpdate, onNext, onBack }) {
  const [local, setLocal] = useState({
    minutesLostPerDay: inputs.minutesLostPerDay ?? defaults.minutesLostPerDay ?? 15,
    turnoverCount:     inputs.turnoverCount     ?? defaults.turnoverCount     ?? null,
    hrTeamSalary:      inputs.hrTeamSalary      ?? defaults.hrTeamSalary      ?? null,
  })

  const set = (k, v) => setLocal(p => ({ ...p, [k]: v }))

  const handleNext = () => {
    onUpdate(local)
    onNext()
  }

  const fmt = (n) => n ? `${Math.round(n).toLocaleString()}` : null

  return (
    <div>
      <StepHeader
        step={2} total={8}
        icon="👥"
        title="Workforce Leakage"
        description="Payroll errors, time theft, turnover costs, and HR admin waste. Enter values in your local currency — all formulas use universal percentage-based benchmarks that apply globally."
      />

      <div className="space-y-5">
        <Field
          label="Minutes lost per employee per day"
          hint="Time spent on non-productive activities — personal phone use, idle time, unofficial breaks. Industry average: 15 min."
        >
          <NumberInput
            value={local.minutesLostPerDay}
            onChange={v => set('minutesLostPerDay', v)}
            placeholder="15"
            min={0}
            max={120}
            suffix="min"
          />
        </Field>

        <Field
          label={`Annual staff turnover count`}
          hint="Number of employees who left in the last 12 months (voluntary + involuntary)."
        >
          <NumberInput
            value={local.turnoverCount}
            onChange={v => set('turnoverCount', v)}
            placeholder={defaults.turnoverCount ? String(defaults.turnoverCount) : 'e.g. 12'}
            min={0}
          />
          <SuggestedBadge
            value={defaults.turnoverCount}
            label={String(defaults.turnoverCount)}
            onApply={() => set('turnoverCount', defaults.turnoverCount)}
          />
        </Field>

        <Field
          label="Annual HR team salary"
          hint="Combined gross salary of your entire HR function. Used to calculate admin waste."
        >
          <NumberInput
            value={local.hrTeamSalary}
            onChange={v => set('hrTeamSalary', v)}
            placeholder={defaults.hrTeamSalary ? String(defaults.hrTeamSalary) : 'e.g. 200000'}
            min={0}
          />
          <SuggestedBadge
            value={defaults.hrTeamSalary}
            label={fmt(defaults.hrTeamSalary)}
            onApply={() => set('hrTeamSalary', defaults.hrTeamSalary)}
          />
        </Field>
      </div>

      <div className="mt-5 p-4 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">What this calculates</p>
        <ul className="space-y-1 text-[10px] text-slate-500 dark:text-slate-400">
          <li>• Payroll error rate — annual payroll × 2% (American Payroll Association)</li>
          <li>• Time theft — minutes lost × 260 days × headcount × hourly rate (ASE)</li>
          <li>• Turnover cost — exits × avg salary × 0.75 replacement rate (SHRM)</li>
          <li>• HR admin waste — HR salary × 40% manual overhead (PwC)</li>
          <li>• Attendance fraud — annual payroll × 1% (ACFE)</li>
          <li>• Training investment loss — exits × avg salary × 2% (LinkedIn)</li>
        </ul>
      </div>

      <StepNav onBack={onBack} onNext={handleNext} onSkip={() => { onUpdate(local); onNext() }} />
    </div>
  )
}
