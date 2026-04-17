/**
 * LeakageClock.jsx
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 3 — Core UI
 * Org types supported: both
 * Dependencies: hooks/useLiveClock.js, hooks/useCurrencyFormat.js
 * Demo IDs: leakage-clock
 * Integration: OrganizationalIntelligenceWidget
 */

import React, { memo } from 'react'
import { useLiveClock } from '../hooks/useLiveClock.js'
import { useCurrencyFormat } from '../hooks/useCurrencyFormat.js'

// Isolated component — its state updates must NOT re-render parents
const LeakageClock = memo(({ perSecondLeakage, currency, locale, active, isNGO }) => {
  const { totalLost } = useLiveClock(perSecondLeakage, active)
  const { format } = useCurrencyFormat(currency, locale)

  const perDay = perSecondLeakage * 86400
  const perMonth = perSecondLeakage * 2592000
  const perYear = perSecondLeakage * 31536000

  const accentColor = isNGO ? 'teal' : 'red'
  const bgClass = isNGO
    ? 'bg-teal-950 border-teal-700'
    : 'bg-red-950 border-red-700'
  const labelClass = isNGO ? 'text-teal-400' : 'text-red-400'
  const subLabel = isNGO ? 'Budget Efficiency Lost Since You Opened This Report' : 'Lost Since You Opened This Report'

  return (
    <div
      data-demo-id="leakage-clock"
      className={`${bgClass} border rounded-xl p-6 text-center`}
    >
      <p className={`${labelClass} text-sm font-medium uppercase tracking-widest mb-2`}>
        {subLabel}
      </p>

      <div className="text-5xl font-bold text-white font-mono tabular-nums leading-none mb-1">
        {format(totalLost)}
      </div>

      {!active && (
        <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest">
          Complete your profile to activate the live counter
        </p>
      )}

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className={labelClass}>Per Day</p>
          <p className="text-white font-semibold tabular-nums">{format(perDay)}</p>
        </div>
        <div>
          <p className={labelClass}>Per Month</p>
          <p className="text-white font-semibold tabular-nums">{format(perMonth)}</p>
        </div>
        <div>
          <p className={labelClass}>Per Year</p>
          <p className="text-white font-semibold tabular-nums">{format(perYear)}</p>
        </div>
      </div>
    </div>
  )
}, (prev, next) => {
  // Only block re-renders that don't change meaningful props
  // Always re-render when active state or leakage rate changes
  return (
    prev.active === next.active &&
    prev.perSecondLeakage === next.perSecondLeakage &&
    prev.currency === next.currency &&
    prev.isNGO === next.isNGO
  )
})

LeakageClock.displayName = 'LeakageClock'
export default LeakageClock
