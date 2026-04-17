// ============================================
// FILE: src/demo/voice/CinematicSubtitles.tsx
// PURPOSE: Cinematic glassmorphism subtitle overlay.
//   - Floats as a compact pill in the TOP-CENTER (never blocks buttons)
//   - Each word animates in with scale + glow as it's spoken
//   - Active word: violet glow + scale up
//   - Glassmorphism card: frosted blur + gradient border
//   - Fades out gracefully when idle
// ============================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subtitleEngine } from './subtitleEngine';
import { useNarratorStore } from './narratorStore';
import type { SubtitleLine } from './types';

export function CinematicSubtitles() {
  const { subtitlesEnabled, status } = useNarratorStore();

  const [currentLine, setCurrentLine] = useState<SubtitleLine | null>(null);
  const [wordIndex,   setWordIndex]   = useState(-1);
  const [visible,     setVisible]     = useState(false);

  useEffect(() => {
    subtitleEngine.onLine((line) => {
      setCurrentLine(line);
      setWordIndex(-1);
      setVisible(true);
    });
    subtitleEngine.onWord((_, idx) => setWordIndex(idx));
  }, []);

  // Fade out after idle
  useEffect(() => {
    if (status === 'idle') {
      const t = setTimeout(() => {
        setVisible(false);
        setCurrentLine(null);
        setWordIndex(-1);
      }, 1200);
      return () => clearTimeout(t);
    } else {
      setVisible(true);
    }
  }, [status]);

  if (!subtitlesEnabled) return null;

  return (
    // ── Positioned TOP-CENTER so it never overlaps buttons ──
    <div className="fixed top-6 left-0 right-0 z-[9999] pointer-events-none select-none flex justify-center px-4">
      <AnimatePresence mode="wait">
        {visible && currentLine && (
          <motion.div
            key={currentLine.id}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,   scale: 1    }}
            exit={{    opacity: 0, y: -12,  scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            // Glassmorphism card
            className="relative max-w-2xl w-full"
          >
            {/* Gradient border glow */}
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-[#e0f2fe]0/40 via-[#0ea5e9]/30 to-[#eff6ff]0/40 blur-[2px]" />

            {/* Frosted glass card — always dark so text is always visible */}
            <div className="relative rounded-2xl px-6 py-3.5 overflow-hidden"
              style={{
                background: 'rgba(2, 13, 26, 0.88)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(56,189,248,0.2)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
              }}>

              {/* Subtle inner shimmer */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-[#e0f2fe]0/5 rounded-2xl" />

              {/* Waveform indicator + words */}
              <div className="relative flex items-center gap-3">

                {/* Live waveform */}
                <div className="flex gap-[3px] items-center flex-shrink-0">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.span
                      key={i}
                      className="w-[3px] rounded-full bg-[#0ea5e9]"
                      animate={
                        status === 'speaking'
                          ? { height: ['4px', '14px', '4px'] }
                          : { height: '4px' }
                      }
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>

                {/* Word-by-word text */}
                <p className="text-sm md:text-base font-semibold leading-relaxed flex flex-wrap gap-x-[0.3em] gap-y-1">
                  {currentLine.words.map((word, idx) => {
                    const isActive = idx === wordIndex;
                    const isPast   = idx < wordIndex;
                    return (
                      <motion.span
                        key={idx}
                        initial={{ opacity: 0, y: 6, scale: 0.9 }}
                        animate={{
                          opacity:    isActive ? 1 : isPast ? 0.5 : 0.85,
                          y:          0,
                          scale:      isActive ? 1.08 : 1,
                          color:      isActive ? '#c4b5fd' : isPast ? '#94a3b8' : '#f1f5f9',
                          textShadow: isActive
                            ? '0 0 16px rgba(56,189,248,0.9), 0 0 32px rgba(14,165,233,0.4)'
                            : 'none',
                        }}
                        transition={{ duration: 0.12, ease: 'easeOut' }}
                        className="inline-block"
                      >
                        {word.text}
                      </motion.span>
                    );
                  })}
                </p>
              </div>

              {/* Progress bar at bottom of card */}
              <motion.div
                className="absolute bottom-0 left-0 h-[2px] rounded-full bg-gradient-to-r from-[#e0f2fe]0 via-[#0ea5e9] to-[#eff6ff]0"
                initial={{ width: '0%' }}
                animate={{ width: wordIndex >= 0
                  ? `${Math.round(((wordIndex + 1) / currentLine.words.length) * 100)}%`
                  : '0%'
                }}
                transition={{ duration: 0.15, ease: 'linear' }}
              />
            </div>
          </motion.div>
        )}

        {/* Loading state pill */}
        {status === 'loading' && !currentLine && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2.5 rounded-full px-5 py-2.5"
              style={{
                background: 'rgba(2, 13, 26, 0.88)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(56,189,248,0.2)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
          >
            <motion.span
              className="w-3 h-3 rounded-full border-2 border-[#0ea5e9] border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
            <span className="text-[11px] font-black text-white/60 uppercase tracking-[0.15em]">
              Loading voice…
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

