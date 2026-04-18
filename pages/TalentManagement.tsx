import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, UserPlus, Briefcase, Mail, Phone, MapPin, Check, Users, MessageSquare, GraduationCap, Building2 } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { DEMO_JOB_OPENINGS, DEMO_CANDIDATES, DEMO_ONBOARDING } from '../demoData';

const CANDIDATE_STATS = [
  { name: 'New Applicants', count: DEMO_CANDIDATES.length, color: '#0047cc' },
  { name: 'Screening',      count: DEMO_CANDIDATES.filter(c => c.status === 'SCREENING').length,  color: '#0047cc' },
  { name: 'Assessment',     count: DEMO_CANDIDATES.filter(c => c.status === 'ASSESSMENT').length, color: '#f59e0b' },
  { name: 'Interview',      count: DEMO_CANDIDATES.filter(c => c.status === 'INTERVIEW').length,  color: '#10b981' },
  { name: 'Offer',          count: DEMO_CANDIDATES.filter(c => c.status === 'OFFER').length,      color: '#94a3b8' },
];

const CANDIDATE_CHART_DATA = DEMO_CANDIDATES.map(c => ({ name: c.name.split(' ')[0], val: c.score }));

const JOB_OPENINGS = DEMO_JOB_OPENINGS.map(j => ({
  title: j.title,
  openings: j.openings,
  applicants: j.applicants,
  updated: j.postedDate,
  status: j.status === 'OPEN' ? 'Open' : 'Closed',
  statusColor: j.status === 'OPEN' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}));

const ONBOARDING_PROGRESS = DEMO_ONBOARDING.map(o => ({
  title: o.title,
  dept: o.department,
  hires: o.newHires,
  remaining: o.tasksTotal - o.tasksCompleted,
  expiry: '01/01/2027',
  progress: Math.round((o.tasksCompleted / o.tasksTotal) * 100),
  avatar: `https://picsum.photos/32/32?sig=${o.id}`,
}));

const TalentManagement: React.FC = () => {
  const [isManualCreateModalOpen, setIsManualCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [candidateForm, setCandidateForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: 'Software Engineer',
    source: 'LinkedIn',
    status: 'Screening'
  });

  const handleManualCreate = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsManualCreateModalOpen(false);
      setCandidateForm({
        name: '',
        email: '',
        phone: '',
        position: 'Software Engineer',
        source: 'LinkedIn',
        status: 'Screening'
      });
    }, 1500);
  };
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Talent <span className="text-[#0047cc]">Management</span></h2>
        </div>
        <button 
          onClick={() => setIsManualCreateModalOpen(true)}
          className="w-full sm:w-auto px-5 py-2.5 bg-[#0047cc] hover:bg-[#0035a0] text-white font-black text-[11px] uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 group"
        >
          <Plus size={14} className="group-hover:rotate-90 transition-transform" strokeWidth={3} />
          Manual Create
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: 'Active Job Openings',        val: '14', footer: 'View All →', Icon: Briefcase,    color: 'text-[#0047cc]',    accent: '#0047cc' },
          { label: 'New Applicants',             val: '68', footer: '+25% vs last 30 days', Icon: Users, color: 'text-emerald-500', accent: '#10b981' },
          { label: 'Interviews Scheduled Today', val: '5',  footer: 'Today: 3',  Icon: MessageSquare, color: 'text-rose-500',      accent: '#ef4444' },
          { label: 'Active Onboarding Programs', val: '8',  footer: 'Front: 6',  Icon: GraduationCap, color: 'text-amber-500',     accent: '#f59e0b' },
          { label: 'Active Onshore Days',        val: '8',  footer: 'View List', Icon: Building2,     color: 'text-[#0047cc]',    accent: '#0035a0' },
        ].map((stat, i) => (
          <GlassCard key={i} accentColor={stat.accent} className="!p-4 group">
            <div className="flex justify-between items-center mb-3">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <stat.Icon size={14} className="opacity-40 group-hover:opacity-100 transition-all" />
            </div>
            <p className={`text-2xl font-black tracking-tighter leading-none ${stat.color}`}>{stat.val}</p>
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5">
              <span className={`text-[8px] font-black uppercase tracking-widest ${stat.color}`}>{stat.footer}</span>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Section */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Job Openings Table */}
          <GlassCard 
            title="Active Job Openings" 
            action={
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">+ Create Job</button>
                <button className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">Export ?</button>
              </div>
            }
          >
            <div className="table-wrap">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                    <th className="px-2 py-4">Job Title</th>
                    <th className="px-2 py-4">Openings</th>
                    <th className="px-2 py-4">Applicants</th>
                    <th className="px-2 py-4">Last Updated ?</th>
                    <th className="px-2 py-4">Status</th>
                    <th className="px-2 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {JOB_OPENINGS.map((job, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-2 py-4">
                        <p className="text-xs font-bold text-white tracking-tight">{job.title}</p>
                      </td>
                      <td className="px-2 py-4 text-xs font-bold text-slate-300">{job.openings}</td>
                      <td className="px-2 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{job.applicants}</span>
                          <div className="w-4 h-4 rounded bg-white/10 flex items-center justify-center text-[8px]">??</div>
                        </div>
                      </td>
                      <td className="px-2 py-4 text-[10px] text-slate-500 font-bold uppercase">{job.updated}</td>
                      <td className="px-2 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border ${job.statusColor}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-2 py-4 text-right">
                        <button className="text-slate-600 hover:text-white transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Onboarding Table Section */}
          <GlassCard 
            title="Active Onboarding" 
            className="!p-0 overflow-hidden"
            action={
              <div className="flex gap-4 items-center">
                 <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">New Hiros</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Detayl: 2</span>
                 </div>
                 <button className="text-slate-500 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2"/></svg>
                 </button>
              </div>
            }
          >
            <div className="table-wrap">
              <table className="w-full text-left">
                <thead className="bg-white/[0.01]">
                  <tr className="text-[8px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                    <th className="px-6 py-4">Job Title</th>
                    <th className="px-6 py-4">Department ?</th>
                    <th className="px-6 py-4">New Hires</th>
                    <th className="px-6 py-4">Remaining</th>
                    <th className="px-6 py-4">Expiry Date</th>
                    <th className="px-6 py-4">Progress</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ONBOARDING_PROGRESS.map((item, i) => (
                    <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg overflow-hidden flex-shrink-0 border border-white/10"><img src={item.avatar} className="w-full h-full object-cover" alt="" /></div>
                          <span className="text-[10px] font-bold text-white tracking-tight leading-tight">{item.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[8px] font-black text-slate-500 uppercase">{item.dept}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold text-slate-300">{item.hires} � 59</span>
                      </td>
                      <td className="px-6 py-4">
                         <div className="w-12 h-4 bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                            <div className="h-full bg-blue-500/40" style={{ width: '40%' }} />
                            <span className="absolute inset-0 flex items-center justify-center text-[7px] font-black text-blue-300">00%</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-[9px] font-mono text-slate-500">{item.expiry}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] font-black text-white">{item.progress}%</span>
                           <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-[#0047cc]" style={{ width: `${item.progress}%` }} />
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-600 hover:text-white transition-colors">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 flex justify-center items-center gap-4 border-t border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                 <span>1 � 3 of 20</span>
                 <div className="flex gap-1">
                    <button className="w-6 h-6 flex items-center justify-center bg-white/5 rounded-lg">�</button>
                    <button className="w-6 h-6 flex items-center justify-center bg-white/5 rounded-lg">�</button>
                 </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard title="Candidate Summary" action={<button className="text-[9px] font-black text-slate-500 uppercase bg-white/5 px-2 py-1 rounded-lg">All Clest Today ?</button>}>
            <div className="grid grid-cols-5 gap-2 mb-6">
               {CANDIDATE_STATS.map((stat, i) => (
                 <div key={i} className="text-center">
                    <p className="text-lg font-black text-white">{stat.count}</p>
                    <p className="text-[7px] text-slate-500 uppercase font-black leading-tight break-words">{stat.name}</p>
                 </div>
               ))}
            </div>
            
            {/* Funnel visualization */}
            <div className="flex h-12 gap-px rounded-xl overflow-hidden mb-6 border border-white/5">
               {CANDIDATE_STATS.map((stat, i) => (
                 <div 
                  key={i} 
                  className="h-full relative flex items-center justify-center group" 
                  style={{ backgroundColor: stat.color, opacity: 1 - (i * 0.15), flex: 5 - i }}
                 >
                    <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-[8px] font-black text-white rounded whitespace-nowrap z-10 border border-white/10">
                       {stat.name}: {stat.count}
                    </div>
                 </div>
               ))}
            </div>

            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={CANDIDATE_CHART_DATA}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 7, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', border: '1px solid var(--tooltip-border, #e2e8f0)', borderRadius: '8px', fontSize: '10px', color: 'var(--tooltip-color, #0f172a)' }} />
                  <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                    {CANDIDATE_CHART_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 4 ? '#f59e0b' : '#0047cc'} opacity={0.6} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-end mt-2">
               <button className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Date Rengs �</button>
            </div>
          </GlassCard>

          <GlassCard title="Onboarding Progress" action={<button className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg">Export ?</button>}>
            <p className="text-[10px] font-bold text-white uppercase tracking-tight mb-4">Onboarding Checklist Completeness</p>
            <div className="space-y-6">
               {[
                 { label: 'Documents Signed', progress: 92, color: 'bg-emerald-500' },
                 { label: 'Hardware Setup', progress: 66, color: 'bg-blue-500' },
                 { label: 'Knowledge Base Access', progress: 90, color: 'bg-[#e0f2fe]0' },
                 { label: 'Security Training', progress: 30, color: 'bg-rose-500' },
               ].map((item, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[8px] font-black uppercase text-slate-400">
                       <span>{item.label}</span>
                       <span className="text-white">{item.progress}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                       <div className={`h-full ${item.color} opacity-60`} style={{ width: `${item.progress}%` }} />
                    </div>
                 </div>
               ))}
            </div>
          </GlassCard>

          <GlassCard title="Recently Hired" action={<button className="text-[9px] font-black text-blue-400 uppercase tracking-widest hover:underline">View All �</button>}>
            <div className="space-y-4">
               {DEMO_CANDIDATES.filter(c => c.status === 'OFFER').concat(DEMO_CANDIDATES.filter(c => c.status === 'INTERVIEW')).slice(0, 2).map((hire, i) => (
                 <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-white/10"><img src={hire.avatar} className="w-full h-full object-cover" alt="" /></div>
                    <div className="flex-1">
                       <p className="text-xs font-bold text-white leading-tight">{hire.name}</p>
                       <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight mt-0.5">{hire.position}</p>
                    </div>
                    <span className="text-[8px] font-black text-slate-600 uppercase whitespace-nowrap">{hire.appliedDate}</span>
                 </div>
               ))}
            </div>
          </GlassCard>
        </div>
      </div>
      {/* Manual Create Modal */}
      <AnimatePresence>
        {isManualCreateModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsManualCreateModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#0f1120] rounded-[48px] border border-white/10 shadow-[0_32px_128px_rgba(0,0,0,0.5)] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 sm:p-10 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02]">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Manual <span className="text-[#0047cc]">Creation</span></h3>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Direct Candidate Provisioning</p>
                </div>
                <button 
                  onClick={() => setIsManualCreateModalOpen(false)}
                  className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                >
                  <Plus className="rotate-45" size={20} />
                </button>
              </div>

              <div className="p-10 grid grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1">Candidate Full Name</label>
                  <div className="relative">
                    <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Enter full name..."
                      value={candidateForm.name}
                      onChange={e => setCandidateForm({...candidateForm, name: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs text-slate-900 dark:text-white font-bold focus:border-[#0047cc] outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="email" 
                      placeholder="email@example.com"
                      value={candidateForm.email}
                      onChange={e => setCandidateForm({...candidateForm, email: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs text-slate-900 dark:text-white font-bold focus:border-[#0047cc] outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="tel" 
                      placeholder="+234 ..."
                      value={candidateForm.phone}
                      onChange={e => setCandidateForm({...candidateForm, phone: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs text-slate-900 dark:text-white font-bold focus:border-[#0047cc] outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1">Target Position</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select 
                      value={candidateForm.position}
                      onChange={e => setCandidateForm({...candidateForm, position: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs text-slate-900 dark:text-white font-bold focus:border-[#0047cc] outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option>Software Engineer</option>
                      <option>Product Manager</option>
                      <option>UI/UX Designer</option>
                      <option>Marketing Lead</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1">Initial Status</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select 
                      value={candidateForm.status}
                      onChange={e => setCandidateForm({...candidateForm, status: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs text-slate-900 dark:text-white font-bold focus:border-[#0047cc] outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option>Screening</option>
                      <option>Interview</option>
                      <option>Shortlisted</option>
                      <option>Offered</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-10 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex justify-end gap-4">
                <button 
                  onClick={() => setIsManualCreateModalOpen(false)}
                  className="px-8 py-4 text-slate-500 hover:text-slate-900 dark:hover:text-white font-black text-[11px] uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleManualCreate}
                  disabled={isSubmitting || !candidateForm.name}
                  className="px-12 py-4 bg-[#0047cc] text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 relative overflow-hidden group"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Check size={16} strokeWidth={3} />
                      <span>Create Candidate</span>
                    </div>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TalentManagement;



