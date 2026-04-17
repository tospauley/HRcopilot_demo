/**
 * Step8_ComplianceLeakage.jsx
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 4 — Domain Sections
 * Org types supported: both
 * Dependencies: StepWizard
 * Demo IDs: none
 * Integration: OrganizationalIntelligenceWidget wizard
 */

import React, { useState } from 'react'
import { Toggle, StepNav, StepHeader } from './StepWizard.jsx'

export default function Step8_ComplianceLeakage({ inputs, profile, defaults, onUpdate, onNext, onBack, isNGO }) {
  const [local, setLocal] = useState({
    multipleJurisdictions:    inputs.multipleJurisdictions    ?? false,
    multiCurrency:            inputs.multiCurrency            ?? false,
    industryRegulations:      inputs.industryRegulations      ?? false,
    dataPrivacyObligations:   inputs.dataPrivacyObligations   ?? false,
    recentComplianceFinding:  inputs.recentComplianceFinding  ?? false,
    mediaRiskLevel:           inputs.mediaRiskLevel           ?? 'low',
  })

  const set = (k, v) => setLocal(p => ({ ...p, [k]: v }))
  const handleNext = () => { onUpdate(local); onNext() }

  // Risk score preview
  const score = [
    local.multipleJurisdictions ? 2 : 0,
    local.multiCurrency ? 1 : 0,
    local.industryRegulations ? 2 : 0,
    local.dataPrivacyObligations ? 2 : 0,
    local.recentComplianceFinding ? 3 : 0,
  ].reduce((a, b) => a + b, 0)

  const riskLabel = score <= 3 ? 'Low' : score <= 6 ? 'Medium' : 'High'
  const riskColor = score <= 3 ? 'text-emerald-500' : score <= 6 ? 'text-amber-500' : 'text-rose-500'

  return (
    <div>
      <StepHeader
        step={8} total={8}
        icon="⚖️"
        title={isNGO ? 'Compliance & Reputational Risk' : 'Compliance & Risk Leakage'}
        description="Jurisdiction-agnostic risk assessment. Applies globally regardless of where you operate."
      />

      <div className="space-y-4">
        <Toggle
          label="Operating in multiple jurisdictions"
          description="Different countries, states, or regulatory zones with separate compliance requirements."
          checked={local.multipleJurisdictions}
          onChange={v => set('multipleJurisdictions', v)}
        />
        <Toggle
          label="Multi-currency operations"
          description="Transactions in more than one currency, requiring FX management and reconciliation."
          checked={local.multiCurrency}
          onChange={v => set('multiCurrency', v)}
        />
        <Toggle
          label="Subject to industry-specific regulations"
          description="Sector regulations beyond standard employment law (e.g. financial services, healthcare, food safety)."
          checked={local.industryRegulations}
          onChange={v => set('industryRegulations', v)}
        />
        <Toggle
          label="Data privacy obligations (GDPR, NDPR, etc.)"
          description="Formal data protection obligations requiring documented compliance processes."
          checked={local.dataPrivacyObligations}
          onChange={v => set('dataPrivacyObligations', v)}
        />
        <Toggle
          label="Recent compliance finding or audit issue"
          description="Any regulatory finding, audit exception, or compliance breach in the last 24 months."
          checked={local.recentComplianceFinding}
          onChange={v => set('recentComplianceFinding', v)}
        />

        {isNGO && (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Media & Reputational Risk Level</p>
            <div className="flex gap-2">
              {['low', 'medium', 'high'].map(level => (
                <button
                  key={level}
                  onClick={() => set('mediaRiskLevel', level)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    local.mediaRiskLevel === level
                      ? level === 'low' ? 'bg-emerald-500 text-white'
                        : level === 'medium' ? 'bg-amber-500 text-white'
                        : 'bg-rose-500 text-white'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-slate-400">
              {local.mediaRiskLevel === 'low' && 'Low: 5% donor attrition risk (CAF World Giving Index)'}
              {local.mediaRiskLevel === 'medium' && 'Medium: 15% donor attrition risk (CAF World Giving Index)'}
              {local.mediaRiskLevel === 'high' && 'High: 30% donor attrition risk (CAF World Giving Index)'}
            </p>
          </div>
        )}
      </div>

      {/* Risk score preview */}
      <div className="mt-5 p-4 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Compliance Risk Score</p>
          <p className="text-[9px] text-slate-400 mt-0.5">annualPayroll × 5% × score/10 (ACFE)</p>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-black ${riskColor}`}>{score}/10</p>
          <p className={`text-[9px] font-black uppercase ${riskColor}`}>{riskLabel} Risk</p>
        </div>
      </div>

      <StepNav
        onBack={onBack}
        onNext={handleNext}
        nextLabel="View Results →"
      />
    </div>
  )
}
