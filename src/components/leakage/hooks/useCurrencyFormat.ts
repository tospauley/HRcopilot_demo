/**
 * useCurrencyFormat.js
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 2 — State & Computation
 * Org types supported: both
 * Dependencies: engine/CurrencyEngine.js
 * Demo IDs: none
 * Integration: all display components
 */

import { useState, useEffect, useCallback } from 'react'
import { initCurrencyEngine, getCurrencyEngine } from '../engine/CurrencyEngine.js'

export function useCurrencyFormat(currency, locale) {
  const [engine, setEngine] = useState(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    initCurrencyEngine().then((e) => {
      setEngine(e)
      setIsReady(true)
    })
  }, [])

  const format = useCallback((usdAmount) => {
    if (!engine) {
      // Engine not ready yet — show raw number with currency code
      const c = currency || 'USD'
      return `${c} ${(usdAmount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
    }
    return engine.format(usdAmount, currency, locale)
  }, [engine, currency, locale])

  const formatPerSecond = useCallback((annualUSD) => {
    if (!engine) return '$0/s'
    return engine.formatPerSecond(annualUSD, currency, locale)
  }, [engine, currency, locale])

  const convert = useCallback((usdAmount) => {
    if (!engine) return usdAmount
    return engine.convert(usdAmount, currency)
  }, [engine, currency])

  return { format, formatPerSecond, convert, isReady }
}
