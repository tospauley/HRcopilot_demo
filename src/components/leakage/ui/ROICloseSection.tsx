/**
 * ROICloseSection.jsx
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 6 — Close Sections
 * Org types supported: commercial
 * Dependencies: useCurrencyFormat
 * Demo IDs: roi-close-section
 * Integration: OrganizationalIntelligenceWidget
 */

import React from 'react'
import { useCurrencyFormat } from '../hooks/useCurrencyFormat.js'

export default function ROICloseSection({ results, currency, locale }) {
  const { format } = useCurrencyFormat(currency, locale)
  const { yearOneROI, breakEvenMonths, threeYearGain, recoveryEstimate, HRcopilotAnnualCost } = results

  return (
    <div
      data-demo-id="roi-close-section"
      className="bg-gradient-to-br from-[#0047cc] to-[#002b7a] rounded-2xl p-8 text-white space-y-6"
    >
      <div>
        <p className="text-[10px] font-black text-blue-200/60 uppercase tracking-widest mb-1">
          Return on Investment
        </p>
        <h3 className="text-2xl font-black uppercase tracking-tight">
          HRcopilot Pays for Itself
        </h3>
        <p className="text-blue-200/80 text-sm mt-2">
          Based on 50% leakage recovery — a conservative estimate used across enterprise deployments.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-[8px] font-black text-blue-200/60 uppercase tracking-widest mb-1">Year 1 ROI</p>
          <p className="text-2xl font-black tabular-nums">
            {yearOneROI > 0 ? `${Math.round(yearOneROI)}%` : '—'}
          </p>
        </div>
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-[8px] font-black text-blue-200/60 uppercase tracking-widest mb-1">Break-Even</p>
          <p className="text-2xl font-black tabular-nums">
            {breakEvenMonths > 0 ? `${breakEvenMonths.toFixed(1)}mo` : '—'}
          </p>
        </div>
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-[8px] font-black text-blue-200/60 uppercase tracking-widest mb-1">Year 1 Recovery</p>
          <p className="text-xl font-black tabular-nums">{format(recoveryEstimate)}</p>
        </div>
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-[8px] font-black text-blue-200/60 uppercase tracking-widest mb-1">3-Year Net Gain</p>
          <p className="text-xl font-black tabular-nums">{format(threeYearGain)}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button className="flex-1 py-3 bg-white text-[#0047cc] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-colors shadow-lg">
          Book a Demo
        </button>
        <button className="flex-1 py-3 bg-white/10 text-white border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-colors">
          Download Report
        </button>
      </div>
    </div>
  )
}
