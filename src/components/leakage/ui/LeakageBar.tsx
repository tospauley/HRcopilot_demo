/**
 * LeakageBar.jsx
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 4 — Domain Sections
 * Org types supported: both
 * Dependencies: hooks/useCurrencyFormat.js
 * Demo IDs: none
 * Integration: DomainCard
 */

import React, { useEffect, useRef, useState } from 'react'

export default function LeakageBar({ value, maxValue, color = '#0047cc', label, animated = true }) {
  const [width, setWidth] = useState(0)
  const pct = maxValue > 0 ? Math.min(100, (value / maxValue) * 100) : 0

  useEffect(() => {
    if (!animated) { setWidth(pct); return }
    const timer = setTimeout(() => setWidth(pct), 100)
    return () => clearTimeout(timer)
  }, [pct, animated])

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
          <span className="text-[9px] font-black text-slate-500">{pct.toFixed(1)}%</span>
        </div>
      )}
      <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
