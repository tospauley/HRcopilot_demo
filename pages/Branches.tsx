
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GlassCard from '../components/GlassCard';
import { Branch, BranchDevice } from '../types';
import GeofenceMap from '../components/GeofenceMap';
import { Map as MapIcon, List as ListIcon } from 'lucide-react';
import { DEMO_BRANCHES, DEMO_EMPLOYEES } from '../demoData';

// --- Simulated API Endpoints (backed by demoData) ---
const fetchBranchesApi = async (): Promise<Branch[]> => {
  await new Promise(r => setTimeout(r, 400));
  return DEMO_BRANCHES.map(b => ({
    ...b,
    address: `${b.city}, ${b.country}`,
    type: b.type as Branch['type'],
    status: b.status as Branch['status'],
  }));
};

const fetchBranchEmployeesApi = async (branchId: string) => {
  await new Promise(r => setTimeout(r, 400));
  return DEMO_EMPLOYEES
    .filter(e => e.branchId === branchId)
    .map(e => ({
      id: e.id,
      name: e.name,
      role: e.position,
      status: e.status,
      email: `${e.name.split(' ')[0].toLowerCase()}.${e.name.split(' ')[1].toLowerCase()}@HRcopilot.io`,
      avatar: e.avatar,
    }));
};

const fetchBranchAuditLogsApi = async (branchId: string) => {
  await new Promise(r => setTimeout(r, 300));
  const branch = DEMO_BRANCHES.find(b => b.id === branchId);
  return [
    { id: 'l1', event: 'Attendance Policy Updated', user: branch?.manager_name ?? 'System', timestamp: '2h ago' },
    { id: 'l2', event: 'New Device Registered', user: branch?.manager_name ?? 'System', timestamp: '1d ago' },
    { id: 'l3', event: 'Branch Status Verified Active', user: 'System', timestamp: '5d ago' },
  ];
};

const TIMEZONES = [
  'UTC', 'America/Los_Angeles', 'America/New_York', 'Europe/London', 'Europe/Paris', 'Africa/Lagos', 'Asia/Dubai', 'Asia/Singapore'
];

const Branches: React.FC = () => {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'LIST' | 'FORM' | 'DETAIL' | 'MAP'>('LIST');
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [detailTab, setDetailTab] = useState<'Overview' | 'Employees' | 'Devices' | 'Overrides' | 'Audit'>('Overview');

  // React Query: Main List
  const { data: branches = [], isLoading: isListLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: fetchBranchesApi,
    staleTime: 60000,
  });

  const selectedBranch = useMemo(() => 
    branches.find(b => b.id === selectedBranchId) || null
  , [branches, selectedBranchId]);

  // React Query: Sub-Resources (Detail View)
  const { data: employees = [], isLoading: isEmployeesLoading } = useQuery({
    queryKey: ['branch-employees', selectedBranchId],
    queryFn: () => fetchBranchEmployeesApi(selectedBranchId!),
    enabled: !!selectedBranchId && detailTab === 'Employees',
  });

  const { data: auditLogs = [], isLoading: isAuditLoading } = useQuery({
    queryKey: ['branch-audit', selectedBranchId],
    queryFn: () => fetchBranchAuditLogsApi(selectedBranchId!),
    enabled: !!selectedBranchId && detailTab === 'Audit',
  });

  // Filtered Data for List View
  const filteredBranches = useMemo(() => {
    return branches.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           b.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'All' || b.type === filterType;
      const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [branches, searchTerm, filterType, filterStatus]);

  // Form State
  const [formBranch, setFormBranch] = useState<Partial<Branch>>({});

  const handleEdit = (branch: Branch) => {
    setFormBranch(branch);
    setView('FORM');
  };

  const handleCreate = () => {
    setFormBranch({ type: 'Regional', status: 'Active', is_hq: false, timezone: 'UTC' });
    setView('FORM');
  };

  const handleViewDetail = (id: string) => {
    setSelectedBranchId(id);
    setDetailTab('Overview');
    setView('DETAIL');
  };

  const handleArchive = useMutation({
    mutationFn: async (id: string) => {
       await new Promise(r => setTimeout(r, 400));
       console.log('Archived branch:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    }
  });

  if (view === 'FORM') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
        <div className="flex justify-between items-center px-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">
              {formBranch.id ? 'Configure' : 'Provision'} <span className="text-[#0047cc]">Branch</span>
            </h2>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1 italic">Identity-Bound Workspace Governance</p>
          </div>
          <button 
            onClick={() => setView('LIST')}
            className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all"
          >
            Cancel
          </button>
        </div>

        <GlassCard className="!p-8 border-t-4 border-t-[#0047cc]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Display Name</label>
                  <input 
                    type="text" 
                    value={formBranch.name || ''} 
                    onChange={e => setFormBranch({...formBranch, name: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-3.5 text-sm text-slate-900 dark:text-white focus:border-[#0047cc] outline-none transition-all placeholder:text-slate-400" 
                    placeholder="e.g. London Tech Center" 
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Branch Code</label>
                    <input 
                      type="text" 
                      value={formBranch.code || ''}
                      onChange={e => setFormBranch({...formBranch, code: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3.5 text-sm text-slate-900 dark:text-white font-mono uppercase focus:border-[#0047cc] outline-none" 
                      placeholder="LON-01" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Timezone</label>
                    <select 
                      value={formBranch.timezone || 'UTC'}
                      onChange={e => setFormBranch({...formBranch, timezone: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3.5 text-xs text-slate-900 dark:text-white focus:border-[#0047cc] outline-none appearance-none cursor-pointer"
                    >
                      {TIMEZONES.map(tz => <option key={tz} value={tz} className="bg-white dark:bg-[#0d0a1a] text-slate-900 dark:text-white">{tz}</option>)}
                    </select>
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Primary Address</label>
                  <textarea 
                    value={formBranch.address || ''}
                    onChange={e => setFormBranch({...formBranch, address: e.target.value})}
                    rows={3} 
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-3.5 text-sm text-slate-900 dark:text-white focus:border-[#0047cc] outline-none transition-all resize-none placeholder:text-slate-400" 
                    placeholder="Full street address..." 
                  />
               </div>
            </div>
            
            <div className="space-y-6">
               <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Classification</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['HQ', 'Regional', 'Satellite', 'Virtual'].map(t => (
                      <button 
                        key={t} 
                        onClick={() => setFormBranch({...formBranch, type: t as any})}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formBranch.type === t ? 'bg-[#0047cc] border-transparent text-white shadow-lg' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
               </div>
               <div className="p-6 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase italic">Designate Corporate HQ</p>
                        <p className="text-[9px] text-slate-600 dark:text-slate-500 font-bold uppercase">Unlocks global control parameters</p>
                     </div>
                     <button 
                        onClick={() => setFormBranch({...formBranch, is_hq: !formBranch.is_hq})}
                        className={`w-12 h-6 rounded-full p-1 transition-all flex items-center ${formBranch.is_hq ? 'bg-amber-500 justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'}`}
                     >
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                     </button>
                  </div>
               </div>
               <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 rounded-[32px] gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-3xl opacity-40">???</div>
                  <p className="text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase text-center italic leading-relaxed">Identity nodes must be sync-ready.<br/>Verification required during deployment.</p>
               </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-12 pt-8 border-t border-slate-100 dark:border-white/5">
             <button onClick={() => setView('LIST')} className="px-8 py-3.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-black text-[11px] uppercase tracking-widest transition-all">Discard</button>
             <button 
                onClick={() => setView('LIST')}
                className="px-12 py-3.5 bg-emerald-500 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
             >
                Deploy Configuration
             </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (view === 'DETAIL' && selectedBranch) {
    return (
      <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('LIST')} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" /></svg>
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">{selectedBranch.name}</h2>
              <span className="px-3 py-1 bg-[#0047cc]/10 border border-[#0047cc]/20 text-[#0047cc] text-[10px] font-black uppercase rounded-full">{selectedBranch.code}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 italic">Operating since Jan 2024 � Managed by {selectedBranch.manager_name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1 space-y-6">
            <GlassCard title="Node Metadata" className="!p-5 border-l-4 border-l-[#0047cc]">
               <div className="space-y-4">
                 <div className="flex gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl shadow-inner">??</div>
                   <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Classification</p>
                      <p className="text-sm font-bold text-white tracking-tight">{selectedBranch.type} Hub</p>
                   </div>
                 </div>
                 <div className="pt-4 border-t border-white/5 space-y-3">
                   <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Global Address</p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{selectedBranch.address}, {selectedBranch.city}, {selectedBranch.country}</p>
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Temporal Logic</p>
                      <p className="text-xs text-slate-400 mt-1">{selectedBranch.timezone}</p>
                   </div>
                 </div>
               </div>
            </GlassCard>

            <GlassCard title="Engagement Today" className="!p-5">
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
                     <p className="text-[20px] font-black text-emerald-400">{selectedBranch.attendance_today.present}</p>
                     <p className="text-[8px] font-black text-slate-500 uppercase">Synchronized</p>
                  </div>
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-center">
                     <p className="text-[20px] font-black text-amber-400">{selectedBranch.attendance_today.late}</p>
                     <p className="text-[8px] font-black text-slate-500 uppercase">Latency</p>
                  </div>
               </div>
               <div className="mt-4 p-3 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-500 uppercase">Absences</span>
                  <span className="text-xs font-black text-rose-400">{selectedBranch.attendance_today.absent}</span>
               </div>
            </GlassCard>
          </aside>

          <main className="lg:col-span-3 space-y-6">
            <div className="flex gap-2 border-b border-white/5 overflow-x-auto">
              {['Overview', 'Employees', 'Devices', 'Overrides', 'Audit'].map((t: any) => (
                <button 
                  key={t}
                  onClick={() => setDetailTab(t)}
                  className={`pb-4 px-6 text-[10px] font-black uppercase tracking-widest relative transition-all whitespace-nowrap ${detailTab === t ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {t}
                  {detailTab === t && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0047cc] shadow-[0_0_12px_#0047cc]" />}
                </button>
              ))}
            </div>

            <div className="animate-in fade-in duration-500">
               {detailTab === 'Overview' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <GlassCard title="Identity Distribution">
                      <div className="h-64 flex flex-col justify-center items-center relative">
                        <div className="w-40 h-40 rounded-full border-[8px] border-white/5 flex items-center justify-center relative">
                           <div className="absolute inset-0 rounded-full border-[8px] border-[#eff6ff]0 border-t-transparent -rotate-45" />
                           <div className="text-center">
                              <p className="text-4xl font-black text-white">{selectedBranch.employee_count}</p>
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Nodes</p>
                           </div>
                        </div>
                        <div className="mt-8 flex gap-6">
                           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#eff6ff]0" /> <span className="text-[9px] font-black text-slate-400 uppercase">Core</span></div>
                           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-500" /> <span className="text-[9px] font-black text-slate-400 uppercase">Provisioning</span></div>
                        </div>
                      </div>
                   </GlassCard>
                   <GlassCard title="Asset Integrity">
                      <div className="space-y-4">
                         <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="flex gap-3 items-center">
                               <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xl shadow-lg">??</div>
                               <div>
                                  <p className="text-xs font-bold text-white uppercase tracking-tight">Sync State</p>
                                  <p className="text-[9px] text-slate-500 font-bold uppercase">Infrastructure OK</p>
                               </div>
                            </div>
                            <span className="text-xs font-black text-emerald-400">99.8%</span>
                         </div>
                         <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="flex gap-3 items-center">
                               <div className="w-10 h-10 rounded-xl bg-[#0047cc]/10 flex items-center justify-center text-xl shadow-lg">???</div>
                               <div>
                                  <p className="text-xs font-bold text-white uppercase tracking-tight">MFA Compliance</p>
                                  <p className="text-[9px] text-slate-500 font-bold uppercase">Global Mandate</p>
                               </div>
                            </div>
                            <span className="text-xs font-black text-[#0047cc]">84.2%</span>
                         </div>
                      </div>
                   </GlassCard>
                 </div>
               )}

               {detailTab === 'Employees' && (
                 <GlassCard className="!p-0 overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                       <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Assigned Workforce</h4>
                       <button className="px-4 py-1.5 bg-[#0047cc]/10 border border-[#0047cc]/20 text-[#0047cc] text-[9px] font-black uppercase rounded-lg hover:bg-[#0047cc] hover:text-white transition-all">Reassign Node</button>
                    </div>
                    {isEmployeesLoading ? (
                      <div className="p-5 sm:p-12 text-center animate-pulse text-slate-500 uppercase text-[10px] font-black italic">Synchronizing Employees...</div>
                    ) : (
                      <div className="table-wrap">
                        <table className="w-full text-left">
                          <thead>
                             <tr className="text-[9px] font-black text-slate-500 uppercase border-b border-white/5">
                               <th className="px-6 py-4">Identity</th>
                               <th className="px-6 py-4">Professional Role</th>
                               <th className="px-6 py-4">Status</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                             {employees.map((emp: any) => (
                               <tr key={emp.id} className="hover:bg-white/[0.02] transition-colors group">
                                 <td className="px-6 py-4">
                                   <div className="flex items-center gap-3">
                                     <img src={emp.avatar} className="w-8 h-8 rounded-full border border-white/10" alt="" />
                                     <div>
                                       <p className="text-xs font-bold text-white">{emp.name}</p>
                                       <p className="text-[9px] text-slate-500 font-mono italic mt-0.5">{emp.email}</p>
                                     </div>
                                   </div>
                                 </td>
                                 <td className="px-6 py-4 text-xs text-slate-400 font-medium">{emp.role}</td>
                                 <td className="px-6 py-4">
                                   <span className={`text-[8px] font-black border px-2 py-0.5 rounded-full uppercase ${
                                     emp.status === 'Active' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10' :
                                     emp.status === 'Remote' ? 'text-blue-400 border-blue-400/20 bg-blue-400/10' :
                                     emp.status === 'On Leave' ? 'text-amber-400 border-amber-400/20 bg-amber-400/10' :
                                     'text-slate-400 border-slate-400/20 bg-slate-400/10'
                                   }`}>{emp.status}</span>
                                 </td>
                               </tr>
                             ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                 </GlassCard>
               )}

               {detailTab === 'Devices' && (
                 <div className="space-y-6">
                    <div className="flex justify-between items-center px-1">
                       <h4 className="text-sm font-black text-white uppercase italic tracking-tight">Biometric Endpoints</h4>
                       <button className="px-4 py-2 bg-[#0047cc] text-white text-[9px] font-black uppercase rounded-xl shadow-lg transition-all active:scale-95">+ Provision Terminal</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="p-5 bg-white/[0.02] border border-white/10 rounded-[28px] flex items-center gap-5 hover:bg-white/[0.04] transition-all group">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner bg-emerald-500/10 text-emerald-400">??</div>
                          <div className="flex-1 min-w-0">
                             <p className="text-sm font-black text-white uppercase tracking-tight truncate">Face-ID LOBBY-01</p>
                             <p className="text-[9px] font-mono text-slate-500 mt-1 uppercase tracking-tighter">SN: HRcopilot-SFO-901</p>
                          </div>
                          <div className="text-right">
                             <span className="text-[8px] font-black uppercase text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">ONLINE</span>
                             <p className="text-[8px] text-slate-600 font-bold mt-2 uppercase">Sync: Now</p>
                          </div>
                       </div>
                       <div className="p-5 bg-white/[0.02] border border-white/10 rounded-[28px] flex items-center gap-5 opacity-40 grayscale group cursor-not-allowed">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner bg-rose-500/10 text-rose-500">?</div>
                          <div className="flex-1 min-w-0">
                             <p className="text-sm font-black text-white uppercase tracking-tight truncate">Finger-Scan BACK-02</p>
                             <p className="text-[9px] font-mono text-slate-500 mt-1 uppercase tracking-tighter">SN: HRcopilot-SFO-404</p>
                          </div>
                          <div className="text-right">
                             <span className="text-[8px] font-black uppercase text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">OFFLINE</span>
                             <p className="text-[8px] text-slate-600 font-bold mt-2 uppercase">Sync: 1d ago</p>
                          </div>
                       </div>
                    </div>
                 </div>
               )}

               {detailTab === 'Overrides' && (
                 <GlassCard title="Regional Policy Overrides">
                    <div className="space-y-8 max-w-xl py-4">
                       <div className="flex items-center justify-between group">
                          <div>
                             <p className="text-xs font-black text-white uppercase tracking-tight">Grace Period Variance</p>
                             <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Overrides global +15min default</p>
                          </div>
                          <div className="flex items-center gap-4">
                             <input type="number" defaultValue={20} className="w-16 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-black text-center outline-none focus:border-[#0047cc]" />
                             <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">mins</span>
                          </div>
                       </div>
                       <div className="flex items-center justify-between group pt-6 border-t border-white/5">
                          <div>
                             <p className="text-xs font-black text-white uppercase tracking-tight">Regional Holiday Calendar</p>
                             <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Automated local compliance sync</p>
                          </div>
                          <div className="w-12 h-6 bg-[#0047cc] rounded-full p-1 flex justify-end cursor-pointer">
                             <div className="w-4 h-4 bg-white rounded-full shadow" />
                          </div>
                       </div>
                       <div className="pt-8 flex justify-end">
                          <button className="px-8 py-3 bg-[#0047cc]/20 border border-[#0047cc]/30 text-[#0047cc] font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-[#0047cc] hover:text-white transition-all">Apply Local Strategy</button>
                       </div>
                    </div>
                 </GlassCard>
               )}

               {detailTab === 'Audit' && (
                  <GlassCard className="!p-0 overflow-hidden">
                    {isAuditLoading ? (
                      <div className="p-5 sm:p-12 text-center text-slate-500 uppercase text-[10px] font-black italic">Synchronizing Logs...</div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {auditLogs.map((log: any) => (
                          <div key={log.id} className="p-5 flex justify-between items-center hover:bg-white/[0.01] transition-all">
                             <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs opacity-50">??</div>
                                <div>
                                   <p className="text-xs font-bold text-white uppercase tracking-tight">{log.event}</p>
                                   <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Author: {log.user}</p>
                                </div>
                             </div>
                             <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">{log.timestamp}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </GlassCard>
               )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Distributed <span className="text-[#0047cc]">Infrastructure</span></h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1 italic">Enterprise Node Management & Geospatial Governance</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            <button 
              onClick={() => setView('LIST')}
              className={`p-2 rounded-xl transition-all ${view === 'LIST' ? 'bg-[#0047cc] text-white' : 'text-slate-500 hover:text-white'}`}
            >
              <ListIcon size={18} />
            </button>
            <button 
              onClick={() => setView('MAP')}
              className={`p-2 rounded-xl transition-all ${view === 'MAP' ? 'bg-[#0047cc] text-white' : 'text-slate-500 hover:text-white'}`}
            >
              <MapIcon size={18} />
            </button>
          </div>
          <button 
            onClick={handleCreate}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-[#0047cc] text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl shadow-[#e0f2fe]0/20 active:scale-95 transition-all"
          >
            + Provision New Hub
          </button>
        </div>
      </div>

      {view === 'MAP' ? (
        <div className="h-[400px] sm:h-[700px] w-full animate-in zoom-in-95 duration-500">
          <GeofenceMap 
            center={
              filteredBranches.length === 1 && filteredBranches[0].latitude
                ? [filteredBranches[0].latitude, filteredBranches[0].longitude]
                : [7.5, 5.0]
            }
            zoom={filteredBranches.length === 1 ? 7 : 5}
            branches={filteredBranches
              .filter(b => b.latitude && b.longitude && !(b.latitude === 0 && b.longitude === 0))
              .map(b => ({
                id: b.id,
                name: b.name,
                lat: b.latitude || 0,
                lng: b.longitude || 0,
                image: b.image,
              }))}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <aside className="lg:col-span-1 space-y-4">
            <GlassCard title="Governance Filters" className="!p-4">
               <div className="space-y-6">
                  <div className="relative group">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#0047cc] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2.5" /></svg>
                    <input 
                      type="text" 
                      placeholder="Search code or name..." 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:border-[#0047cc] outline-none transition-all placeholder:italic placeholder:opacity-50"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-3 px-1">Infrastructure Status</label>
                    <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/5">
                       {['All', 'Active', 'Inactive'].map(s => (
                         <button 
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-[#0047cc] text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                         >
                            {s}
                         </button>
                       ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-3 px-1">Node Hierarchy</label>
                    <div className="grid grid-cols-2 gap-2">
                       {['All', 'HQ', 'Regional', 'Satellite'].map(t => (
                         <button 
                            key={t}
                            onClick={() => setFilterType(t)}
                            className={`py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${filterType === t ? 'bg-white/10 border-[#0047cc] text-white' : 'bg-white/5 border-transparent text-slate-500 hover:text-slate-300'}`}
                         >
                            {t}
                         </button>
                       ))}
                    </div>
                  </div>
               </div>
            </GlassCard>
            
            {/* Live Governance Map */}
            <div className="rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/10 relative" style={{ height: '240px' }}>
               <GeofenceMap
                 key={filteredBranches.map(b => b.id).join('-')}
                 center={
                   filteredBranches.length === 1 && filteredBranches[0].latitude
                     ? [filteredBranches[0].latitude as number, filteredBranches[0].longitude as number]
                     : [7.5, 5.0]
                 }
                 zoom={filteredBranches.length === 1 ? 7 : 5}
                 branches={filteredBranches
                   .filter(b => b.latitude && b.longitude && !(b.latitude === 0 && b.longitude === 0))
                   .map(b => ({
                     id: b.id,
                     name: b.name,
                     lat: b.latitude as number,
                     lng: b.longitude as number,
                     image: b.image,
                   }))}
               />
               <div className="absolute bottom-2 left-2 z-[999] bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1 flex items-center gap-1.5 pointer-events-none">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                 <span className="text-[8px] font-black text-white uppercase tracking-widest">
                   {filteredBranches.filter(b => b.latitude && b.latitude !== 0).length} nodes
                 </span>
               </div>
            </div>
         </aside>

         <main className="lg:col-span-3">
            <GlassCard className="!p-0 overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border-white/5">
               <div className="table-wrap">
                  {isListLoading ? (
                    <div className="p-20 text-center text-slate-500 uppercase text-xs font-black italic tracking-widest animate-pulse">Syncing Global Infrastructure Nodes...</div>
                  ) : (
                    <table className="w-full text-left">
                     <thead>
                        <tr className="text-slate-500 text-[9px] uppercase font-black tracking-[0.25em] border-b border-white/5 bg-white/[0.01]">
                           <th className="px-6 py-5">Node Identity</th>
                           <th className="px-6 py-5">Logic Type</th>
                           <th className="px-6 py-5">Workforce</th>
                           <th className="px-6 py-5">Hardware</th>
                           <th className="px-6 py-5">Status</th>
                           <th className="px-6 py-5 text-right pr-8">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {filteredBranches.map((branch) => (
                           <tr key={branch.id} className="group hover:bg-white/[0.03] transition-all cursor-pointer" onClick={() => handleViewDetail(branch.id)}>
                              <td className="px-6 py-6">
                                 <div className="flex items-center gap-4">
                                    <div className={`w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl transition-all group-hover:border-[#0047cc]/50 ${branch.is_hq ? 'shadow-[0_0_15px_rgba(130,82,233,0.3)]' : ''}`}>
                                       {branch.type === 'HQ' ? '??' : '???'}
                                    </div>
                                    <div>
                                       <p className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-2">
                                         {branch.name}
                                         {branch.is_hq && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />}
                                       </p>
                                       <p className="text-[9px] font-mono text-slate-500 mt-1 uppercase tracking-tighter">{branch.code} � {branch.city}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-6">
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border border-white/5 bg-white/5 px-2 py-0.5 rounded">{branch.type}</span>
                              </td>
                              <td className="px-6 py-6">
                                 <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-white">{branch.employee_count}</span>
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Nodes</span>
                                 </div>
                              </td>
                              <td className="px-6 py-6">
                                 <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-slate-400">{branch.device_count}</span>
                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">Terminals</span>
                                 </div>
                              </td>
                              <td className="px-6 py-6">
                                 <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${branch.status === 'Active' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-slate-500'}`} />
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${branch.status === 'Active' ? 'text-emerald-400' : 'text-slate-500'}`}>{branch.status}</span>
                                 </div>
                              </td>
                              <td className="px-6 py-6 text-right pr-8">
                                 <div className="flex justify-end gap-3" onClick={e => e.stopPropagation()}>
                                    <button 
                                       onClick={() => handleEdit(branch)}
                                       className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-sm"
                                    >
                                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth="2.5" /></svg>
                                    </button>
                                    <button 
                                       onClick={() => handleArchive.mutate(branch.id)}
                                       className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                    >
                                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2.5" /></svg>
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                  )}
               </div>
               <div className="p-5 border-t border-white/5 bg-white/[0.01] flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                  <div className="flex gap-4 items-center">
                    <span>Showing {filteredBranches.length} infrastructure nodes</span>
                    <div className="w-px h-3 bg-white/10" />
                    <span>Global Capacity: 282 / 500</span>
                  </div>
                  <div className="flex gap-4">
                     <button className="hover:text-white transition-colors opacity-30 cursor-not-allowed">Previous ?</button>
                     <button className="hover:text-white transition-colors">Next ?</button>
                  </div>
               </div>
            </GlassCard>
         </main>
      </div>
      )}
    </div>
  );
};

export default Branches;




