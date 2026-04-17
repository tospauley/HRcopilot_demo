/**
 * CredibilityTierToggle.jsx
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 3 — Core UI
 * Org types supported: both
 * Dependencies: none
 * Demo IDs: credibility-tier-toggle, tier-conservative, tier-average, tier-uncontrolled
 * Integration: OrganizationalIntelligenceWidget
 */

import React from 'react'

const TIERS = [
  {
    id: 'conservative',
    label: 'Conservative',
    description: 'Lower bound — most defensible estimate',
    color: 'text-emerald-600',
    activeClass: 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20',
  },
  {
    id: 'average',
    label: 'Average',
    description: 'Industry benchmark midpoint',
    color: 'text-blue-600',
    activeClass: 'bg-blue-600 text-white shadow-lg shadow-blue-500/20',
  },
  {
    id: 'uncontrolled',
    label: 'Uncontrolled',
    description: 'No digital controls in place',
    color: 'text-rose-600',
    activeClass: 'bg-rose-600 text-white shadow-lg shadow-rose-500/20',
  },
]

export default function CredibilityTierToggle({ tier, onChangeTier }) {
  return (
    <div
      data-demo-id="credibility-tier-toggle"
      className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
    >
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
        Credibility Tier
      </span>
      <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10 gap-1">
        {TIERS.map((t) => (
          <button
            key={t.id}
            data-demo-id={`tier-${t.id}`}
            onClick={() => onChangeTier(t.id)}
            title={t.description}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              tier === t.id
                ? t.activeClass
                : `text-slate-500 hover:text-slate-900 dark:hover:text-white ${t.color}`
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <span className="text-[9px] text-slate-400 font-medium hidden sm:block">
        {TIERS.find(t => t.id === tier)?.description}
      </span>
    </div>
  )
}
