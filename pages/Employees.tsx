
import React, { useState } from 'react';
import GlassCard from '../components/GlassCard';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import { DEMO_EMPLOYEES, DEMO_BRANCHES } from '../demoData';

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  branch: string;
  employment: string;
  status: 'Active' | 'Probation' | 'On Leave' | 'Suspended' | 'Remote';
  avatar: string;
  bloodGroup: string;
  genotype: string;
  academics: string;
  info?: string;
  estimatedReturn?: string;
}

interface Branch {
  id: string;
  name: string;
  code: string;
  location: string;
  manager: string;
  employeeCount: number;
  status: 'Active' | 'Inactive';
  timezone: string;
}

const INITIAL_EMPLOYEES: Employee[] = DEMO_EMPLOYEES.map(e => ({
  id: e.id,
  name: e.name,
  position: e.position,
  department: e.department,
  branch: e.branch,
  employment: e.employment,
  status: e.status as Employee['status'],
  avatar: e.avatar,
  bloodGroup: e.bloodGroup,
  genotype: e.genotype,
  academics: e.academics,
}));

const INITIAL_BRANCHES: Branch[] = DEMO_BRANCHES.map(b => ({
  id: b.id,
  name: b.name,
  code: b.code,
  location: `${b.city}, ${b.country}`,
  manager: b.manager_name,
  employeeCount: b.employee_count,
  status: b.status as Branch['status'],
  timezone: b.timezone,
}));

const Employees: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Employee Directory');
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [selectedEmployeeProfile, setSelectedEmployeeProfile] = useState<Employee | null>(null);
  const [formStep, setFormStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [branches] = useState(INITIAL_BRANCHES);

  const [newEmp, setNewEmp] = useState<{
    name: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    branch: string;
    employment: string;
    status: 'Active' | 'Probation' | 'On Leave' | 'Suspended' | 'Remote';
    role: string;
    startDate: string;
    bloodGroup: string;
    genotype: string;
    academics: string;
  }>({
    name: '', email: '', phone: '', position: '', department: 'Engineering', branch: 'Main HQ',
    employment: 'Full-Time', status: 'Active', role: 'EMPLOYEE', startDate: '',
    bloodGroup: 'Unknown', genotype: 'Unknown', academics: ''
  });

  const statusColors = {
    Active: 'bg-emerald-500/10 text-emerald-400',
    Probation: 'bg-amber-500/10 text-amber-400',
    'On Leave': 'bg-orange-500/10 text-orange-400',
    Suspended: 'bg-rose-500/10 text-rose-400',
    Remote: 'bg-blue-500/10 text-blue-400',
  };

  const handleAddEmployee = () => {
    const freshEmp: Employee = {
      id: (employees.length + 1).toString(),
      name: newEmp.name,
      position: newEmp.position,
      department: newEmp.department,
      branch: newEmp.branch,
      employment: newEmp.employment,
      status: newEmp.status,
      avatar: `https://picsum.photos/120/120?sig=${Date.now()}`,
      bloodGroup: newEmp.bloodGroup,
      genotype: newEmp.genotype,
      academics: newEmp.academics
    };
    setEmployees([freshEmp, ...employees]);
    setIsAddingEmployee(false);
    setFormStep(1);
    setNewEmp({
      name: '', email: '', phone: '', position: '', department: 'Engineering', branch: 'Main HQ',
      employment: 'Full-Time', status: 'Active', role: 'EMPLOYEE', startDate: '',
      bloodGroup: 'Unknown', genotype: 'Unknown', academics: ''
    });
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         emp.id.includes(searchTerm) || 
                         emp.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses' || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isAddingEmployee) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Provision <span className="text-[#eab308]">Identity</span></h2>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">HRcopilot Human Capital Onboarding</p>
          </div>
          <button onClick={() => setIsAddingEmployee(false)} className="px-4 py-2 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all">Cancel Onboarding</button>
        </div>
        <div className="px-4">
          <div className="flex justify-between mb-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all ${formStep >= step ? 'bg-[#eab308] text-slate-900 shadow-lg' : 'bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-600'}`}>{step}</div>
                <span className={`text-[8px] font-black uppercase tracking-widest ${formStep >= step ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-700'}`}>{step === 1 ? 'Identity' : step === 2 ? 'Placement' : 'Governance'}</span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-[#eab308] transition-all duration-700" style={{ width: `${(formStep / 3) * 100}%` }} /></div>
        </div>
        <GlassCard data-demo-id="emp-onboarding-step3" className="!p-8 border-t-4 border-t-[#eab308]">
          {formStep === 1 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Full Legal Name</label>
                    <input type="text" data-demo-id="emp-name-input" placeholder="e.g. Jonathan Ive" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-3.5 text-sm text-slate-900 dark:text-white focus:border-[#eab308] outline-none transition-all" value={newEmp.name} onChange={(e) => setNewEmp({...newEmp, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Work Email Address</label>
                    <input type="email" placeholder="j.ive@enterprise.com" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-3.5 text-sm text-slate-900 dark:text-white focus:border-[#eab308] outline-none transition-all" value={newEmp.email} onChange={(e) => setNewEmp({...newEmp, email: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Blood Group</label>
                      <input type="text" placeholder="B+" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-3.5 text-sm text-slate-900 dark:text-white focus:border-[#eab308] outline-none transition-all" value={newEmp.bloodGroup} onChange={(e) => setNewEmp({...newEmp, bloodGroup: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Genotype</label>
                      <input type="text" placeholder="AA" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-3.5 text-sm text-slate-900 dark:text-white focus:border-[#eab308] outline-none transition-all" value={newEmp.genotype} onChange={(e) => setNewEmp({...newEmp, genotype: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 rounded-[32px] gap-4">
                  <div className="w-32 h-32 rounded-[40px] bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 flex items-center justify-center text-4xl grayscale">👤</div>
                  <button className="px-6 py-2 bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-300 dark:hover:bg-white/20 transition-all">Upload Photo</button>
                </div>
              </div>
            </div>
          )}
          {formStep === 2 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Designation</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-3.5 text-sm text-slate-900 dark:text-white focus:border-[#eab308] outline-none" value={newEmp.position} onChange={(e) => setNewEmp({...newEmp, position: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Department</label>
                  <select className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-3.5 text-sm text-slate-900 dark:text-white focus:border-[#eab308] outline-none appearance-none" value={newEmp.department} onChange={(e) => setNewEmp({...newEmp, department: e.target.value})}><option className="bg-white dark:bg-[#0f172a]">Engineering</option><option className="bg-white dark:bg-[#0f172a]">Marketing</option></select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Academic Background</label>
                  <input type="text" data-demo-id="emp-academics-input" placeholder="e.g. MBA Marketing, Yale University" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-3.5 text-sm text-slate-900 dark:text-white focus:border-[#eab308] outline-none" value={newEmp.academics} onChange={(e) => setNewEmp({...newEmp, academics: e.target.value})} />
                </div>
              </div>
            </div>
          )}
          {formStep === 3 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Access Role</label>
                  <select className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-3.5 text-sm text-slate-900 dark:text-white focus:border-[#eab308] outline-none appearance-none" value={newEmp.role} onChange={(e) => setNewEmp({...newEmp, role: e.target.value})}><option>EMPLOYEE</option><option>MANAGER</option></select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Joining Date</label>
                  <input type="date" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-3.5 text-sm text-slate-900 dark:text-white outline-none" value={newEmp.startDate} onChange={(e) => setNewEmp({...newEmp, startDate: e.target.value})} />
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-100 dark:border-white/5">
            <button onClick={() => setFormStep(Math.max(1, formStep - 1))} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formStep === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>← Previous Step</button>
            <div className="flex gap-4">
              {formStep < 3 ? (
                <Button variant="primary" size="lg" onClick={() => setFormStep(formStep + 1)}>Continue →</Button>
              ) : (
                <Button variant="success" size="lg" onClick={handleAddEmployee}>Confirm & Provision</Button>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-700 relative pb-20 px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
           <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase italic"><span className="text-slate-900 dark:text-white">Employee</span> <span className="text-[#0047cc]">Directory</span></h2>
           <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-2 sm:mt-3 opacity-70">Global Workforce Governance Hub</p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
            <button 
              data-demo-id="add-employee-btn"
              onClick={() => setIsAddingEmployee(true)} 
              className="flex-1 sm:flex-none px-6 sm:px-10 py-3 sm:py-4 bg-[#0047cc] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-full shadow-[0_8px_30px_rgba(0,71,204,0.3)] hover:shadow-[0_15px_40px_rgba(0,71,204,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
               <span>+ ADD EMPLOYEE</span>
            </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6" id="workforce-kpi-ribbon">
         {[
            { label: 'Total Strength', value: employees.length, color: 'text-slate-900 dark:text-white' },
            { label: 'Active Assets', value: employees.filter(e => e.status === 'Active').length, color: 'text-emerald-500' },
            { label: 'In Probation', value: employees.filter(e => e.status === 'Probation').length, color: 'text-amber-500' },
            { label: 'New Hires (MTD)', value: 1, color: 'text-[#0047cc]' },
         ].map((stat, i) => (
            <GlassCard key={i} className="!p-8 flex flex-col justify-start gap-4 shadow-xl">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">{stat.label}</p>
               <p className={`text-[2.5rem] font-black tracking-tighter leading-none ${stat.color}`}>{stat.value}</p>
            </GlassCard>
         ))}
      </div>

      {/* Modernized Search Card */}
      <GlassCard className="!p-4 rounded-full shadow-lg border-slate-50 dark:border-white/5">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="relative flex-1 group w-full">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl opacity-40 group-focus-within:opacity-100 transition-opacity">🔍</span>
            <input 
              type="text" 
              id="employee-search-bar"
              placeholder="SEARCH INTELLIGENCE FILES..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full bg-transparent border-none py-3 pl-14 pr-8 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-0 transition-all placeholder:text-slate-400" 
            />
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto px-2">
             <div className="flex-1 md:w-48 relative border-none">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-transparent py-3 px-6 pr-10 text-[10px] font-black uppercase tracking-widest border-none appearance-none cursor-pointer outline-none text-slate-600 dark:text-slate-300"
                >
                   <option>All Statuses</option>
                   <option>Active</option>
                   <option>Probation</option>
                   <option>On Leave</option>
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 text-xs">▼</span>
             </div>
             <button className="px-10 py-3.5 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">Filter</button>
          </div>
        </div>
      </GlassCard>

      {/* Directory Content */}
      <div className="space-y-6 pt-4">
        {/* Mobile card view */}
        <div className="block sm:hidden space-y-3">
          {filteredEmployees.map((emp) => (
            <div key={emp.id} className="p-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar src={emp.avatar} name={emp.name} size={40} radius="rounded-full" className="shadow-sm flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{emp.name}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate">{emp.position}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${statusColors[emp.status]}`}>{emp.status}</span>
                </div>
              </div>
              <button onClick={() => setSelectedEmployeeProfile(emp)} className="text-[10px] font-black text-[#0047cc] uppercase tracking-widest flex-shrink-0">View</button>
            </div>
          ))}
        </div>
        {/* Desktop table view */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
                <th className="px-8 pb-6">Employee</th>
                <th className="px-8 pb-6">Position</th>
                <th className="px-8 pb-6">Department</th>
                <th className="px-8 pb-6">Status</th>
                <th className="px-8 pb-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5 bg-transparent">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors duration-200">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-5">
                       <Avatar src={emp.avatar} name={emp.name} size={42} radius="rounded-full" className="shadow-sm" />
                       <div>
                          <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{emp.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">101{emp.id}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{emp.position}</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{emp.department}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${statusColors[emp.status]}`}>{emp.status}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-6 text-[10px] font-black uppercase tracking-widest">
                       <button onClick={() => setSelectedEmployeeProfile(emp)} className="text-slate-500 hover:text-[#0047cc] transition-colors">View</button>
                       <button className="text-slate-300 hover:text-slate-600 transition-colors">•••</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CENTERED EMPLOYEE PROFILE MODAL */}
      {selectedEmployeeProfile && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300 p-6">
           <div className="absolute inset-0" onClick={() => setSelectedEmployeeProfile(null)} />
           <div className="w-full max-w-2xl bg-white dark:bg-[#0d0a1a] shadow-2xl rounded-[40px] border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-500 flex flex-col relative overflow-hidden max-h-[90vh]">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#0047cc]/10 blur-[100px] rounded-full -mr-40 -mt-40 pointer-events-none" />
              <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02] relative z-10">
                 <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedEmployeeProfile(null)} className="p-3 bg-white dark:bg-white/5 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm border border-slate-200 dark:border-white/10">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3"/></svg>
                    </button>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Identity <span className="text-[#0047cc]">Nexus</span></h3>
                 </div>
                 <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setSelectedEmployeeProfile(null)}>Edit</Button>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto relative z-10">
                 <div className="p-10 flex flex-col items-center text-center">
                    <div className="relative mb-6">
                       <div className="absolute inset-0 bg-[#0047cc] blur-3xl opacity-20 rounded-full" />
                       <Avatar src={selectedEmployeeProfile.avatar} name={selectedEmployeeProfile.name} size={128} radius="rounded-[48px]" className="border-4 border-white dark:border-[#0d0a1a] shadow-2xl relative z-10" />
                       <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl border-4 border-white dark:border-[#0d0a1a] flex items-center justify-center text-white z-20 shadow-xl ${statusColors[selectedEmployeeProfile.status].split(' ')[0].replace('10', '500')}`}>👤</div>
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">{selectedEmployeeProfile.name}</h2>
                    <p className="text-[#0047cc] font-black uppercase tracking-[0.3em] text-[10px] mt-2 mb-6">EMP-00{selectedEmployeeProfile.id} • {selectedEmployeeProfile.position}</p>
                    <div className="flex flex-wrap justify-center gap-3">
                       <span className="px-4 py-1.5 bg-[#0047cc]/10 border border-[#0047cc]/20 rounded-full text-[10px] font-black text-[#0047cc] uppercase tracking-widest">{selectedEmployeeProfile.department}</span>
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[selectedEmployeeProfile.status]}`}>{selectedEmployeeProfile.status}</span>
                    </div>
                 </div>
                 <div className="p-10 space-y-12">
                    <section>
                       <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-6 border-l-2 border-[#0047cc] pl-3">Personal Metadata</h4>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[32px]"><p className="text-[9px] font-black text-slate-500 uppercase mb-1">Blood Group</p><p className="text-2xl font-black text-slate-900 dark:text-white">{selectedEmployeeProfile.bloodGroup}</p></div>
                          <div className="p-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[32px]"><p className="text-[9px] font-black text-slate-500 uppercase mb-1">Genotype</p><p className="text-2xl font-black text-slate-900 dark:text-white">{selectedEmployeeProfile.genotype}</p></div>
                       </div>
                    </section>
                    <section>
                       <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-6 border-l-2 border-[#0047cc] pl-3">Academic Excellence</h4>
                       <div className="p-8 bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/10 dark:border-blue-500/20 rounded-[32px] relative overflow-hidden group">
                          <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-4 italic">Verified Credentials</p>
                          <p className="text-xl font-black text-slate-900 dark:text-white leading-relaxed">{selectedEmployeeProfile.academics}</p>
                       </div>
                    </section>
                 </div>
              </div>
              <div className="p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50/80 dark:bg-black/40 backdrop-blur-md flex gap-4">
                 <button className="flex-1 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/10 shadow-sm transition-all">Download PDF</button>
                 <button className="flex-1 py-4 bg-[#0047cc] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#e0f2fe]0/20 hover:scale-[1.02] transition-all">Close Nexus</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Employees;

