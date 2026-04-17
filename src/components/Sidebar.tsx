import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Settings, 
  MapPin, 
  Calendar, 
  CheckSquare, 
  DollarSign, 
  BarChart3, 
  Briefcase,
  ChevronLeft
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { label: 'PEOPLE', isHeader: true },
  { icon: Users, label: 'Employees' },
  { icon: Clock, label: 'Attendance' },
  { icon: Settings, label: 'Role Management' },
  { icon: MapPin, label: 'Branches' },
  { label: 'OPERATIONS', isHeader: true },
  { icon: Calendar, label: 'Leave' },
  { icon: CheckSquare, label: 'My Approvals' },
  { icon: DollarSign, label: 'Payroll' },
  { label: 'TALENT', isHeader: true },
  { icon: BarChart3, label: 'Performance' },
  { icon: Briefcase, label: 'Talent Management' },
];

export function Sidebar({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) {
  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col sticky top-0">
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">H</span>
        </div>
        <span className="font-display font-extrabold text-xl tracking-tight text-slate-800">HRcopilot</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-2">
        <ul className="space-y-1">
          {navItems.map((item, idx) => (
            <li key={idx}>
              {item.isHeader ? (
                <span className="block px-3 py-4 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                  {item.label}
                </span>
              ) : (
                <button
                  onClick={() => !item.isHeader && onTabChange(item.label)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    activeTab === item.label 
                      ? "bg-brand-blue/5 text-brand-blue" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  )}
                >
                  {item.icon && <item.icon size={18} />}
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-700">
          <ChevronLeft size={18} />
          COLLAPSE MENU
        </button>
      </div>
    </aside>
  );
}
