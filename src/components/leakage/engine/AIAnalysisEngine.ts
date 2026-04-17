/**
 * AIAnalysisEngine.js
 * HRcopilot Organizational Intelligence Widget
 */

import { isNGO } from '../data/orgTypeProfiles.js'
import { FALLBACK_RATES } from '../data/exchangeRates.js'

const GROQ_MODEL = 'llama-3.3-70b-versatile'

export class AIAnalysisEngine {
  constructor(groqApiKey, orgProfile, role) {
    this.apiKey = groqApiKey || import.meta.env.VITE_GROQ_API_KEY || ''
    this.profile = orgProfile
    this.role = role
    this.isNGOOrg = isNGO(orgProfile?.orgType)

    // Currency conversion — all calculator values are USD internally.
    // We convert to local currency before sending to AI so the model
    // writes amounts the client actually recognises.
    this.currency = orgProfile?.currency || 'USD'
    this.exchangeRate = orgProfile?.exchangeRate
      || FALLBACK_RATES[this.currency]
      || 1
  }

  // Convert a USD amount to local currency and format it as a plain number string
  // e.g. 9493 USD → "15,000,000 NGN" (at rate 1580)
  _toLocal(usdAmount) {
    if (!usdAmount || usdAmount === 0) return `0 ${this.currency}`
    const local = Math.round(usdAmount * this.exchangeRate)
    return `${local.toLocaleString('en-US')} ${this.currency}`
  }

  // Convert all section totals to local currency for the AI prompt
  _localSections(sections) {
    return Object.fromEntries(
      Object.entries(sections || {}).map(([k, v]) => [
        k,
        { total: Math.round((v?.total || 0) * this.exchangeRate) }
      ])
    )
  }

  _buildSystemPrompt() {
    const roleLabel = this.role || 'Executive'
    const orgLabel = this.profile?.orgTypeLabel || 'organization'
    const frame = this.isNGOOrg
      ? 'Frame all insights around mission efficiency, donor accountability, and beneficiary impact. Never use profit language.'
      : 'Frame all insights around financial performance, operational efficiency, and competitive advantage.'
    return `You are an expert organizational intelligence advisor for HRcopilot. You are speaking directly to a ${roleLabel} at a ${orgLabel}.\n${frame}\nAll monetary amounts in the data are in ${this.currency}. Always use ${this.currency} amounts and the ${this.currency} currency code when mentioning figures — never use USD or $ unless the currency is USD.\nReturn ONLY valid JSON matching the schema provided. No preamble, no markdown, no explanation.\nBe specific. Use numbers from the data provided. Maximum 40 words per insight field.`
  }

  async generateDescriptive(results) {
    const localTotal = this._toLocal(results.totalLeakage)
    const localSections = this._localSections(results.sections)
    const prompt = `Leakage data (all amounts in ${this.currency}): ${JSON.stringify({
      sections: localSections,
      totalLeakage: localTotal,
    })}\nGenerate a descriptive analysis. Return JSON: {"headline":"string (max 10 words)","insight":"string (max 40 words, use specific ${this.currency} amounts)","topCategory":"string","topAmount":0,"trend":"increasing|stable|decreasing","urgency":"low|medium|high|critical"}`
    return this._callGroq(prompt)
  }

  async generateDiagnostic(results) {
    const localSections = this._localSections(results.sections)
    const prompt = `Leakage data (all amounts in ${this.currency}): ${JSON.stringify({ sections: localSections })}\nOrg: ${JSON.stringify({ orgType: this.profile?.orgType, headcount: this.profile?.headcount, techMaturity: this.profile?.techMaturity, sector: this.profile?.sector })}\nDiagnose WHY leakage is occurring. Return JSON: {"headline":"string","insight":"string (max 40 words)","rootCause":"string (max 30 words)","systemicPattern":"string (max 30 words)","severity":"low|medium|high|critical"}`
    return this._callGroq(prompt)
  }

  async generatePredictive(results) {
    const localTotal    = this._toLocal(results.totalLeakage)
    const localThreeYr  = this._toLocal(results.threeYearGain)
    const prompt = `Leakage data (all amounts in ${this.currency}): ${JSON.stringify({
      totalLeakage: localTotal,
      threeYearGain: localThreeYr,
    })}\nOrg: ${JSON.stringify({ orgType: this.profile?.orgType, headcount: this.profile?.headcount, techMaturity: this.profile?.techMaturity })}\nPredict 3-year impact if nothing changes. Return JSON: {"headline":"string","insight":"string (max 40 words, use ${this.currency} amounts)","threeYearExposure":${Math.round((results.totalLeakage || 0) * 3 * this.exchangeRate)},"highestRiskCategory":"string","confidence":"string e.g. 78%","triggerEvent":"string (max 20 words)"}`
    return this._callGroq(prompt)
  }

  async generatePrescriptive(results) {
    const moduleMap = this.isNGOOrg
      ? { workforce: 'HR & Attendance', programme: 'Programme Management', finance: 'Accounting', document: 'Virtual Cabinet', compliance: 'Role Management' }
      : { workforce: 'HR & Attendance', revenue: 'CRM & Sales', procurement: 'Procurement', finance: 'Accounting & Finance', document: 'Virtual Cabinet', performance: 'Performance Module' }

    const localSections  = this._localSections(results.sections)
    const localRecovery  = this._toLocal(results.recoveryEstimate)

    const prompt = `Leakage data (all amounts in ${this.currency}): ${JSON.stringify({
      sections: localSections,
      recoveryEstimate: localRecovery,
    })}\nModules: ${JSON.stringify(moduleMap)}\nTech maturity: ${this.profile?.techMaturity}\nPrescribe highest-ROI interventions. Return JSON: {"headline":"string","insight":"string (max 40 words, use ${this.currency} amounts)","firstIntervention":{"module":"string","expectedRecovery":${Math.round((results.recoveryEstimate || 0) * 0.4 * this.exchangeRate)},"timeToValue":"string"},"secondIntervention":{"module":"string","expectedRecovery":${Math.round((results.recoveryEstimate || 0) * 0.25 * this.exchangeRate)},"timeToValue":"string"},"totalRecoveryYear1":${Math.round((results.recoveryEstimate || 0) * this.exchangeRate)}}`
    return this._callGroq(prompt)
  }

  async runAllAnalyses(results) {
    const [d, diag, pred, presc] = await Promise.allSettled([
      this.generateDescriptive(results),
      this.generateDiagnostic(results),
      this.generatePredictive(results),
      this.generatePrescriptive(results),
    ])
    return {
      descriptive:  d.status     === 'fulfilled' ? d.value     : this._fallback('descriptive'),
      diagnostic:   diag.status  === 'fulfilled' ? diag.value  : this._fallback('diagnostic'),
      predictive:   pred.status  === 'fulfilled' ? pred.value  : this._fallback('predictive'),
      prescriptive: presc.status === 'fulfilled' ? presc.value : this._fallback('prescriptive'),
    }
  }

  async _callGroq(userPrompt) {
    const key = this.apiKey
    if (!key || key.length < 10) {
      console.warn('[AIAnalysisEngine] No API key found')
      return this._fallback()
    }
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: GROQ_MODEL,
          max_tokens: 400,
          temperature: 0.3,
          messages: [
            { role: 'system', content: this._buildSystemPrompt() },
            { role: 'user',   content: userPrompt },
          ],
        }),
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) {
        const err = await res.text().catch(() => '')
        console.error(`[AIAnalysisEngine] HTTP ${res.status}:`, err)
        return this._fallback()
      }
      const data = await res.json()
      const text = data.choices?.[0]?.message?.content || ''
      const cleaned = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim()
      const match = cleaned.match(/\{[\s\S]*\}/)
      if (!match) {
        console.warn('[AIAnalysisEngine] No JSON in response:', cleaned.slice(0, 200))
        return this._fallback()
      }
      return JSON.parse(match[0])
    } catch (err) {
      console.error('[AIAnalysisEngine] Call failed:', err?.message || err)
      return this._fallback()
    }
  }

  _fallback(type) {
    const map = {
      descriptive:  { headline: 'Leakage analysis complete', insight: 'AI analysis unavailable. Your leakage figures are calculated from your inputs.', topCategory: 'workforce', topAmount: 0, trend: 'stable', urgency: 'medium' },
      diagnostic:   { headline: 'Root cause analysis unavailable', insight: 'Review the leakage breakdown for manual analysis.', rootCause: 'Manual processes and lack of integrated systems', systemicPattern: 'Workforce and finance leakage share the same root cause', severity: 'medium' },
      predictive:   { headline: 'Predictive analysis unavailable', insight: 'Based on current leakage, exposure compounds annually.', threeYearExposure: 0, highestRiskCategory: 'workforce', confidence: '-', triggerEvent: 'Continued manual operations without digital controls' },
      prescriptive: { headline: 'Intervention plan unavailable', insight: 'HRcopilot modules address each leakage category directly.', firstIntervention: { module: 'HR & Attendance', expectedRecovery: 0, timeToValue: '30-60 days' }, secondIntervention: { module: 'Accounting & Finance', expectedRecovery: 0, timeToValue: '60-90 days' }, totalRecoveryYear1: 0 },
    }
    return map[type] || map.descriptive
  }
}
