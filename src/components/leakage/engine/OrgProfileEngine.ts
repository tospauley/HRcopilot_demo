/**
 * OrgProfileEngine.js
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 1 — Data Layer
 * Org types supported: both
 * Dependencies: data/orgTypeProfiles.js, data/industryProfiles.js, engine/BenchmarkEngine.js
 * Demo IDs: none
 * Integration: useLeakageState, Step1_OrgProfile
 */

import { ORG_TYPES, isNGO, isCommercial } from '../data/orgTypeProfiles.js'
import { getIndustryProfile } from '../data/industryProfiles.js'
import { BenchmarkEngine } from './BenchmarkEngine.js'
import { FALLBACK_RATES } from '../data/exchangeRates.js'

const benchmarkEngine = new BenchmarkEngine()

export class OrgProfileEngine {
  /**
   * Map raw Step1 form values to a complete profile object.
   * All monetary values are normalised to USD internally.
   * The display layer (CurrencyEngine) converts back to the local currency.
   */
  buildProfile(formValues) {
    const {
      orgType,
      headcount,
      headcountRange,
      annualPayroll,
      annualRevenue,
      annualBudget,
      currency = 'USD',
      locale = 'en-US',
      exchangeRate,
      countriesOfOperation = 1,
      techMaturity = 'basic',
      fiscalYearStart = 'january',
      fundingSources,
      volunteerCount = 0,
      programmeEfficiencyRatio,
      costPerBeneficiary,
    } = formValues

    const orgTypeDef = ORG_TYPES[orgType]
    if (!orgTypeDef) throw new Error(`Unknown orgType: ${orgType}`)

    const sector = orgTypeDef.sector
    const industry = orgTypeDef.benchmarkSet

    // ── Currency normalisation ────────────────────────────────────────────
    // The user enters monetary values in their selected currency (e.g. NGN).
    // We convert to USD here so the calculator always works in USD.
    // The display layer multiplies back by the exchange rate for presentation.
    const resolvedRate = exchangeRate && exchangeRate > 1
      ? exchangeRate
      : (FALLBACK_RATES[currency] || 1)

    const toUSD = (v) => (v && resolvedRate > 0) ? v / resolvedRate : (v || 0)

    const annualPayrollUSD = toUSD(annualPayroll)
    const annualRevenueUSD = toUSD(annualRevenue)
    const annualBudgetUSD  = toUSD(annualBudget)
    const costPerBeneficiaryUSD = costPerBeneficiary ? toUSD(costPerBeneficiary) : null

    // Derive headcount range
    const derivedHeadcountRange = headcountRange || this.#deriveHeadcountRange(headcount)

    // Average salary in USD
    const avgAnnualSalary = annualPayrollUSD && headcount
      ? Math.round(annualPayrollUSD / headcount)
      : this.#estimateAvgSalary(industry, currency)

    const avgHourlyRate = avgAnnualSalary / (260 * 8)

    return {
      orgType,
      sector,
      industry,
      headcount: headcount || 0,
      headcountRange: derivedHeadcountRange,
      annualPayroll: annualPayrollUSD || (avgAnnualSalary * (headcount || 0)),
      annualRevenue: annualRevenueUSD || 0,
      annualBudget: annualBudgetUSD || 0,
      avgAnnualSalary,
      avgHourlyRate,
      currency,
      locale,
      exchangeRate: resolvedRate,
      countriesOfOperation,
      techMaturity,
      fiscalYearStart,
      fundingSources: fundingSources || { governmentGrants: 0, privateDonors: 0, corporate: 0, selfGenerated: 0 },
      volunteerCount,
      programmeEfficiencyRatio: programmeEfficiencyRatio || null,
      costPerBeneficiary: costPerBeneficiaryUSD,
      isNGO: isNGO(orgType),
      isCommercial: isCommercial(orgType),
      orgTypeLabel: orgTypeDef.label,
      orgTypeIcon: orgTypeDef.icon,
    }
  }

  /**
   * Validate profile completeness — returns array of missing field keys.
   */
  validateProfile(profile) {
    const required = ['orgType', 'headcount', 'annualPayroll']
    const missing = required.filter(k => !profile[k])

    if (profile.isNGO && !profile.annualBudget) missing.push('annualBudget')
    if (profile.isCommercial && !profile.annualRevenue) missing.push('annualRevenue')

    return missing
  }

  /**
   * Get suggested defaults for Step inputs based on profile.
   */
  getSuggestedDefaults(profile) {
    return benchmarkEngine.suggestDefaults(profile)
  }

  /**
   * Build benchmarks for a complete profile.
   */
  buildBenchmarks(profile) {
    return benchmarkEngine.buildBenchmarks(profile)
  }

  /**
   * Get the display label for a tech maturity level.
   */
  getTechMaturityLabel(level) {
    const labels = {
      manual: 'Manual / Paper-based',
      basic: 'Basic Digital (Spreadsheets)',
      integrated: 'Integrated Systems',
      automated: 'Fully Automated',
    }
    return labels[level] || level
  }

  #deriveHeadcountRange(headcount) {
    if (!headcount) return '51-200'
    if (headcount <= 50) return '1-50'
    if (headcount <= 200) return '51-200'
    if (headcount <= 1000) return '201-1000'
    return '1000+'
  }

  #estimateAvgSalary(industry, currency) {
    // USD baseline estimates by industry
    const baselines = {
      technology: 85000,
      financial_services: 90000,
      professional_services: 80000,
      healthcare: 70000,
      manufacturing: 55000,
      energy: 75000,
      telecoms: 65000,
      logistics: 50000,
      retail_fmcg: 40000,
      construction: 52000,
      hospitality: 38000,
      education_private: 52000,
      ngo_international: 58000,
      ngo_local: 35000,
      ngo_foundation: 62000,
      ngo_faith: 32000,
      ngo_humanitarian: 55000,
      ngo_development: 52000,
      social_enterprise: 48000,
      public_sector: 52000,
    }
    return baselines[industry] || 50000
  }
}
