// ============================================
// FILE: src/demo/components/DemoPayslipModal.tsx
// PURPOSE: Guided demo payslip showcase.
//   Opens automatically on the payroll-slip step.
//   Shows Kelly Robinson's April 2026 payslip — the most
//   complete demo payslip (includes performance bonus).
// ============================================

import { motion, AnimatePresence } from 'framer-motion';
import { DEMO_PAYSLIPS } from '../../../demoData';
import { Building2, ShieldCheck, Download, Printer } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Use Kelly Robinson's April 2026 payslip — has performance bonus
const PAYSLIP = DEMO_PAYSLIPS[0];

export function DemoPayslipModal({ isOpen, onClose }: Props) {
  const earnings   = PAYSLIP.breakdown.earnings;
  const deductions = PAYSLIP.breakdown.deductions;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 32 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-2xl mx-auto bg-white rounded-[24px] md:rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Top accent bar */}
            <div className="h-1.5 bg-gradient-to-r from-[#0047cc] via-[#e0f2fe]0 to-[#0047cc]" />

            {/* Controls */}
            <div className="px-4 md:px-8 pt-4 md:pt-5 pb-0 flex flex-wrap justify-between items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                  {PAYSLIP.status}
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {PAYSLIP.period}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="hidden sm:flex items-center gap-1.5 px-3 md:px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-all"
                >
                  <Printer size={12} /> Print
                </button>
                <button className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-[#0047cc] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0035a0] transition-all shadow-lg shadow-blue-500/20">
                  <Download size={12} /> <span className="hidden sm:inline">Download PDF</span><span className="sm:hidden">PDF</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all text-sm"
                >✕</button>
              </div>
            </div>

            {/* Payslip body */}
            <div className="px-4 md:px-8 py-4 md:py-6 space-y-4 md:space-y-6">

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 border-b border-dashed border-slate-200 pb-4 md:pb-6">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-[#0047cc] rounded-2xl flex items-center justify-center text-white text-xl md:text-2xl font-black italic shadow-lg shadow-blue-500/20 flex-shrink-0">
                    H
                  </div>
                  <div>
                    <h1 className="text-base md:text-xl font-black tracking-tighter text-slate-900 uppercase italic">
                      HRcopilot <span className="text-[#0047cc]">ENTERPRISE</span>
                    </h1>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                      Institutional Financial Document
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
                      <span className="flex items-center gap-1"><Building2 size={10} /> HQ Branch, Lagos NG</span>
                      <span className="flex items-center gap-1 text-emerald-500"><ShieldCheck size={10} /> SECURE_RECORD</span>
                    </div>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <h2 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-tight">{PAYSLIP.period}</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Pay Date: {PAYSLIP.payDate ?? (PAYSLIP as any).date}</p>
                </div>
              </div>

              {/* Employee + Bank */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                <div className="space-y-3">
                  <h3 className="text-[9px] font-black text-[#0047cc] uppercase tracking-widest">Employee Details</h3>
                  <div className="grid grid-cols-2 gap-2 md:gap-3 text-slate-900">
                    {[
                      ['Employee Name', PAYSLIP.employeeName],
                      ['Employee ID',   PAYSLIP.employeeId],
                      ['Designation',   PAYSLIP.position],
                      ['Department',    PAYSLIP.department],
                      ['Branch',        PAYSLIP.branch],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">{label}</p>
                        <p className="text-[11px] font-black uppercase">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-[9px] font-black text-[#0047cc] uppercase tracking-widest">Bank Details</h3>
                  <div className="grid grid-cols-2 gap-2 md:gap-3 text-slate-900">
                    {[
                      ['Bank',           PAYSLIP.bank.name],
                      ['Account',        PAYSLIP.bank.accountNumber],
                      ['TIN',            PAYSLIP.bank.tin],
                      ['Currency',       PAYSLIP.bank.currency],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">{label}</p>
                        <p className="text-[11px] font-black uppercase">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Earnings + Deductions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {/* Earnings */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <h3 className="text-[9px] font-black text-[#0047cc] uppercase tracking-widest mb-3">Earnings</h3>
                  <div className="space-y-2">
                    {earnings.map((e: any) => (
                      <div key={e.label} className="flex justify-between text-[11px]">
                        <span className="text-slate-600 font-medium">{e.label}</span>
                        <span className="font-black text-slate-900">₦{e.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase">Gross Pay</span>
                    <span className="text-[13px] font-black text-[#0047cc]">₦{PAYSLIP.grossPay.toLocaleString()}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
                  <h3 className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-3">Deductions</h3>
                  <div className="space-y-2">
                    {deductions.map((d: any) => (
                      <div key={d.label} className="flex justify-between text-[11px]">
                        <span className="text-slate-600 font-medium">{d.label}</span>
                        <span className="font-black text-rose-600">-₦{d.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-rose-200 flex justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase">Total Deductions</span>
                    <span className="text-[13px] font-black text-rose-600">-₦{PAYSLIP.totalDeductions.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Net Pay */}
              <div className="bg-gradient-to-r from-[#0047cc] to-[#0369a1] rounded-2xl p-5 flex justify-between items-center shadow-lg shadow-blue-500/20">
                <div>
                  <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Net Pay</p>
                  <p className="text-[9px] font-bold text-white/50 mt-0.5">After all statutory deductions</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-white tracking-tight">
                    ₦{PAYSLIP.netPay.toLocaleString()}
                  </p>
                  <p className="text-[9px] text-white/60 mt-0.5 uppercase tracking-widest">{PAYSLIP.bank.currency}</p>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

