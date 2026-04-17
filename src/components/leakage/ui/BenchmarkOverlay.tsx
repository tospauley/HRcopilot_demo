/**
 * BenchmarkOverlay.jsx
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 6 — Close Sections
 * Org types supported: both
 * Dependencies: useCurrencyFormat
 * Demo IDs: benchmark-overlay
 * Integration: LeakageSummary, OrganizationalIntelligenceWidget
 */

import React from 'react'
import { useCurrencyFormat } from '../hooks/useCurrencyFormat.js'

function Bar({ value, max, color }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}

export default function BenchmarkOverlay({ benchmarks, results, profile, currency, locale }) {
  const { format } = useCurrencyFormat(currency, locale)
  const peerComparisons = benchmarks?.peerComparisons || {}
  const industryProfile = benchmarks?.industryProfile || {}

  if (!Object.keys(peerComparisons).length) return null

  const totalLeakage = results?.totalLeakage || 0
  const payroll = profile?.annualPayroll || 1
  const leakagePct = ((totalLeakage / payroll) * 100).toFixed(1)

  // Industry average leakage as % of payroll (rough benchmark)
  const industryAvgLeakagePct = 18 // ~18% of payroll is typical across industries

  return (
    <div
      data-demo-id="benchmark-overlay"
      className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-5"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">📐</span>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Industry Benchmark</p>
          <p className="text-sm font-black text-slate-900 dark:text-white">
            {industryProfile.label || 'Peer Comparison'}
          </p>
        </div>
      </div>

      {/* Leakage vs industry */}
      <div className="p-4 bg-slate-50 dark:bg-white/[0.02] rounded-xl space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Your Leakage</span>
          <span className={`text-sm font-black ${parseFloat(leakagePct) > industryAvgLeakagePct ? 'text-rose-500' : 'text-emerald-500'}`}>
            {leakagePct}% of payroll
          </span>
        </div>
        <Bar value={parseFloat(leakagePct)} max={40} color={parseFloat(leakagePct) > industryAvgLeakagePct ? '#ef4444' : '#10b981'} />

        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Industry Average</span>
          <span className="text-sm font-black text-slate-400">{industryAvgLeakagePct}% of payroll</span>
        </div>
        <Bar value={industryAvgLeakagePct} max={40} color="#94a3b8" />
      </div>

      {/* Peer comparisons */}
      <div className="space-y-4">
        {Object.entries(peerComparisons).map(([key, comp]) => {
          if (!comp) return null
          return (
            <div key={key} className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{comp.label}</span>
                <span className="text-[10px] font-black text-slate-400">
                  Industry avg: {(comp.industryAvg * 100).toFixed(1)}{comp.unit}
                </span>
              </div>
              <Bar
                value={comp.industryAvg * 100}
                max={100}
                color="#0047cc"
              />
            </div>
          )
        })}
      </div>

      <p className="text-[8px] text-slate-400 italic">
        Benchmarks sourced from SHRM, Gallup, Hackett Group, McKinsey, and Deloitte industry surveys.
      </p>
    </div>
  )
}
