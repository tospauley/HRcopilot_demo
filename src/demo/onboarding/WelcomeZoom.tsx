// ============================================
// FILE: src/demo/onboarding/WelcomeZoom.tsx
// PURPOSE: Premium light welcome screen.
//   Clean white/light background, subtle blue accents,
//   smooth entrance animations, enterprise aesthetic.
// ============================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { speak, primeAudioContext } from '../voice/narrationEngine';

interface Props { onDone: () => void; }

const WELCOME_TEXT =
  "Welcome to HRcopilot Explorer. I'm your AI guide. Let me show you what's possible when people, finance, and operations work as one.";

export function WelcomeZoom({ onDone }: Props) {
  const [show, setShow] = useState(false);
  const advancedRef = useRef(false);

  const advance = useCallback(() => {
    if (advancedRef.current) return;
    advancedRef.current = true;
    onDone();
  }, [onDone]);

  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), 400);
    const t2 = setTimeout(() => {
      primeAudioContext();
      speak(WELCOME_TEXT, {
        scriptId: 'onboarding.welcome',
        onDone: () => setTimeout(advance, 600),
      }).catch(() => {});
    }, 800);
    const t3 = setTimeout(advance, 12_000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [advance]);

  return (
    <div className="fixed inset-0 overflow-hidden flex items-center justify-center bg-white">

      {/* Expanding reveal overlay */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 0.04, borderRadius: '50%', opacity: 0 }}
        animate={{ scale: 1, borderRadius: '0%', opacity: 1 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        style={{ background: 'linear-gradient(160deg, #f8faff 0%, #eef4ff 50%, #f0f9ff 100%)' }}
      />

      {/* Subtle blue orb — top left */}
      <motion.div
        className="absolute w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full pointer-events-none -top-16 -left-16 md:-top-32 md:-left-32"
        style={{ background: 'radial-gradient(circle, rgba(0,71,204,0.06) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Subtle blue orb — bottom right */}
      <motion.div
        className="absolute w-[250px] h-[250px] md:w-[500px] md:h-[500px] rounded-full pointer-events-none -bottom-12 -right-12 md:-bottom-24 md:-right-24"
        style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Fine grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,71,204,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,71,204,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Scan line */}
      <motion.div
        className="absolute left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,71,204,0.15), transparent)' }}
        animate={{ top: ['0%', '100%'], opacity: [0, 1, 0] }}
        transition={{ duration: 4, delay: 1.2, repeat: Infinity, repeatDelay: 6, ease: 'linear' }}
      />

      {/* Main content */}
      <motion.div
        className="relative z-10 text-center px-6 flex flex-col items-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: show ? 1 : 0, y: show ? 0 : 24 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo mark */}
        <motion.div
          className="mb-8 relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: show ? 1 : 0.8, opacity: show ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Outer ring */}
          <div className="relative w-20 h-20 mx-auto">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: '1.5px solid rgba(0,71,204,0.15)' }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.2, 0.6] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute inset-[6px] rounded-full"
              style={{ border: '1.5px solid rgba(0,71,204,0.25)' }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.8, 0.3, 0.8] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            />
            {/* Center */}
            <div
              className="absolute inset-[14px] rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0047cc, #0ea5e9)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Wordmark */}
        <motion.h1
          className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-2"
          style={{ color: '#0a1628' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: show ? 1 : 0, y: show ? 0 : 12 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          HR<span style={{ color: '#0047cc' }}>copilot</span>
        </motion.h1>

        <motion.p
          className="font-black uppercase tracking-[0.4em] mb-4"
          style={{ color: 'rgba(0,71,204,0.5)', fontSize: '10px' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: show ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          Enterprise · Explorer
        </motion.p>

        {/* Divider */}
        <motion.div
          className="mb-5"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: show ? 1 : 0, opacity: show ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '48px', height: '1.5px', background: 'linear-gradient(90deg, #0047cc, #0ea5e9)', borderRadius: '2px' }}
        />

        <motion.p
          className="text-sm max-w-xs leading-relaxed mb-10 font-medium"
          style={{ color: 'rgba(10,22,40,0.45)' }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: show ? 1 : 0, y: show ? 0 : 8 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          People · Finance · Operations · Intelligence
        </motion.p>

        {/* Loading dots */}
        <motion.div
          className="flex justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: show ? 1 : 0 }}
          transition={{ delay: 0.65 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: '#0047cc' }}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Skip */}
      <motion.button
        onClick={onDone}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-8 right-8 text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
        style={{ color: 'rgba(0,71,204,0.3)' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(0,71,204,0.7)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(0,71,204,0.3)')}
      >
        Skip intro →
      </motion.button>
    </div>
  );
}
