/**
 * BenchmarkEngine.js
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 1 — Data Layer
 * Org types supported: both
 * Dependencies: data/benchmarks.js, data/industryProfiles.js, data/orgTypeProfiles.js
 * Demo IDs: none
 * Integration: useLeakageState, BenchmarkOverlay
 */

import { TIER_MULTIPLIERS, INDUSTRY_BENCHMARK_OVERRIDES, HEADCOUNT_SCALE_FACTORS } from '../data/benchmarks.js'
import { getIndustryProfile } from '../data/industryProfiles.js'
import { ORG_TYPES, isNGO } from '../data/orgTypeProfiles.js'

export class BenchmarkEngine {
  /**
   * Build the full benchmark set for a given profile.
   * Called once when the org profile is complete.
   * Returns benchmarks object consumed by LeakageCalculator.
   */
  buildBenchmarks(profile) {
    const { industry, headcountRange, orgType } = profile
    const industryProfile = getIndustryProfile(industry)
    const overrides = INDUSTRY_BENCHMARK_OVERRIDES[industry] || {}
    const scaleFactor = HEADCOUNT_SCALE_FACTORS[headcountRange] || HEADCOUNT_SCALE_FACTORS['51-200']

    // Build per-tier benchmark values with industry overrides applied
    const benchmarks = {}
    for (const tier of ['conservative', 'average', 'uncontrolled']) {
      const base = { ...TIER_MULTIPLIERS[tier] }
      // Apply industry overrides
      for (const [key, val] of Object.entries(overrides)) {
        if (val && typeof val === 'object' && val[tier] !== undefined) {
          base[key] = val[tier]
        }
      }
      benchmarks[tier] = base
    }

    // Compute industry-specific peer comparisons for BenchmarkOverlay
    const peerComparisons = this.#buildPeerComparisons(profile, industryProfile)

    return {
      ...benchmarks.average, // default to average tier values at top level
      tiers: benchmarks,
      peerComparisons,
      industryProfile,
      scaleFactor,
      orgType: ORG_TYPES[orgType],
    }
  }

  /**
   * Get benchmark value for a specific metric and tier.
   */
  getValue(benchmarks, metric, tier = 'average') {
    return benchmarks?.tiers?.[tier]?.[metric] ?? benchmarks?.[metric] ?? 0
  }

  /**
   * Build peer comparison data for the BenchmarkOverlay component.
   * Shows where the org sits relative to industry peers.
   */
  #buildPeerComparisons(profile, industryProfile) {
    const isNGOOrg = isNGO(profile.orgType)
    return {
      turnoverRate: {
        label: 'Annual Turnover Rate',
        industryAvg: industryProfile.typicalTurnoverRate,
        unit: '%',
        lowerIsBetter: true,
      },
      lowPerformerPct: {
        label: 'Low Performer %',
        industryAvg: industryProfile.typicalLowPerformerPct / 100,
        unit: '%',
        lowerIsBetter: true,
      },
      hrTeamRatio: {
        label: 'HR Team Ratio',
        industryAvg: industryProfile.hrTeamRatio,
        unit: '% of headcount',
        lowerIsBetter: false,
      },
      procurementSpendRatio: {
        label: 'Procurement / Revenue',
        industryAvg: industryProfile.procurementSpendRatio,
        unit: '%',
        lowerIsBetter: false,
      },
      ...(isNGOOrg && {
        programmeEfficiencyRatio: {
          label: 'Programme Efficiency Ratio',
          industryAvg: industryProfile.typicalProgrammeEfficiencyRatio || 0.75,
          unit: '%',
          lowerIsBetter: false,
        },
      }),
    }
  }

  /**
   * Suggest default input values based on org profile.
   * Used to pre-fill Step wizard fields.
   */
  suggestDefaults(profile) {
    const industryProfile = getIndustryProfile(profile.industry)
    const headcount = profile.headcount || 100
    const avgSalary = profile.avgAnnualSalary || 50000
    const annualPayroll = profile.annualPayroll || (headcount * avgSalary)
    const annualRevenue = profile.annualRevenue || 0
    const annualBudget = profile.annualBudget || 0
    const primaryFinancial = annualRevenue || annualBudget

    // For procurement and AP spend, use the LOWER of:
    //   (a) revenue-based estimate, or
    //   (b) headcount-based estimate (headcount × per-person spend proxy)
    // This prevents tiny teams with high revenue from getting absurd procurement defaults.
    const revenueBasedProcurement = Math.round(primaryFinancial * industryProfile.procurementSpendRatio)
    const headcountBasedProcurement = Math.round(headcount * avgSalary * 0.15)
    const annualProcurementSpend = primaryFinancial > 0
      ? Math.min(revenueBasedProcurement, headcountBasedProcurement * 5)
      : headcountBasedProcurement

    const revenueBasedAP = Math.round((primaryFinancial * industryProfile.typicalAPSpendRatio) / 12)
    const headcountBasedAP = Math.round((headcount * avgSalary * 0.08) / 12)
    const monthlyAPSpend = primaryFinancial > 0
      ? Math.min(revenueBasedAP, headcountBasedAP * 5)
      : headcountBasedAP

    return {
      // Workforce
      minutesLostPerDay: 15,
      turnoverCount: Math.round(headcount * industryProfile.typicalTurnoverRate),
      hrTeamSalary: Math.round(headcount * industryProfile.hrTeamRatio * avgSalary),
      // Performance
      lowPerformerPercent: industryProfile.typicalLowPerformerPct,
      managerCount: Math.round(headcount * industryProfile.managerRatio),
      appraisalCyclesPerYear: 2,
      // Procurement — headcount-anchored to avoid inflation on high-revenue small orgs
      annualProcurementSpend,
      purchaseOrderCount: Math.round(headcount * 2.5),
      // Finance — headcount-anchored
      financeTeamSalary: Math.round(headcount * industryProfile.financeTeamRatio * avgSalary),
      monthlyAPSpend,
      avgDaysToClose: 10,
      // Document
      knowledgeWorkerCount: Math.round(headcount * industryProfile.knowledgeWorkerRatio),
      // NGO
      programmeBudget: annualBudget ? Math.round(annualBudget * 0.70) : 0,
      grantReportsPerYear: industryProfile.typicalGrantReportsPerYear || 0,
    }
  }
}
