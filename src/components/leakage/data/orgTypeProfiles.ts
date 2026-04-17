/**
 * orgTypeProfiles.js
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 1 — Data Layer
 * Org types supported: commercial | ngo | both
 * Dependencies: none
 * Demo IDs: none
 * Integration: consumed by LeakageCalculator, OrgProfileEngine, AIAnalysisEngine
 */

export const ORG_TYPES = {
  // ── COMMERCIAL ──────────────────────────────────────────────────────
  manufacturing: {
    id: 'manufacturing', label: 'Manufacturing', sector: 'commercial', icon: '🏭',
    primaryMetric: 'annualRevenue', leakageFraming: 'profit_loss',
    roiLabel: 'Return on Investment', closingMetric: 'yearOneROI',
    advisorTone: 'business_outcomes', benchmarkSet: 'manufacturing'
  },
  financial_services: {
    id: 'financial_services', label: 'Financial Services / Banking', sector: 'commercial', icon: '🏦',
    primaryMetric: 'annualRevenue', leakageFraming: 'profit_loss',
    roiLabel: 'Return on Investment', closingMetric: 'yearOneROI',
    advisorTone: 'business_outcomes', benchmarkSet: 'financial_services'
  },
  healthcare: {
    id: 'healthcare', label: 'Healthcare / Pharma', sector: 'commercial', icon: '🏥',
    primaryMetric: 'annualRevenue', leakageFraming: 'profit_loss',
    roiLabel: 'Return on Investment', closingMetric: 'yearOneROI',
    advisorTone: 'business_outcomes', benchmarkSet: 'healthcare'
  },
  technology: {
    id: 'technology', label: 'Technology / SaaS', sector: 'commercial', icon: '💻',
    primaryMetric: 'annualRevenue', leakageFraming: 'profit_loss',
    roiLabel: 'Return on Investment', closingMetric: 'yearOneROI',
    advisorTone: 'business_outcomes', benchmarkSet: 'technology'
  },
  retail_fmcg: {
    id: 'retail_fmcg', label: 'Retail / FMCG', sector: 'commercial', icon: '🛒',
    primaryMetric: 'annualRevenue', leakageFraming: 'profit_loss',
    roiLabel: 'Return on Investment', closingMetric: 'yearOneROI',
    advisorTone: 'business_outcomes', benchmarkSet: 'retail'
  },
  construction: {
    id: 'construction', label: 'Construction / Real Estate', sector: 'commercial', icon: '🏗️',
    primaryMetric: 'annualRevenue', leakageFraming: 'profit_loss',
    roiLabel: 'Return on Investment', closingMetric: 'yearOneROI',
    advisorTone: 'business_outcomes', benchmarkSet: 'construction'
  },
  energy: {
    id: 'energy', label: 'Energy / Oil & Gas', sector: 'commercial', icon: '⚡',
    primaryMetric: 'annualRevenue', leakageFraming: 'profit_loss',
    roiLabel: 'Return on Investment', closingMetric: 'yearOneROI',
    advisorTone: 'business_outcomes', benchmarkSet: 'energy'
  },
  logistics: {
    id: 'logistics', label: 'Logistics / Supply Chain', sector: 'commercial', icon: '🚚',
    primaryMetric: 'annualRevenue', leakageFraming: 'profit_loss',
    roiLabel: 'Return on Investment', closingMetric: 'yearOneROI',
    advisorTone: 'business_outcomes', benchmarkSet: 'logistics'
  },
  hospitality: {
    id: 'hospitality', label: 'Hospitality / Tourism', sector: 'commercial', icon: '🏨',
    primaryMetric: 'annualRevenue', leakageFraming: 'profit_loss',
    roiLabel: 'Return on Investment', closingMetric: 'yearOneROI',
    advisorTone: 'business_outcomes', benchmarkSet: 'hospitality'
  },
  education_private: {
    id: 'education_private', label: 'Education (Private)', sector: 'commercial', icon: '🎓',
    primaryMetric: 'annualRevenue', leakageFraming: 'profit_loss',
    roiLabel: 'Return on Investment', closingMetric: 'yearOneROI',
    advisorTone: 'business_outcomes', benchmarkSet: 'education'
  },
  professional_services: {
    id: 'professional_services', label: 'Professional Services', sector: 'commercial', icon: '💼',
    primaryMetric: 'annualRevenue', leakageFraming: 'profit_loss',
    roiLabel: 'Return on Investment', closingMetric: 'yearOneROI',
    advisorTone: 'business_outcomes', benchmarkSet: 'professional_services'
  },
  telecoms: {
    id: 'telecoms', label: 'Telecommunications', sector: 'commercial', icon: '📡',
    primaryMetric: 'annualRevenue', leakageFraming: 'profit_loss',
    roiLabel: 'Return on Investment', closingMetric: 'yearOneROI',
    advisorTone: 'business_outcomes', benchmarkSet: 'telecoms'
  },

  // ── NON-PROFIT / SOCIAL SECTOR ───────────────────────────────────────
  international_ngo: {
    id: 'international_ngo', label: 'International NGO', sector: 'ngo', icon: '🌍',
    primaryMetric: 'annualBudget', leakageFraming: 'mission_efficiency',
    roiLabel: 'Mission Impact Recovery', closingMetric: 'additionalBeneficiaries',
    advisorTone: 'mission_accountability', benchmarkSet: 'ngo_international',
    ngoSubtype: 'international'
  },
  local_ngo: {
    id: 'local_ngo', label: 'Local / Community NGO', sector: 'ngo', icon: '🏘️',
    primaryMetric: 'annualBudget', leakageFraming: 'mission_efficiency',
    roiLabel: 'Mission Impact Recovery', closingMetric: 'additionalBeneficiaries',
    advisorTone: 'mission_accountability', benchmarkSet: 'ngo_local',
    ngoSubtype: 'local'
  },
  foundation: {
    id: 'foundation', label: 'Foundation / Endowment', sector: 'ngo', icon: '🏛️',
    primaryMetric: 'annualBudget', leakageFraming: 'mission_efficiency',
    roiLabel: 'Mission Impact Recovery', closingMetric: 'additionalBeneficiaries',
    advisorTone: 'mission_accountability', benchmarkSet: 'ngo_foundation',
    ngoSubtype: 'foundation'
  },
  faith_based: {
    id: 'faith_based', label: 'Faith-based Organization', sector: 'ngo', icon: '⛪',
    primaryMetric: 'annualBudget', leakageFraming: 'mission_efficiency',
    roiLabel: 'Mission Impact Recovery', closingMetric: 'additionalBeneficiaries',
    advisorTone: 'mission_accountability', benchmarkSet: 'ngo_faith',
    ngoSubtype: 'faith'
  },
  humanitarian: {
    id: 'humanitarian', label: 'Humanitarian / Relief', sector: 'ngo', icon: '🆘',
    primaryMetric: 'annualBudget', leakageFraming: 'mission_efficiency',
    roiLabel: 'Mission Impact Recovery', closingMetric: 'additionalBeneficiaries',
    advisorTone: 'mission_accountability', benchmarkSet: 'ngo_humanitarian',
    ngoSubtype: 'humanitarian'
  },
  development: {
    id: 'development', label: 'Development Organization', sector: 'ngo', icon: '📈',
    primaryMetric: 'annualBudget', leakageFraming: 'mission_efficiency',
    roiLabel: 'Mission Impact Recovery', closingMetric: 'additionalBeneficiaries',
    advisorTone: 'mission_accountability', benchmarkSet: 'ngo_development',
    ngoSubtype: 'development'
  },
  social_enterprise: {
    id: 'social_enterprise', label: 'Social Enterprise', sector: 'ngo', icon: '🤝',
    primaryMetric: 'annualBudget', leakageFraming: 'mission_efficiency',
    roiLabel: 'Mission Impact Recovery', closingMetric: 'additionalBeneficiaries',
    advisorTone: 'mission_accountability', benchmarkSet: 'social_enterprise',
    ngoSubtype: 'social_enterprise'
  },
  public_sector: {
    id: 'public_sector', label: 'Public Sector / Government Agency', sector: 'ngo', icon: '🏛️',
    primaryMetric: 'annualBudget', leakageFraming: 'mission_efficiency',
    roiLabel: 'Mission Impact Recovery', closingMetric: 'additionalBeneficiaries',
    advisorTone: 'mission_accountability', benchmarkSet: 'public_sector',
    ngoSubtype: 'public'
  },
}

export const isNGO = (orgTypeId) => ORG_TYPES[orgTypeId]?.sector === 'ngo'
export const isCommercial = (orgTypeId) => ORG_TYPES[orgTypeId]?.sector === 'commercial'

export const COMMERCIAL_TYPES = Object.values(ORG_TYPES).filter(t => t.sector === 'commercial')
export const NGO_TYPES = Object.values(ORG_TYPES).filter(t => t.sector === 'ngo')
