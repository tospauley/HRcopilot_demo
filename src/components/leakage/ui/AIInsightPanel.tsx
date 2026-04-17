/**
 * AIInsightPanel.jsx
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 5 — Intelligence Layer
 * Org types supported: both
 * Dependencies: hooks/useAIAnalysis.js, hooks/useCurrencyFormat.js
 * Demo IDs: advisor-panel
 * Integration: OrganizationalIntelligenceWidget
 */

import React, { useState } from 'react'
import { useCurrencyFormat } from '../hooks/useCurrencyFormat.js'

const TABS = [
  { id: 'descriptive', label: 'What Is Happening', icon: '🔍' },
  { id: 'diagnostic', label: 'Why It\'s Happening', icon: '🔬' },
  { id: 'predictive', label: 'What Will Happen', icon: '🔮' },
  { id: 'prescriptive', label: 'What To Do', icon: '💊' },
]

function SkeletonCard() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-3/4" />
      <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-full" />
      <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-5/6" />
      <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-2/3" />
    </div>
  )
}

function InsightCard({ type, data, format }) {
  if (!data) return <SkeletonCard />

  const urgencyColor = {
    low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#ef4444',
  }
  const severityColor = {
    low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#ef4444',
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">
          {data.headline}
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
          {data.insight}
        </p>
      </div>

      {type === 'descriptive' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Top Category</p>
            <p className="text-xs font-black text-slate-900 dark:text-white capitalize">{data.topCategory}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Urgency</p>
            <p className="text-xs font-black capitalize" style={{ color: urgencyColor[data.urgency] || '#94a3b8' }}>
              {data.urgency}
            </p>
          </div>
        </div>
      )}

      {type === 'diagnostic' && (
        <div className="space-y-2">
          <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Root Cause</p>
            <p className="text-xs text-slate-700 dark:text-slate-300">{data.rootCause}</p>
          </div>
          {data.systemicPattern && (
            <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Systemic Pattern</p>
              <p className="text-xs text-slate-700 dark:text-slate-300">{data.systemicPattern}</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Severity</span>
            <span className="text-[9px] font-black capitalize px-2 py-0.5 rounded"
              style={{ backgroundColor: `${severityColor[data.severity] || '#94a3b8'}20`, color: severityColor[data.severity] || '#94a3b8' }}>
              {data.severity}
            </span>
          </div>
        </div>
      )}

      {type === 'predictive' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">3-Year Exposure</p>
              <p className="text-xs font-black text-rose-500">{format(data.threeYearExposure || 0)}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Confidence</p>
              <p className="text-xs font-black text-slate-900 dark:text-white">{data.confidence}</p>
            </div>
          </div>
          {data.triggerEvent && (
            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
              <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-1">Risk Trigger</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">{data.triggerEvent}</p>
            </div>
          )}
        </div>
      )}

      {type === 'prescriptive' && data.firstIntervention && (
        <div className="space-y-2">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">
            <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">First: {data.firstIntervention.module}</p>
            <p className="text-xs font-black text-emerald-700 dark:text-emerald-400">
              {format(data.firstIntervention.expectedRecovery || 0)} recovery · {data.firstIntervention.timeToValue}
            </p>
          </div>
          {data.secondIntervention && (
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl">
              <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1">Then: {data.secondIntervention.module}</p>
              <p className="text-xs font-black text-blue-700 dark:text-blue-400">
                {format(data.secondIntervention.expectedRecovery || 0)} recovery · {data.secondIntervention.timeToValue}
              </p>
            </div>
          )}
          <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Year 1 Total Recovery</p>
            <p className="text-sm font-black text-emerald-500">{format(data.totalRecoveryYear1 || 0)}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AIInsightPanel({ aiAnalysis, results, currency, locale, onRunAnalysis }) {
  const [activeTab, setActiveTab] = useState('descriptive')
  const { format } = useCurrencyFormat(currency, locale)
  const { isLoading, descriptive, diagnostic, predictive, prescriptive } = aiAnalysis

  const dataMap = { descriptive, diagnostic, predictive, prescriptive }

  // AI returns amounts already in local currency — format as local integer, no USD conversion
  const fmtLocal = (n) => {
    if (!n || n === 0) return `0 ${currency}`
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        notation: Math.abs(n) >= 1_000_000 ? 'compact' : 'standard',
        maximumFractionDigits: Math.abs(n) >= 1_000_000 ? 1 : 0,
      }).format(n)
    } catch {
      return `${currency} ${Math.round(n).toLocaleString()}`
    }
  }

  return (
    <div
      data-demo-id="advisor-panel"
      className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🧠</span>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Advisor</p>
            <p className="text-xs font-black text-slate-900 dark:text-white">4-Layer Analysis</p>
          </div>
        </div>
        {!isLoading && !descriptive && (
          <button
            onClick={onRunAnalysis}
            className="px-3 py-1.5 bg-[#0047cc] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#0035a0] transition-colors"
          >
            Analyze
          </button>
        )}
        {isLoading && (
          <div className="w-4 h-4 border-2 border-[#0047cc] border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-white/5 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-[#0047cc] text-[#0047cc]'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:block">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5">
        {isLoading
          ? <SkeletonCard />
          : <InsightCard type={activeTab} data={dataMap[activeTab]} format={fmtLocal} />
        }
      </div>
    </div>
  )
}
