import React, { createContext, useContext } from 'react';
import type { CurrencyCode } from '../../types';

const SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  NGN: '₦',
};

interface CurrencyContextValue {
  currency: CurrencyCode;
  symbol: string;
  /** Format a number with the active currency symbol */
  fmt: (value: number, opts?: { decimals?: number; compact?: boolean }) => string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'NGN',
  symbol: '₦',
  fmt: (v) => `₦${v.toLocaleString()}`,
});

export const CurrencyProvider: React.FC<{
  currency: CurrencyCode;
  children: React.ReactNode;
}> = ({ currency, children }) => {
  const symbol = SYMBOLS[currency];

  const fmt = (value: number, opts?: { decimals?: number; compact?: boolean }) => {
    if (opts?.compact) {
      if (Math.abs(value) >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(opts.decimals ?? 1)}M`;
      if (Math.abs(value) >= 1_000) return `${symbol}${(value / 1_000).toFixed(opts.decimals ?? 0)}K`;
    }
    return `${symbol}${value.toLocaleString(undefined, {
      minimumFractionDigits: opts?.decimals ?? 0,
      maximumFractionDigits: opts?.decimals ?? 0,
    })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, symbol, fmt }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
