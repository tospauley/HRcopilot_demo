/**
 * useLeakageState.js
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 2 — State & Computation
 * Org types supported: both
 * Dependencies: LeakageCalculator, BenchmarkEngine, MaturityScorer, OrgProfileEngine, CurrencyEngine
 * Demo IDs: none
 * Integration: OrganizationalIntelligenceWidget (root consumer)
 */

import { useReducer, useMemo, useCallback, useEffect, useRef } from 'react'
import { LeakageCalculator } from '../engine/LeakageCalculator.js'
import { BenchmarkEngine } from '../engine/BenchmarkEngine.js'
import { MaturityScorer } from '../engine/MaturityScorer.js'
import { OrgProfileEngine } from '../engine/OrgProfileEngine.js'

const benchmarkEngine = new BenchmarkEngine()
const maturityScorer = new MaturityScorer()
const orgProfileEngine = new OrgProfileEngine()

// ── Initial State ─────────────────────────────────────────────────────────────

const INITIAL_STATE = {
  profile: {
    orgType: null, sector: null, industry: null,
    headcount: null, headcountRange: null,
    annualPayroll: null, annualRevenue: null, annualBudget: null,
    avgAnnualSalary: null, avgHourlyRate: null,
    currency: 'USD', locale: 'en-US', exchangeRate: 1,
    countriesOfOperation: 1, techMaturity: null, fiscalYearStart: 'january',
    fundingSources: { governmentGrants: 0, privateDonors: 0, corporate: 0, selfGenerated: 0 },
    volunteerCount: 0, programmeEfficiencyRatio: null, costPerBeneficiary: null,
    isNGO: false, isCommercial: true,
  },
  inputs: {
    avgAnnualSalary: null, avgHourlyRate: null, minutesLostPerDay: 15,
    turnoverCount: null, hrTeamSalary: null,
    lowPerformerPercent: 15, managerCount: null, appraisalCyclesPerYear: 2,
    hoursPerAppraisalCycle: null, topTalentLostPerYear: null,
    annualProcurementSpend: null, purchaseOrderCount: null,
    monthlyLeadVolume: null, avgDealValue: null, salesTeamSize: null,
    salesTeamSalary: null, monthlyChurnRate: null, avgCustomerLifetimeValue: null,
    programmeBudget: null, numberOfProjects: null, avgGrantValue: null, grantReportsPerYear: null,
    financeTeamSalary: null, monthlyAPSpend: null, avgDaysToClose: null,
    knowledgeWorkerCount: null, operationalWorkerCount: null,
    multipleJurisdictions: false, multiCurrency: false, industryRegulations: false,
    dataPrivacyObligations: false, recentComplianceFinding: false,
    donorRetentionRate: null, mediaRiskLevel: 'low',
  },
  results: {
    sections: {
      workforce: { total: 0, breakdown: {} },
      performance: { total: 0, breakdown: {} },
      procurement: { total: 0, breakdown: {} },
      revenue: { total: 0, breakdown: {} },
      programme: { total: 0, breakdown: {} },
      finance: { total: 0, breakdown: {} },
      document: { total: 0, breakdown: {} },
      compliance: { total: 0, breakdown: {} },
      reputational: { total: 0, breakdown: {} },
    },
    totalLeakage: 0, recoveryEstimate: 0,
    yearOneROI: 0, breakEvenMonths: 0, threeYearGain: 0,
    programmeEfficiencyRatio: 0, additionalBeneficiaries: 0, missionImpactScore: 0,
    dailyLeakage: 0, hourlyLeakage: 0, perSecondLeakage: 0,
    HRcopilotAnnualCost: 0, isNGO: false,
  },
  benchmarks: {},
  maturityScore: {
    overall: 0, grade: null, percentile: 0, gradeLabel: '', gradeColor: '#94a3b8',
    domains: { peopleSystem: 0, financialControls: 0, revenueOperations: 0, programmeDelivery: 0, compliancePosture: 0, documentControl: 0 },
  },
  aiAnalysis: {
    descriptive: null, diagnostic: null, predictive: null, prescriptive: null,
    isLoading: false, lastUpdated: null,
  },
  ui: {
    currentStep: 0,
    credibilityTier: 'average',
    clockStartTime: null, clockActive: false,
    completedSections: [], expandedDomain: null, exportLoading: false,
    profileComplete: false,
  },
}

// ── Reducer ───────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } }

    case 'SET_INPUTS':
      return { ...state, inputs: { ...state.inputs, ...action.payload } }

    case 'SET_RESULTS':
      return { ...state, results: action.payload }

    case 'SET_BENCHMARKS':
      return { ...state, benchmarks: action.payload }

    case 'SET_MATURITY':
      return { ...state, maturityScore: action.payload }

    case 'SET_AI_ANALYSIS':
      return { ...state, aiAnalysis: { ...state.aiAnalysis, ...action.payload } }

    case 'SET_UI':
      return { ...state, ui: { ...state.ui, ...action.payload } }

    case 'SET_TIER':
      return { ...state, ui: { ...state.ui, credibilityTier: action.payload } }

    case 'NEXT_STEP':
      return {
        ...state,
        ui: {
          ...state.ui,
          currentStep: state.ui.currentStep + 1,
          completedSections: [...new Set([...state.ui.completedSections, state.ui.currentStep])],
        },
      }

    case 'GO_TO_STEP':
      return { ...state, ui: { ...state.ui, currentStep: action.payload } }

    case 'ACTIVATE_CLOCK':
      return { ...state, ui: { ...state.ui, clockActive: true, clockStartTime: Date.now() } }

    case 'PROFILE_COMPLETE':
      return { ...state, ui: { ...state.ui, profileComplete: true } }

    case 'RESET':
      return INITIAL_STATE

    default:
      return state
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useLeakageState() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const debounceRef = useRef(null)

  // Compute results whenever inputs, profile, or tier change — debounced 300ms
  const computeResults = useCallback((profile, inputs, benchmarks, tier) => {
    if (!profile.orgType || !profile.headcount) return

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      try {
        const calculator = new LeakageCalculator(profile, inputs, benchmarks, tier)
        const results = calculator.calculate()
        dispatch({ type: 'SET_RESULTS', payload: results })

        // Auto-activate clock as soon as we have a valid leakage rate
        if (results.perSecondLeakage > 0) {
          dispatch({ type: 'ACTIVATE_CLOCK' })
        }

        const maturity = maturityScorer.calculate(profile, inputs, results)
        dispatch({ type: 'SET_MATURITY', payload: maturity })
      } catch (err) {
        console.warn('[LeakageCalculator] Calculation error:', err)
      }
    }, 300)
  }, [])

  // Recompute when relevant state changes
  useEffect(() => {
    if (state.profile.orgType && state.profile.headcount) {
      computeResults(state.profile, state.inputs, state.benchmarks, state.ui.credibilityTier)
    }
  }, [state.profile, state.inputs, state.benchmarks, state.ui.credibilityTier, computeResults])

  // ── Actions ────────────────────────────────────────────────────────────────

  const setProfile = useCallback((patch) => dispatch({ type: 'SET_PROFILE', payload: patch }), [])

  const setInputs = useCallback((patch) => dispatch({ type: 'SET_INPUTS', payload: patch }), [])

  const setTier = useCallback((tier) => dispatch({ type: 'SET_TIER', payload: tier }), [])

  const nextStep = useCallback(() => dispatch({ type: 'NEXT_STEP' }), [])

  const goToStep = useCallback((step) => dispatch({ type: 'GO_TO_STEP', payload: step }), [])

  const activateClock = useCallback(() => dispatch({ type: 'ACTIVATE_CLOCK' }), [])

  const setUI = useCallback((patch) => dispatch({ type: 'SET_UI', payload: patch }), [])

  const setAIAnalysis = useCallback((patch) => dispatch({ type: 'SET_AI_ANALYSIS', payload: patch }), [])

  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  /**
   * Called when Step1 profile form is submitted.
   * Builds full profile, benchmarks, and suggested defaults.
   */
  const completeProfile = useCallback((formValues) => {
    try {
      const profile = orgProfileEngine.buildProfile(formValues)
      const benchmarks = orgProfileEngine.buildBenchmarks(profile)
      const defaults = orgProfileEngine.getSuggestedDefaults(profile)

      dispatch({ type: 'SET_PROFILE', payload: profile })
      // Store defaults inside benchmarks so wizard steps can access them
      dispatch({ type: 'SET_BENCHMARKS', payload: { ...benchmarks, _defaults: defaults } })
      // Pre-fill inputs with suggested defaults (user can override in wizard)
      dispatch({ type: 'SET_INPUTS', payload: defaults })
      dispatch({ type: 'PROFILE_COMPLETE' })
      dispatch({ type: 'NEXT_STEP' })
    } catch (err) {
      console.error('[OrgProfileEngine] Profile build error:', err)
    }
  }, [])

  // Memoized derived values
  const isProfileComplete = useMemo(() => state.ui.profileComplete, [state.ui.profileComplete])
  const hasResults = useMemo(() => state.results.totalLeakage > 0, [state.results.totalLeakage])

  return {
    // State
    ...state,
    // Derived
    isProfileComplete,
    hasResults,
    // Actions
    setProfile,
    setInputs,
    setTier,
    nextStep,
    goToStep,
    activateClock,
    setUI,
    setAIAnalysis,
    completeProfile,
    reset,
  }
}
