// ============================================
// FILE: src/demo/components/SandboxToggle.tsx
// PURPOSE: Mode switcher pill — Guided / Sandbox / Flows.
//   Reads/writes demoOrchestrator + onboardingStore.
//   Compact variant for TopNav, full variant for modal.
// ============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoOrchestrator } from '../orchestrator/demoOrchestrator';
import { useOnboardingStore } from '../onboarding/onboardingStore';
import { STRATEGIC_FLOWS } from '../orchestrator/strategicFlows';
import type { DemoMode } from '../onboarding/onboardingStore';

interface Props {
  compact?: boolean; // true = icon+label pill for TopNav
}

const MODES: { id: DemoMode; label: string; icon: string; desc: string }[] = [
  { id: 'guided',  label: 'Guided',  icon: '🎯', desc: 'Quen walks you through every module' },
  { id: 'sandbox', label: 'Sandbox', icon: '🎮', desc: 'Explore freely — full access, reset anytime' },
  { id: 'flows',   label: 'Flows',   icon: '⚡', desc: 'Watch complete business processes' },
];

export function SandboxToggle({ compact = false }: Props) {
  const { mode: orchMode, setMode, startDemo, resetDemo, status } = useDemoOrchestrator();
  const { demoMode, setDemoMode }                                  = useOnboardingStore();
  const [open, setOpen]                                            = useState(false);
  const [flowOpen, setFlowOpen]                                    = useState(false);

  const activeMode = demoMode ?? orchMode;

  const handleSelect = (m: DemoMode) => {
    setDemoMode(m);
    setMode(m);
    setOpen(false);

    if (m === 'guided') {
      resetDemo();
      startDemo();
    } else if (m === 'flows') {
      setFlowOpen(true);
    }
    // sandbox — just let user explore freely
  };

  const activeMeta = MODES.find((m) => m.id === activeMode) ?? MODES[0];

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-white/70 hover:text-white"
        >
          <span className="text-sm">{activeMeta.icon}</span>
          <span className="text-[10px] font-black uppercase tracking-wider hidden sm:block">
            {activeMeta.label}
          </span>
          <span className="text-white/30 text-xs">▾</span>
        </button>

        <AnimatePresence>
          {open && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-64 bg-[#1a1530]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-2">
                  {MODES.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleSelect(m.id)}
                      className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                        activeMode === m.id
                          ? 'bg-[#0369a1]/20 border border-[#e0f2fe]0/30'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <span className="text-xl flex-shrink-0">{m.icon}</span>
                      <div>
                        <p className="text-[11px] font-black text-white uppercase tracking-tight">
                          {m.label}
                          {activeMode === m.id && (
                            <span className="ml-2 text-[#0ea5e9]">✓</span>
                          )}
                        </p>
                        <p className="text-[10px] text-white/40 mt-0.5 leading-relaxed">{m.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Status indicator */}
                {status === 'running' && (
                  <div className="px-4 py-2 border-t border-white/5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                      Demo running
                    </span>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Strategic flows picker */}
        <FlowPicker open={flowOpen} onClose={() => setFlowOpen(false)} />
      </div>
    );
  }

  // Full variant — 3 large cards
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Demo Mode</p>
      <div className="grid grid-cols-3 gap-3">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => handleSelect(m.id)}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
              activeMode === m.id
                ? 'bg-[#0369a1]/20 border-[#e0f2fe]0/40 text-white'
                : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="text-2xl">{m.icon}</span>
            <span className="text-[10px] font-black uppercase tracking-wider">{m.label}</span>
          </button>
        ))}
      </div>
      <FlowPicker open={flowOpen} onClose={() => setFlowOpen(false)} />
    </div>
  );
}

// ── Strategic flow picker modal ───────────────────────────────────────────────

function FlowPicker({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { setMode, startDemo, resetDemo } = useDemoOrchestrator();

  const handleFlow = () => {
    setMode('flows');
    resetDemo();
    startDemo();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-[#1a1530]/98 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl z-50 p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-black text-white uppercase tracking-tight">
                  Strategic Flows
                </h2>
                <p className="text-[10px] text-white/40 mt-0.5">
                  Watch a complete business process end-to-end
                </p>
              </div>
              <button onClick={onClose} className="text-white/30 hover:text-white text-xl">✕</button>
            </div>

            <div className="space-y-2">
              {STRATEGIC_FLOWS.map((flow) => (
                <button
                  key={flow.id}
                  onClick={handleFlow}
                  className="w-full flex items-center gap-4 px-4 py-3 bg-white/5 hover:bg-[#0369a1]/15 border border-white/10 hover:border-[#e0f2fe]0/30 rounded-xl text-left transition-all group"
                >
                  <span className="text-2xl flex-shrink-0">{flow.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-black text-white group-hover:text-[#38bdf8] transition-colors">
                      {flow.title}
                    </p>
                    <p className="text-[10px] text-white/40 truncate">{flow.description}</p>
                  </div>
                  <span className="text-[9px] font-black text-white/25 uppercase tracking-wider flex-shrink-0">
                    {flow.durationMin} min
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

