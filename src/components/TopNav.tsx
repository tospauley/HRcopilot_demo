import React from 'react';
import { Search, Sparkles, Beaker, Activity, Moon, Bell } from 'lucide-react';

export function TopNav() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Identity, Cycles, or Assets..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-4 py-1.5 bg-brand-blue text-white rounded-full text-sm font-medium hover:bg-brand-blue/90 transition-colors">
          <Sparkles size={16} />
          AI Advisor
        </button>

        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-100 rounded-lg text-[10px] font-bold text-amber-600 uppercase tracking-wider">
          <Beaker size={14} />
          Test Mode: Attendance Simulator
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
          <Activity size={14} />
          Live Hub: 0/10 Active
        </div>

        <div className="h-8 w-px bg-slate-200 mx-2" />

        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Moon size={20} />
        </button>

        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            1
          </span>
        </button>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-800 leading-none">HRcopilot</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-tighter">System</p>
          </div>
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center border border-orange-200">
            <span className="text-orange-600 font-bold text-sm">H</span>
          </div>
        </div>
      </div>
    </header>
  );
}
