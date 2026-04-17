/**
 * LeakageCalculator.js
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 1 — Data Layer
 * Org types supported: both
 * Dependencies: orgTypeProfiles.js, benchmarks.js
 * Demo IDs: none
 * Integration: useLeakageState, OrganizationalIntelligenceWidget
 *
 * All amounts computed in USD internally. CurrencyEngine converts for display.
 * All methods are pure functions with no side effects.
 */

import { isNGO, ORG_TYPES } from '../data/orgTypeProfiles.js'
import { TIER_MULTIPLIERS, INDUSTRY_BENCHMARK_OVERRIDES } from '../data/benchmarks.js'

export class LeakageCalculator {
  constructor(profile, inputs, benchmarks, tier = 'average') {
    this.p = profile
    this.i = inputs
    this.b = this.#mergeBenchmarks(benchmarks, tier, profile.industry)
    this.tier = tier
    this.multipliers = TIER_MULTIPLIERS[tier] || TIER_MULTIPLIERS.average
  }

  // Merge global tier multipliers with industry-specific overrides
  #mergeBenchmarks(benchmarks, tier, industry) {
    const base = { ...TIER_MULTIPLIERS[tier] }
    const overrides = INDUSTRY_BENCHMARK_OVERRIDES[industry] || {}
    const merged = { ...base }
    for (const [key, val] of Object.entries(overrides)) {
      if (val && typeof val === 'object' && val[tier] !== undefined) {
        merged[key] = val[tier]
      }
    }
    return merged
  }

  // ── SECTION B: WORKFORCE LEAKAGE ──────────────────────────────────────

  payrollErrorRate() {
    const base = this.b.payrollErrorRate
    if (!this.p.annualPayroll) return { value: 0, formula: 'annualPayroll required', source: 'American Payroll Association' }
    return {
      value: this.p.annualPayroll * base,
      formula: `annualPayroll × ${(base * 100).toFixed(1)}%`,
      source: 'American Payroll Association',
      benchmark: `Industry: ${(TIER_MULTIPLIERS.average.payrollErrorRate * 100).toFixed(1)}%`,
    }
  }

  timeTheftCost() {
    const minsLost = this.i.minutesLostPerDay || this.b.timeTheftMinutes
    const hourlyRate = this.p.avgHourlyRate || (this.p.avgAnnualSalary / (260 * 8))
    const annualHoursLost = (minsLost / 60) * 260 * (this.p.headcount || 0)
    return {
      value: annualHoursLost * hourlyRate,
      formula: `(${minsLost}min/60) × 260 days × ${this.p.headcount} employees × hourlyRate`,
      source: 'American Society of Employers',
      annualHoursLost,
    }
  }

  turnoverCost() {
    const replacementRate = this.b.replacementCostRate
    const avgSalary = this.p.avgAnnualSalary || 0
    const replacementCostPerPerson = avgSalary * replacementRate
    const turnoverCount = this.i.turnoverCount || 0
    return {
      value: turnoverCount * replacementCostPerPerson,
      formula: `${turnoverCount} exits × avgSalary × ${replacementRate.toFixed(2)}`,
      source: 'SHRM Talent Acquisition Benchmarking',
      costPerPerson: replacementCostPerPerson,
    }
  }

  hrAdminWaste() {
    const wasteRate = this.b.hrAdminWasteRate
    const hrSalary = this.i.hrTeamSalary || 0
    return {
      value: hrSalary * wasteRate,
      formula: `hrTeamSalary × ${(wasteRate * 100).toFixed(0)}%`,
      source: 'PwC HR Technology Survey',
    }
  }

  attendanceFraud() {
    const baseRate = this.p.techMaturity === 'manual'
      ? TIER_MULTIPLIERS.uncontrolled.attendanceFraudRate
      : this.b.attendanceFraudRate
    return {
      value: (this.p.annualPayroll || 0) * baseRate,
      formula: `annualPayroll × ${(baseRate * 100).toFixed(2)}%`,
      source: 'ACFE Global Fraud Report',
    }
  }

  trainingInvestmentLoss() {
    const trainingCostPerEmployee = (this.p.avgAnnualSalary || 0) * 0.02
    const lostTraining = (this.i.turnoverCount || 0) * trainingCostPerEmployee
    return {
      value: lostTraining,
      formula: `${this.i.turnoverCount || 0} exits × avgSalary × 2%`,
      source: 'LinkedIn Workplace Learning Report',
    }
  }

  workforceTotal() {
    const items = {
      payrollErrors: this.payrollErrorRate(),
      timeTheft: this.timeTheftCost(),
      turnover: this.turnoverCost(),
      hrAdmin: this.hrAdminWaste(),
      attendanceFraud: this.attendanceFraud(),
      trainingLoss: this.trainingInvestmentLoss(),
    }
    return { ...items, total: Object.values(items).reduce((s, r) => s + (r.value || 0), 0) }
  }

  // ── SECTION C: PERFORMANCE LEAKAGE ────────────────────────────────────

  underperformanceCost() {
    const lowPerformers = Math.round((this.p.headcount || 0) * ((this.i.lowPerformerPercent || 15) / 100))
    const productivityGap = this.b.productivityGap
    const fteLost = lowPerformers * productivityGap
    return {
      value: fteLost * (this.p.avgAnnualSalary || 0),
      formula: `${lowPerformers} low performers × productivityGap(${productivityGap}) × avgSalary`,
      source: 'McKinsey Global Institute',
      lowPerformers,
      fteLost,
    }
  }

  disengagementCost() {
    const disengagedCount = Math.round((this.p.headcount || 0) * this.b.disengagementRate)
    return {
      value: disengagedCount * (this.p.avgAnnualSalary || 0) * 0.34,
      formula: `${disengagedCount} disengaged × avgSalary × 34%`,
      source: 'Gallup State of Global Workplace Report',
      disengagedCount,
    }
  }

  appraisalWaste() {
    if (!this.i.managerCount) return { value: 0, formula: 'managerCount required', source: 'Deloitte Human Capital Trends' }
    const hoursPerCycle = this.i.hoursPerAppraisalCycle || this.b.appraisalHoursPerCycle
    const managerHourlyRate = ((this.p.avgAnnualSalary || 0) * 1.5) / (260 * 8)
    return {
      value: this.i.managerCount * hoursPerCycle * (this.i.appraisalCyclesPerYear || 2) * managerHourlyRate,
      formula: `${this.i.managerCount} managers × ${hoursPerCycle}hrs × ${this.i.appraisalCyclesPerYear || 2} cycles × managerHourlyRate`,
      source: 'Deloitte Human Capital Trends',
    }
  }

  topTalentLoss() {
    if (!this.i.topTalentLostPerYear) return { value: 0, formula: 'topTalentLostPerYear required', source: 'SHRM Talent Retention Research' }
    return {
      value: this.i.topTalentLostPerYear * (this.p.avgAnnualSalary || 0) * 2,
      formula: `${this.i.topTalentLostPerYear} top talent exits × avgSalary × 2.0`,
      source: 'SHRM Talent Retention Research',
    }
  }

  performanceTotal() {
    const items = {
      underperformance: this.underperformanceCost(),
      disengagement: this.disengagementCost(),
      appraisalWaste: this.appraisalWaste(),
      topTalentLoss: this.topTalentLoss(),
    }
    return { ...items, total: Object.values(items).reduce((s, r) => s + (r.value || 0), 0) }
  }

  // ── SECTION D: PROCUREMENT LEAKAGE ────────────────────────────────────

  maverickSpending() {
    const rate = this.b.maverickSpendingRate
    return {
      value: (this.i.annualProcurementSpend || 0) * rate,
      formula: `procurementSpend × ${(rate * 100).toFixed(0)}%`,
      source: 'Hackett Group Procurement Study',
    }
  }

  vendorOverpricing() {
    return {
      value: (this.i.annualProcurementSpend || 0) * 0.08,
      formula: 'procurementSpend × 8%',
      source: 'CIPS Procurement Benchmark',
    }
  }

  manualPOProcessingCost() {
    if (!this.i.purchaseOrderCount) return { value: 0, formula: 'purchaseOrderCount required', source: 'APQC Process Cost Benchmarks' }
    const costPerPO = this.b.manualPOCost
    return {
      value: this.i.purchaseOrderCount * costPerPO,
      formula: `${this.i.purchaseOrderCount} POs × $${costPerPO} per PO`,
      source: 'APQC Process Cost Benchmarks',
    }
  }

  contractLeakage() {
    return {
      value: (this.i.annualProcurementSpend || 0) * 0.09,
      formula: 'procurementSpend × 9%',
      source: 'IACCM Contract Management Study',
    }
  }

  duplicatePayments() {
    const rate = this.b.duplicatePaymentRate
    return {
      value: (this.i.monthlyAPSpend || 0) * 12 * rate,
      formula: `annualAPSpend × ${(rate * 100).toFixed(2)}%`,
      source: 'IOFM Accounts Payable Research',
    }
  }

  procurementTotal() {
    const items = {
      maverickSpending: this.maverickSpending(),
      vendorOverpricing: this.vendorOverpricing(),
      manualPOCost: this.manualPOProcessingCost(),
      contractLeakage: this.contractLeakage(),
      duplicatePayments: this.duplicatePayments(),
    }
    return { ...items, total: Object.values(items).reduce((s, r) => s + (r.value || 0), 0) }
  }

  // ── SECTION E (COMMERCIAL): REVENUE LEAKAGE ───────────────────────────

  leadDecayCost() {
    if (!this.i.monthlyLeadVolume || !this.i.avgDealValue) return { value: 0, formula: 'monthlyLeadVolume + avgDealValue required', source: 'Harvard Business Review — Lead Response Study' }
    const annualLeads = this.i.monthlyLeadVolume * 12
    const decayedLeads = annualLeads * this.b.leadDecayRate
    const baseConversionRate = 0.20
    const degradedConversionRate = baseConversionRate / 7
    return {
      value: decayedLeads * (baseConversionRate - degradedConversionRate) * this.i.avgDealValue,
      formula: `annualLeads × decayRate(${(this.b.leadDecayRate * 100).toFixed(0)}%) × conversionDrop × dealValue`,
      source: 'Harvard Business Review — Lead Response Study',
    }
  }

  pipelineBlindnessCost() {
    if (!this.i.monthlyLeadVolume || !this.i.avgDealValue) return { value: 0, formula: 'monthlyLeadVolume + avgDealValue required', source: 'Salesforce State of Sales Report' }
    const pipelineValue = this.i.monthlyLeadVolume * 3 * this.i.avgDealValue
    return {
      value: pipelineValue * 0.12,
      formula: 'pipelineValue × 12%',
      source: 'Salesforce State of Sales Report',
    }
  }

  customerChurnCost() {
    if (!this.i.monthlyChurnRate || !this.i.avgCustomerLifetimeValue) return { value: 0, formula: 'monthlyChurnRate + avgCustomerLTV required', source: 'Bain & Company Customer Retention Research' }
    const annualChurn = this.i.monthlyChurnRate * 12
    return {
      value: annualChurn * this.i.avgCustomerLifetimeValue,
      formula: `annualChurnCount × avgCustomerLTV`,
      source: 'Bain & Company Customer Retention Research',
    }
  }

  salesAdminWaste() {
    if (!this.i.salesTeamSalary) return { value: 0, formula: 'salesTeamSalary required', source: 'Salesforce State of Sales' }
    return {
      value: this.i.salesTeamSalary * 0.66,
      formula: 'salesTeamSalary × 66%',
      source: 'Salesforce State of Sales — 66% time on non-selling',
    }
  }

  revenueTotal() {
    const items = {
      leadDecay: this.leadDecayCost(),
      pipelineBlindness: this.pipelineBlindnessCost(),
      customerChurn: this.customerChurnCost(),
      salesAdminWaste: this.salesAdminWaste(),
    }
    return { ...items, total: Object.values(items).reduce((s, r) => s + (r.value || 0), 0) }
  }

  // ── SECTION E (NGO): PROGRAMME DELIVERY LEAKAGE ───────────────────────

  beneficiaryTargetingErrors() {
    if (!this.i.programmeBudget) return { value: 0, formula: 'programmeBudget required', source: 'World Bank Programme Evaluation' }
    return {
      value: this.i.programmeBudget * 0.12,
      formula: 'programmeBudget × 12%',
      source: 'World Bank Programme Evaluation',
    }
  }

  projectOverrunCost() {
    if (!this.i.programmeBudget) return { value: 0, formula: 'programmeBudget required', source: 'PMI Global Project Management Report' }
    return {
      value: this.i.programmeBudget * 0.30,
      formula: 'programmeBudget × 30%',
      source: 'PMI Global Project Management Report',
    }
  }

  unverifiedOutcomes() {
    if (!this.i.programmeBudget) return { value: 0, formula: 'programmeBudget required', source: 'DFID Programme Evaluation Framework' }
    return {
      value: this.i.programmeBudget * 0.15,
      formula: 'programmeBudget × 15%',
      source: 'DFID Programme Evaluation Framework',
    }
  }

  supplyChainDiversion() {
    if (ORG_TYPES[this.p.orgType]?.ngoSubtype !== 'humanitarian') return { value: 0, formula: 'humanitarian subtype only', source: 'Transparency International Humanitarian Aid Report' }
    return {
      value: (this.i.annualProcurementSpend || 0) * 0.07,
      formula: 'procurementSpend × 7%',
      source: 'Transparency International Humanitarian Aid Report',
    }
  }

  donorFundLeakage() {
    if (!this.p.annualBudget) return { value: 0, formula: 'annualBudget required', source: 'GuideStar / Charity Navigator Benchmarks' }
    const adminRatio = this.p.programmeEfficiencyRatio ? 1 - this.p.programmeEfficiencyRatio : 0.25
    const excessAdmin = Math.max(0, adminRatio - 0.20)
    const grantRisk = (this.i.avgGrantValue || 0) * 0.10
    const duplicates = this.p.annualBudget * 0.04
    return {
      value: (this.p.annualBudget * excessAdmin) + grantRisk + duplicates,
      formula: 'budget × excessAdminRatio + grantRisk + duplicates',
      source: 'GuideStar / Charity Navigator Benchmarks',
    }
  }

  grantReportingCost() {
    if (!this.i.grantReportsPerYear) return { value: 0, formula: 'grantReportsPerYear required', source: 'BOND NGO Network Reporting Survey' }
    const hoursPerReport = 160
    const financeHeadcount = Math.max(1, Math.round((this.p.headcount || 1) * 0.1))
    const financeHourlyRate = (this.i.financeTeamSalary || 0) / (financeHeadcount * 260 * 8)
    return {
      value: this.i.grantReportsPerYear * hoursPerReport * financeHourlyRate,
      formula: `${this.i.grantReportsPerYear} reports × 160hrs × financeHourlyRate`,
      source: 'BOND NGO Network Reporting Survey',
    }
  }

  programmeTotal() {
    const items = {
      beneficiaryErrors: this.beneficiaryTargetingErrors(),
      projectOverruns: this.projectOverrunCost(),
      unverifiedOutcomes: this.unverifiedOutcomes(),
      supplyChainDiversion: this.supplyChainDiversion(),
      donorFundLeakage: this.donorFundLeakage(),
      grantReportingCost: this.grantReportingCost(),
    }
    return { ...items, total: Object.values(items).reduce((s, r) => s + (r.value || 0), 0) }
  }

  // ── SECTION F: FINANCE & ACCOUNTING LEAKAGE ───────────────────────────

  reconciliationCost() {
    if (!this.i.financeTeamSalary) return { value: 0, formula: 'financeTeamSalary required', source: 'Blackline Finance Automation Survey' }
    const rate = this.b.reconciliationWasteRate
    return {
      value: this.i.financeTeamSalary * rate,
      formula: `financeTeamSalary × ${(rate * 100).toFixed(0)}%`,
      source: 'Blackline Finance Automation Survey',
    }
  }

  latePaymentPenalties() {
    if (!this.i.monthlyAPSpend) return { value: 0, formula: 'monthlyAPSpend required', source: 'Industry Average Payment Terms Analysis' }
    return {
      value: this.i.monthlyAPSpend * 12 * 0.015,
      formula: 'annualAPSpend × 1.5%',
      source: 'Industry Average Payment Terms Analysis',
    }
  }

  reportingDelayCost() {
    if (!this.i.avgDaysToClose || !this.p.annualRevenue) return { value: 0, formula: 'avgDaysToClose + annualRevenue required', source: 'Ventana Research Financial Close Benchmark' }
    const benchmarkDaysToClose = this.b.financialCloseDays?.average || 8.5
    const excessDays = Math.max(0, this.i.avgDaysToClose - benchmarkDaysToClose)
    const dailyRevenue = this.p.annualRevenue / 365
    return {
      value: excessDays * dailyRevenue * 0.001,
      formula: `${excessDays} excess days × dailyRevenue × 0.1%`,
      source: 'Ventana Research Financial Close Benchmark',
    }
  }

  auditPreparationWaste() {
    if (!this.i.financeTeamSalary) return { value: 0, formula: 'financeTeamSalary required', source: 'PwC Finance Effectiveness Survey' }
    return {
      value: this.i.financeTeamSalary * 0.15,
      formula: 'financeTeamSalary × 15%',
      source: 'PwC Finance Effectiveness Survey',
    }
  }

  financeTotal() {
    const items = {
      reconciliation: this.reconciliationCost(),
      latePayments: this.latePaymentPenalties(),
      duplicatePayments: this.duplicatePayments(),
      reportingDelay: this.reportingDelayCost(),
      auditWaste: this.auditPreparationWaste(),
    }
    return { ...items, total: Object.values(items).reduce((s, r) => s + (r.value || 0), 0) }
  }

  // ── SECTION G: DOCUMENT & KNOWLEDGE LEAKAGE ───────────────────────────

  documentSearchCost() {
    const kwCount = this.i.knowledgeWorkerCount || Math.round((this.p.headcount || 0) * 0.40)
    const opCount = (this.p.headcount || 0) - kwCount
    const hourlyRate = this.p.avgHourlyRate || ((this.p.avgAnnualSalary || 0) / (260 * 8))
    const kwHours = 1.5 * 260
    const opHours = 0.33 * 260
    return {
      value: ((kwCount * kwHours) + (opCount * opHours)) * hourlyRate,
      formula: `(${kwCount} KW × 1.5hrs + ${opCount} ops × 0.33hrs) × 260 days × hourlyRate`,
      source: 'IDC Knowledge Worker Productivity Research',
    }
  }

  documentRecreationCost() {
    const searchCost = this.documentSearchCost().value
    return {
      value: searchCost * 0.25,
      formula: 'documentSearchCost × 25%',
      source: 'AIIM Document Management Survey',
    }
  }

  knowledgeLossAtExit() {
    return {
      value: (this.i.turnoverCount || 0) * (this.p.avgAnnualSalary || 0) * 0.42 * 0.5,
      formula: `${this.i.turnoverCount || 0} exits × avgSalary × 42% × 50%`,
      source: 'Deloitte Human Capital Trends',
    }
  }

  documentTotal() {
    const items = {
      searchCost: this.documentSearchCost(),
      recreationCost: this.documentRecreationCost(),
      knowledgeLoss: this.knowledgeLossAtExit(),
    }
    return { ...items, total: Object.values(items).reduce((s, r) => s + (r.value || 0), 0) }
  }

  // ── SECTION H: COMPLIANCE & RISK LEAKAGE ──────────────────────────────

  complianceRiskScore() {
    const { i } = this
    let score = 0
    if (i.multipleJurisdictions) score += 2
    if (i.multiCurrency) score += 1
    if (i.industryRegulations) score += 2
    if (i.dataPrivacyObligations) score += 2
    if (i.recentComplianceFinding) score += 3
    return score // 0–10
  }

  complianceLeakage() {
    const score = this.complianceRiskScore()
    const riskMultiplier = score / 10
    const baseExposure = (this.p.annualPayroll || 0) * 0.05
    return {
      value: baseExposure * riskMultiplier,
      formula: `annualPayroll × 5% × riskScore(${score})/10`,
      source: 'ACFE Report to the Nations — Compliance Risk',
      riskScore: score,
      riskLevel: score <= 3 ? 'low' : score <= 6 ? 'medium' : 'high',
    }
  }

  // ── SECTION I: NGO REPUTATIONAL LEAKAGE ───────────────────────────────

  reputationalLeakage() {
    if (!isNGO(this.p.orgType)) return { value: 0, formula: 'NGO only', source: 'CAF World Giving Index + Charity Navigator' }
    const donorAttritionRates = { low: 0.05, medium: 0.15, high: 0.30 }
    const rate = donorAttritionRates[this.i.mediaRiskLevel || 'low']
    return {
      value: (this.p.annualBudget || 0) * rate,
      formula: `annualBudget × donorAttritionRate(${(rate * 100).toFixed(0)}%)`,
      source: 'CAF World Giving Index + Charity Navigator',
    }
  }

  // ── DOMAIN CAPS — prevent any single domain exceeding a credible % of its base ──

  #capDomain(section, maxValue, label) {
    if (!maxValue || maxValue <= 0 || section.total <= maxValue) return section
    const scale = maxValue / section.total
    const capped = {}
    for (const [k, v] of Object.entries(section)) {
      if (k === 'total') continue
      capped[k] = typeof v === 'object' && v !== null
        ? { ...v, value: (v.value || 0) * scale }
        : v
    }
    capped.total = maxValue
    capped._capped = true
    capped._capLabel = label
    return capped
  }

  // ── GRAND TOTAL ────────────────────────────────────────────────────────

  calculate() {
    const isNGOOrg = isNGO(this.p.orgType)
    const payroll   = this.p.annualPayroll  || 0
    const revenue   = this.p.annualRevenue  || 0
    const budget    = this.p.annualBudget   || 0
    const headcount = this.p.headcount      || 1

    // ── Per-domain credibility caps ──────────────────────────────────────
    // Each domain is capped at a realistic ceiling relative to its base.
    // This prevents high-revenue / low-headcount orgs from showing absurd totals.

    const rawWorkforce   = this.workforceTotal()
    const rawPerformance = this.performanceTotal()
    const rawProcurement = this.procurementTotal()
    const rawRevenue     = isNGOOrg ? null : this.revenueTotal()
    const rawProgramme   = isNGOOrg ? this.programmeTotal() : null
    const rawFinance     = this.financeTotal()
    const rawDocument    = this.documentTotal()
    const complianceResult = this.complianceLeakage()
    const rawCompliance  = { total: complianceResult.value, breakdown: { compliance: complianceResult } }
    const reputationalResult = isNGOOrg ? this.reputationalLeakage() : null
    const rawReputational = reputationalResult
      ? { total: reputationalResult.value, breakdown: { reputational: reputationalResult } }
      : null

    // Workforce: max 25% of annual payroll
    const workforce = this.#capDomain(rawWorkforce, payroll * 0.25, '25% of payroll')

    // Performance: max 20% of annual payroll
    const performance = this.#capDomain(rawPerformance, payroll * 0.20, '20% of payroll')

    // Procurement: max 30% of actual procurement spend (or 5% of revenue if spend not provided)
    const procBase = this.i.annualProcurementSpend
      ? this.i.annualProcurementSpend * 0.30
      : (revenue || budget) * 0.05
    const procurement = this.#capDomain(rawProcurement, procBase, '30% of procurement spend')

    // Revenue leakage: max 15% of annual revenue
    const revenueSection = rawRevenue
      ? this.#capDomain(rawRevenue, revenue * 0.15, '15% of revenue')
      : null

    // Programme: max 40% of programme budget (NGO)
    const programme = rawProgramme
      ? this.#capDomain(rawProgramme, (this.i.programmeBudget || budget) * 0.40, '40% of programme budget')
      : null

    // Finance: max 10% of payroll
    const finance = this.#capDomain(rawFinance, payroll * 0.10, '10% of payroll')

    // Document: max 8% of payroll (knowledge work is real but bounded)
    const document = this.#capDomain(rawDocument, payroll * 0.08, '8% of payroll')

    // Compliance: already formula-bounded by risk score, keep as-is
    const compliance = rawCompliance

    // Reputational: already formula-bounded, keep as-is
    const reputational = rawReputational

    const sections = {
      workforce,
      performance,
      procurement,
      ...(revenueSection && { revenue: revenueSection }),
      ...(programme && { programme }),
      finance,
      document,
      compliance,
      ...(reputational && { reputational }),
    }

    // ── Global sanity cap ────────────────────────────────────────────────
    // Total leakage cannot credibly exceed:
    //   - 40% of annual payroll (workforce-heavy orgs), OR
    //   - 20% of revenue/budget (revenue-heavy orgs)
    // BUT also capped at a per-headcount maximum of $150K/person
    // to prevent high-revenue / low-headcount orgs from showing absurd totals.
    const perHeadcountCeiling = headcount * 150_000
    const financialCeiling = Math.max(payroll * 0.40, (revenue || budget) * 0.20)
    const globalCeiling = Math.min(financialCeiling, perHeadcountCeiling)
    let totalLeakage = Object.values(sections).reduce((sum, s) => sum + (s?.total || 0), 0)

    if (globalCeiling > 0 && totalLeakage > globalCeiling) {
      const scale = globalCeiling / totalLeakage
      for (const key of Object.keys(sections)) {
        if (sections[key]) {
          sections[key] = { ...sections[key], total: sections[key].total * scale, _globallyScaled: true }
        }
      }
      totalLeakage = globalCeiling
    }

    const recoveryEstimate = totalLeakage * 0.50
    const HRcopilotAnnualCost = headcount * 120
    // Cap ROI display at 9,999% — beyond that it loses credibility with clients
    const rawROI = HRcopilotAnnualCost > 0
      ? ((recoveryEstimate - HRcopilotAnnualCost) / HRcopilotAnnualCost) * 100
      : 0
    const yearOneROI = Math.min(rawROI, 9999)
    const breakEvenMonths = recoveryEstimate > 0 ? (HRcopilotAnnualCost / (recoveryEstimate / 12)) : 0
    const threeYearGain = (recoveryEstimate * 3) - (HRcopilotAnnualCost * 3)

    const additionalBeneficiaries = isNGOOrg && this.p.costPerBeneficiary
      ? Math.round(recoveryEstimate / this.p.costPerBeneficiary)
      : 0

    const programmeEfficiencyRatio = isNGOOrg && (budget || payroll)
      ? Math.max(0, Math.min(1, 1 - (totalLeakage / (budget || payroll))))
      : 0

    return {
      sections,
      totalLeakage,
      recoveryEstimate,
      yearOneROI,
      breakEvenMonths,
      threeYearGain,
      additionalBeneficiaries,
      programmeEfficiencyRatio,
      dailyLeakage: totalLeakage / 365,
      hourlyLeakage: totalLeakage / (365 * 24),
      perSecondLeakage: totalLeakage / (365 * 24 * 3600),
      HRcopilotAnnualCost,
      isNGO: isNGOOrg,
    }
  }
}
