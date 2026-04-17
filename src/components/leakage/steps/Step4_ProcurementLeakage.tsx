/**
 * Step4_ProcurementLeakage.jsx
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 4 — Domain Sections
 * Org types supported: both
 * Dependencies: StepWizard
 * Demo IDs: none
 * Integration: OrganizationalIntelligenceWidget wizard
 */

import React, { useState } from 'react'
import { Field, NumberInput, StepNav, StepHeader, SuggestedBadge } from './StepWizard.jsx'

export default function Step4_ProcurementLeakage({ inputs, profile, defaults, onUpdate, onNext, onBack }) {
  const [local, setLocal] = useState({
    annualProcurementSpend: inputs.annualProcurementSpend ?? defaults.annualProcurementSpend ?? null,
    purchaseOrderCount:     inputs.purchaseOrderCount     ?? defaults.purchaseOrderCount     ?? null,
    monthlyAPSpend:         inputs.monthlyAPSpend         ?? defaults.monthlyAPSpend         ?? null,
  })

  const set = (k, v) => setLocal(p => ({ ...p, [k]: v }))
  const handleNext = () => { onUpdate(local); onNext() }
  const fmt = (n) => n ? `${Math.round(n).toLocaleString()}` : null

  return (
    <div>
      <StepHeader
        step={4} total={8}
        icon="🛒"
        title="Procurement Leakage"
        description="Maverick spending, vendor overpricing, manual PO costs, contract leakage, and duplicate payments."
      />

      <div className="space-y-5">
        <Field
          label="Annual procurement spend"
          hint="Total spend on goods and services (excluding payroll). Drives maverick spending and contract leakage calculations."
        >
          <NumberInput
            value={local.annualProcurementSpend}
            onChange={v => set('annualProcurementSpend', v)}
            placeholder={defaults.annualProcurementSpend ? String(defaults.annualProcurementSpend) : 'e.g. 500000'}
            min={0}
          />
          <SuggestedBadge
            value={defaults.annualProcurementSpend}
            label={fmt(defaults.annualProcurementSpend)}
            onApply={() => set('annualProcurementSpend', defaults.annualProcurementSpend)}
          />
        </Field>

        <Field
          label="Annual purchase order count"
          hint="Number of POs raised per year. Each manual PO costs ~$175 to process. (APQC)"
        >
          <NumberInput
            value={local.purchaseOrderCount}
            onChange={v => set('purchaseOrderCount', v)}
            placeholder={defaults.purchaseOrderCount ? String(defaults.purchaseOrderCount) : 'e.g. 100'}
            min={0}
          />
          <SuggestedBadge
            value={defaults.purchaseOrderCount}
            label={String(defaults.purchaseOrderCount)}
            onApply={() => set('purchaseOrderCount', defaults.purchaseOrderCount)}
          />
        </Field>

        <Field
          label="Monthly accounts payable spend"
          hint="Monthly total of supplier invoices processed. Used to calculate duplicate payments and late penalties."
        >
          <NumberInput
            value={local.monthlyAPSpend}
            onChange={v => set('monthlyAPSpend', v)}
            placeholder={defaults.monthlyAPSpend ? String(defaults.monthlyAPSpend) : 'e.g. 50000'}
            min={0}
          />
          <SuggestedBadge
            value={defaults.monthlyAPSpend}
            label={fmt(defaults.monthlyAPSpend)}
            onApply={() => set('monthlyAPSpend', defaults.monthlyAPSpend)}
          />
        </Field>
      </div>

      <div className="mt-5 p-4 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">What this calculates</p>
        <ul className="space-y-1 text-[10px] text-slate-500 dark:text-slate-400">
          <li>• Maverick spending — procurement × 20% off-contract (Hackett Group)</li>
          <li>• Vendor overpricing — procurement × 8% (CIPS)</li>
          <li>• Manual PO cost — PO count × $175 per PO (APQC)</li>
          <li>• Contract leakage — procurement × 9% (IACCM)</li>
          <li>• Duplicate payments — annual AP × 0.3% (IOFM)</li>
        </ul>
      </div>

      <StepNav onBack={onBack} onNext={handleNext} onSkip={() => { onUpdate(local); onNext() }} />
    </div>
  )
}
