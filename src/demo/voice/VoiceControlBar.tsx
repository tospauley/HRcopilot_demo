// ============================================
// FILE: src/demo/voice/VoiceControlBar.tsx
// PURPOSE: Floating mini voice control bar
// Shows active provider, speaking status, quick mute, open admin
// ============================================

import { motion, AnimatePresence } from 'framer-motion';
import { useNarratorStore } from './narratorStore';
import { stop, pauseAmbience, resumeAmbience, stopAmbience } from './narrationEngine';
import { useDemoOrchestrator } from '../orchestrator/demoOrchestrator';

const PROVIDER_ICONS: Record<string, string> = {
  elevenlabs: '⚡',
  groq:       '🚀',
};

const PROVIDER_LABELS: Record<string, string> = {
  elevenlabs: 'ElevenLabs',
  groq:       'Groq TTS',
};

export function VoiceControlBar() {
  const store = useNarratorStore();
  const { status: demoStatus, pauseDemo, resumeDemo, resetDemo } = useDemoOrchestrator();

  // Pause: fade out ambience + pause narration + pause demo
  const handlePause = () => {
    stop();
    pauseAmbience();
    pauseDemo();
  };

  // Resume: resume ambience + resume demo (narration restarts via orchestrator)
  const handleResume = () => {
    resumeAmbience();
    resumeDemo();
  };

  // Stop: full teardown — narration, ambience, demo state
  const handleStop = () => {
    stop();
    stopAmbience();
    resetDemo();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-20 md:bottom-6 right-3 md:right-6 z-[9998] flex items-center gap-2"
    >
      {/* Speaking indicator pill */}
      <AnimatePresence>
        {store.status === 'speaking' && (
          <motion.div
            key="speaking-pill"
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 bg-black/80 backdrop-blur-xl rounded-full px-4 py-2 border border-white/10 shadow-xl"
          >
            {/* Waveform animation */}
            <div className="flex gap-0.5 items-center h-3">
              {[0, 1, 2, 3].map((i) => (
                <motion.span
                  key={i}
                  className="w-0.5 bg-[#0ea5e9] rounded-full"
                  animate={{ height: ['4px', '12px', '4px'] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest max-w-[160px] truncate">
              {store.currentWord || 'Speaking…'}
            </span>
            {/* Pause/Resume demo */}
            <button
              onClick={() => demoStatus === 'paused' ? handleResume() : handlePause()}
              title={demoStatus === 'paused' ? 'Resume demo' : 'Pause demo'}
              className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/30 transition-all text-[8px]"
            >
              {demoStatus === 'paused' ? '▶' : '⏸'}
            </button>
            {/* Stop narration + ambience + demo */}
            <button
              onClick={handleStop}
              title="Stop demo"
              className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-rose-500/60 transition-all text-[8px]"
            >
              ■
            </button>
          </motion.div>
        )}

        {store.status === 'loading' && (
          <motion.div
            key="loading-pill"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center gap-2 bg-black/80 backdrop-blur-xl rounded-full px-4 py-2 border border-white/10 shadow-xl"
          >
            <span className="w-3 h-3 border border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
              Loading model…
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main control button */}
      <button
        onClick={store.toggleAdminPanel}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full border shadow-xl transition-all duration-200 ${
          store.adminPanelOpen
            ? 'bg-[#0369a1] border-[#e0f2fe]0 text-white shadow-[#e0f2fe]0/30'
            : 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-slate-200 dark:border-white/10 text-slate-700 dark:text-white hover:border-[#0ea5e9] hover:shadow-[#e0f2fe]0/10'
        }`}
      >
        <span className="text-base">{PROVIDER_ICONS[store.provider]}</span>
        <div className="text-left">
          <p className="text-[10px] font-black uppercase tracking-widest leading-none">
            {PROVIDER_LABELS[store.provider]}
          </p>
          <p className="text-[8px] font-medium opacity-60 uppercase tracking-widest mt-0.5">
            {store.muted ? 'Muted' : 'Narrator'}
          </p>
        </div>
        {/* Mute indicator */}
        {store.muted && (
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
        )}
        {/* Settings icon */}
        <svg className="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
            d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.894.15c.542.09.94.56.94 1.109v1.094c0 .55-.398 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527a1.125 1.125 0 01-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.124 1.124 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </motion.div>
  );
}

