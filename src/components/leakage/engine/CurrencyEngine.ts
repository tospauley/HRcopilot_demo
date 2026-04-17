/**
 * CurrencyEngine.js
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 1 — Data Layer
 * Org types supported: both
 * Dependencies: data/exchangeRates.js
 * Demo IDs: none
 * Integration: useCurrencyFormat, LeakageClock, all display components
 */

import { FALLBACK_RATES } from '../data/exchangeRates.js'

export class CurrencyEngine {
  #rates = {}
  #locale = 'en-US'
  #currency = 'USD'
  #initialized = false

  async init() {
    try {
      const res = await fetch(
        'https://api.exchangerate-api.com/v4/latest/USD',
        { signal: AbortSignal.timeout(3000) }
      )
      const data = await res.json()
      this.#rates = data.rates
    } catch {
      // Fallback to embedded rates — never fail
      this.#rates = FALLBACK_RATES
    }
    this.#initialized = true
    return this
  }

  // Detect from browser locale
  autoDetect() {
    try {
      const locale = Intl.DateTimeFormat().resolvedOptions().locale || 'en-US'
      // Try to get currency from locale
      const testFormatter = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' })
      const currency = testFormatter.resolvedOptions().currency || 'USD'
      this.#locale = locale
      this.#currency = currency
      return { locale, currency }
    } catch {
      return { locale: 'en-US', currency: 'USD' }
    }
  }

  setLocale(locale) { this.#locale = locale }
  setCurrency(currency) { this.#currency = currency }
  getLocale() { return this.#locale }
  getCurrency() { return this.#currency }

  // Convert from USD to target
  convert(usdAmount, targetCurrency) {
    const rates = this.#initialized ? this.#rates : FALLBACK_RATES
    const rate = rates[targetCurrency] || 1
    return usdAmount * rate
  }

  // Format for display
  format(usdAmount, currency, locale) {
    const c = currency || this.#currency
    const l = locale || this.#locale
    const converted = this.convert(usdAmount, c)
    const absConverted = Math.abs(converted)
    const notation = absConverted >= 1000000 ? 'compact' : 'standard'
    try {
      return new Intl.NumberFormat(l, {
        style: 'currency',
        currency: c,
        notation,
        maximumFractionDigits: notation === 'compact' ? 1 : 0,
      }).format(converted)
    } catch {
      // Fallback for unsupported currency codes
      return `${c} ${converted.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
    }
  }

  // Per-second for live clock
  formatPerSecond(annualUSD, currency, locale) {
    const perSecond = annualUSD / (365 * 24 * 3600)
    return this.format(perSecond, currency, locale)
  }

  // Format a raw number without currency conversion (already in target currency)
  formatRaw(amount, currency, locale) {
    const c = currency || this.#currency
    const l = locale || this.#locale
    const absAmount = Math.abs(amount)
    const notation = absAmount >= 1000000 ? 'compact' : 'standard'
    try {
      return new Intl.NumberFormat(l, {
        style: 'currency',
        currency: c,
        notation,
        maximumFractionDigits: notation === 'compact' ? 1 : 0,
      }).format(amount)
    } catch {
      return `${c} ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
    }
  }

  // Get list of supported currencies for the selector
  getSupportedCurrencies() {
    const rates = this.#initialized ? this.#rates : FALLBACK_RATES
    return Object.keys(rates).sort()
  }

  isInitialized() { return this.#initialized }
}

// Singleton instance — shared across the widget
let _instance = null

export const getCurrencyEngine = () => {
  if (!_instance) {
    _instance = new CurrencyEngine()
  }
  return _instance
}

export const initCurrencyEngine = async () => {
  const engine = getCurrencyEngine()
  if (!engine.isInitialized()) {
    await engine.init()
    engine.autoDetect()
  }
  return engine
}
