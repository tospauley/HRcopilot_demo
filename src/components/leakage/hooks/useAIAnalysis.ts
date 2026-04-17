/**
 * useAIAnalysis.js
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 2 — State & Computation
 * Org types supported: both
 * Dependencies: engine/AIAnalysisEngine.js
 * Demo IDs: advisor-panel
 * Integration: AIInsightPanel
 */

import { useCallback, useRef } from 'react'
import { AIAnalysisEngine } from '../engine/AIAnalysisEngine.js'

// Simple hash for cache keying
const hashKey = (inputs, tier, orgType) => {
  const str = JSON.stringify({ inputs, tier, orgType })
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return String(hash)
}

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export function useAIAnalysis(groqApiKey, profile, role, setAIAnalysis) {
  const cacheRef = useRef({})

  const runAnalysis = useCallback(async (results, inputs, tier) => {
    if (!results || results.totalLeakage === 0) return

    const cacheKey = hashKey(inputs, tier, profile?.orgType)
    const cached = cacheRef.current[cacheKey]
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      setAIAnalysis({ ...cached.data, isLoading: false })
      return
    }

    setAIAnalysis({ isLoading: true })

    const engine = new AIAnalysisEngine(groqApiKey, profile, role)
    const analyses = await engine.runAllAnalyses(results)

    const payload = {
      ...analyses,
      isLoading: false,
      lastUpdated: new Date().toISOString(),
    }

    cacheRef.current[cacheKey] = { data: payload, timestamp: Date.now() }
    setAIAnalysis(payload)
  }, [groqApiKey, profile, role, setAIAnalysis])

  const runSingle = useCallback(async (type, results) => {
    if (!results || results.totalLeakage === 0) return null
    const engine = new AIAnalysisEngine(groqApiKey, profile, role)
    switch (type) {
      case 'descriptive': return engine.generateDescriptive(results)
      case 'diagnostic': return engine.generateDiagnostic(results)
      case 'predictive': return engine.generatePredictive(results)
      case 'prescriptive': return engine.generatePrescriptive(results)
      default: return null
    }
  }, [groqApiKey, profile, role])

  return { runAnalysis, runSingle }
}
