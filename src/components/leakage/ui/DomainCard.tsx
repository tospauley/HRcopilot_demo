/**
 * DomainCard.jsx
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 4 — Domain Sections
 * Org types supported: both
 * Dependencies: LeakageBar, useCurrencyFormat
 * Demo IDs: domain-[domainName], domain-[domainName]-expand
 * Integration: LeakageSummary, OrganizationalIntelligenceWidget
 */

import React, { useState, useEffect, useRef } from 'react'
import LeakageBar from './LeakageBar.jsx'
import { useCurrencyFormat } from '../hooks/useCurrencyFormat.js'

// Animated counter — counts up from 0 to value on mount
function AnimatedValue({ value, format }) {
  const [displayed, setDisplayed] = useState(0)
  const rafRef = useRef(null)
  const startRef = useRef(null)
  const DURATION = 1200

  useEffect(() => {
    if (!value) return
    startRef.current = Date.now()
    const from = 0
    const to = value

    const tick = () => {
      const elapsed = Date.now() - startRef.current
      const progress = Math.min(1, elapsed / DURATION)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(from + (to - from) * eased)
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value])

  return <span>{format(displayed)}</span>
}

// Severity color based on leakage as % of payroll
function getSeverityColor(value, annualPayroll) {
  if (!annualPayroll || annualPayroll === 0) return '#94a3b8'
  const pct = value / annualPayroll
  if (pct < 0.02) return '#10b981'  // green — < 2%
  if (pct < 0.05) return '#f59e0b'  // amber — 2–5%
  return '#ef4444'                   // red — > 5%
}

const DOMAIN_META = {
  workforce:    { label: 'Workforce', icon: '👥', color: '#0047cc' },
  performance:  { label: 'Performance', icon: '📊', color: '#0ea5e9' },
  procurement:  { label: 'Procurement', icon: '🛒', color: '#f59e0b' },
  revenue:      { label: 'Revenue', icon: '💰', color: '#10b981' },
  programme:    { label: 'Programme Delivery', icon: '🎯', color: '#14b8a6' },
  finance:      { label: 'Finance & Accounting', icon: '🏦', color: '#0ea5e9' },
  document:     { label: 'Document & Knowledge', icon: '📁', color: '#38bdf8' },
  compliance:   { label: 'Compliance & Risk', icon: '⚖️', color: '#f97316' },
  reputational: { label: 'Reputational', icon: '🌐', color: '#ec4899' },
}

export default function DomainCard({ domainKey, section, totalLeakage, annualPayroll, currency, locale, isNGO }) {
  const [expanded, setExpanded] = useState(false)
  const { format } = useCurrencyFormat(currency, locale)
  const meta = DOMAIN_META[domainKey] || { label: domainKey, icon: '📌', color: '#94a3b8' }
  const severityColor = getSeverityColor(section?.total || 0, annualPayroll)
  const pctOfTotal = totalLeakage > 0 ? ((section?.total || 0) / totalLeakage) * 100 : 0

  const breakdownItems = Object.entries(section?.breakdown || {}).filter(([, v]) => v?.value > 0)

  return (
    <div
      data-demo-id={`domain-${domainKey}`}
      className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden transition-all hover:border-slate-300 dark:hover:border-white/20"
    >
      {/* Header */}
      <div className="p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ backgroundColor: `${meta.color}15` }}
          >
            {meta.icon}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{meta.label}</p>
            <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums leading-tight">
              <AnimatedValue value={section?.total || 0} format={format} />
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Severity badge */}
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: severityColor }}
            title={`${pctOfTotal.toFixed(1)}% of total leakage`}
          />
          <span className="text-[9px] font-black text-slate-400 hidden sm:block">
            {pctOfTotal.toFixed(1)}%
          </span>

          {/* Expand button */}
          {breakdownItems.length > 0 && (
            <button
              data-demo-id={`domain-${domainKey}-expand`}
              onClick={() => setExpanded(!expanded)}
              className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-3">
        <LeakageBar value={section?.total || 0} maxValue={totalLeakage} color={meta.color} />
      </div>

      {/* Benchmark badge */}
      {annualPayroll > 0 && (
        <div className="px-5 pb-3">
          <span
            className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded"
            style={{ backgroundColor: `${severityColor}15`, color: severityColor }}
          >
            {((section?.total || 0) / annualPayroll * 100).toFixed(1)}% of payroll
          </span>
        </div>
      )}

      {/* Expanded breakdown */}
      {expanded && breakdownItems.length > 0 && (
        <div className="border-t border-slate-100 dark:border-white/5 px-5 py-4 space-y-3 bg-slate-50/50 dark:bg-white/[0.01]">
          {breakdownItems.map(([key, item]) => (
            <div key={key} className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                {item.formula && (
                  <p className="text-[8px] text-slate-400 font-mono mt-0.5 truncate">{item.formula}</p>
                )}
                {item.source && (
                  <p className="text-[8px] text-slate-400 italic mt-0.5">Source: {item.source}</p>
                )}
              </div>
              <p className="text-[11px] font-black text-slate-900 dark:text-white tabular-nums flex-shrink-0">
                {format(item.value || 0)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

