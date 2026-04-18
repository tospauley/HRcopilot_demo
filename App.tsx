
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { HashRouter, Link } from 'react-router-dom';
import { Routes, Route, useLocation, Navigate } from 'react-router';
import { signInAnonymously } from './mockDb';
import { doc, setDoc } from './mockDb';
import { auth, db } from './mockDb';
import { ICONS } from './constants';
import { UserRole, Notification, BrandSettings, UserProfile, Branch } from './types';

// ── Lazy-loaded pages — each becomes its own JS chunk ────────────────────────
const Dashboard        = lazy(() => import('./pages/Dashboard'));
const Attendance       = lazy(() => import('./pages/Attendance'));
const MyAttendance     = lazy(() => import('./pages/MyAttendance'));
const Payroll          = lazy(() => import('./pages/Payroll'));
const Performance      = lazy(() => import('./pages/Performance'));
const Identity         = lazy(() => import('./pages/Identity'));
const Communication    = lazy(() => import('./pages/Communication'));
const Employees        = lazy(() => import('./pages/Employees'));
const Branches         = lazy(() => import('./pages/Branches'));
const Leave            = lazy(() => import('./pages/Leave'));
const RoleManagement   = lazy(() => import('./pages/RoleManagement'));
const Goals            = lazy(() => import('./pages/Goals'));
const TalentManagement = lazy(() => import('./pages/TalentManagement'));
const Settings         = lazy(() => import('./pages/Settings'));
const MemoSystem       = lazy(() => import('./pages/Memo'));
const AutomationAI     = lazy(() => import('./pages/AutomationAI'));
const Integrations     = lazy(() => import('./pages/Integrations'));
const Finance          = lazy(() => import('./pages/Finance'));
const Procurement      = lazy(() => import('./pages/Procurement'));
const CRM              = lazy(() => import('./pages/CRM'));
const Cabinet          = lazy(() => import('./pages/Cabinet'));
const MyPayroll        = lazy(() => import('./pages/MyPayroll'));
const MyPerformance    = lazy(() => import('./pages/MyPerformance'));
const Invoices         = lazy(() => import('./pages/Invoices'));
const EmployeeDashboard = lazy(() => import('./pages/EmployeeDashboard'));
const Login            = lazy(() => import('./pages/Login'));
const Landing          = lazy(() => import('./pages/Landing'));
const Setup            = lazy(() => import('./pages/Setup'));
const LeakageWidget    = lazy(() => import('./src/components/leakage/OrganizationalIntelligenceWidget'));

import AIAdvisorModal from './components/AIAdvisorModal';
import ClockInModal from './components/ClockInModal';
import LeakageAnalysisModal from './components/LeakageAnalysisModal';
import { HR360Provider } from './src/context/HR360Context';
import { CurrencyProvider } from './src/context/CurrencyContext';
import { loadBrandSettings } from './src/db/settingsDb';
// CinematicSubtitles lazy-loaded to break App.tsx → voice barrel → narrationEngine → narratorStore TDZ
const CinematicSubtitles = lazy(() => import('./src/demo/voice').then(m => ({ default: m.CinematicSubtitles })));
export { ThemeToggle } from './components/ThemeToggle';

// ── Page loading fallback ─────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center h-full min-h-[60vh]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-[#0047cc] border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading...</p>
    </div>
  </div>
);

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'PENDING_REVIEW', title: 'Pending Evaluation', message: 'Reminder: Ethan Parker appraisal due in 2 days.', timestamp: '10 min ago', isRead: false, priority: 'HIGH' },
  { id: '2', type: 'CYCLE_EVENT', title: 'New Cycle Initialized', message: 'Q2 Performance Cycle has been provisioned globally.', timestamp: '1h ago', isRead: false, priority: 'MEDIUM' },
  { id: '3', type: 'EVALUATION_COMPLETE', title: 'Review Finalized', message: 'Sarah Mitchell evaluation has been verified by HR.', timestamp: '3h ago', isRead: true, priority: 'LOW' },
];

const SidebarItem: React.FC<{ item: any; isCollapsed: boolean }> = ({ item, isCollapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === item.route;

  if (item.isHeader) {
    return !isCollapsed ? (
      <p className="px-6 mt-8 mb-2 text-[10px] font-extrabold text-slate-400 dark:text-slate-600 uppercase tracking-[0.25em]">{item.label}</p>
    ) : (
      <div className="h-px bg-slate-100 dark:bg-white/5 mx-4 my-6" />
    );
  }

  return (
    <Link 
      to={item.route || '#'} 
      className={`flex items-center gap-3 px-6 py-3.5 transition-all duration-300 group relative ${isActive ? 'sidebar-active text-[var(--brand-primary)] dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.02]'}`}
    >
      <div className={`w-5 h-5 flex-shrink-0 transition-transform ${isActive ? 'text-[var(--brand-primary)] scale-110' : 'group-hover:scale-110'}`}>
        {item.icon}
      </div>
      {!isCollapsed && (
        <span className="font-bold text-[13px] tracking-wide truncate flex-1">{item.label}</span>
      )}
      {item.badge && !isCollapsed && (
        <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-[var(--brand-primary)] text-white shadow-lg">
          {item.badge}
        </span>
      )}
    </Link>
  );
};

import { ThemeToggle } from './components/ThemeToggle';

const NotificationCenter: React.FC<{ notifications: Notification[]; onMarkAsRead: (id: string) => void }> = ({ notifications, onMarkAsRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 md:p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl md:rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all relative group flex-shrink-0"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-[#0f172a] rounded-full animate-pulse shadow-[0_0_8px_#f43f5e]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-[calc(100vw-2rem)] sm:w-[380px] max-w-[380px] bg-white dark:bg-[#120e24]/95 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[32px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] z-[100] animate-in fade-in zoom-in-95 duration-200">
          <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Notifications</h3>
            <span className="px-2.5 py-1 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-[9px] font-black uppercase rounded-lg">{unreadCount} New</span>
          </div>
          
          <div className="max-h-[450px] overflow-y-auto py-2 text-slate-900 dark:text-white">
            {notifications.length === 0 ? (
              <div className="py-20 text-center px-10">
                <div className="text-4xl mb-4 opacity-20">📭</div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">No new alerts.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => onMarkAsRead(n.id)}
                  className={`p-5 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all cursor-pointer border-b border-slate-50 dark:border-white/5 last:border-0 relative ${!n.isRead ? 'bg-[#0047cc]/5' : ''}`}
                >
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                      n.type === 'CYCLE_EVENT' ? 'bg-purple-500/10 text-purple-400' : 
                      n.type === 'PENDING_REVIEW' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {n.type === 'CYCLE_EVENT' ? '🎯' : n.type === 'PENDING_REVIEW' ? '⌛' : '✅'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className={`text-[11px] font-black uppercase tracking-tight ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{n.title}</p>
                        <span className="text-[8px] font-bold text-slate-500 uppercase whitespace-nowrap ml-2">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                  {!n.isRead && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--brand-primary)] rounded-full shadow-[0_0_8px_var(--brand-primary)]" />
                  )}
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 bg-slate-50 dark:bg-white/[0.02] rounded-b-[32px] text-center">
            <button className="text-[9px] font-black text-[var(--brand-primary)] uppercase tracking-[0.2em] hover:text-slate-900 dark:hover:text-white transition-colors">Clear History</button>
          </div>
        </div>
      )}
    </div>
  );
};

const SIDEBAR_CONFIG = [
  { label: 'Dashboard', icon: <ICONS.Dashboard />, route: '/' },
  { label: 'PEOPLE', isHeader: true, roles: [UserRole.CEO, UserRole.HR_MANAGER] },
  { label: 'Employees', icon: <ICONS.People />, route: '/employees', roles: [UserRole.CEO, UserRole.HR_MANAGER] },
  { label: 'Role Management', icon: <ICONS.Administration />, route: '/roles', roles: [UserRole.HR_MANAGER] },
  { label: 'Branches', icon: <ICONS.Analytics />, route: '/branches', roles: [UserRole.CEO, UserRole.HR_MANAGER] },
  { label: 'OPERATIONS', isHeader: true },
  { label: 'My Profile', icon: <ICONS.People />, route: '/my-profile', roles: [UserRole.EMPLOYEE] },
  { label: 'My Payslips', icon: <ICONS.Payroll />, route: '/my-payroll', roles: [UserRole.EMPLOYEE] },
  { label: 'My Attendance', icon: <ICONS.Attendance />, route: '/my-attendance', roles: [UserRole.EMPLOYEE] },
  { label: 'Attendance', icon: <ICONS.Attendance />, route: '/attendance', badge: 'Live', roles: [UserRole.CEO, UserRole.HR_MANAGER] },
  { label: 'Leave', icon: <ICONS.Leave />, route: '/leave' },
  { label: 'My Approvals', icon: <ICONS.Administration />, route: '/approvals', roles: [UserRole.EMPLOYEE] },
  { label: 'Payroll', icon: <ICONS.Payroll />, route: '/payroll', roles: [UserRole.CEO, UserRole.HR_MANAGER, UserRole.ACCOUNTANT] },
  { label: 'TALENT', isHeader: true },
  { label: 'Performance', icon: <ICONS.Performance />, route: '/performance' },
  { label: 'Talent Management', icon: <ICONS.Talent />, route: '/talent' },
  { label: 'ENTERPRISE+', isHeader: true, roles: [UserRole.CEO, UserRole.ACCOUNTANT] },
  { label: 'Accounting & Finance', icon: <ICONS.Payroll />, route: '/finance', roles: [UserRole.CEO, UserRole.ACCOUNTANT] },
  { label: 'Procurement', icon: <ICONS.Integrations />, route: '/procurement', roles: [UserRole.CEO] },
  { label: 'CRM & Sales', icon: <ICONS.People />, route: '/crm', roles: [UserRole.CEO] },
  { label: 'Virtual Cabinet', icon: <ICONS.Memo />, route: '/cabinet', roles: [UserRole.CEO, UserRole.HR_MANAGER, UserRole.ACCOUNTANT] },
  { label: 'Invoices & Receipts', icon: <ICONS.Payroll />, route: '/invoices', roles: [UserRole.CEO, UserRole.ACCOUNTANT] },
  { label: 'COMMUNICATION', isHeader: true },
  { label: 'Team Chat', icon: <ICONS.Chat />, route: '/communication/chat', badge: 12 },
  { label: 'Memo', icon: <ICONS.Memo />, route: '/communication/memo' },
  { label: 'SYSTEM', isHeader: true, roles: [UserRole.CEO] },
  { label: 'Brand Settings', icon: <ICONS.Administration />, route: '/settings', roles: [UserRole.CEO] },
];

// ── Removed DemoPortal ─────────────────────────────────────────────────────────────

export const MainApp: React.FC<{ 
  onLogout: () => void; 
  brand: BrandSettings; 
  onUpdateBrand: (b: BrandSettings) => void;
  userProfile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isGuestMode?: boolean;
  onExitGuest?: () => void;
}> = ({ onLogout, brand, onUpdateBrand, userProfile, onUpdateProfile, theme, onToggleTheme, isGuestMode, onExitGuest }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isClockInOpen, setIsClockInOpen] = useState(false);
  const [isLeakageModalOpen, setIsLeakageModalOpen] = useState(false);
  const [clockTime, setClockTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setClockTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const currentUserRole = userProfile.role;
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const filteredMenu = SIDEBAR_CONFIG.filter(item => !item.roles || item.roles.includes(currentUserRole));

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const addNotification = (title: string, message: string, type: Notification['type']) => {
    const newNotif: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: 'Just now',
      isRead: false,
      priority: 'MEDIUM'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  return (
    <div className="flex h-screen h-[100dvh] overflow-hidden bg-white dark:bg-[#0d0a1a] selection:bg-purple-500/30">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-[70] md:relative flex flex-col h-screen h-[100dvh] border-r border-slate-200 dark:border-white/5 glass transition-all duration-500 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'
      } ${isCollapsed ? 'md:w-20' : 'md:w-72'}`}>
        <div className="p-6 md:p-7 flex items-center justify-between mb-2 md:mb-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
              <img src="/Analytictosin_Logo.png" alt="Analytictosin Logo" className="w-full h-full object-contain drop-shadow-md" />
            </div>
            {(!isCollapsed || isMobileMenuOpen) && <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic animate-in fade-in slide-in-from-left-2">HRcopilot</h1>}
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto min-h-0 space-y-0.5">
          {filteredMenu.map((item, idx) => (
            <SidebarItem key={idx} item={item} isCollapsed={isCollapsed && !isMobileMenuOpen} />
          ))}
          {isGuestMode && (
            <div className="px-3 pt-2 md:hidden">
              <button
                onClick={onExitGuest}
                className="w-full flex items-center gap-3 px-6 py-3.5 rounded-xl bg-[#0047cc]/5 hover:bg-[#0047cc]/10 text-[#0047cc] transition-all border border-[#0047cc]/20"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                <span className="font-bold text-[13px] tracking-wide">Home</span>
              </button>
            </div>
          )}
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-white/5 hidden md:block space-y-1">
           {isGuestMode && (
             <button
               onClick={onExitGuest}
               className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#0047cc]/5 hover:bg-[#0047cc]/10 text-[#0047cc] transition-all border border-[#0047cc]/20"
             >
               <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
               {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-widest">Home</span>}
             </button>
           )}
           <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 transition-all"
           >
             <div className={`transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" strokeWidth="2.5"/></svg>
             </div>
             {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-widest">Collapse Menu</span>}
           </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 md:h-20 border-b border-slate-200 dark:border-white/5 flex items-center px-3 md:px-10 bg-white/80 dark:bg-[#0d0a1a]/60 backdrop-blur-2xl justify-between z-50">
           <div className="flex items-center gap-2 md:gap-6 flex-1 min-w-0">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all flex-shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2.5"/></svg>
              </button>

              <div className="flex items-center gap-2 mr-2 md:mr-4 flex-shrink-0">
                <div className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center">
                  <img src="/Analytictosin_Logo.png" alt="Analytictosin Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-base md:text-lg font-black text-[#0047cc] italic hidden xs:block">HRcopilot</span>
              </div>

              <div className="relative flex-1 max-w-md hidden md:block">
                 <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2.5"/></svg>
                 <input type="text" placeholder="Search Identity, Cycles, or Assets..." className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-2.5 pl-12 pr-4 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all" />
              </div>

              <div className="hidden xl:flex items-center gap-3">
                <button 
                  onClick={() => setIsAIModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0047cc] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-[#0035a0] transition-all"
                >
                  <span className="w-4 h-4 flex items-center justify-center bg-white/20 rounded-full">+</span>
                  AI Advisor
                </button>
                <button 
                  onClick={() => setIsLeakageModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0047cc] to-[#0035a0] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
                >
                  <span className="text-lg">📊</span>
                  Leakage Analysis
                </button>
              </div>
           </div>
           
           <div className="flex items-center gap-1.5 md:gap-4 flex-shrink-0">
              {/* Clock-In Widget */}
              <button
                onClick={() => setIsClockInOpen(true)}
                className="hidden md:flex items-center gap-2.5 px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-all group"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm shadow-purple-500/30">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-slate-900 dark:text-white tabular-nums">
                    {clockTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                  </p>
                  <p className="text-[8px] font-black text-violet-600 uppercase tracking-widest">Attendance System</p>
                </div>
              </button>

              {/* Mobile AI + Clock button */}
              <button
                onClick={() => setIsAIModalOpen(true)}
                className="md:hidden p-2 bg-[#0047cc] text-white rounded-xl flex-shrink-0"
                title="AI Advisor"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              </button>

              <ThemeToggle theme={theme} onToggle={onToggleTheme} />

              {/* ── Guest mode: Explore Demo badge ── */}
              {isGuestMode && (
                <motion.button
                  onClick={onExitGuest}
                  animate={{ scale: [1, 1.06, 1], rotate: [0, -1.5, 1.5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 6, ease: 'easeInOut' }}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest shadow-lg relative overflow-hidden flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #0047cc, #0ea5e9, #14b8a6)' }}
                  title="Back to guided demo"
                >
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
                  />
                  <span className="relative z-10">✦ Explore Demo</span>
                </motion.button>
              )}
              
              <div className="flex items-center gap-2 group cursor-pointer p-1 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all" onClick={onLogout}>
                 <div className="text-right hidden sm:block">
                   <p className="text-xs font-black text-slate-900 dark:text-white">HRcopilot</p>
                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">SYSTEM</p>
                 </div>
                 <div className="w-8 h-8 md:w-10 md:h-10 rounded-2xl border-2 border-orange-500 bg-orange-500/20 flex items-center justify-center text-orange-500 font-black text-lg md:text-xl italic shadow-lg">
                   H
                 </div>
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto relative p-3 sm:p-5 md:p-10 scroll-smooth text-slate-900 dark:text-white">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--brand-primary)]/5 blur-[160px] rounded-full pointer-events-none -z-10 animate-pulse" />

          <div className="max-w-[1400px] mx-auto animate-fade-in">
             <Suspense fallback={<PageLoader />}>
             <Routes>
                <Route path="/" element={currentUserRole === UserRole.EMPLOYEE ? <EmployeeDashboard /> : <Dashboard userProfile={userProfile} />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/roles" element={<RoleManagement />} />
                <Route path="/branches" element={<Branches />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/my-attendance" element={<MyAttendance />} />
                <Route path="/payroll" element={<Payroll />} />
                <Route path="/performance" element={currentUserRole === UserRole.EMPLOYEE ? <MyPerformance /> : <Performance onNotify={(t, m, type) => addNotification(t, m, type)} />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/identity" element={<Identity />} />
                <Route path="/communication/chat" element={<Communication />} />
                <Route path="/leave" element={<Leave />} />
                <Route path="/talent" element={<TalentManagement />} />
                <Route path="/settings" element={<Settings brand={brand} onUpdate={onUpdateBrand} userProfile={userProfile} onUpdateProfile={onUpdateProfile} />} />
                <Route path="/communication/memo" element={<MemoSystem />} />
                <Route path="/automation" element={<AutomationAI />} />
                <Route path="/integrations" element={<Integrations />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/procurement" element={<Procurement />} />
                <Route path="/crm" element={<CRM />} />
                <Route path="/cabinet" element={<Cabinet />} />
                <Route path="/my-payroll" element={<MyPayroll />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/setup" element={<Setup />} />
                <Route path="/intelligence" element={<LeakageWidget standalone={true} />} />
                <Route path="*" element={<Navigate to="/" />} />
             </Routes>
             </Suspense>
          </div>
        </main>
      </div>

      <AIAdvisorModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)}
        userName={userProfile.name}
      />
      <ClockInModal
        isOpen={isClockInOpen}
        onClose={() => setIsClockInOpen(false)}
        userName={userProfile.name}
      />
      <LeakageAnalysisModal
        isOpen={isLeakageModalOpen}
        onClose={() => setIsLeakageModalOpen(false)}
        userName={userProfile.name}
      />

      {/* ── Voice System — subtitles only in main app ────────────────────── */}
      <Suspense fallback={null}><CinematicSubtitles /></Suspense>
    </div>
  );
};

// Fixed: Added the App component with default export to fix the "no default export" error in App.tsx
const App: React.FC = () => {
  // Read guest role set by Landing role picker — skip login entirely
  const guestRole = sessionStorage.getItem('hr360_guest_role') as 'executive' | 'employee' | null;

  const [isAuthenticated, setIsAuthenticated] = useState(!!guestRole);
  const [showLogin, setShowLogin] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(!!guestRole);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [brand, setBrand] = useState<BrandSettings>({
    companyName: 'HRcopilot',
    logoUrl: '',
    primaryColor: '#0047cc',
    currency: 'NGN',
  });
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: guestRole === 'employee' ? 'Guest Employee' : 'HRcopilot System',
    username: guestRole === 'employee' ? 'employee' : 'ceo',
    avatar: '',
    role: guestRole === 'employee' ? UserRole.EMPLOYEE : UserRole.CEO,
  });

  useEffect(() => {
    loadBrandSettings().then(saved => {
      if (saved) setBrand(saved);
    });
  }, []);

  useEffect(() => {
    // Only apply dark mode if we are NOT on the landing page
    const isLandingPage = !isAuthenticated && !showLogin && !isGuestMode;
    if (theme === 'dark' && !isLandingPage) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, isAuthenticated, showLogin, isGuestMode]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [isAuthenticated, showLogin]);

  if (!isAuthenticated) {
    if (showLogin) {
      return (
        <Login 
          brand={brand} 
          onLogin={async (user) => {
            try {
              const userCred = await signInAnonymously();
              await setDoc(doc(db, 'users', userCred.user.uid), {
                uid: userCred.user.uid,
                name: user.name,
                email: user.username + '@example.com',
                role: user.role,
                avatar: user.avatar
              });
              setUserProfile({ ...user, uid: userCred.user.uid });
              setIsAuthenticated(true);
            } catch (error) {
              console.error("Auth error:", error);
              setUserProfile(user);
              setIsAuthenticated(true);
            }
          }} 
          onBackToLanding={() => setShowLogin(false)}
          theme={theme}
          onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        />
      );
    }
    return (
      <Landing 
        brand={brand} 
        onLogin={() => setShowLogin(true)} 
        onGetStarted={() => setShowLogin(true)}
        onViewApp={(role) => {
          setUserProfile({
            name: role === 'executive' ? 'Guest Executive' : 'Guest Employee',
            username: role === 'executive' ? 'guest_ceo' : 'guest_employee',
            avatar: `https://picsum.photos/40/40?sig=${role}`,
            role: role === 'executive' ? UserRole.CEO : UserRole.EMPLOYEE,
          });
          setIsGuestMode(true);
          setIsAuthenticated(true);
        }}
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
      />
    );
  }

  return (
    <HR360Provider>
      <CurrencyProvider currency={brand.currency}>
        <HashRouter>
          <MainApp 
            theme={theme}
            onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            brand={brand}
            onUpdateBrand={setBrand}
            userProfile={userProfile}
            onUpdateProfile={setUserProfile}
            isGuestMode={isGuestMode}
            onExitGuest={() => {
              sessionStorage.removeItem('hr360_guest_role');
              setIsAuthenticated(false);
              setIsGuestMode(false);
              window.location.href = '/';
            }}
            onLogout={() => {
              sessionStorage.removeItem('hr360_guest_role');
              auth.signOut();
              setIsAuthenticated(false);
              setIsGuestMode(false);
              window.location.href = '/';
            }}
          />
        </HashRouter>
      </CurrencyProvider>
    </HR360Provider>
  );
};

export default App;
