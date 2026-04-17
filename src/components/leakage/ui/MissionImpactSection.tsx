/**
 * MissionImpactSection.jsx
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 6 — Close Sections
 * Org types supported: ngo
 * Dependencies: useCurrencyFormat
 * Demo IDs: mission-impact-section
 * Integration: OrganizationalIntelligenceWidget
 */

import React from 'react'
import { useCurrencyFormat } from '../hooks/useCurrencyFormat.js'

export default function MissionImpactSection({ results, profile, currency, locale }) {
  const { format } = useCurrencyFormat(currency, locale)
  const { recoveryEstimate, additionalBeneficiaries, programmeEfficiencyRatio } = results

  const efficiencyPct = programmeEfficiencyRatio
    ? (programmeEfficiencyRatio * 100).toFixed(1)
    : null

  return (
    <div
      data-demo-id="mission-impact-section"
      className="bg-gradient-to-br from-teal-900 to-teal-950 border border-teal-700 rounded-2xl p-8 text-white space-y-6"
    >
      <div>
        <p className="text-[10px] font-black text-teal-300/60 uppercase tracking-widest mb-1">
          Mission Impact Recovery
        </p>
        <h3 className="text-2xl font-black uppercase tracking-tight">
          Every Recovered Dollar Reaches Beneficiaries
        </h3>
        <p className="text-teal-200/80 text-sm mt-2">
          Operational efficiency is not just a financial metric — it is a mission multiplier.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-[8px] font-black text-teal-200/60 uppercase tracking-widest mb-1">Budget Recovered</p>
          <p className="text-xl font-black tabular-nums">{format(recoveryEstimate)}</p>
        </div>
        {additionalBeneficiaries > 0 && (
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-[8px] font-black text-teal-200/60 uppercase tracking-widest mb-1">Additional Beneficiaries</p>
            <p className="text-2xl font-black tabular-nums">{additionalBeneficiaries.toLocaleString()}</p>
          </div>
        )}
        {efficiencyPct && (
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-[8px] font-black text-teal-200/60 uppercase tracking-widest mb-1">Programme Efficiency</p>
            <p className="text-2xl font-black tabular-nums">{efficiencyPct}%</p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button className="flex-1 py-3 bg-white text-teal-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-50 transition-colors shadow-lg">
          Book a Demo
        </button>
        <button className="flex-1 py-3 bg-white/10 text-white border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-colors">
          Download Report
        </button>
      </div>
    </div>
  )
}
