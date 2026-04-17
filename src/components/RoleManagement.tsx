import React from 'react';
import { Plus, Shield, Edit3, Lock } from 'lucide-react';
import { cn } from '../lib/utils';

const roles = [
  { name: 'SUPER_ADMIN', description: 'Full system access with all permissions', scope: 'ALL', permissions: 80, status: 'ACTIVE' },
  { name: 'CEO', description: 'Executive level oversight and organizational reporting', scope: 'ALL', permissions: 72, status: 'ACTIVE' },
  { name: 'HR_MANAGER', description: 'HR operations and employee management', scope: 'ALL', permissions: 61, status: 'ACTIVE' },
  { name: 'BRANCH_MANAGER', description: 'Branch-level management and operations', scope: 'BRANCH', permissions: 30, status: 'ACTIVE' },
  { name: 'DEPARTMENT_HEAD', description: 'Department-level management', scope: 'DEPARTMENT', permissions: 26, status: 'ACTIVE' },
  { name: 'EMPLOYEE', description: 'Standard employee access', scope: 'SELF', permissions: 20, status: 'ACTIVE' },
  { name: 'SUPER ADMIN', description: 'Full system access', scope: 'SELF', permissions: 64, status: 'ACTIVE' },
  { name: 'HR MANAGER', description: 'HR management access', scope: 'SELF', permissions: 8, status: 'ACTIVE' },
  { name: 'MANAGER', description: 'Team management access', scope: 'SELF', permissions: 4, status: 'ACTIVE' },
  { name: 'ACCOUNTANT', description: 'Reviews tax figures, approves and disburses payroll. Cannot create payroll runs.', scope: 'ALL', permissions: 9, status: 'ACTIVE' },
  { name: 'FINANCE_OFFICER', description: 'Records statutory remittance payments (PAYE, Pension, NHF, NSITF). Cannot approve payroll runs.', scope: 'ALL', permissions: 7, status: 'ACTIVE' },
];

export function RoleManagement() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-slate-800 tracking-tight italic uppercase">
            Role <span className="text-brand-blue">Management</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
            Access Control & Permission Hub
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20">
          <Plus size={16} />
          Create Role
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-200">
        <button className="px-1 py-4 text-[10px] font-bold text-brand-blue border-b-2 border-brand-blue uppercase tracking-widest">
          Roles <span className="ml-1 px-1.5 py-0.5 bg-brand-blue/10 rounded text-[8px]">11</span>
        </button>
        <button className="px-1 py-4 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">
          Permissions
        </button>
        <button className="px-1 py-4 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">
          Designations
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role, idx) => (
          <RoleCard key={idx} {...role} />
        ))}
      </div>
    </div>
  );
}

function RoleCard({ name, description, scope, permissions, status }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col group">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{name}</h3>
        <span className="px-2 py-0.5 bg-blue-50 text-brand-blue text-[8px] font-bold rounded uppercase tracking-tighter border border-blue-100">
          System
        </span>
      </div>
      
      <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-6 flex-1">
        {description}
      </p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mb-1">Default Scope</p>
          <span className="px-2 py-0.5 bg-[#e0f2fe] text-[#0369a1] text-[9px] font-bold rounded uppercase tracking-wider border border-[#bae6fd]">
            {scope}
          </span>
        </div>
        <div>
          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mb-1">Permissions</p>
          <span className="text-xs font-extrabold text-emerald-500">{permissions}</span>
        </div>
        <div>
          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mb-1">Status</p>
          <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">{status}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-widest transition-all">
          <Shield size={14} />
          Permissions
        </button>
        <button className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-slate-400 hover:text-brand-blue transition-all">
          <Edit3 size={14} />
        </button>
      </div>
    </div>
  );
}

