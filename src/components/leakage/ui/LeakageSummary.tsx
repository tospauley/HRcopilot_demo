/**
 * LeakageSummary.jsx
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 4 — Domain Sections
 * Org types supported: both
 * Dependencies: DomainCard, useCurrencyFormat
 * Demo IDs: leakage-summary-total
 * Integration: OrganizationalIntelligenceWidget
 */

import React from 'react'
import DomainCard from './DomainCard.jsx'
import { useCurrencyFormat } from '../hooks/useCurrencyFormat.js'

const DOMAIN_ORDER = ['workforce', 'performance', 'procurement', 'revenue', 'programme', 'finance', 'document', 'compliance', 'reputational']

export default function LeakageSummary({ results, profile, currency, locale }) {
  const { format } = useCurrencyFormat(currency, locale)
  const { sections, totalLeakage, recoveryEstimate } = results

  const activeDomains = DOMAIN_ORDER.filter(key => sections[key] && sections[key].total > 0)

  return (
    <div className="space-y-4">
      {/* Total bar */}
      <div
        data-demo-id="leakage-summary-total"
        className="bg-slate-900 dark:bg-white/5 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Total Annual Leakage
          </p>
          <p className="text-4xl font-black text-white tabular-nums">
            {format(totalLeakage)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">
            Estimated Recovery with HRcopilot
          </p>
          <p className="text-2xl font-black text-emerald-400 tabular-nums">
            {format(recoveryEstimate)}
          </p>
          <p className="text-[9px] text-slate-400 mt-1">50% recovery estimate</p>
        </div>
      </div>

      {/* Domain cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {activeDomains.map(key => (
          <DomainCard
            key={key}
            domainKey={key}
            section={sections[key]}
            totalLeakage={totalLeakage}
            annualPayroll={profile?.annualPayroll || 0}
            currency={currency}
            locale={locale}
            isNGO={profile?.isNGO}
          />
        ))}
      </div>
    </div>
  )
}
