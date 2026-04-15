// ============================================
// FILE: src/demo/components/DemoLeakageModal.tsx
// PURPOSE: Guided demo leakage showcase.
//   Pre-fills the leakage calculator with demo org data
//   (20 employees, ₦115.8M annual payroll, Technology sector)
//   and jumps straight to the results view — no wizard steps.
//   The visitor sees the live leakage clock and ROI immediately.
// ============================================

import { Suspense, lazy, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy-load the heavy widget
const LeakageWidget = lazy(() =>
  import('../../components/leakage/OrganizationalIntelligenceWidget')
);

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Demo org profile — derived from DEMO_EMPLOYEES + DEMO_PAYROLL_TREND
const DEMO_PROFILE = {
  orgType:        'commercial',
  sector:         'commercial',
  industry:       'Technology / SaaS',
  headcount:      20,
  headcountRange: '11-50',
  annualPayroll:  115_800_000,   // ₦9.65M/month × 12
  annualRevenue:  480_000_000,   // estimated from CRM pipeline
  avgAnnualSalary: 5_790_000,   // ₦483K/month avg × 12
  avgHourlyRate:   2_784,        // avgAnnualSalary / (260 × 8)
  currency:       'NGN',
  locale:         'en-NG',
  exchangeRate:   1550,          // NGN/USD
  countriesOfOperation: 1,
  techMaturity:   'partial',
  isNGO:          false,
  isCommercial:   true,
};

const DEMO_INPUTS = {
  minutesLostPerDay:      18,
  turnoverCount:          3,
  hrTeamSalary:           14_400_000,  // 2 HR staff × ₦600K/mo × 12
  lowPerformerPercent:    15,
  managerCount:           5,
  appraisalCyclesPerYear: 2,
  hoursPerAppraisalCycle: 4,
  topTalentLostPerYear:   1,
  annualProcurementSpend: 25_000_000,
  purchaseOrderCount:     24,
  monthlyLeadVolume:      40,
  avgDealValue:           52_000_000,
  salesTeamSize:          3,
  salesTeamSalary:        21_600_000,
  monthlyChurnRate:       3,
  avgCustomerLifetimeValue: 156_000_000,
  financeTeamSalary:      14_400_000,
  monthlyAPSpend:         2_083_333,
  avgDaysToClose:         8,
  knowledgeWorkerCount:   14,
  operationalWorkerCount: 6,
  multipleJurisdictions:  false,
  multiCurrency:          false,
  industryRegulations:    true,
  dataPrivacyObligations: true,
  recentComplianceFinding: false,
};

export function DemoLeakageModal({ isOpen, onClose }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/20 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-7xl bg-white dark:bg-[#0f172a] rounded-[48px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden flex flex-col"
            style={{ height: '95vh' }}
          >
            {/* Header */}
            <div className="p-8 pb-4 flex justify-between items-center border-b border-slate-200 dark:border-white/10 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0047cc] to-[#0035a0] rounded-2xl flex items-center justify-center shadow-sm">
                  <span className="text-2xl text-white">📊</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">
                      Leakage Intelligence
                    </h2>
                    <span className="px-2 py-0.5 bg-[#e0e7ff] text-[#0047cc] text-[10px] font-bold rounded-md">Enterprise</span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-md">Demo Data</span>
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Live leakage analysis — 20 employees · Technology sector · ₦115.8M annual payroll
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 bg-slate-100 dark:bg-white/5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors shadow-sm"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Widget — pre-filled and jumped to results */}
            <div className="flex-1 overflow-y-auto">
              <Suspense fallback={
                <div className="flex items-center justify-center h-full min-h-[400px]">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-[#0047cc] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Calculating leakage…
                    </p>
                  </div>
                </div>
              }>
                <div className="p-6">
                  <PrefilledLeakageWidget />
                </div>
              </Suspense>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ── Inner component — mounts widget and pre-fills on first render ─────────────
function PrefilledLeakageWidget() {
  const seededRef = useRef(false);

  return (
    <LeakageWidget
      standalone={true}
      demoMode="guided"
      // Pass pre-seeded profile + inputs so the widget skips the wizard
      // and renders results immediately
      initialProfile={DEMO_PROFILE}
      initialInputs={DEMO_INPUTS}
      skipToResults={true}
    />
  );
}
