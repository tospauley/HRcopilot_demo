import React from 'react';
import { Plus, Search, Filter, MoreHorizontal, User } from 'lucide-react';
import { cn } from '../lib/utils';

const employees = [
  {
    id: '1011',
    name: 'OLUWATOSIN DAMILOLA',
    position: 'System Administrator',
    department: 'ADMINISTRATION',
    status: 'ACTIVE',
    initials: 'OD',
    color: 'bg-[#bae6fd] text-[#0369a1]'
  },
  {
    id: '1010',
    name: 'BISOLA AKINTORINWA',
    position: 'Head of Human Resources',
    department: 'HUMAN RESOURCES',
    status: 'ACTIVE',
    initials: 'BA',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: '1008',
    name: 'BLESSING TIMOTHY',
    position: 'Marketing Officer',
    department: 'MARKETING',
    status: 'ACTIVE',
    initials: 'BT',
    color: 'bg-emerald-100 text-emerald-600'
  },
  {
    id: '1007',
    name: 'NELSON NELSON',
    position: 'Travel Consultant',
    department: 'ADMINISTRATION',
    status: 'ACTIVE',
    initials: 'NN',
    color: 'bg-[#dbeafe] text-[#2563eb]'
  }
];

export function Employees() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-slate-800 tracking-tight italic uppercase">
            Employee <span className="text-brand-blue">Directory</span>
          </h1>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
            Global Workforce Governance Hub
          </p>
        </div>
        <button className="flex items-center gap-2 px-8 py-3.5 bg-brand-blue text-white rounded-xl text-[11px] font-extrabold uppercase tracking-widest hover:bg-brand-blue/90 transition-all shadow-xl shadow-brand-blue/20">
          <Plus size={16} strokeWidth={3} />
          Add New Employee
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EmployeeStatCard label="Total Strength" value="9" />
        <EmployeeStatCard label="Active Assets" value="9" />
        <EmployeeStatCard label="In Probation" value="0" />
        <EmployeeStatCard label="New Hires (MTD)" value="1" />
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="SEARCH INTELLIGENCE FILES..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-blue/10 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[10px] font-bold text-slate-500 tracking-widest uppercase focus:outline-none">
            <option>All Statuses</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-500 tracking-widest uppercase hover:bg-slate-100 transition-all">
            <Filter size={14} />
            Filter
          </button>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Position</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs", emp.color)}>
                      {emp.initials}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{emp.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">{emp.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs font-medium text-slate-600">{emp.position}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{emp.department}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 uppercase tracking-wider border border-emerald-100">
                    {emp.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-4">
                    <button className="text-[10px] font-bold text-slate-400 hover:text-brand-blue uppercase tracking-widest transition-colors">View</button>
                    <button className="p-1.5 text-slate-300 hover:text-slate-500 transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmployeeStatCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</p>
    </div>
  );
}

