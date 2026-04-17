import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palmtree, Hourglass, CheckCircle2, X, Calendar, PartyPopper, Plus } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  AreaChart, Area
} from 'recharts';
import { DEMO_LEAVE_REQUESTS, DEMO_LEAVE_BALANCES, DEMO_DASHBOARD_KPIS } from '../demoData';

const LEAVE_STATS = [
  { label: 'Employees on Leave Today',    val: String(DEMO_DASHBOARD_KPIS.onLeaveToday),          Icon: Palmtree,     action: 'View List', color: 'border-l-emerald-500', accent: '#10b981' },
  { label: 'Pending Leave Requests',      val: String(DEMO_DASHBOARD_KPIS.pendingLeaveRequests),   Icon: Hourglass,    action: 'View List', color: 'border-l-amber-500',   accent: '#f59e0b' },
  { label: 'Approved This Month',         val: String(DEMO_LEAVE_REQUESTS.filter(r => r.status === 'APPROVED').length), delta: '+3 from last month', Icon: CheckCircle2, color: 'border-l-[#0047cc]', accent: '#0047cc' },
  { label: 'Rejected Requests',           val: String(DEMO_LEAVE_REQUESTS.filter(r => r.status === 'REJECTED').length), delta: '-2 from last month', Icon: X,            color: 'border-l-rose-500', accent: '#ef4444' },
  { label: 'Upcoming Leaves Next 7 Days', val: String(DEMO_LEAVE_REQUESTS.filter(r => r.status === 'PENDING').length), Icon: Calendar,     action: 'View List', color: 'border-l-[#0035a0]', accent: '#0035a0' },
];

const PENDING_REQUESTS = DEMO_LEAVE_REQUESTS
  .filter(r => r.status === 'PENDING')
  .slice(0, 5)
  .map(r => ({ id: r.id, name: r.employeeName, type: r.type, avatar: r.avatar, dates: `${r.startDate.slice(5).replace('-', ' ')} - ${r.endDate.slice(5).replace('-', ' ')}` }));

const LEAVE_BALANCE_DATA = DEMO_LEAVE_BALANCES.slice(0, 5).map(b => ({
  name: b.employeeName,
  dept: DEMO_LEAVE_REQUESTS.find(r => r.employeeId === b.employeeId)?.department ?? 'HR',
  type: 'Annual',
  duration: '20 days',
  usage: b.annual.used,
  expiry: '01/01/2027',
  avatar: `https://picsum.photos/40/40?sig=${b.employeeId}`,
}));

const ANALYTICS_PIE = [
  { name: 'Annual',    value: DEMO_LEAVE_REQUESTS.filter(r => r.type === 'Annual Leave').length,  color: '#0047cc' },
  { name: 'Sick',      value: DEMO_LEAVE_REQUESTS.filter(r => r.type === 'Sick Leave').length,    color: '#f59e0b' },
  { name: 'Casual',    value: DEMO_LEAVE_REQUESTS.filter(r => r.type === 'Casual Leave').length,  color: '#10b981' },
  { name: 'Maternity', value: DEMO_LEAVE_REQUESTS.filter(r => r.type === 'Maternity').length,     color: '#ef4444' },
];

const ANALYTICS_BAR = [
  { name: 'Eng',   value: 75, fill: '#0047cc' },
  { name: 'Sales', value: 45, fill: '#0047cc' },
  { name: 'Mkt',   value: 90, fill: '#10b981' },
  { name: 'HR',    value: 30, fill: '#f59e0b' },
];

const Leave: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Leave Dashboard');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    type: 'Annual Leave',
    start: '',
    end: '',
    reason: ''
  });

  const handleApply = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsApplyModalOpen(false);
      setLeaveForm({ type: 'Annual Leave', start: '', end: '', reason: '' });
    }, 1500);
  };

  const tabs = [
    'Leave Dashboard',
    'Leave Requests',
    'Leave Policies',
    'Absence Tracking',
    'Holiday Calendar'
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="page-header text-slate-900 dark:text-white">Leave <span className="text-[#0047cc]">Management</span></h2>
        </div>
         <Button 
            variant="primary" 
            size="md" 
            onClick={() => setIsApplyModalOpen(true)}
          >
            Apply Leave <Plus size={12} className="inline ml-1" />
          </Button>
       </div>

      {/* Tab Nav */}
      <div className="tab-nav border-b border-slate-200 dark:border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-[10px] font-black uppercase tracking-widest relative transition-all whitespace-nowrap flex-shrink-0 px-1 mr-4 sm:mr-6 ${activeTab === tab ? 'text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0047cc] shadow-[0_0_8px_#0047cc]" />}
          </button>
        ))}
      </div>

      {/* Main Content Areas */}
      <div className="animate-in slide-in-from-bottom-2 duration-500">
        
        {activeTab === 'Leave Dashboard' && (
          <div className="space-y-6">
            {/* Summary Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {LEAVE_STATS.map((stat, idx) => (
                <GlassCard key={idx} accentColor={stat.accent} className="!p-4 cursor-default">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-tight">{stat.label}</p>
                    <stat.Icon size={14} className="opacity-40" />
                  </div>
                  <p className="text-2xl font-black tracking-tighter leading-none text-slate-900 dark:text-white">{stat.val}</p>
                  {stat.delta ? (
                    <p className="text-[8px] font-bold text-amber-500 mt-2">{stat.delta}</p>
                  ) : (
                    <button className="text-[8px] font-black text-[#0047cc] uppercase tracking-widest mt-2 hover:underline">{stat.action} &gt;</button>
                  )}
                </GlassCard>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 space-y-6">
                <GlassCard title="April 2024" className="overflow-hidden" action={
                  <div className="flex gap-2">
                     {['Month', 'Week', 'Today'].map(p => (
                       <button key={p} className="px-3 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">{p}</button>
                     ))}
                  </div>
                }>
                  <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
                     {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                       <div key={d} className="bg-slate-50 dark:bg-[#0f172a] p-3 text-center text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-white/5">{d}</div>
                     ))}
                     {Array.from({ length: 35 }).map((_, i) => {
                       const day = i - 6;
                       const isTomLeave = day >= 15 && day <= 16;
                       const isSamLeave = day === 24;
                       const isToday = day === 23;
                       return (
                         <div key={i} className={`bg-white dark:bg-[#0f172a] h-20 p-2 border-r border-b border-slate-100 dark:border-white/5 relative hover:bg-slate-50 dark:hover:bg-slate-50/50 dark:bg-white/[0.01] transition-colors ${day <= 0 || day > 30 ? 'opacity-20' : ''}`}>
                            <span className={`text-[10px] font-bold ${isToday ? 'bg-[#f59e0b] text-white w-5 h-5 flex items-center justify-center rounded-full' : 'text-slate-500'}`}>{day > 0 && day <= 30 ? day : ''}</span>
                            {isTomLeave && day === 15 && (
                              <div className="absolute top-8 left-0 w-[200%] h-6 bg-slate-200 dark:bg-slate-500/20 border-l-2 border-slate-400 rounded-r-lg z-10 p-1 flex items-center gap-1">
                                 <img src="https://picsum.photos/20/20?sig=tom" className="w-4 h-4 rounded-full" />
                                 <span className="text-[8px] font-black text-slate-700 dark:text-white truncate">Tom Green</span>
                              </div>
                            )}
                         </div>
                       );
                     })}
                  </div>
                </GlassCard>

                <GlassCard title="Leave Balance Overview" action={<button className="text-[10px] font-black text-[#0047cc] uppercase tracking-widest border border-[#0047cc]/20 px-3 py-1.5 rounded-lg">Export CSV</button>}>
                  <div className="table-wrap">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
                             <th className="px-4 py-4">Employee</th>
                             <th className="px-4 py-4">Department</th>
                             <th className="px-4 py-4">Leave Type</th>
                             <th className="px-4 py-4">Usage</th>
                             <th className="px-4 py-4 text-right">Expiry Date</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {LEAVE_BALANCE_DATA.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:bg-white/[0.02] transition-colors">
                              <td className="px-4 py-4 flex items-center gap-3">
                                 <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 border border-slate-200 dark:border-white/10"><img src={row.avatar} className="w-full h-full object-cover" alt="" /></div>
                                 <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">{row.name}</span>
                              </td>
                              <td className="px-4 py-4 text-xs text-slate-400">{row.dept}</td>
                              <td className="px-4 py-4">
                                 <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${row.type === 'Annual' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{row.type}</span>
                              </td>
                              <td className="px-4 py-4 text-xs font-bold text-slate-900 dark:text-white">{row.usage} days</td>
                              <td className="px-4 py-4 text-xs text-slate-500 text-right font-mono">{row.expiry}</td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                  </div>
                </GlassCard>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <GlassCard title="Pending Requests" action={<span className="text-slate-500 font-black text-sm">8</span>}>
                   <div className="space-y-4">
                      {PENDING_REQUESTS.map((req) => (
                        <div key={req.id} className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                           <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-slate-200 dark:border-white/10"><img src={req.avatar} className="w-full h-full object-cover" alt="" /></div>
                              <div>
                                 <p className="text-[11px] font-black text-slate-900 dark:text-white">{req.name}</p>
                                 <p className="text-[9px] text-slate-500 font-bold uppercase">{req.dates}</p>
                              </div>
                           </div>
                           <div className="flex gap-1 self-end sm:self-auto">
                              <Button variant="success" size="sm">Approve</Button>
                              <Button variant="danger" size="sm">Reject</Button>
                           </div>
                        </div>
                      ))}
                   </div>
                </GlassCard>

                <GlassCard title="Leave Analytics">
                   <div className="h-48 relative">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                         <PieChart>
                            <Pie data={ANALYTICS_PIE} innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                               {ANALYTICS_PIE.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip />
                         </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <span className="text-2xl font-black text-slate-900 dark:text-white">375</span>
                         <span className="text-[8px] text-slate-500 font-black uppercase">Total Days</span>
                      </div>
                   </div>
                </GlassCard>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Leave Requests' && (
          <GlassCard className="!p-0 overflow-hidden">
             <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-white/5 flex flex-wrap gap-2 sm:gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-2">
                   {['All Status', 'Pending', 'Approved', 'Rejected'].map(s => (
                     <button key={s} className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">{s}</button>
                   ))}
                </div>
                <div className="relative w-full sm:w-auto">
                   <input type="text" placeholder="Search requests..." className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg py-1.5 px-4 text-[11px] text-slate-300 w-full sm:w-64 focus:outline-none focus:border-[#0047cc]/50" />
                </div>
             </div>
             <div className="table-wrap">
                <table className="w-full text-left">
                   <thead>
                      <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
                         <th className="px-6 py-4">Employee</th>
                         <th className="px-6 py-4">Leave Type</th>
                         <th className="px-6 py-4">Duration</th>
                         <th className="px-6 py-4">Status</th>
                         <th className="px-6 py-4">Applied On</th>
                         <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {DEMO_LEAVE_REQUESTS.map((req, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:bg-white/[0.02] transition-colors group">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <img src={req.avatar} className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10" alt="" />
                                 <div>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">{req.employeeName}</p>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{req.department ?? ''}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <span className="text-xs font-bold text-slate-500 dark:text-slate-300">{req.type}</span>
                           </td>
                           <td className="px-6 py-4">
                              <div className="text-xs font-black text-slate-900 dark:text-white">{req.days} Days</div>
                              <div className="text-[9px] text-slate-500 font-bold">{req.startDate} � {req.endDate}</div>
                           </td>
                           <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                                req.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400' :
                                'bg-amber-500/10 text-amber-400'
                              }`}>
                                 {req.status}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-xs text-slate-400 font-mono tracking-tighter">{req.appliedOn}</td>
                           <td className="px-6 py-4 text-right">
                              <button className="text-[10px] font-black text-[#0047cc] uppercase tracking-widest hover:underline">Review Request</button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </GlassCard>
        )}

        {activeTab === 'Leave Policies' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[
               { title: 'Annual Leave', quota: '25 Days', accrual: 'Monthly (2.08 days)', carry: 'Max 10 days', color: 'border-t-blue-500' },
               { title: 'Sick Leave', quota: '12 Days', accrual: 'Annual upfront', carry: 'Non-cumulative', color: 'border-t-emerald-500' },
               { title: 'Casual Leave', quota: '8 Days', accrual: 'Pro-rata', carry: 'Non-cumulative', color: 'border-t-amber-500' },
               { title: 'Maternity Leave', quota: '90 Days', accrual: 'Per incident', carry: 'N/A', color: 'border-t-[#e0f2fe]0' },
               { title: 'Paternity Leave', quota: '10 Days', accrual: 'Per incident', carry: 'N/A', color: 'border-t-rose-500' },
               { title: 'Study Leave', quota: '5 Days', accrual: 'Approval based', carry: 'N/A', color: 'border-t-slate-500' },
             ].map((policy, i) => (
                <GlassCard key={i} className={`border-t-4 ${policy.color}`}>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">{policy.title}</h4>
                  <div className="space-y-3">
                     <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-500 uppercase tracking-widest">Yearly Quota</span>
                        <span className="text-slate-900 dark:text-white">{policy.quota}</span>
                     </div>
                     <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-500 uppercase tracking-widest">Accrual Method</span>
                        <span className="text-slate-600 dark:text-slate-300">{policy.accrual}</span>
                     </div>
                     <div className="flex justify-between items-center text-[10px] font-bold pb-4">
                        <span className="text-slate-500 uppercase tracking-widest">Carry Forward</span>
                        <span className="text-slate-600 dark:text-slate-300">{policy.carry}</span>
                     </div>
                     <button className="w-full pt-4 border-t border-slate-100 dark:border-white/5 text-[10px] font-black text-[#0047cc] uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors">Edit Policy Details</button>
                  </div>
               </GlassCard>
             ))}
          </div>
        )}

        {activeTab === 'Absence Tracking' && (
          <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlassCard title="Unplanned Absence Rate" className="text-center">
                   <div className="text-4xl font-black text-rose-500 my-2">4.2%</div>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Target: &lt;3%</p>
                </GlassCard>
                <GlassCard title="Absenteeism Heatmap" className="md:col-span-2">
                   <div className="h-24 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Presence Trends across days of the week
                   </div>
                </GlassCard>
             </div>
             
             <GlassCard title="Staffing Coverage Matrix (Real-time)" className="!p-0 overflow-hidden">
                <div className="table-wrap">
                   <div className="min-w-[1000px] p-6">
                      <div className="flex gap-1 mb-2">
                         <div className="w-48 flex-shrink-0" />
                         {Array.from({length: 31}).map((_, i) => (
                           <div key={i} className="flex-1 text-center text-[9px] font-black text-slate-600 uppercase">{i+1}</div>
                         ))}
                      </div>
                      {['Engineering', 'Sales', 'Marketing', 'Customer Success'].map((dept, i) => (
                        <div key={dept} className="flex gap-1 mb-1 items-center">
                           <div className="w-48 flex-shrink-0 text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest border-r border-slate-100 dark:border-white/5 mr-2">{dept}</div>
                           {Array.from({length: 31}).map((_, j) => {
                             const isWeekend = j % 7 >= 5;
                             const hasAbsence = Math.random() > 0.9;
                             return (
                               <div key={j} className={`flex-1 h-6 rounded-sm ${isWeekend ? 'bg-slate-100 dark:bg-white/5' : hasAbsence ? 'bg-rose-500/40 border border-rose-500/20' : 'bg-emerald-500/10 border border-emerald-500/5'}`} />
                             );
                           })}
                        </div>
                      ))}
                   </div>
                </div>
                <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex justify-between items-center">
                   <div className="flex gap-4">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-sm bg-emerald-500/40" /> <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Fully Staffed</span></div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-sm bg-rose-500/40" /> <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Understaffed Warning</span></div>
                   </div>
                </div>
             </GlassCard>
          </div>
        )}

        {activeTab === 'Holiday Calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2">
                <GlassCard title="2024 Global Holidays">
                   <div className="space-y-2">
                      {[
                        { date: 'Jan 01', name: 'New Year\'s Day', type: 'Global', desc: 'Mandatory non-working day across all branches.' },
                        { date: 'Mar 29', name: 'Good Friday', type: 'Regional', desc: 'Observed in EU and Americas branches.' },
                        { date: 'Apr 01', name: 'Easter Monday', type: 'Regional', desc: 'Observed in EU and Americas branches.' },
                        { date: 'May 01', name: 'Labor Day', type: 'Global', desc: 'Mandatory non-working day.' },
                        { date: 'Jul 04', name: 'Independence Day', type: 'USA Only', desc: 'Observed in US branches only.' },
                        { date: 'Dec 25', name: 'Christmas Day', type: 'Global', desc: 'Year-end holiday closure.' },
                      ].map((holiday, i) => (
                        <div key={i} className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl flex items-center gap-6 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all">
                           <div className="w-16 h-16 rounded-xl bg-[#0047cc]/10 border border-[#0047cc]/20 flex flex-col items-center justify-center">
                              <span className="text-[9px] font-black text-[#0047cc] uppercase tracking-widest">{holiday.date.split(' ')[0]}</span>
                              <span className="text-xl font-black text-slate-900 dark:text-white">{holiday.date.split(' ')[1]}</span>
                           </div>
                           <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                 <h5 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{holiday.name}</h5>
                                 <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[8px] font-black uppercase text-slate-500 border border-slate-200 dark:border-white/10">{holiday.type}</span>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-1">{holiday.desc}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </GlassCard>
             </div>
             <div className="space-y-6">
                <GlassCard title="Next Holiday Pulse" className="!bg-[#0047cc]/10 border-[#0047cc]/20 text-center !p-10">
                   <div className="flex justify-center mb-4"><PartyPopper size={40} className="text-[#0047cc]" /></div>
                   <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-1">Labor Day</h4>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6">In 12 Days (May 01)</p>
                   <div className="h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden mb-8">
                      <div className="h-full bg-emerald-500" style={{ width: '82%' }} />
                   </div>
                   <button className="w-full py-2.5 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all shadow-xl">Announce To Team</button>
                </GlassCard>
                <GlassCard title="Holiday Compliance">
                   <p className="text-[11px] text-slate-400 leading-relaxed mb-4">Ensure all regional specific mandatory holidays are synced with branch-specific attendance rules.</p>
                   <button className="w-full py-2 bg-slate-100 dark:bg-white/5 rounded-xl text-[10px] font-black uppercase text-slate-400 border border-slate-200 dark:border-white/10">Manage Branch Rules</button>
                </GlassCard>
             </div>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      <AnimatePresence>
        {isApplyModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsApplyModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-[40px] border border-slate-200 dark:border-white/10 shadow-2xl shadow-black/50 overflow-hidden"
            >
              <div className="p-4 sm:p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Request <span className="text-[#0047cc]">Leave</span></h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Submit Operational Absence Proposal</p>
                 </div>
                 <button 
                    onClick={() => setIsApplyModalOpen(false)}
                    className="p-2 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition-all"
                 >
                    <span className="text-xl">?</span>
                 </button>
              </div>

              <div className="p-4 sm:p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                 {/* Leave Type Selector */}
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1">Infrastructure Logic (Leave Type)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                       {['Annual Leave', 'Sick Leave', 'Casual Leave', 'Maternity'].map(type => (
                          <button 
                             key={type}
                             onClick={() => setLeaveForm({...leaveForm, type})}
                             className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${leaveForm.type === type ? 'bg-[#0047cc] border-transparent text-white ring-4 ring-blue-500/10' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:border-[#0047cc]/30'}`}
                          >
                             <p className="text-[10px] font-black uppercase tracking-tight">{type}</p>
                             {leaveForm.type === type && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
                          </button>
                       ))}
                    </div>
                 </div>

                 {/* Date Range Controls */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1">Commencement Date</label>
                       <input 
                          type="date" 
                          value={leaveForm.start}
                          onChange={e => setLeaveForm({...leaveForm, start: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-xs text-slate-900 dark:text-white font-bold focus:border-[#0047cc] outline-none transition-all appearance-none" 
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1">Resumption Date</label>
                       <input 
                          type="date" 
                          value={leaveForm.end}
                          onChange={e => setLeaveForm({...leaveForm, end: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-xs text-slate-900 dark:text-white font-bold focus:border-[#0047cc] outline-none transition-all appearance-none" 
                       />
                    </div>
                 </div>

                 {/* Justification Area */}
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1">Request Justification & Notes</label>
                    <textarea 
                      placeholder="Provide contextual details for administrative review..."
                      value={leaveForm.reason}
                      onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})}
                      rows={4}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[32px] px-6 py-5 text-sm text-slate-900 dark:text-white focus:border-[#0047cc] outline-none transition-all resize-none placeholder:text-slate-400"
                    />
                 </div>
              </div>

              <div className="p-4 sm:p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex justify-end gap-4">
                 <button 
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-8 py-4 text-slate-500 hover:text-slate-900 dark:hover:text-white font-black text-[11px] uppercase tracking-widest transition-all"
                 >
                    Cancel
                 </button>
                 <Button 
                    variant="primary" 
                    size="md" 
                    onClick={handleApply}
                    disabled={isSubmitting || !leaveForm.start || !leaveForm.end}
                    className="px-12 relative overflow-hidden"
                 >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Transmitting...</span>
                      </div>
                    ) : 'Synchronize Request'}
                 </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Leave;



