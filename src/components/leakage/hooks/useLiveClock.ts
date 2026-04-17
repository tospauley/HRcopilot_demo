/**
 * useLiveClock.js
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 2 — State & Computation
 * Org types supported: both
 * Dependencies: none
 * Demo IDs: leakage-clock
 * Integration: LeakageClock component
 */

import { useState, useEffect, useRef, useCallback } from 'react'

export function useLiveClock(perSecondLeakage, active) {
  const [totalLost, setTotalLost] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const startRef = useRef(null)
  const rafRef = useRef(null)

  const start = useCallback(() => {
    startRef.current = Date.now()
  }, [])

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  const reset = useCallback(() => {
    stop()
    setTotalLost(0)
    setElapsedSeconds(0)
    startRef.current = null
  }, [stop])

  useEffect(() => {
    if (!active || !perSecondLeakage || perSecondLeakage <= 0) return

    if (!startRef.current) {
      startRef.current = Date.now()
    }

    const tick = () => {
      const elapsed = (Date.now() - startRef.current) / 1000
      setElapsedSeconds(elapsed)
      setTotalLost(elapsed * perSecondLeakage)
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [active, perSecondLeakage])

  return { totalLost, elapsedSeconds, start, stop, reset }
}
