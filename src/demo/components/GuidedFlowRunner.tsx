// ============================================
// FILE: src/demo/components/GuidedFlowRunner.tsx
// PURPOSE: Drives the guided demo automatically.
//   - Navigates to the correct module for each step
//   - Speaks role-aware narration via Quen
//   - Auto-advances after durationMs
//   - Shows a floating control bar (prev / pause / next / exit)
// ============================================

import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoOrchestrator } from '../orchestrator/demoOrchestrator';
import { useOnboardingStore } from '../onboarding/onboardingStore';
import { GUIDED_FLOW, resolveNarration } from '../orchestrator/guidedFlow';
import { speak, stop, primeAudioContext } from '../voice/narrationEngine';
import { ProgressIndicator } from './ProgressIndicator';

export function GuidedFlowRunner() {
  const {
    status, mode, stepIndex,
    nextStep, prevStep, pauseDemo, resumeDemo, resetDemo, completeStep,
  } = useDemoOrchestrator();
  const { role }  = useOnboardingStore();
  const navigate  = useNavigate();

  // ── Separate refs for speech-done timer vs safety fallback timer ──────────
  // Using two refs prevents the race condition where the safety timer fires
  // after onDone already scheduled an advance, causing a double-step skip.
  const speechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const renderDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef      = useRef<{ stepIndex: number; mode: string } | null>(null);
  // Track whether onDone has already fired so the safety timer can bail out
  const advancedRef    = useRef(false);

  const currentStep = GUIDED_FLOW[stepIndex];
  const isRunning   = status === 'running' && mode === 'guided';
  const isPaused    = status === 'paused'  && mode === 'guided';

  // ── Audio-suspended overlay state ─────────────────────────────────────────
  const [isAudioSuspended, setIsAudioSuspended] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      const ctxState = (window as any)._audioCtx?.state;
      setIsAudioSuspended(ctxState === 'suspended');
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const clearAllTimers = useCallback(() => {
    if (speechTimerRef.current) { clearTimeout(speechTimerRef.current); speechTimerRef.current = null; }
    if (safetyTimerRef.current) { clearTimeout(safetyTimerRef.current); safetyTimerRef.current = null; }
    if (renderDelayRef.current) { clearTimeout(renderDelayRef.current); renderDelayRef.current = null; }
  }, []);

  // ── Navigate + narrate when step changes ──────────────────────────────────
  useEffect(() => {
    if (!isRunning || !currentStep) return;

    // Prevent duplicate execution for same step
    if (
      activeRef.current?.stepIndex === stepIndex &&
      activeRef.current?.mode === mode
    ) return;
    activeRef.current = { stepIndex, mode };
    advancedRef.current = false;

    clearAllTimers();

    // Navigate to the module
    const target = currentStep.module ? `/app/${currentStep.module}` : '/app';
    navigate(target);

    // Close any modal that was opened by the previous step
    const prevStep = GUIDED_FLOW[stepIndex - 1];
    if (prevStep?.uiAction?.startsWith('open:')) {
      const closeAction = prevStep.uiAction.replace('open:', 'close:');
      // Small delay so React has flushed the previous render before closing
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('demo:uiAction', { detail: closeAction }));
      }, 50);
    }

    // Fire any UI action for this step (e.g. open a modal)
    if (currentStep.uiAction) {
      // Delay so the page has rendered and any previous modal has closed
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('demo:uiAction', { detail: currentStep.uiAction }));
      }, 400);
    }

    // Helper to advance — guarded so it can only fire once per step
    const advance = () => {
      if (advancedRef.current) return;
      advancedRef.current = true;
      clearAllTimers();
      const state = useDemoOrchestrator.getState();
      if (state.status !== 'running') return;
      if (stepIndex < GUIDED_FLOW.length - 1) {
        nextStep();
      } else {
        useDemoOrchestrator.getState().setStatus('complete');
      }
    };

    // Speak narration after a short delay to let the page render
    const text = resolveNarration(currentStep, role);
    if (text) {
      renderDelayRef.current = setTimeout(() => {
        renderDelayRef.current = null;
        primeAudioContext();
        speak(text, {
          scriptId: currentStep.narrationKey,
          onDone: () => {
            // Speech finished naturally — short pause then advance
            speechTimerRef.current = setTimeout(advance, 800);
          },
          onError: () => {
            // onDone is also called by the fallback chain, so this is just
            // for logging — the advance will happen via onDone
          },
        }).catch(() => {
          // speak() threw synchronously — safety timer handles advance
        });
      }, 400);
    } else {
      // No narration for this step — advance after durationMs
      safetyTimerRef.current = setTimeout(advance, currentStep.durationMs || 10_000);
      return () => { clearAllTimers(); };
    }

    // Mark step complete
    completeStep(currentStep.id);

    // ── SAFETY FALLBACK TIMER ─────────────────────────────────────────────
    // Fires only if onDone never fires. Budget:
    //   durationMs  = intended display time
    //   + 15s extra = Kokoro generation time on slow device (WASM ~3-8s)
    //                 + full narration playback time (longest script ~12s)
    // This must be longer than generation + playback combined.
    const safetyMs = (currentStep.durationMs || 10_000) + 15_000;
    safetyTimerRef.current = setTimeout(() => {
      if (!advancedRef.current) {
        console.warn(`[GuidedFlow] Safety advance triggered for: ${currentStep.id}`);
        advance();
      }
    }, safetyMs);

    return () => {
      clearAllTimers();
      // Do NOT call stop() here — it rejects the pending Kokoro generation,
      // which triggers the fallback chain, which calls onDone, which calls
      // advance() on the NEW step — causing a double-advance cascade.
      // The stale-generation guard in narrationEngine handles cleanup safely.
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, isRunning, mode]);

  // ── Pause stops timers and audio ──────────────────────────────────────────
  useEffect(() => {
    if (isPaused) {
      clearAllTimers();
      stop();
    }
  }, [isPaused, clearAllTimers]);

  const handlePrev = useCallback(() => {
    primeAudioContext();
    clearAllTimers();
    activeRef.current = null;
    advancedRef.current = true;
    stop();
    // Close any open modal from the current step
    const cur = GUIDED_FLOW[useDemoOrchestrator.getState().stepIndex];
    if (cur?.uiAction?.startsWith('open:')) {
      window.dispatchEvent(new CustomEvent('demo:uiAction', { detail: cur.uiAction.replace('open:', 'close:') }));
    }
    prevStep();
  }, [prevStep, clearAllTimers]);

  const handleNext = useCallback(() => {
    primeAudioContext();
    clearAllTimers();
    activeRef.current = null;
    advancedRef.current = true;
    stop();
    // Close any open modal from the current step
    const cur = GUIDED_FLOW[useDemoOrchestrator.getState().stepIndex];
    if (cur?.uiAction?.startsWith('open:')) {
      window.dispatchEvent(new CustomEvent('demo:uiAction', { detail: cur.uiAction.replace('open:', 'close:') }));
    }
    nextStep();
  }, [nextStep, clearAllTimers]);

  const handlePause = useCallback(() => {
    primeAudioContext();
    if (isRunning) pauseDemo();
    else resumeDemo();
  }, [isRunning, pauseDemo, resumeDemo]);

  const handleExit = useCallback(() => {
    clearAllTimers();
    activeRef.current = null;
    advancedRef.current = true;
    stop();
    // Close any open modal
    const cur = GUIDED_FLOW[useDemoOrchestrator.getState().stepIndex];
    if (cur?.uiAction?.startsWith('open:')) {
      window.dispatchEvent(new CustomEvent('demo:uiAction', { detail: cur.uiAction.replace('open:', 'close:') }));
    }
    resetDemo();
    navigate('/app');
  }, [resetDemo, navigate, clearAllTimers]);

  // Only show in guided mode when running or paused
  if (mode !== 'guided' || (status !== 'running' && status !== 'paused')) return null;

  return (
    <AnimatePresence>
      {/* ── Audio suspended overlay — shown when browser blocks audio ──────── */}
      {isAudioSuspended && (
        <motion.div
          key="audio-resume-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9995] flex items-center justify-center pointer-events-auto"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={() => {
            primeAudioContext();
            setIsAudioSuspended(false);
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-4 px-8 py-6 rounded-2xl"
            style={{ background: 'rgba(13,8,28,0.95)', border: '1px solid rgba(167,139,250,0.3)' }}
          >
            <span className="text-4xl">🔇</span>
            <p className="text-white font-black text-sm uppercase tracking-widest">Click to Resume Audio</p>
            <p className="text-white/40 text-xs text-center max-w-[220px]">
              Your browser paused the audio context. Tap anywhere to continue.
            </p>
          </motion.div>
        </motion.div>
      )}

      <motion.div
        key="guided-control-bar"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9990] pointer-events-auto"
      >
        <div
          className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl"
          style={{
            background:     'rgba(13, 8, 28, 0.92)',
            backdropFilter: 'blur(20px)',
            border:         '1px solid rgba(167,139,250,0.25)',
            boxShadow:      '0 8px 40px rgba(0,0,0,0.4)',
          }}
        >
          {/* Step info */}
          <div className="flex items-center gap-2 pr-3 border-r border-white/10">
            <span className="text-lg">🎯</span>
            <div>
              <p className="text-[10px] font-black text-white uppercase tracking-wider leading-none">
                {currentStep?.label ?? 'Demo'}
              </p>
              <p className="text-[9px] text-white/40 mt-0.5">
                Step {stepIndex + 1} / {GUIDED_FLOW.length}
              </p>
            </div>
          </div>

          {/* Progress dots */}
          <div className="px-2">
            <ProgressIndicator compact />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 pl-3 border-l border-white/10">
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={handlePrev}
              disabled={stepIndex === 0}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
              title="Previous step"
            >◀</motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={handlePause}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-all text-sm"
              title={isRunning ? 'Pause' : 'Resume'}
            >{isRunning ? '⏸' : '▶'}</motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              disabled={stepIndex >= GUIDED_FLOW.length - 1}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
              title="Next step"
            >▶▶</motion.button>

            <div className="w-px h-5 bg-white/10 mx-1" />

            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={handleExit}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-all text-xs"
              title="Exit guided demo"
            >✕</motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
