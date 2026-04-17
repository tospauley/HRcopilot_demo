// ============================================
// FILE: src/demo/onboarding/OrganizationProfile.tsx
// PURPOSE: CEO-only step — collect company name, brand color,
//          logo, industry, headcount. Applies CSS var on submit.
//          Skip always available.
// ============================================

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from './onboardingStore';
import { speak } from '../voice/narrationEngine';
import { primeAudioContext } from '../voice/narrationEngine';
import type { OrgProfile } from './onboardingStore';

interface Props {
  onDone: () => void; // → ModeSelection
}

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance & Banking', 'Retail',
  'Manufacturing', 'Education', 'Government / NGO', 'Other',
];

const HEADCOUNTS = [
  '1–10', '11–50', '51–100', '101–500', '501–1,000', '1,000+',
];

const DEFAULT_COLOR = '#2563eb';

export function OrganizationProfile({ onDone }: Props) {
  const { setOrgProfile, setStep } = useOnboardingStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<OrgProfile>({
    companyName:  '',
    primaryColor: DEFAULT_COLOR,
    logoDataUrl:  null,
    industry:     'Technology',
    employeeCount: '51–100',
  });
  const [submitting, setSubmitting] = useState(false);

  const patch = (partial: Partial<OrgProfile>) =>
    setForm((prev) => ({ ...prev, ...partial }));

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => patch({ logoDataUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  const applyBrandColor = (color: string) => {
    document.documentElement.style.setProperty('--brand-primary', color);
  };

  const handleSubmit = async (skipped = false) => {
    if (submitting) return;
    setSubmitting(true);

    primeAudioContext();

    if (!skipped && form.companyName) {
      applyBrandColor(form.primaryColor);
      setOrgProfile(form);
      speak(
        `Great. I've personalised your HRcopilot experience for ${form.companyName}. Let's choose how you'd like to explore.`,
        { scriptId: 'onboarding.org-profile' },
      ).catch(() => {});
    } else {
      speak(
        "No problem. You can customise your brand settings any time from the Settings module.",
        { scriptId: 'onboarding.org-profile-skip' },
      ).catch(() => {});
    }

    await new Promise((r) => setTimeout(r, 700));
    setStep('mode-selection');
    onDone();
  };

  const hasPreview = form.companyName || form.primaryColor !== DEFAULT_COLOR || form.logoDataUrl;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#eff6ff]/40 flex items-center justify-center px-4 py-8 md:py-12 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#bae6fd]/50 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#dbeafe]/40 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        className="relative z-10 w-full max-w-xl"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 p-5 md:p-8 shadow-xl shadow-slate-200/50">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🏢</div>
            <p className="text-xs font-black text-[#0369a1] uppercase tracking-[0.2em] mb-2">
              CEO Setup
            </p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              Customise Your Experience
            </h1>
            <p className="text-slate-500 text-sm">
              Personalise the demo with your company details
            </p>
          </div>

          <div className="space-y-5">

            {/* Company Name */}
            <div>
              <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => patch({ companyName: e.target.value })}
                placeholder="Acme Corporation"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#bae6fd] transition-all text-sm"
              />
            </div>

            {/* Brand Color */}
            <div>
              <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
                Primary Brand Colour
              </label>
              <div className="flex gap-3 items-center">
                <div className="relative">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => patch({ primaryColor: e.target.value })}
                    className="w-12 h-12 rounded-xl cursor-pointer border-0 bg-transparent p-0.5"
                  />
                </div>
                <input
                  type="text"
                  value={form.primaryColor}
                  onChange={(e) => patch({ primaryColor: e.target.value })}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono text-sm focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#bae6fd] transition-all"
                />
                {/* Swatch preview */}
                <div
                  className="w-12 h-12 rounded-xl border border-white/10 flex-shrink-0"
                  style={{ background: form.primaryColor }}
                />
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
                Company Logo
              </label>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {form.logoDataUrl
                    ? <img src={form.logoDataUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                    : <span className="text-2xl">🖼️</span>
                  }
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 hover:text-slate-900 text-sm font-semibold transition-all"
                >
                  {form.logoDataUrl ? 'Change Logo' : 'Upload Logo'}
                </button>
                {form.logoDataUrl && (
                  <button
                    type="button"
                    onClick={() => patch({ logoDataUrl: null })}
                    className="text-white/30 hover:text-red-400 text-xs transition-colors"
                  >
                    Remove
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Industry + Headcount — side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-xs font-bold uppercase tracking-wider mb-2">
                  Industry
                </label>
                <select
                  value={form.industry}
                  onChange={(e) => patch({ industry: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#bae6fd] transition-all appearance-none cursor-pointer"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white/70 text-xs font-bold uppercase tracking-wider mb-2">
                  Employees
                </label>
                <select
                  value={form.employeeCount}
                  onChange={(e) => patch({ employeeCount: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#bae6fd] transition-all appearance-none cursor-pointer"
                >
                  {HEADCOUNTS.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live preview */}
            <AnimatePresence>
              {hasPreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
                      Live Preview
                    </p>
                    <div className="flex items-center gap-3">
                      {form.logoDataUrl
                        ? <img src={form.logoDataUrl} alt="" className="w-8 h-8 rounded-lg object-contain" />
                        : (
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black"
                            style={{ background: form.primaryColor }}
                          >
                            {form.companyName?.[0]?.toUpperCase() || 'H'}
                          </div>
                        )
                      }
                      <div>
                        <p className="text-slate-900 text-sm font-bold">
                          {form.companyName || 'Your Company'}
                        </p>
                        <p className="text-slate-400 text-xs">
                          {form.industry} · {form.employeeCount} employees
                        </p>
                      </div>
                      <div
                        className="ml-auto w-3 h-3 rounded-full"
                        style={{ background: form.primaryColor }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={submitting}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 text-sm font-semibold transition-all disabled:opacity-40"
              >
                Skip for now
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="flex-2 flex-grow-[2] py-3 rounded-xl text-white text-sm font-black transition-all disabled:opacity-40 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${form.primaryColor}, #0ea5e9)` }}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full inline-block"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                    />
                    Applying…
                  </span>
                ) : 'Continue →'}
              </button>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}

