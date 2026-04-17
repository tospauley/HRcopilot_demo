/**
 * MaturityScoreCard.jsx
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 5 — Intelligence Layer
 * Org types supported: both
 * Dependencies: none
 * Demo IDs: maturity-score-card
 * Integration: OrganizationalIntelligenceWidget
 */

import React from 'react'

const DOMAIN_LABELS = {
  peopleSystem: 'People Systems',
  financialControls: 'Financial Controls',
  revenueOperations: 'Revenue Operations',
  programmeDelivery: 'Programme Delivery',
  compliancePosture: 'Compliance Posture',
  documentControl: 'Document Control',
}

export default function MaturityScoreCard({ maturityScore, isNGO }) {
  const { overall, grade, percentile, gradeLabel, gradeColor, domains } = maturityScore

  const accentColor = isNGO ? '#14b8a6' : '#0047cc'

  return (
    <div
      data-demo-id="maturity-score-card"
      className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Organizational Maturity Score
          </p>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black tabular-nums" style={{ color: gradeColor || accentColor }}>
              {overall}
            </span>
            <div className="mb-1">
              <span
                className="text-2xl font-black"
                style={{ color: gradeColor || accentColor }}
              >
                {grade}
              </span>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                {gradeLabel}
              </p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Peer Percentile
          </p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {percentile}<span className="text-sm">th</span>
          </p>
          <p className="text-[9px] text-slate-400">vs industry peers</p>
        </div>
      </div>

      {/* Domain scores */}
      <div className="space-y-3">
        {Object.entries(domains).map(([key, score]) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                {DOMAIN_LABELS[key] || key}
              </span>
              <span className="text-[10px] font-black text-slate-900 dark:text-white">
                {score}/100
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${score}%`,
                  backgroundColor: score >= 70 ? '#10b981' : score >= 50 ? accentColor : score >= 35 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-[9px] text-slate-400 italic">
        Score based on tech maturity, process controls, and leakage ratios vs industry benchmarks.
      </p>
    </div>
  )
}
