// ============================================
// FILE: src/demo/onboarding/ModeSelection.tsx
// ============================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from './onboardingStore';
import { speak, primeAudioContext } from '../voice/narrationEngine';
import { useDemoOrchestrator } from '../orchestrator/demoOrchestrator';
import type { DemoMode } from './onboardingStore';

interface Props { onDone: () => void; onBack: () => void; }

const IconGlance = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-12m12-13.5v13.5M9 16.5v3.75m6-3.75v3.75M9 20.25h6" />
  </svg>
);
const IconSandbox = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
  </svg>
);
const IconFlows = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
  </svg>
);

const MODES = [
  { id: 'guided' as DemoMode,  Icon: IconGlance,  title: 'HRcopilot At A Glance', tagline: 'The full story in under 12 minutes', duration: '10–12 min', disabled: false,
    details: ['Every module — live, narrated, explained', 'Payroll slip, procurement & leakage ROI', 'Discover what your org is losing today', 'Ends with a personalised proposal'],
    narration: "HRcopilot At A Glance gives you the complete picture in under twelve minutes. I'll walk you through every module, show you a live payroll slip, reveal what your organisation is losing right now, and end with a personalised proposal." },
  { id: 'sandbox' as DemoMode, Icon: IconSandbox, title: 'Sandbox Mode',       tagline: 'Explore freely at your own pace',    duration: 'Unlimited', disabled: true,
    details: ['Full access to all 12 modules', 'Live data simulation', 'Try any feature instantly', 'Reset to seed data anytime'],
    narration: "Sandbox mode gives you full control. Add employees, run payroll, test the geofence — everything is live and you can reset any time." },
  { id: 'flows' as DemoMode,   Icon: IconFlows,   title: 'Strategic Flows',   tagline: 'Watch real business processes',       duration: '5–8 min',   disabled: true,
    details: ['Employee Lifecycle end-to-end', 'Month-End Close automation', 'Talent Acquisition pipeline', 'Compliance Audit walkthrough'],
    narration: "Strategic flows show you complete business processes from start to finish — onboarding an employee, closing the month, running a compliance audit." },
];

export function ModeSelection({ onDone, onBack }: Props) {
  const { setDemoMode, setStep } = useOnboardingStore();
  const { setMode, startDemo, resetDemo } = useDemoOrchestrator();
  const [selecting, setSelecting] = useState<DemoMode | null>(null);

  const handleSelect = async (mode: typeof MODES[0]) => {
    if (selecting || mode.disabled) return;
    setSelecting(mode.id);
    primeAudioContext();
    speak(mode.narration, { scriptId: `onboarding.mode.${mode.id}` }).catch(() => {});
    setDemoMode(mode.id);
    resetDemo();
    setMode(mode.id);
    startDemo();
    await new Promise((r) => setTimeout(r, 700));
    setStep('complete');
    onDone();
  };

  const handleBack = () => { setStep('role-selection'); onBack(); };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 md:py-16 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #f8faff 0%, #eef4ff 50%, #f0f9ff 100%)' }}>

      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(0,71,204,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,71,204,0.03) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

      {/* Blue orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,71,204,0.05) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 70%)' }} />

      {/* Header */}
      <motion.div className="text-center mb-14 relative z-10"
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-3" style={{ color: '#0047cc' }}>
          Choose your experience
        </p>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3" style={{ color: '#0a1628' }}>
          How would you like to <span style={{ color: '#0047cc' }}>explore?</span>
        </h1>
        <p className="text-sm max-w-sm mx-auto" style={{ color: 'rgba(10,22,40,0.45)' }}>
          You can switch modes any time inside the app
        </p>
      </motion.div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 w-full max-w-3xl relative z-10">
        {MODES.map((mode, i) => {
          const isSelecting = selecting === mode.id;
          return (
            <div key={mode.id} className="relative group">
              <motion.button
                onClick={() => handleSelect(mode)}
                disabled={!!selecting || mode.disabled}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                whileHover={!selecting && !mode.disabled ? { y: -3, boxShadow: '0 8px 32px rgba(0,71,204,0.12)' } : {}}
                whileTap={!selecting && !mode.disabled ? { scale: 0.98 } : {}}
                className={`w-full relative text-left rounded-2xl p-6 transition-all duration-300 bg-white ${mode.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                style={{
                  border: isSelecting ? '1.5px solid #0047cc' : '1px solid rgba(0,71,204,0.1)',
                  boxShadow: isSelecting ? '0 0 0 3px rgba(0,71,204,0.08), 0 8px 32px rgba(0,71,204,0.12)' : '0 2px 12px rgba(0,71,204,0.06)',
                }}>

                {isSelecting && (
                  <motion.div className="absolute top-4 right-4 w-4 h-4 rounded-full border-2 border-t-transparent"
                    style={{ borderColor: '#0047cc', borderTopColor: 'transparent' }}
                    animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                )}

                {/* Duration */}
                {!isSelecting && (
                  <div className="absolute top-5 right-5">
                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(0,71,204,0.3)' }}>
                      {mode.duration}
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div className="mb-4 w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(0,71,204,0.06)', color: '#0047cc' }}>
                  <mode.Icon />
                </div>

                <h2 className="text-sm font-black mb-0.5 tracking-tight" style={{ color: '#0a1628' }}>{mode.title}</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(0,71,204,0.5)' }}>
                  {mode.tagline}
                </p>

                <ul className="space-y-1.5 mb-5">
                  {mode.details.map((d) => (
                    <li key={d} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(10,22,40,0.5)' }}>
                      <span style={{ color: '#0047cc', fontSize: '10px' }}>—</span>{d}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(0,71,204,0.07)' }}>
                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: mode.disabled ? 'rgba(10,22,40,0.25)' : 'rgba(0,71,204,0.35)' }}>
                    {mode.disabled ? 'Coming soon' : 'Select'}
                  </span>
                  {!mode.disabled && <span className="text-xs" style={{ color: 'rgba(0,71,204,0.35)' }}>→</span>}
                </div>
              </motion.button>

              {/* Coming soon overlay */}
              {mode.disabled && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  <span className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white shadow-lg"
                    style={{ color: '#0047cc', border: '1px solid rgba(0,71,204,0.15)' }}>
                    Coming Soon
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <motion.div className="mt-10 relative z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <button onClick={handleBack}
          className="text-[10px] font-black uppercase tracking-widest transition-colors"
          style={{ color: 'rgba(0,71,204,0.3)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(0,71,204,0.7)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(0,71,204,0.3)')}>
          ← Back to role selection
        </button>
      </motion.div>
    </div>
  );
}
