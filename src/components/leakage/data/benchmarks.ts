/**
 * benchmarks.js
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 1 — Data Layer
 * Org types supported: both
 * Dependencies: none
 * Demo IDs: none
 * Integration: LeakageCalculator, BenchmarkEngine, useBenchmarks
 */

// ── Credibility Tier Multipliers ─────────────────────────────────────────────
export const TIER_MULTIPLIERS = {
  conservative: {
    payrollErrorRate: 0.01,
    timeTheftMinutes: 5,
    replacementCostRate: 0.50,
    hrAdminWasteRate: 0.30,
    attendanceFraudRate: 0.003,
    maverickSpendingRate: 0.10,
    productivityGap: 0.20,
    leadDecayRate: 0.25,
    reconciliationWasteRate: 0.25,
    disengagementRate: 0.20,
    manualPOCost: 75,
    duplicatePaymentRate: 0.001,
    appraisalHoursPerCycle: 120,
    financialCloseDays: { average: 6 },
  },
  average: {
    payrollErrorRate: 0.02,
    timeTheftMinutes: 15,
    replacementCostRate: 0.75,
    hrAdminWasteRate: 0.40,
    attendanceFraudRate: 0.01,
    maverickSpendingRate: 0.20,
    productivityGap: 0.30,
    leadDecayRate: 0.35,
    reconciliationWasteRate: 0.35,
    disengagementRate: 0.34,
    manualPOCost: 175,
    duplicatePaymentRate: 0.003,
    appraisalHoursPerCycle: 210,
    financialCloseDays: { average: 8.5 },
  },
  uncontrolled: {
    payrollErrorRate: 0.05,
    timeTheftMinutes: 25,
    replacementCostRate: 1.50,
    hrAdminWasteRate: 0.55,
    attendanceFraudRate: 0.03,
    maverickSpendingRate: 0.35,
    productivityGap: 0.45,
    leadDecayRate: 0.55,
    reconciliationWasteRate: 0.50,
    disengagementRate: 0.51,
    manualPOCost: 500,
    duplicatePaymentRate: 0.005,
    appraisalHoursPerCycle: 350,
    financialCloseDays: { average: 15 },
  },
}

// ── Industry-specific benchmark overrides ────────────────────────────────────
// Where an industry deviates significantly from the global average
export const INDUSTRY_BENCHMARK_OVERRIDES = {
  manufacturing: {
    replacementCostRate: { conservative: 0.60, average: 0.85, uncontrolled: 1.60 },
    attendanceFraudRate: { conservative: 0.005, average: 0.015, uncontrolled: 0.04 },
    maverickSpendingRate: { conservative: 0.12, average: 0.22, uncontrolled: 0.38 },
  },
  financial_services: {
    payrollErrorRate: { conservative: 0.008, average: 0.015, uncontrolled: 0.04 },
    reconciliationWasteRate: { conservative: 0.20, average: 0.30, uncontrolled: 0.45 },
    duplicatePaymentRate: { conservative: 0.0008, average: 0.002, uncontrolled: 0.004 },
  },
  healthcare: {
    replacementCostRate: { conservative: 0.75, average: 1.00, uncontrolled: 1.75 },
    disengagementRate: { conservative: 0.25, average: 0.40, uncontrolled: 0.55 },
    hrAdminWasteRate: { conservative: 0.35, average: 0.45, uncontrolled: 0.60 },
  },
  technology: {
    replacementCostRate: { conservative: 0.80, average: 1.20, uncontrolled: 2.00 },
    leadDecayRate: { conservative: 0.20, average: 0.30, uncontrolled: 0.50 },
    disengagementRate: { conservative: 0.18, average: 0.30, uncontrolled: 0.48 },
  },
  retail_fmcg: {
    attendanceFraudRate: { conservative: 0.008, average: 0.018, uncontrolled: 0.045 },
    maverickSpendingRate: { conservative: 0.15, average: 0.25, uncontrolled: 0.40 },
    replacementCostRate: { conservative: 0.40, average: 0.60, uncontrolled: 1.20 },
  },
  construction: {
    attendanceFraudRate: { conservative: 0.008, average: 0.020, uncontrolled: 0.05 },
    maverickSpendingRate: { conservative: 0.15, average: 0.28, uncontrolled: 0.45 },
    manualPOCost: { conservative: 100, average: 220, uncontrolled: 600 },
  },
  energy: {
    maverickSpendingRate: { conservative: 0.08, average: 0.18, uncontrolled: 0.32 },
    contractLeakageRate: 0.11,
    reconciliationWasteRate: { conservative: 0.28, average: 0.38, uncontrolled: 0.52 },
  },
  logistics: {
    attendanceFraudRate: { conservative: 0.006, average: 0.016, uncontrolled: 0.038 },
    productivityGap: { conservative: 0.22, average: 0.32, uncontrolled: 0.48 },
  },
  hospitality: {
    attendanceFraudRate: { conservative: 0.010, average: 0.022, uncontrolled: 0.055 },
    replacementCostRate: { conservative: 0.35, average: 0.55, uncontrolled: 1.10 },
    disengagementRate: { conservative: 0.28, average: 0.42, uncontrolled: 0.58 },
  },
  professional_services: {
    replacementCostRate: { conservative: 0.90, average: 1.30, uncontrolled: 2.20 },
    disengagementRate: { conservative: 0.20, average: 0.32, uncontrolled: 0.50 },
    appraisalHoursPerCycle: { conservative: 150, average: 260, uncontrolled: 420 },
  },
  telecoms: {
    leadDecayRate: { conservative: 0.22, average: 0.32, uncontrolled: 0.52 },
    reconciliationWasteRate: { conservative: 0.30, average: 0.40, uncontrolled: 0.55 },
  },
  // NGO benchmarks
  ngo_international: {
    hrAdminWasteRate: { conservative: 0.25, average: 0.35, uncontrolled: 0.50 },
    replacementCostRate: { conservative: 0.45, average: 0.70, uncontrolled: 1.30 },
  },
  ngo_humanitarian: {
    attendanceFraudRate: { conservative: 0.005, average: 0.012, uncontrolled: 0.030 },
    maverickSpendingRate: { conservative: 0.12, average: 0.22, uncontrolled: 0.38 },
  },
}

// ── Headcount range multipliers for scaling benchmarks ───────────────────────
export const HEADCOUNT_SCALE_FACTORS = {
  '1-50':     { hrAdminWaste: 1.2, documentSearch: 0.8, appraisalWaste: 0.7 },
  '51-200':   { hrAdminWaste: 1.0, documentSearch: 1.0, appraisalWaste: 1.0 },
  '201-1000': { hrAdminWaste: 0.85, documentSearch: 1.2, appraisalWaste: 1.15 },
  '1000+':    { hrAdminWaste: 0.70, documentSearch: 1.4, appraisalWaste: 1.30 },
}

// ── Benchmark source citations ────────────────────────────────────────────────
export const BENCHMARK_SOURCES = {
  payrollError:       'American Payroll Association',
  timeTheft:          'American Society of Employers',
  turnover:           'SHRM Talent Acquisition Benchmarking',
  hrAdmin:            'PwC HR Technology Survey',
  attendanceFraud:    'ACFE Global Fraud Report',
  trainingLoss:       'LinkedIn Workplace Learning Report',
  underperformance:   'McKinsey Global Institute',
  disengagement:      'Gallup State of Global Workplace Report',
  appraisalWaste:     'Deloitte Human Capital Trends',
  topTalentLoss:      'SHRM Talent Retention Research',
  maverickSpending:   'Hackett Group Procurement Study',
  vendorOverpricing:  'CIPS Procurement Benchmark',
  manualPO:           'APQC Process Cost Benchmarks',
  contractLeakage:    'IACCM Contract Management Study',
  duplicatePayments:  'IOFM Accounts Payable Research',
  leadDecay:          'Harvard Business Review — Lead Response Study',
  pipelineBlindness:  'Salesforce State of Sales Report',
  customerChurn:      'Bain & Company Customer Retention Research',
  salesAdmin:         'Salesforce State of Sales — 66% time on non-selling',
  reconciliation:     'Blackline Finance Automation Survey',
  latePayments:       'Industry Average Payment Terms Analysis',
  reportingDelay:     'Ventana Research Financial Close Benchmark',
  auditWaste:         'PwC Finance Effectiveness Survey',
  documentSearch:     'IDC Knowledge Worker Productivity Research',
  documentRecreation: 'AIIM Document Management Survey',
  knowledgeLoss:      'Deloitte Human Capital Trends',
  complianceRisk:     'ACFE Report to the Nations — Compliance Risk',
  reputational:       'CAF World Giving Index + Charity Navigator',
  programmeDelivery:  'World Bank Programme Evaluation',
  projectOverrun:     'PMI Global Project Management Report',
  unverifiedOutcomes: 'DFID Programme Evaluation Framework',
  supplyChain:        'Transparency International Humanitarian Aid Report',
  donorFund:          'GuideStar / Charity Navigator Benchmarks',
  grantReporting:     'BOND NGO Network Reporting Survey',
}
