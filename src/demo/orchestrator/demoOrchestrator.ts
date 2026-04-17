// ============================================
// FILE: src/demo/orchestrator/demoOrchestrator.ts
// PURPOSE: Zustand store + step controller for the guided demo.
//   Manages current step, mode, history, pause/resume, and reset.
//   Consumed by ProgressIndicator, SandboxToggle, and guided flow runner.
// ============================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DemoMode } from '../onboarding/onboardingStore';

// ── Types ─────────────────────────────────────────────────────────────────────

export type DemoStatus = 'idle' | 'running' | 'paused' | 'complete';

export interface DemoStep {
  id:           string;
  label:        string;
  module:       string;       // route segment e.g. 'attendance'
  narrationKey: string;       // key into ALL_SCRIPTS
  durationMs:   number;       // auto-advance after this ms (0 = manual)
  joyrideTarget?: string;     // CSS selector for spotlight
  uiAction?:    string;       // optional action to fire on step start e.g. 'open:ai-advisor'
}

interface OrchestratorState {
  // Runtime
  status:       DemoStatus;
  mode:         DemoMode;
  stepIndex:    number;       // index into current flow's steps array
  stepHistory:  string[];     // ids of completed steps
  autoAdvance:  boolean;      // whether timer auto-advances steps

  // Actions
  setMode:        (m: DemoMode)    => void;
  setStatus:      (s: DemoStatus)  => void;
  startDemo:      ()               => void;
  pauseDemo:      ()               => void;
  resumeDemo:     ()               => void;
  nextStep:       ()               => void;
  prevStep:       ()               => void;
  jumpTo:         (index: number)  => void;
  completeStep:   (id: string)     => void;
  resetDemo:      ()               => void;
  setAutoAdvance: (v: boolean)     => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useDemoOrchestrator = create<OrchestratorState>()(
  persist(
    (set, get) => ({
      status:      'idle',
      mode:        'guided',
      stepIndex:   0,
      stepHistory: [],
      autoAdvance: true,

      setMode:   (mode)   => set({ mode }),
      setStatus: (status) => set({ status }),

      startDemo: () => set({ status: 'running', stepIndex: 0, stepHistory: [] }),

      pauseDemo:  () => set({ status: 'paused' }),
      resumeDemo: () => set({ status: 'running' }),

      nextStep: () => {
        const { stepIndex } = get();
        set({ stepIndex: stepIndex + 1 });
      },

      prevStep: () => {
        const { stepIndex } = get();
        set({ stepIndex: Math.max(0, stepIndex - 1) });
      },

      jumpTo: (index) => set({ stepIndex: index }),

      completeStep: (id) => {
        const { stepHistory } = get();
        if (!stepHistory.includes(id)) {
          set({ stepHistory: [...stepHistory, id] });
        }
      },

      resetDemo: () => set({
        status:      'idle',
        stepIndex:   0,
        stepHistory: [],
        // mode is intentionally NOT reset — preserve the user's selection
      }),

      setAutoAdvance: (autoAdvance) => set({ autoAdvance }),
    }),
    {
      name:    'HRcopilot_demo_orchestrator',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        mode:        s.mode,
        stepIndex:   s.stepIndex,
        stepHistory: s.stepHistory,
        autoAdvance: s.autoAdvance,
      }),
    },
  ),
);

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns true if a step id has been completed */
export function isStepComplete(id: string): boolean {
  return useDemoOrchestrator.getState().stepHistory.includes(id);
}

/** Returns the current step from a given flow */
export function getCurrentStep(steps: DemoStep[]): DemoStep | null {
  const { stepIndex } = useDemoOrchestrator.getState();
  return steps[stepIndex] ?? null;
}
