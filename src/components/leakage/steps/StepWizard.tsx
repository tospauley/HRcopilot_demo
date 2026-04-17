/**
 * StepWizard.jsx
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 3 — Core UI
 * Org types supported: both
 * Dependencies: all Step components
 * Demo IDs: none
 * Integration: OrganizationalIntelligenceWidget
 *
 * Shared input field primitives and step progress bar used by all steps.
 */

import React from 'react'

// ── Shared field components ───────────────────────────────────────────────────

export function Field({ label, hint, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-[9px] text-slate-400">{hint}</p>}
      {error && <p className="text-[9px] text-rose-500 font-bold">{error}</p>}
    </div>
  )
}

export function NumberInput({ value, onChange, placeholder, min = 0, step = 1, prefix, suffix }) {
  return (
    <div className="relative flex items-center">
      {prefix && (
        <span className="absolute left-3 text-xs font-bold text-slate-400 pointer-events-none">{prefix}</span>
      )}
      <input
        type="number"
        min={min}
        step={step}
        value={value ?? ''}
        onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
        placeholder={placeholder}
        className={`w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0047cc] transition-all ${prefix ? 'pl-8' : 'px-4'} ${suffix ? 'pr-12' : 'pr-4'}`}
      />
      {suffix && (
        <span className="absolute right-3 text-xs font-bold text-slate-400 pointer-events-none">{suffix}</span>
      )}
    </div>
  )
}

export function Toggle({ label, checked, onChange, description }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative mt-0.5 flex-shrink-0">
        <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
        <div className={`w-9 h-5 rounded-full transition-colors ${checked ? 'bg-[#0047cc]' : 'bg-slate-200 dark:bg-white/10'}`} />
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{label}</p>
        {description && <p className="text-[9px] text-slate-400 mt-0.5">{description}</p>}
      </div>
    </label>
  )
}

export function StepNav({ onBack, onNext, onSkip, nextLabel = 'Next →', backLabel = '← Back', canNext = true }) {
  return (
    <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5 mt-6">
      <button
        onClick={onBack}
        className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        {backLabel}
      </button>
      <div className="flex items-center gap-3">
        {onSkip && (
          <button
            onClick={onSkip}
            className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Skip
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!canNext}
          className="px-6 py-2.5 bg-[#0047cc] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0035a0] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  )
}

export function StepHeader({ step, total, title, description, icon }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#0047cc]/10 flex items-center justify-center text-xl flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Step {step} of {total}</span>
            <div className="flex-1 h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0047cc] rounded-full transition-all duration-500"
                style={{ width: `${(step / total) * 100}%` }}
              />
            </div>
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h3>
        </div>
      </div>
      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
      )}
    </div>
  )
}

export function SuggestedBadge({ value, label, onApply }) {
  if (!value) return null
  return (
    <button
      onClick={onApply}
      className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#0047cc]/8 text-[#0047cc] rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-[#0047cc]/15 transition-colors"
    >
      <span>Suggested: {label}</span>
      <span>↑ Apply</span>
    </button>
  )
}
