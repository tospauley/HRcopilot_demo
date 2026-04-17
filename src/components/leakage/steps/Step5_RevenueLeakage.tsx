/**
 * Step5_RevenueLeakage.jsx
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 4 — Domain Sections
 * Org types supported: commercial
 * Dependencies: StepWizard
 * Demo IDs: none
 * Integration: OrganizationalIntelligenceWidget wizard
 */

import React, { useState } from 'react'
import { Field, NumberInput, StepNav, StepHeader } from './StepWizard.jsx'

export default function Step5_RevenueLeakage({ inputs, onUpdate, onNext, onBack }) {
  const [local, setLocal] = useState({
    monthlyLeadVolume:        inputs.monthlyLeadVolume        ?? null,
    avgDealValue:             inputs.avgDealValue             ?? null,
    salesTeamSalary:          inputs.salesTeamSalary          ?? null,
    monthlyChurnRate:         inputs.monthlyChurnRate         ?? null,
    avgCustomerLifetimeValue: inputs.avgCustomerLifetimeValue ?? null,
  })

  const set = (k, v) => setLocal(p => ({ ...p, [k]: v }))
  const handleNext = () => { onUpdate(local); onNext() }

  return (
    <div>
      <StepHeader
        step={5} total={8}
        icon="💰"
        title="Revenue Leakage"
        description="Lead decay, pipeline blindness, customer churn, and sales admin waste. Your top-line leakage."
      />

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Monthly lead volume" hint="New leads entering your pipeline per month.">
            <NumberInput value={local.monthlyLeadVolume} onChange={v => set('monthlyLeadVolume', v)} placeholder="e.g. 50" min={0} />
          </Field>
          <Field label="Avg deal value" hint="Average closed deal value in your local currency.">
            <NumberInput value={local.avgDealValue} onChange={v => set('avgDealValue', v)} placeholder="e.g. 10000" min={0} />
          </Field>
        </div>

        <Field label="Sales team total annual salary" hint="66% of sales time is spent on non-selling activities. (Salesforce State of Sales)">
          <NumberInput value={local.salesTeamSalary} onChange={v => set('salesTeamSalary', v)} placeholder="e.g. 500000" min={0} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Monthly customer churn count" hint="Customers lost per month.">
            <NumberInput value={local.monthlyChurnRate} onChange={v => set('monthlyChurnRate', v)} placeholder="e.g. 3" min={0} />
          </Field>
          <Field label="Avg customer lifetime value" hint="Revenue per customer over their lifetime.">
            <NumberInput value={local.avgCustomerLifetimeValue} onChange={v => set('avgCustomerLifetimeValue', v)} placeholder="e.g. 25000" min={0} />
          </Field>
        </div>
      </div>

      <div className="mt-5 p-4 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">What this calculates</p>
        <ul className="space-y-1 text-[10px] text-slate-500 dark:text-slate-400">
          <li>• Lead decay — 35% of leads decay before follow-up, conversion drops 7× (HBR)</li>
          <li>• Pipeline blindness — 3-month pipeline × 12% invisible loss (Salesforce)</li>
          <li>• Customer churn — monthly churn × 12 × avg LTV (Bain)</li>
          <li>• Sales admin waste — sales salary × 66% non-selling time (Salesforce)</li>
        </ul>
      </div>

      <StepNav onBack={onBack} onNext={handleNext} onSkip={() => { onUpdate(local); onNext() }} />
    </div>
  )
}
