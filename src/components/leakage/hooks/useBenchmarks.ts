/**
 * useBenchmarks.js
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 2 — State & Computation
 * Org types supported: both
 * Dependencies: engine/BenchmarkEngine.js
 * Demo IDs: none
 * Integration: BenchmarkOverlay, DomainCard
 */

import { useMemo } from 'react'
import { TIER_MULTIPLIERS } from '../data/benchmarks.js'

export function useBenchmarks(benchmarks, tier = 'average') {
  const tierData = useMemo(() => {
    return benchmarks?.tiers?.[tier] || TIER_MULTIPLIERS[tier] || TIER_MULTIPLIERS.average
  }, [benchmarks, tier])

  const peerComparisons = useMemo(() => {
    return benchmarks?.peerComparisons || {}
  }, [benchmarks])

  const getValue = useMemo(() => (metric) => {
    return tierData[metric] ?? TIER_MULTIPLIERS.average[metric] ?? 0
  }, [tierData])

  return { tierData, peerComparisons, getValue }
}
