// ============================================
// FILE: src/demo/components/ModuleWrapper.tsx
// PURPOSE: ErrorBoundary wrapper for every module.
//   Catches render errors in isolation — one broken module
//   never takes down the whole demo.
//   Shows a clean fallback with module name + retry button.
// ============================================

import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { motion } from 'framer-motion';

interface FallbackProps {
  error:              Error;
  resetErrorBoundary: () => void;
  moduleName:         string;
}

function ModuleFallback({ error, resetErrorBoundary, moduleName }: FallbackProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[40vh] px-6 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-3xl mb-4">
        ⚠️
      </div>
      <h2 className="text-base font-black text-white uppercase tracking-tight mb-1">
        {moduleName} unavailable
      </h2>
      <p className="text-white/40 text-sm mb-1 max-w-sm">
        This module encountered an error and has been isolated.
      </p>
      <p className="text-white/20 text-xs font-mono mb-6 max-w-sm break-all">
        {error.message}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-5 py-2.5 bg-[#0369a1]/20 hover:bg-[#0369a1]/30 border border-[#e0f2fe]0/30 rounded-xl text-white/70 hover:text-white text-xs font-black uppercase tracking-wider transition-all"
      >
        Retry Module
      </button>
    </motion.div>
  );
}

interface ModuleWrapperProps {
  name:     string;
  children: React.ReactNode;
}

export function ModuleWrapper({ name, children }: ModuleWrapperProps) {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ModuleFallback
          error={error}
          resetErrorBoundary={resetErrorBoundary}
          moduleName={name}
        />
      )}
      onError={(error) => {
        console.error(`[ModuleWrapper:${name}]`, error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

