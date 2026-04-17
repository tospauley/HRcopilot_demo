import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, Printer, ChevronRight, FileText, TrendingUp, ShieldCheck,
  CreditCard, Building2, Calendar, ExternalLink
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import { DEMO_PAYSLIPS } from '../demoData';

// Show Kelly Robinson's payslips as the logged-in employee demo
const MOCK_PAYSLIPS = DEMO_PAYSLIPS.filter(p => p.employeeId === 'E01');

const PayslipModal: React.FC<{ payslip: any; onClose: () => void }> = ({ payslip, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 print:p-0">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl print:hidden"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        className="relative w-full max-w-4xl bg-white dark:bg-[#0f1120] rounded-[32px] sm:rounded-[48px] border border-white/10 shadow-[0_32px_128px_rgba(0,0,0,0.5)] overflow-hidden print:shadow-none print:border-none print:rounded-none print:bg-white print:text-black print:max-w-none print:m-0"
        onClick={e => e.stopPropagation()}
      >
        {/* Print Header Logic */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#0047cc] to-transparent opacity-50 print:hidden" />
        
        {/* Controls */}
        <div className="p-4 sm:p-8 pb-0 flex justify-end gap-2 sm:gap-3 print:hidden">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
          >
            <Printer size={14} /> Print Payslip
          </button>
          <button 
            className="flex items-center gap-2 px-6 py-3 bg-[#0047cc] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-blue-500/20"
          >
            <Download size={14} /> Download PDF
          </button>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            ?
          </button>
        </div>

        {/* Payslip Document Area */}
        <div className="p-6 sm:p-12 space-y-8 sm:space-y-10 print:p-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-dashed border-slate-200 dark:border-white/10 pb-6 sm:pb-10 print:border-slate-300">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-[#0047cc] rounded-3xl flex items-center justify-center text-white text-3xl font-black italic shadow-xl shadow-blue-500/20 print:shadow-none">
                H
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic print:text-black">HRcopilot <span className="text-[#0047cc]">ENTERPRISE</span></h1>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1 print:text-slate-600">Institutional Financial Document</p>
                <div className="mt-4 flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase print:text-slate-500">
                  <span className="flex items-center gap-1"><Building2 size={12} /> HQ Branch, Lagos NG</span>
                  <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-emerald-500" /> SECURE_RECORD</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 print:bg-emerald-50 print:border print:border-emerald-200">
                {payslip.status}
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight print:text-black">{payslip.period}</h2>
              <p className="text-xs font-bold text-slate-500 uppercase mt-1 print:text-slate-600">Pay Date: {payslip.date}</p>
            </div>
          </div>

          {/* Employee & Bank Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 text-slate-900 dark:text-white print:text-black">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-[#0047cc] uppercase tracking-widest">Employee Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Employee Name</p>
                  <p className="text-sm font-black uppercase">{payslip.employeeName}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Employee ID</p>
                  <p className="text-sm font-black uppercase">{payslip.employeeId}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Designation</p>
                  <p className="text-sm font-black uppercase">{payslip.position}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Department</p>
                  <p className="text-sm font-black uppercase">{payslip.department}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-[#0047cc] uppercase tracking-widest">Payment Destination</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Bank Name</p>
                  <p className="text-sm font-black uppercase flex items-center gap-2"><CreditCard size={14} /> {payslip.bank.name}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Account Number</p>
                  <p className="text-sm font-black uppercase tracking-widest">{payslip.bank.accountNumber}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Tax ID / TIN</p>
                  <p className="text-sm font-black uppercase">{payslip.bank.tin}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Currency</p>
                  <p className="text-sm font-black uppercase">NGN (₦)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Table Breakdown */}
          <div className="grid grid-cols-2 gap-10 border-y border-dashed border-slate-200 dark:border-white/10 py-10 print:border-slate-300">
            {/* Earnings */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-xl print:bg-slate-100">
                <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">EARNINGS</span>
                <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">AMOUNT (?)</span>
              </div>
              <div className="space-y-3 px-4">
                {payslip.breakdown.earnings.map((e: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500 uppercase print:text-slate-600">{e.label}</span>
                    <span className="font-black text-slate-900 dark:text-white print:text-black">{e.amount.toLocaleString()}.00</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Deductions */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-xl print:bg-slate-100">
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">DEDUCTIONS</span>
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">AMOUNT (?)</span>
              </div>
              <div className="space-y-3 px-4">
                {payslip.breakdown.deductions.map((d: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500 uppercase print:text-slate-600">{d.label}</span>
                    <span className="font-black text-rose-500">{d.amount.toLocaleString()}.00</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="flex justify-end pt-6">
            <div className="w-full max-w-sm space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500 uppercase">Gross Earnings</span>
                <span className="font-black text-slate-900 dark:text-white print:text-black">₦{payslip.grossPay.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500 uppercase">Total Deductions</span>
                <span className="font-black text-rose-500">₦{payslip.breakdown.deductions.reduce((a: any, b: any) => a + b.amount, 0).toLocaleString()}.00</span>
              </div>
              <div className="h-px bg-slate-200 dark:bg-white/10 my-4" />
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-black text-[#0047cc] uppercase tracking-widest block">Net Pay</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase italic">(Disbursed to bank)</span>
                </div>
                <span className="text-3xl font-black text-[#0047cc] italic">₦{payslip.netPay.toLocaleString()}.00</span>
              </div>
            </div>
          </div>

          {/* Verification Footer */}
          <div className="pt-12 flex justify-between items-end border-t border-slate-100 dark:border-white/5 print:border-slate-300">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-white p-2 rounded-2xl border border-slate-100 print:border-slate-300">
                <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center gap-1 opacity-40">
                  <div className="w-8 h-8 rounded-full border-2 border-slate-300" />
                  <span className="text-[6px] font-black uppercase tracking-tighter">SECURE QR CODE</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Document Hash Verification</p>
                <p className="text-[9px] font-mono text-slate-500">8920-X921-HRCOPILOT-COMPLY-2026</p>
                <p className="text-[8px] text-slate-400 uppercase mt-2 italic">This is a system-generated document and has been digitally verified for institutional compliance.</p>
              </div>
            </div>
            <div className="text-right">
              <div className="w-32 h-12 bg-slate-50 dark:bg-white/5 rounded-xl border-b-2 border-slate-200 mb-2 flex items-center justify-center opacity-30 italic font-serif text-slate-400">
                Digital Signature
              </div>
              <p className="text-[8px] font-black text-[#0047cc] uppercase tracking-widest italic">CFO Authorised</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const MyPayroll: React.FC = () => {
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
            COMPENSATION <span className="text-[#0047cc]">INTELLIGENCE</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">
            PERSONAL PAYROLL PORTAL
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="md" icon={<Calendar size={14} />}>Tax Year 2026</Button>
          <Button variant="secondary" size="md" icon={<Download size={14} />}>Export History</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="!bg-[#0047cc] text-white overflow-hidden relative group">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <span className="text-[10px] font-black opacity-60 uppercase tracking-widest block mb-2">Total Earnings (YTD)</span>
              <h3 className="text-4xl font-black tracking-tighter italic">₦{MOCK_PAYSLIPS.reduce((s, p) => s + p.grossPay, 0).toLocaleString()}.00</h3>
              <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-black opacity-60 uppercase">Net Pay (Avg)</p>
                  <p className="text-lg font-black">₦{Math.round(MOCK_PAYSLIPS.reduce((s, p) => s + p.netPay, 0) / MOCK_PAYSLIPS.length).toLocaleString()}.00</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-white/20 rounded text-[8px] font-black uppercase tracking-widest">Active Cycle</span>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Payroll Breakdown</h4>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[11px] font-black uppercase mb-2">
                  <span className="text-slate-500">Net Take Home</span>
                  <span className="text-slate-900 dark:text-white">88%</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[88%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-black uppercase mb-2">
                  <span className="text-slate-500">Statutory Deductions</span>
                  <span className="text-slate-900 dark:text-white">12%</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 w-[12%]" />
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-slate-50 dark:bg-white/3 rounded-2xl border border-slate-100 dark:border-white/5">
              <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase italic overflow-hidden">
                Institutional Note: Your tax and pension compliance is handled automatically via institutional settlement.
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="overflow-hidden !p-0">
            <div className="p-4 sm:p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight italic">PAYSLIP HISTORY</h3>
              <span className="text-[9px] font-black text-[#0047cc] uppercase tracking-widest bg-[#0047cc]/10 px-3 py-1 rounded-lg">Last 12 Months</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {MOCK_PAYSLIPS.map((ps) => (
                <div 
                  key={ps.id} 
                  className="p-6 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all cursor-pointer group flex items-center justify-between"
                  onClick={() => setSelectedPayslip(ps)}
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#0047cc]/5 flex items-center justify-center text-[#0047cc] group-hover:scale-110 transition-transform">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{ps.period}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{ps.id} � {ps.payDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-black text-slate-900 dark:text-white">₦{ps.netPay.toLocaleString()}.00</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">NET DISBURSEMENT</p>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:border-[#0047cc] group-hover:text-[#0047cc] transition-all">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <div className="grid grid-cols-2 gap-6">
            <button className="flex items-center justify-between p-6 bg-white dark:bg-white/5 rounded-[32px] border border-slate-200 dark:border-white/10 hover:border-[#0047cc] transition-all group shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#e0f2fe]0/10 text-[#e0f2fe]0 flex items-center justify-center"><Calendar size={18} /></div>
                <div className="text-left">
                  <p className="text-xs font-black text-slate-900 dark:text-white">Tax Certificates</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">YTD Summary</p>
                </div>
              </div>
              <ExternalLink size={14} className="text-slate-400 group-hover:text-[#0047cc]" />
            </button>
            <button className="flex items-center justify-between p-6 bg-white dark:bg-white/5 rounded-[32px] border border-slate-200 dark:border-white/10 hover:border-[#0047cc] transition-all group shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><TrendingUp size={18} /></div>
                <div className="text-left">
                  <p className="text-xs font-black text-slate-900 dark:text-white">Salary Projection</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Cycle Estimator</p>
                </div>
              </div>
              <ExternalLink size={14} className="text-slate-400 group-hover:text-[#0047cc]" />
            </button>
          </div>
        </div>
      </div>

      {/* Payslip Modal */}
      <AnimatePresence>
        {selectedPayslip && (
          <PayslipModal 
            payslip={selectedPayslip} 
            onClose={() => setSelectedPayslip(null)} 
          />
        )}
      </AnimatePresence>

      {/* Print Overlay CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed.inset-0.z-\\[9999\\] {
            visibility: visible !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            overflow: visible;
          }
          .fixed.inset-0.z-\\[9999\\] * {
            visibility: visible !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .shadow-\\[0_32px_128px_rgba\\(0\\,0\\,0\\,0.5\\)\\] {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MyPayroll;


