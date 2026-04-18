import React, { useState } from 'react';
import { useCurrency } from '../src/context/CurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, Plus, Trophy, TrendingUp, Users, Clock, 
  ChevronRight, MoreHorizontal, ExternalLink, Save, CheckCircle2, Calendar, Filter
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import {
  DEMO_PAYROLL_TREND, DEMO_PAYROLL_LINES, DEMO_PAYROLL_RUNS, DEMO_PAYROLL_PERIODS,
  DEMO_EMPLOYEES, DEMO_DASHBOARD_KPIS,
} from '../demoData';

const MOCK_PAYMENT_HISTORY = DEMO_PAYROLL_TREND.map(d => ({ name: d.month, value: Math.round(d.net / 1000) }));

const empTypes = ['Full-Time', 'Contract', 'Part-Time'];
const MOCK_WORKFORCE_MIX = empTypes.map(t => ({
  name: t.toUpperCase(),
  value: DEMO_EMPLOYEES.filter(e => e.employment === t).length,
}));

const COLORS = ['#0047cc', '#10b981', '#f59e0b'];

const Payroll: React.FC = () => {
  const { symbol, fmt } = useCurrency();
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [isCreatePayrollModalOpen, setIsCreatePayrollModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Modal Form State
  const [payrollForm, setPayrollForm] = useState({
    period: 'April 2024',
    branch: 'ALL BRANCHES',
    type: 'Regular Payroll'
  });

  const handleRunPayroll = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsCreatePayrollModalOpen(false);
      // In a real app, we'd trigger a toast or navigate to the run results
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-header text-slate-900 dark:text-white">
            GLOBAL <span className="text-[#0047cc]">PAYROLL</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.25em] mt-1 italic opacity-70">
            ENTERPRISE FINANCIAL GOVERNANCE
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="tab-nav bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10">
            {['DASHBOARD', 'PERIODS', 'MANAGEMENT', 'APPROVALS', 'SETTINGS'].map((tab) => (
              <button
                key={tab}
                data-demo-id={`payroll-tab-${tab.toLowerCase()}`}
                onClick={() => setActiveTab(tab)}
                className={`tab-btn ${
                  activeTab === tab 
                    ? 'bg-[#0047cc] text-white shadow-lg shadow-blue-500/20' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={<Download size={14} />}>Export</Button>
            <Button 
              id="run-payroll"
              data-demo-id="run-payroll"
              variant="success" 
              size="sm" 
              icon={<Plus size={14} strokeWidth={3} />}
              onClick={() => setIsCreatePayrollModalOpen(true)}
            >
              Create Payroll
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-in slide-in-from-bottom-2 duration-500">
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div data-demo-id="payroll-stats-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              {[
                { label: 'MONTHLY PAYROLL', value: fmt(DEMO_DASHBOARD_KPIS.monthlyPayrollTotal, { compact: true, decimals: 2 }), sub: 'NET DISBURSEMENT', icon: TrendingUp, color: 'text-[#0047cc]', accent: '#0047cc' },
                { label: 'AVERAGE PAY',     value: fmt(Math.round(DEMO_DASHBOARD_KPIS.monthlyPayrollTotal / DEMO_DASHBOARD_KPIS.activeEmployees), { compact: true }), sub: 'PER WORKFORCE', icon: Users, color: 'text-emerald-500', accent: '#10b981' },
                { label: 'HEADCOUNT',       value: String(DEMO_DASHBOARD_KPIS.activeEmployees), sub: 'ACTIVE EMPLOYEES', icon: Users, color: 'text-amber-500', accent: '#f59e0b' },
                { label: 'PENDING RUNS',    value: String(DEMO_DASHBOARD_KPIS.pendingPayrollApprovals), sub: 'APPROVALS NEEDED', icon: Clock, color: 'text-rose-500', accent: '#ef4444' },
              ].map((stat, i) => (
                <GlassCard key={i} accentColor={stat.accent} className="!p-4 cursor-pointer group">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <div className={`${stat.color} group-hover:scale-110 transition-transform`}>
                      <stat.icon size={14} />
                    </div>
                  </div>
                  <p className={`text-2xl font-black tracking-tighter leading-none ${stat.color}`}>{stat.value}</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2 opacity-60">{stat.sub}</p>
                </GlassCard>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <GlassCard className="lg:col-span-2 p-4 sm:p-8">
                <div className="flex justify-between items-center mb-6 sm:mb-10">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase italic border-l-4 border-[#0047cc] pl-4">
                    PAYMENT HISTORY
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#0047cc]" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">MONTHLY NET</span>
                  </div>
                </div>
                <div className="chart-md w-full min-w-0 relative">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <LineChart data={MOCK_PAYMENT_HISTORY}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
                        tickFormatter={(value) => `${value}k`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--tooltip-bg, #fff)',
                          border: '1px solid var(--tooltip-border, #e2e8f0)',
                          borderRadius: '16px',
                          fontSize: '10px',
                          fontWeight: '800',
                          color: 'var(--tooltip-color, #0f172a)',
                          boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
                        }}
                        itemStyle={{ color: '#0047cc' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#0047cc" 
                        strokeWidth={4} 
                        dot={{ r: 6, fill: '#0047cc', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 8, fill: '#0047cc', strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              <GlassCard className="p-4 sm:p-8">
                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase italic border-l-4 border-[#0047cc] pl-4 mb-6 sm:mb-10">
                  WORKFORCE MIX
                </h3>
                <div className="chart-sm min-w-0 relative">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <PieChart>
                      <Pie
                        data={MOCK_WORKFORCE_MIX}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {MOCK_WORKFORCE_MIX.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-3xl font-black text-slate-900 dark:text-white">10</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">TOTAL</p>
                  </div>
                </div>
                <div className="mt-8 space-y-4">
                  {MOCK_WORKFORCE_MIX.map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.name}</span>
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Transitions Table */}
            <GlassCard className="overflow-hidden">
              <div className="p-4 sm:p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase italic border-l-4 border-amber-500 pl-4">
                  APPROVED TRANSITIONS
                </h3>
                <button className="text-[9px] font-black text-[#0047cc] uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity">
                  REQUEST FINANCIAL REVIEW
                  <ExternalLink size={12} />
                </button>
              </div>
              <div className="table-wrap">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-white/[0.02]">
                      {['PERIOD', 'APPROVAL DATE', 'EMPLOYEES', 'TOTAL AMOUNT', 'ACTION'].map((h) => (
                        <th key={h} className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-30">
                          <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center">
                            <Clock size={32} />
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            NO APPROVED PAYROLL RUNS YET � APPROVE A RUN TO SEE IT HERE
                          </p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'PERIODS' && (
          <div className="space-y-6">
            <GlassCard title="Payroll Periods">
              <div className="space-y-4">
                {DEMO_PAYROLL_PERIODS.map((period, i) => (
                  <div key={i} className="p-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{period.name}</h4>
                      <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Deadline: {period.endDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900 dark:text-white">
                        {DEMO_PAYROLL_RUNS.find(r => r.periodId === period.id)
                          ? `${symbol}${DEMO_PAYROLL_RUNS.find(r => r.periodId === period.id)!.totalNet.toLocaleString()}`
                          : `${symbol}0.00`}
                      </p>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${period.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>
                        {period.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'MANAGEMENT' && (
          <div className="space-y-6">
            <GlassCard title="Employee Compensation Management">
              <div className="table-wrap">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
                      <th className="px-6 py-4">Employee</th>
                      <th className="px-6 py-4">Base Salary</th>
                      <th className="px-6 py-4">Allowances</th>
                      <th className="px-6 py-4">Deductions</th>
                      <th className="px-6 py-4 text-right">Net Pay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {DEMO_PAYROLL_LINES.slice(0, 8).map((line, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={line.avatar} className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10" alt="" />
                            <div>
                              <span className="text-xs font-bold text-slate-900 dark:text-white block">{line.employeeName}</span>
                              <span className="text-[9px] text-slate-400 uppercase">{line.department}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">{symbol}{line.baseSalary.toLocaleString()}</td>
                        <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">{symbol}{line.allowances.toLocaleString()}</td>
                        <td className="px-6 py-4 text-xs text-rose-500">{symbol}{line.deductions.toLocaleString()}</td>
                        <td className="px-6 py-4 text-xs font-black text-slate-900 dark:text-white text-right">{symbol}{line.netPay.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'APPROVALS' && (
          <div className="space-y-6">
            <GlassCard title="Pending Payroll Approvals">
              <div className="p-10 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-500">
                  <Clock size={32} />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">No Pending Approvals</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest max-w-xs mx-auto">All payroll runs for the current period have been processed or are awaiting final disbursement.</p>
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'SETTINGS' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* STATUTORY DEDUCTIONS */}
            <GlassCard>
              <div className="p-6 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-[#0047cc] rounded-full" />
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">STATUTORY DEDUCTIONS</h3>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 tracking-widest">TOGGLE EACH DEDUCTION ON/OFF � NIGERIA FINANCE ACT 2025</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-1">
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">PAYE Tax</p>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5">Progressive income tax deducted from employee gross pay. Remitted to FIRS by the 10th of the following month.</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> ON
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Pension Contribution</p>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5">Employee 8% + Employer 10% of (Basic + Housing + Transport). Remitted to PenCom by the 7th.</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> ON
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">NHIS (Health Insurance)</p>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5">Employee 5% + Employer 10% of Basic Salary. Remitted to NHIS.</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> ON
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">NHF (National Housing Fund)</p>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5">2.5% of basic salary, employee only. Remitted to FMBN by the 1st of the following month.</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> ON
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">NSITF</p>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5">1% of total basic wages, employer only. Remitted to NSITF by the 1st of the following month.</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> ON
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">ITF (Training Fund)</p>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5">1% of total payroll cost, employer only. Mandatory for organisations with 5+ employees.</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> ON
                  </div>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">State Development Levy</p>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5">{symbol}100 fixed annual deduction per employee. Remitted to the specific State Internal Revenue Service.</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> ON
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* STATUTORY OVERRIDE */}
            <GlassCard>
              <div className="p-6 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">STATUTORY OVERRIDE</h3>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 tracking-widest">ALLOW AUTHORISED ROLES TO MANUALLY ADJUST PAYE, PENSION, NHF, NSITF</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Allow Statutory Deduction Override</p>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5">When enabled, authorised roles can manually adjust statutory line items. Every override is audit-logged with hash-chain tamper evidence.</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-200 dark:bg-white/10 text-slate-500">
                    <div className="w-2 h-2 rounded-full bg-slate-400" /> OFF
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* COMPLIANCE THRESHOLDS */}
            <GlassCard>
              <div className="p-6 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">COMPLIANCE THRESHOLDS</h3>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 tracking-widest">MINIMUM WAGE, RENT RELIEF CAP, NSITF BASE DEFINITION</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-1">
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">National Minimum Wage (?/month)</p>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5">National Minimum Wage Act (2024 amendment). Payroll submission is blocked if any employee's net pay falls below this.</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10">
                    <span className="text-[10px] font-black text-slate-400">?</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">70000</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Block Submission on Minimum Wage Breach</p>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5">When on, payroll runs with employees below minimum wage cannot be submitted without a documented override note.</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> ON
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Rent Relief Monthly Cap ({symbol})</p>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5">FIRS standard: {symbol}200,000/year ÷ 12 = {symbol}16,667/month. Employees with documented FIRS approval can exceed this.</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10">
                    <span className="text-[10px] font-black text-slate-400">?</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">16667</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Enforce Rent Relief Cap</p>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5">When on, rent relief is capped at the monthly cap unless the employee has FIRS approval on their salary record.</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> ON
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">State Development Levy Month</p>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5">The calendar month (1-12) when the annual State Development Levy is deducted.</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 w-24 justify-center">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">1</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">NSITF Contribution Base</p>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5">NSITF Act 2010 defines the base as basic wages only. 'Total Gross' is legacy and over-calculates the employer liability.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 cursor-pointer">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Basic Wages (Correct)</span>
                    <span className="text-slate-400 text-[10px]">?</span>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* REMITTANCE CONTROLS */}
            <GlassCard>
              <div className="p-6 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">REMITTANCE CONTROLS</h3>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 tracking-widest">DUAL APPROVAL THRESHOLD FOR LARGE STATUTORY PAYMENTS</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-1">
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Dual Approval for Large Remittances</p>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5">Remittances above the threshold require CFO/CEO confirmation before being recorded as paid.</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> ON
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Dual Approval Threshold (?)</p>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5">Remittances above this amount require a second approver. Applies to PAYE, Pension, NHF, and NSITF.</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10">
                    <span className="text-[10px] font-black text-slate-400">?</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">1000000</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Automated Compliance Reminders</p>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5">Send daily emails and dashboard alerts to finance admins before statutory deadlines.</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> ON
                  </div>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Reminder Lead Time (Days)</p>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5">Number of days before the FIRS/PenCom deadline to start sending daily alerts.</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">3</span>
                    <span className="text-[10px] font-black text-slate-400">days</span>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* YTD & RECONCILIATION */}
            <GlassCard>
              <div className="p-6 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-fuchsia-500 rounded-full" />
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">YTD & RECONCILIATION</h3>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 tracking-widest">YEAR-TO-DATE PAYE RECONCILIATION FOR DECEMBER PAYROLL</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-1">
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Auto YTD Reconciliation (December)</p>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5">Automatically run YTD PAYE reconciliation when generating December payroll. Ensures annual totals match FIRS Form A.</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> ON
                  </div>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Block December Submission Until YTD Reconciled</p>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5">When on, December payroll cannot be submitted until all employees have been YTD-reconciled.</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> ON
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* AUDIT & PAYSLIP */}
            <GlassCard>
              <div className="p-6 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-slate-500 rounded-full" />
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">AUDIT & PAYSLIP</h3>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 tracking-widest">RECORD RETENTION PERIOD AND PAYSLIP PDF FORMAT</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-1">
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Audit Log Retention (days)</p>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5">FIRS requires payroll records for 6 years (2,190 days). Records older than this may be archived.</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">2190</span>
                    <span className="text-[10px] font-black text-slate-400">days</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Adjustment Review Threshold (%)</p>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5">Manual adjustments above this % of base salary trigger a review_required flag on the payroll run.</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">5</span>
                    <span className="text-[10px] font-black text-slate-400">%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Payslip Paper Size</p>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5">PDF paper size for generated payslips.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 cursor-pointer w-24 justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">A4</span>
                    <span className="text-slate-400 text-[10px]">?</span>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* ACTIVE TAX RULE */}
            <GlassCard>
              <div className="p-6 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">ACTIVE TAX RULE</h3>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 tracking-widest">NIGERIA PAYE 2026 (FINANCE ACT 2025) � EFFECTIVE 2026-01-01</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/10">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">TAX-FREE THRESHOLD</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{symbol}800,000</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/10">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">PENSION EMPLOYEE</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">8.0%</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/10">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">PENSION EMPLOYER</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">10.0%</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/10">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">NHF RATE</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">2.5%</p>
                  </div>
                </div>
                <button className="text-[10px] font-black text-[#0047cc] uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity">
                  <span className="text-[8px]">?</span> SHOW PAYE BANDS
                </button>
              </div>
            </GlassCard>

            {/* TAX RULE VERSIONS */}
            <GlassCard>
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-[#0047cc] rounded-full" />
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">TAX RULE VERSIONS</h3>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 tracking-widest">HISTORICAL AND ACTIVE PAYE RULE SETS � ACTIVATE TO SWITCH</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="px-4 py-2 bg-[#0047cc] text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-[#e0f2fe]0/20 hover:scale-105 transition-all flex items-center gap-2">
                    <Plus size={12} strokeWidth={3} /> NEW RULE
                  </button>
                  <button className="text-[10px] font-black text-[#0047cc] uppercase tracking-widest flex items-center gap-1 hover:opacity-70 transition-opacity">
                    <span className="text-[8px]">?</span> SHOW ALL
                  </button>
                </div>
              </div>
            </GlassCard>

            {/* FIRS FORM A */}
            <GlassCard>
              <div className="p-6 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">FIRS FORM A � ANNUAL PAYE RETURN</h3>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 tracking-widest">GENERATE AND EXPORT THE ANNUAL PAYE RETURN FOR E-TAX PORTAL UPLOAD</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">TAX YEAR</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-6 py-3 rounded-xl border border-slate-200 dark:border-white/10 w-32 justify-center">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">2026</span>
                  </div>
                  <button className="px-6 py-3 bg-[#0047cc] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-[#e0f2fe]0/20 hover:scale-105 transition-all flex items-center gap-2">
                    <Download size={14} strokeWidth={3} /> GENERATE
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>

      {/* Create Payroll Modal */}
      <AnimatePresence>
        {isCreatePayrollModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreatePayrollModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              data-demo-id="payroll-processing-modal"
              className="relative w-full max-w-2xl bg-white dark:bg-[#0f1120] rounded-[48px] border border-white/10 shadow-[0_32px_128px_rgba(0,0,0,0.5)] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#0047cc] to-transparent opacity-50" />
              
              <div className="p-5 sm:p-12 pb-6 flex justify-between items-start">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
                    RUN <span className="text-[#0047cc]">PAYROLL</span>
                  </h2>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-3 opacity-60">
                    Financial Cycle Disbursement Engine
                  </p>
                </div>
                <button 
                  onClick={() => setIsCreatePayrollModalOpen(false)}
                  className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all hover:rotate-90"
                >
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>

              <div className="p-5 sm:p-12 pt-6 space-y-10">
                <div className="grid grid-cols-2 gap-8">
                  {/* Period Selection */}
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      <Calendar size={12} className="text-[#0047cc]" /> Target Period
                    </label>
                    <select 
                      value={payrollForm.period}
                      onChange={e => setPayrollForm({...payrollForm, period: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/10 rounded-3xl px-8 py-5 text-sm text-slate-900 dark:text-white font-bold focus:border-[#0047cc] outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="April 2024">April 2024 (Open)</option>
                      <option value="May 2024">May 2024 (Upcoming)</option>
                    </select>
                  </div>

                  {/* Branch Filter */}
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      <Filter size={12} className="text-[#0047cc]" /> Workforce Scope
                    </label>
                    <select 
                      value={payrollForm.branch}
                      onChange={e => setPayrollForm({...payrollForm, branch: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/10 rounded-3xl px-8 py-5 text-sm text-slate-900 dark:text-white font-bold focus:border-[#0047cc] outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="ALL BRANCHES">All Global Branches</option>
                      <option value="HEADQUARTERS">Lagos HQ</option>
                      <option value="ABUJA">Abuja Branch</option>
                    </select>
                  </div>
                </div>

                {/* Summary Card */}
                <div className="bg-slate-50 dark:bg-white/5 rounded-[32px] p-8 border border-white/5">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pre-Run Estimate</h4>
                    <span className="text-[10px] font-black text-[#10b981] bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest">All Rules Applied</span>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">10</p>
                      <p className="text-[9px] text-slate-500 font-black uppercase mt-2 tracking-widest">Employees</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{symbol}4.8M+</p>
                      <p className="text-[9px] text-slate-500 font-black uppercase mt-2 tracking-widest">Est. Net Pay</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{symbol}1.2M+</p>
                      <p className="text-[9px] text-slate-500 font-black uppercase mt-2 tracking-widest">Statutory Liab.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="flex-1 py-8 rounded-[28px] text-base font-black uppercase tracking-[0.2em] relative overflow-hidden group shadow-2xl shadow-blue-600/20"
                    onClick={handleRunPayroll}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>PROCESSING CYCLE...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <CheckCircle2 size={20} />
                        <span>INITIATE PAYROLL RUN</span>
                      </div>
                    )}
                    <motion.div 
                       className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
                    />
                  </Button>
                </div>

                <p className="text-center text-[9px] text-slate-500 font-black uppercase tracking-[0.1em] opacity-40">
                  Secure disbursement channel � Audited by HRcopilot Engine v4.0
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Payroll;



