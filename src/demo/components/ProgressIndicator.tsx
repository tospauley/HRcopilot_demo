// ============================================
// FILE: src/demo/components/ProgressIndicator.tsx
// PURPOSE: Horizontal step-dot progress bar for the guided demo.
//   Shows completed / current / upcoming steps.
//   Clickable in sandbox mode. Collapses to a mini bar when compact.
// ============================================

import { motion } from 'framer-motion';
import { useDemoOrchestrator } from '../orchestrator/demoOrchestrator';
import { GUIDED_FLOW } from '../orchestrator/guidedFlow';

interface Props {
  compact?: boolean; // true = thin bar only (for TopNav)
}

export function ProgressIndicator({ compact = false }: Props) {
  const { stepIndex, stepHistory, status, mode, jumpTo } = useDemoOrchestrator();

  // Only show during guided mode
  if (mode !== 'guided' || status === 'idle') return null;

  const steps    = GUIDED_FLOW;
  const total    = steps.length;
  const progress = Math.round(((stepIndex) / (total - 1)) * 100);

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3">
        {/* Thin progress bar */}
        <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#e0f2fe]0 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest tabular-nums">
          {stepIndex + 1}/{total}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {steps.map((step, i) => {
        const isComplete = stepHistory.includes(step.id) || i < stepIndex;
        const isCurrent  = i === stepIndex;
        const canClick   = mode === 'sandbox' || isComplete;

        return (
          <button
            key={step.id}
            onClick={() => canClick && jumpTo(i)}
            disabled={!canClick}
            title={step.label}
            className={`relative transition-all duration-300 ${canClick ? 'cursor-pointer' : 'cursor-default'}`}
          >
            {isCurrent ? (
              // Current step — animated pulse dot
              <motion.div
                className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9] shadow-[0_0_8px_rgba(56,189,248,0.8)]"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            ) : isComplete ? (
              // Completed — filled dot
              <div className="w-2 h-2 rounded-full bg-[#0369a1]" />
            ) : (
              // Upcoming — empty dot
              <div className="w-2 h-2 rounded-full bg-white/15" />
            )}

            {/* Connector line between dots */}
            {i < steps.length - 1 && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 w-2 h-px bg-white/10" />
            )}
          </button>
        );
      })}

      {/* Step label */}
      <span className="ml-2 text-[9px] font-black text-white/30 uppercase tracking-widest hidden md:block">
        {steps[stepIndex]?.label}
      </span>
    </div>
  );
}

