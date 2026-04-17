// ============================================
// FILE: src/demo/onboarding/RoleSelection.tsx
// ============================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from './onboardingStore';
import { speak, primeAudioContext } from '../voice/narrationEngine';
import { UserRole } from '../../../types';

interface Props { onDone: () => void; }

const IconCEO = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-12m12-13.5v13.5M9 16.5v3.75m6-3.75v3.75M9 20.25h6" />
  </svg>
);
const IconHR = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);
const IconFinance = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
  </svg>
);

const ROLES = [
  { role: UserRole.CEO,        Icon: IconCEO,     label: 'CEO',        tagline: 'Strategic Oversight',   features: ['Company-wide analytics', 'Financial planning', 'Executive dashboards'], narration: "As CEO, you'll see the full financial picture — payroll costs, procurement spend, and workforce ROI — all in one command centre.", scriptId: 'role.ceo' },
  { role: UserRole.HR_MANAGER, Icon: IconHR,      label: 'HR Manager', tagline: 'Operations Management', features: ['Employee lifecycle', 'Payroll automation', 'Talent acquisition'],       narration: "As HR Manager, you'll see how HRcopilot eliminates manual processes — attendance, payroll, and performance reviews all automated.",    scriptId: 'role.hr' },
  { role: UserRole.ACCOUNTANT, Icon: IconFinance, label: 'Accountant', tagline: 'Financial Control',     features: ['Payroll processing', 'Budget tracking', 'Compliance reporting'],        narration: "As Accountant, you'll see how every payroll run posts directly to the general ledger — automated journal entries, instant reconciliation.", scriptId: 'role.finance' },
];

export function RoleSelection({ onDone }: Props) {
  const { setRole, setStep } = useOnboardingStore();
  const [selecting, setSelecting] = useState<UserRole | null>(null);

  const handleSelect = async (card: typeof ROLES[0]) => {
    if (selecting) return;
    setSelecting(card.role);
    primeAudioContext();
    speak(card.narration, { scriptId: card.scriptId }).catch(() => {});
    setRole(card.role);
    await new Promise((r) => setTimeout(r, 600));
    setStep('mode-selection');
    onDone();
  };

  const handleSkip = () => {
    setRole(UserRole.HR_MANAGER);
    setStep('mode-selection');
    onDone();
  };

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
          Personalise your demo
        </p>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3" style={{ color: '#0a1628' }}>
          Choose Your <span style={{ color: '#0047cc' }}>Role</span>
        </h1>
        <p className="text-sm max-w-sm mx-auto" style={{ color: 'rgba(10,22,40,0.45)' }}>
          HRcopilot adapts the demo to what matters most for your position
        </p>
      </motion.div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 w-full max-w-3xl relative z-10">
        {ROLES.map((card, i) => {
          const isSelecting = selecting === card.role;
          return (
            <motion.button key={card.role}
              onClick={() => handleSelect(card)}
              disabled={!!selecting}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={!selecting ? { y: -3, boxShadow: '0 8px 32px rgba(0,71,204,0.12)' } : {}}
              whileTap={!selecting ? { scale: 0.98 } : {}}
              className="relative text-left rounded-2xl p-6 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-white"
              style={{
                border: isSelecting ? '1.5px solid #0047cc' : '1px solid rgba(0,71,204,0.1)',
                boxShadow: isSelecting ? '0 0 0 3px rgba(0,71,204,0.08), 0 8px 32px rgba(0,71,204,0.12)' : '0 2px 12px rgba(0,71,204,0.06)',
              }}>

              {isSelecting && (
                <motion.div className="absolute top-4 right-4 w-4 h-4 rounded-full border-2 border-t-transparent"
                  style={{ borderColor: '#0047cc', borderTopColor: 'transparent' }}
                  animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
              )}

              {/* Icon */}
              <div className="mb-4 w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(0,71,204,0.06)', color: '#0047cc' }}>
                <card.Icon />
              </div>

              <h2 className="text-sm font-black mb-0.5 tracking-tight" style={{ color: '#0a1628' }}>{card.label}</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(0,71,204,0.5)' }}>
                {card.tagline}
              </p>

              <ul className="space-y-1.5 mb-5">
                {card.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(10,22,40,0.5)' }}>
                    <span style={{ color: '#0047cc', fontSize: '10px' }}>—</span>{f}
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(0,71,204,0.07)' }}>
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(0,71,204,0.35)' }}>Select</span>
                <span className="text-xs" style={{ color: 'rgba(0,71,204,0.35)' }}>→</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <motion.div className="mt-10 relative z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <button onClick={handleSkip}
          className="text-[10px] font-black uppercase tracking-widest transition-colors"
          style={{ color: 'rgba(0,71,204,0.3)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(0,71,204,0.7)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(0,71,204,0.3)')}>
          Skip — explore as guest →
        </button>
      </motion.div>
    </div>
  );
}
