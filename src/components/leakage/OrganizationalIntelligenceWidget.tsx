/**
 * OrganizationalIntelligenceWidget.jsx
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 3 — Core UI (Root Component)
 * Org types supported: commercial | ngo | both
 * Dependencies: useLeakageState, useAIAnalysis, all UI components
 * Demo IDs: leakage-clock, credibility-tier-toggle, domain-*, leakage-summary-total,
 *           maturity-score-card, roi-close-section, mission-impact-section, advisor-panel
 * Integration: DemoOrchestrator (embedded), standalone route
 */

import React, { useEffect, useCallback } from 'react'
import { useLeakageState } from './hooks/useLeakageState.js'
import { useAIAnalysis } from './hooks/useAIAnalysis.js'
import { initCurrencyEngine } from './engine/CurrencyEngine.js'

import Step1_OrgProfile from './steps/Step1_OrgProfile.jsx'
import Step2_WorkforceLeakage from './steps/Step2_WorkforceLeakage.jsx'
import Step3_PerformanceLeakage from './steps/Step3_PerformanceLeakage.jsx'
import Step4_ProcurementLeakage from './steps/Step4_ProcurementLeakage.jsx'
import Step5_RevenueLeakage from './steps/Step5_RevenueLeakage.jsx'
import Step5_ProgrammeLeakage from './steps/Step5_ProgrammeLeakage.jsx'
import Step6_FinanceLeakage from './steps/Step6_FinanceLeakage.jsx'
import Step7_DocumentLeakage from './steps/Step7_DocumentLeakage.jsx'
import Step8_ComplianceLeakage from './steps/Step8_ComplianceLeakage.jsx'
import LeakageClock from './ui/LeakageClock.jsx'
import CredibilityTierToggle from './ui/CredibilityTierToggle.jsx'
import LeakageSummary from './ui/LeakageSummary.jsx'
import MaturityScoreCard from './ui/MaturityScoreCard.jsx'
import AIInsightPanel from './ui/AIInsightPanel.jsx'
import ROICloseSection from './ui/ROICloseSection.jsx'
import MissionImpactSection from './ui/MissionImpactSection.jsx'
import BenchmarkOverlay from './ui/BenchmarkOverlay.jsx'
import ExportButton from './ui/ExportButton.jsx'

// Error boundary wrapper
class LeakageErrorBoundary extends React.Component {
  state = { hasError: false, error: null }
  static getDerivedStateFromError(error) { return { hasError: true, error } }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center space-y-3">
          <p className="text-2xl">⚠️</p>
          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Widget Error
          </p>
          <p className="text-xs text-slate-500">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-[#0047cc] text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function OrganizationalIntelligenceWidget({
  // Demo system props
  demoMode = null,
  role = null,
  onComplete = null,
  autoAdvance = false,
  standalone = false,
  // Pre-fill props — skip wizard and jump straight to results
  initialProfile = null,
  initialInputs = null,
  skipToResults = false,
  // Engine instances (injected from demo system or self-initialized)
  narrationEngine = null,
  ambientEngine = null,
  groqAdvisor = null,
  autoClickDirector = null,
  // Config
  config = null,
}) {
  const groqApiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GROQ_API_KEY)
    || config?.groq?.apiKey
    || ''

  const state = useLeakageState()
  const {
    profile, inputs, results, benchmarks, maturityScore, aiAnalysis, ui,
    isProfileComplete, hasResults,
    setTier, setInputs, nextStep, goToStep,
    completeProfile, activateClock, setAIAnalysis, setUI,
  } = state

  const { runAnalysis } = useAIAnalysis(groqApiKey, profile, role, setAIAnalysis)

  // Initialize currency engine on mount
  useEffect(() => {
    initCurrencyEngine()
  }, [])

  // ── Pre-fill: skip wizard when initialProfile + skipToResults provided ────
  useEffect(() => {
    if (!initialProfile || !skipToResults) return
    // Use completeProfile to build benchmarks + suggested defaults, then
    // override inputs with our demo values and jump to results step (8)
    completeProfile(initialProfile)
    if (initialInputs) {
      setTimeout(() => {
        setInputs(initialInputs)
        goToStep(8)
      }, 50)
    } else {
      setTimeout(() => goToStep(8), 50)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Activate clock as soon as we have a non-zero perSecondLeakage
  useEffect(() => {
    if (results.perSecondLeakage > 0 && !ui.clockActive) {
      activateClock()
    }
  }, [results.perSecondLeakage, ui.clockActive, activateClock])

  // Auto-run AI analysis when results are ready (demo mode or standalone)
  // Re-runs whenever results change (tier change, profile change)
  useEffect(() => {
    if (hasResults && !aiAnalysis.isLoading) {
      // Only skip if we already have fresh analysis for this exact result set
      if (!aiAnalysis.descriptive) {
        runAnalysis(results, inputs, ui.credibilityTier)
      }
    }
  }, [hasResults, results.totalLeakage, ui.credibilityTier]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRunAnalysis = useCallback(() => {
    if (hasResults) runAnalysis(results, inputs, ui.credibilityTier)
  }, [hasResults, results, inputs, ui.credibilityTier, runAnalysis])

  const currency = profile.currency || 'USD'
  const locale = profile.locale || 'en-US'
  const isNGO = profile.isNGO || false

  // currentStep: 0 = profile, 1–7 = input wizard steps, 8+ = results
  const wizardStep = ui.currentStep

  // ── Render: Profile wizard (Step 0) ───────────────────────────────────────
  if (!isProfileComplete) {
    return (
      <LeakageErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-6 md:p-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0047cc] to-[#0035a0] rounded-2xl mb-6">
                <span className="text-2xl">🧠</span>
                <span className="text-sm font-black uppercase tracking-widest text-white">ENTERPRISE LEAKAGE ANALYTICS</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
                Organizational <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0047cc] to-[#0035a0] italic">Intelligence</span>
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto mb-8">
                Enterprise-grade leakage analysis powered by 30+ research sources
              </p>
            </div>
            <Step1_OrgProfile onComplete={completeProfile} />
          </div>
        </div>
      </LeakageErrorBoundary>
    )
  }

  // ── Render: Input wizard (Steps 1–7) ─────────────────────────────────────
  const stepDefaults = benchmarks._defaults || {}

  const wizardProps = {
    inputs,
    profile,
    defaults: stepDefaults,
    onUpdate: (patch) => setInputs(patch),
    onNext:   () => nextStep(),
    onBack:   () => goToStep(Math.max(1, wizardStep - 1)),
  }

  if (wizardStep >= 1 && wizardStep <= 7) {
    const stepMap = {
      1: <Step2_WorkforceLeakage   {...wizardProps} />,
      2: <Step3_PerformanceLeakage {...wizardProps} />,
      3: <Step4_ProcurementLeakage {...wizardProps} />,
      4: isNGO
           ? <Step5_ProgrammeLeakage {...wizardProps} />
           : <Step5_RevenueLeakage   {...wizardProps} />,
      5: <Step6_FinanceLeakage     {...wizardProps} />,
      6: <Step7_DocumentLeakage    {...wizardProps} />,
      7: <Step8_ComplianceLeakage  {...wizardProps} isNGO={isNGO} />,
    }

    return (
      <LeakageErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-6 md:p-12">
          <div className="max-w-2xl mx-auto">
            {/* Wizard header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0047cc] to-[#0035a0] flex items-center justify-center">
                  <span className="text-lg">📊</span>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{profile.orgTypeLabel}</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">Leakage Analysis</p>
                </div>
              </div>
              <button
                onClick={() => setUI({ profileComplete: false })}
                className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                ← Edit Profile
              </button>
            </div>

            {/* Step card */}
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-sm">
              {stepMap[wizardStep]}
            </div>

            {/* Skip all */}
            <div className="text-center mt-6">
              <button
                onClick={() => goToStep(8)}
                className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                Skip all steps — use suggested defaults →
              </button>
            </div>
          </div>
        </div>
      </LeakageErrorBoundary>
    )
  }

  // ── Render: Results (Step 8+) ─────────────────────────────────────────────
  return (
    <LeakageErrorBoundary>
      <div className="space-y-8 pb-16">

        {/* Premium Header */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0047cc] to-[#0035a0] flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
                    {profile.orgTypeLabel}
                  </p>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                    Leakage Intelligence
                  </h1>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setUI({ profileComplete: false })}
                className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                ← Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Live Leakage Clock */}
        <LeakageClock
          perSecondLeakage={results.perSecondLeakage}
          currency={currency}
          locale={locale}
          active={ui.clockActive}
          isNGO={isNGO}
        />

        {/* Credibility Tier Toggle */}
        <CredibilityTierToggle
          tier={ui.credibilityTier}
          onChangeTier={setTier}
        />

        {/* Main content: domains + AI panel */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Leakage domains — 2/3 width */}
          <div className="xl:col-span-2">
            <LeakageSummary
              results={results}
              profile={profile}
              currency={currency}
              locale={locale}
            />
          </div>

          {/* AI Insight Panel — 1/3 width */}
          <div className="xl:col-span-1">
            <AIInsightPanel
              aiAnalysis={aiAnalysis}
              results={results}
              currency={currency}
              locale={locale}
              onRunAnalysis={handleRunAnalysis}
            />
          </div>
        </div>

        {/* Maturity Score Card */}
        <MaturityScoreCard
          maturityScore={maturityScore}
          isNGO={isNGO}
        />

        {/* Close section — commercial vs NGO */}
        {isNGO
          ? <MissionImpactSection results={results} profile={profile} currency={currency} locale={locale} />
          : <ROICloseSection results={results} currency={currency} locale={locale} />
        }

        {/* Benchmark overlay */}
        <BenchmarkOverlay benchmarks={benchmarks} results={results} profile={profile} currency={currency} locale={locale} />

        {/* Export */}
        <div className="flex justify-center pb-4">
          <ExportButton results={results} profile={profile} aiAnalysis={aiAnalysis} currency={currency} locale={locale} />
        </div>

      </div>
    </LeakageErrorBoundary>
  )
}
