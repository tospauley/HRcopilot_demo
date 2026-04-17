/**
 * MaturityScorer.js
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 1 — Data Layer
 * Org types supported: both
 * Dependencies: data/orgTypeProfiles.js
 * Demo IDs: none
 * Integration: useLeakageState, MaturityScoreCard
 */

import { isNGO } from '../data/orgTypeProfiles.js'

export class MaturityScorer {
  calculate(profile, inputs, results) {
    const isNGOOrg = isNGO(profile.orgType)
    const scores = {}

    // People Systems (0–100)
    scores.peopleSystem = this.#score([
      profile.techMaturity !== 'manual' ? 30 : 0,
      (inputs.minutesLostPerDay || 15) <= 10 ? 20 : (inputs.minutesLostPerDay || 15) <= 20 ? 10 : 0,
      results?.sections?.workforce?.total && profile.annualPayroll
        ? (results.sections.workforce.total / profile.annualPayroll) < 0.05 ? 20 : 10
        : 10,
      profile.techMaturity === 'automated' ? 30 : profile.techMaturity === 'integrated' ? 15 : 0,
    ])

    // Financial Controls (0–100)
    scores.financialControls = this.#score([
      profile.techMaturity !== 'manual' ? 25 : 0,
      !inputs.multipleJurisdictions ? 20 : 10,
      !inputs.recentComplianceFinding ? 30 : 0,
      (inputs.avgDaysToClose || 10) <= 5 ? 25 : (inputs.avgDaysToClose || 10) <= 10 ? 15 : 0,
    ])

    // Revenue / Programme Operations (0–100)
    if (isNGOOrg) {
      scores.programmeDelivery = this.#score([
        (profile.programmeEfficiencyRatio || 0) >= 0.80 ? 40 : 20,
        (inputs.grantReportsPerYear || 0) <= 4 ? 20 : 10,
        profile.techMaturity !== 'manual' ? 40 : 0,
      ])
    } else {
      scores.revenueOperations = this.#score([
        inputs.monthlyLeadVolume ? 20 : 0,
        profile.techMaturity !== 'manual' ? 30 : 0,
        (inputs.monthlyChurnRate || 0.05) < 0.03 ? 30 : 15,
        inputs.salesTeamSize ? 20 : 0,
      ])
    }

    // Compliance Posture (0–100)
    const complianceRiskScore = this.#complianceRiskScore(inputs)
    scores.compliancePosture = Math.max(0, Math.min(100, (10 - complianceRiskScore) * 10))

    // Document Control (0–100)
    scores.documentControl = this.#score([
      profile.techMaturity !== 'manual' ? 40 : 0,
      (inputs.knowledgeWorkerCount || 0) > 0 ? 20 : 0,
      profile.techMaturity === 'automated' ? 40 : 20,
    ])

    const domainValues = Object.values(scores)
    const overall = Math.round(domainValues.reduce((sum, s) => sum + s, 0) / domainValues.length)

    return {
      overall,
      grade: overall >= 80 ? 'A' : overall >= 65 ? 'B' : overall >= 50 ? 'C' : overall >= 35 ? 'D' : 'F',
      percentile: this.#toPercentile(overall),
      domains: scores,
      gradeLabel: this.#gradeLabel(overall),
      gradeColor: this.#gradeColor(overall),
    }
  }

  #score(points) { return Math.min(100, points.reduce((s, p) => s + p, 0)) }

  #toPercentile(score) { return Math.round(score * 0.85) }

  #complianceRiskScore(inputs) {
    return [
      inputs.multipleJurisdictions,
      inputs.multiCurrency,
      inputs.industryRegulations,
      inputs.dataPrivacyObligations,
      inputs.recentComplianceFinding,
    ].filter(Boolean).length * 2
  }

  #gradeLabel(score) {
    if (score >= 80) return 'Excellent'
    if (score >= 65) return 'Good'
    if (score >= 50) return 'Average'
    if (score >= 35) return 'Below Average'
    return 'Critical'
  }

  #gradeColor(score) {
    if (score >= 80) return '#10b981'  // emerald
    if (score >= 65) return '#0047cc'  // blue
    if (score >= 50) return '#f59e0b'  // amber
    if (score >= 35) return '#f97316'  // orange
    return '#ef4444'                   // red
  }
}
