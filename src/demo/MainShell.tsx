// ============================================
// FILE: src/demo/MainShell.tsx
// PURPOSE: Post-onboarding app shell.
//   Sidebar + TopNav + all 12 module routes.
//   Reads brand color from onboarding store (CEO customisation).
//   Renders VoiceControlBar and CinematicSubtitles.
// ============================================

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Joyride } from 'react-joyride';
import { useOnboardingStore } from './onboarding/onboardingStore';
import { SandboxToggle } from './components/SandboxToggle';
import { ProgressIndicator } from './components/ProgressIndicator';
import { ModuleWrapper } from './components/ModuleWrapper';
import { GuidedFlowRunner } from './components/GuidedFlowRunner';
import { SandboxBanner } from './components/SandboxBanner';
import { useDemoOrchestrator } from './orchestrator/demoOrchestrator';
import { useModuleWalkthrough } from './walkthroughs/useModuleWalkthrough';
import { UserRole } from '../../types';

// Derive active module key from pathname e.g. /app/attendance → 'attendance'
function useActiveModule(): string {
  const { pathname } = useLocation();
  const seg = pathname.split('/').filter(Boolean);
  return seg[1] ?? 'dashboard'; // /app/<module>
}

// ── Lazy module pages ─────────────────────────────────────────────────────────
const Dashboard        = lazy(() => import('../../pages/Dashboard'));
const Employees        = lazy(() => import('../../pages/Employees'));
const Attendance       = lazy(() => import('../../pages/Attendance'));
const Payroll          = lazy(() => import('../../pages/Payroll'));
const Performance      = lazy(() => import('../../pages/Performance'));
const Leave            = lazy(() => import('../../pages/Leave'));
const Branches         = lazy(() => import('../../pages/Branches'));
const RoleManagement   = lazy(() => import('../../pages/RoleManagement'));
const Communication    = lazy(() => import('../../pages/Communication'));
const CRM              = lazy(() => import('../../pages/CRM'));
const Finance          = lazy(() => import('../../pages/Finance'));
const TalentManagement = lazy(() => import('../../pages/TalentManagement'));
const Goals            = lazy(() => import('../../pages/Goals'));
const Settings         = lazy(() => import('../../pages/Settings'));
const Procurement      = lazy(() => import('../../pages/Procurement'));
const Invoices         = lazy(() => import('../../pages/Invoices'));
const Cabinet          = lazy(() => import('../../pages/Cabinet'));
const Memo             = lazy(() => import('../../pages/Memo'));
const LeakageWidget    = lazy(() => import('../components/leakage/OrganizationalIntelligenceWidget'));

import AIAdvisorModal      from '../../components/AIAdvisorModal';
import ClockInModal        from '../../components/ClockInModal';
import LeakageAnalysisModal from '../../components/LeakageAnalysisModal';

// ── Page loader ───────────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-7 h-7 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Loading…</p>
      </div>
    </div>
  );
}

// ── Sidebar nav config ────────────────────────────────────────────────────────
interface NavItem {
  label:    string;
  route?:   string;
  icon?:    React.ReactNode;
  isHeader?: boolean;
  badge?:   string | number;
}

const NAV: NavItem[] = [
  { label: 'Dashboard',          route: '/app',              icon: '📊' },
  { label: 'PEOPLE',             isHeader: true },
  { label: 'Employees',          route: '/app/employees',    icon: '👥' },
  { label: 'Role Management',    route: '/app/roles',        icon: '🔐' },
  { label: 'Branches',           route: '/app/branches',     icon: '🏢' },
  { label: 'OPERATIONS',         isHeader: true },
  { label: 'Attendance',         route: '/app/attendance',   icon: '⏱️', badge: 'Live' },
  { label: 'Leave',              route: '/app/leave',        icon: '🌴' },
  { label: 'Payroll',            route: '/app/payroll',      icon: '💰' },
  { label: 'TALENT',             isHeader: true },
  { label: 'Performance',        route: '/app/performance',  icon: '🎯' },
  { label: 'Talent Management',  route: '/app/talent',       icon: '🌟' },
  { label: 'Goals',              route: '/app/goals',        icon: '🏆' },
  { label: 'ENTERPRISE+',        isHeader: true },
  { label: 'Finance',            route: '/app/finance',      icon: '📈' },
  { label: 'Procurement',        route: '/app/procurement',  icon: '🛒' },
  { label: 'CRM & Sales',        route: '/app/crm',          icon: '🤝' },
  { label: 'Invoices',           route: '/app/invoices',     icon: '🧾' },
  { label: 'Virtual Cabinet',    route: '/app/cabinet',      icon: '🗄️' },
  { label: 'Intelligence',       route: '/app/intelligence', icon: '🧠' },
  { label: 'COMMUNICATION',      isHeader: true },
  { label: 'Team Chat',          route: '/app/chat',         icon: '💬', badge: 12 },
  { label: 'Memo',               route: '/app/memo',         icon: '📝' },
  { label: 'SYSTEM',             isHeader: true },
  { label: 'Brand Settings',     route: '/app/settings',     icon: '🎨' },
];

// ── Sidebar item ──────────────────────────────────────────────────────────────
interface SidebarItemProps { item: NavItem; collapsed: boolean }
const SidebarItem: React.FC<SidebarItemProps> = ({ item, collapsed }) => {
  const location = useLocation();
  const isActive = item.route
    ? item.route === '/app'
      ? location.pathname === '/app' || location.pathname === '/app/'
      : location.pathname.startsWith(item.route)
    : false;

  if (item.isHeader) {
    return collapsed ? (
      <div className="h-px bg-slate-100 mx-3 my-4" />
    ) : (
      <p className="px-5 mt-6 mb-1.5 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">
        {item.label}
      </p>
    );
  }

  return (
    <Link
      to={item.route!}
      className={`
        flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl transition-all duration-200 group relative
        ${isActive
          ? 'bg-violet-50 border border-violet-200 text-violet-700'
          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
        }
      `}
    >
      <span className="text-base flex-shrink-0">{item.icon}</span>
      {!collapsed && (
        <>
          <span className="text-[12px] font-bold tracking-wide truncate flex-1">{item.label}</span>
          {item.badge && (
            <span className="px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase bg-violet-100 text-violet-600">
              {item.badge}
            </span>
          )}
        </>
      )}
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-violet-500 rounded-full"
        />
      )}
    </Link>
  );
};

// ── Joyride controller — reads active module, drives walkthrough ──────────────
function JoyrideController() {
  const activeModule = useActiveModule();
  const { steps, run, stepIndex, handleCallback } = useModuleWalkthrough(activeModule);
  const { mode } = useDemoOrchestrator();

  // Joyride only runs in sandbox mode — guided mode uses GuidedFlowRunner
  if (mode === 'guided' || !steps.length || !run) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      callback={handleCallback}
      continuous
      showSkipButton
      showProgress
      disableOverlayClose
      disableScrolling={false}
      floaterProps={{ disableAnimation: false }}
      styles={{
        options: {
          primaryColor:    '#7c3aed',
          backgroundColor: '#ffffff',
          textColor:       '#1e293b',
          arrowColor:      '#ffffff',
          overlayColor:    'rgba(15, 10, 30, 0.55)',
          zIndex:          9999,
        },
        tooltip: {
          borderRadius: '16px',
          padding:      '20px 24px',
          fontSize:     '14px',
          boxShadow:    '0 20px 60px rgba(0,0,0,0.2)',
          border:       '1px solid rgba(124,58,237,0.15)',
        },
        buttonNext: {
          borderRadius:    '10px',
          padding:         '8px 18px',
          fontSize:        '11px',
          fontWeight:      900,
          letterSpacing:   '0.1em',
          textTransform:   'uppercase',
          background:      'linear-gradient(135deg, #7c3aed, #6366f1)',
        },
        buttonSkip: { color: '#94a3b8', fontSize: '11px' },
        buttonBack: { color: '#64748b', fontSize: '11px' },
      }}
    />
  );
}

// ── Main shell ────────────────────────────────────────────────────────────────
export default function MainShell() {
  const { role, orgProfile, reset } = useOnboardingStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [clockTime, setClockTime] = useState(new Date());
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isClockInOpen, setIsClockInOpen] = useState(false);
  const [isLeakageOpen, setIsLeakageOpen] = useState(false);
  const location = useLocation();

  // Apply brand color from CEO org profile
  useEffect(() => {
    const color = orgProfile?.primaryColor ?? '#0047cc';
    document.documentElement.style.setProperty('--brand-primary', color);
  }, [orgProfile?.primaryColor]);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setClockTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Handle guided demo UI actions (e.g. auto-open modals)
  useEffect(() => {
    const handler = (e: Event) => {
      const action = (e as CustomEvent<string>).detail;
      if (action === 'open:ai-advisor') setIsAIOpen(true);
    };
    window.addEventListener('demo:uiAction', handler);
    return () => window.removeEventListener('demo:uiAction', handler);
  }, []);

  const companyName = orgProfile?.companyName || 'HR360';
  const roleLabel = role === UserRole.CEO ? 'CEO' : role === UserRole.HR_MANAGER ? 'HR Manager' : role === UserRole.ACCOUNTANT ? 'Accountant' : 'Guest';

  const handleRestart = () => {
    reset();
    navigate('/');
  };

  // Dummy brand/profile for pages that need them
  const brand = {
    companyName,
    logoUrl: orgProfile?.logoDataUrl ?? '',
    primaryColor: orgProfile?.primaryColor ?? '#0047cc',
  };
  const userProfile = {
    name: roleLabel,
    username: roleLabel.toLowerCase(),
    avatar: '',
    role: role ?? UserRole.CEO,
  };

  return (
    <div className="flex h-screen h-[100dvh] overflow-hidden bg-slate-50 text-slate-900">

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] md:relative flex flex-col h-screen h-[100dvh]
        border-r border-slate-200 bg-white transition-all duration-300 shadow-sm
        ${mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
        ${collapsed ? 'md:w-[68px]' : 'md:w-64'}
      `}>

        {/* Logo */}
        <div className="px-4 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            {orgProfile?.logoDataUrl ? (
              <img src={orgProfile.logoDataUrl} alt="Logo" className="w-8 h-8 rounded-lg object-contain flex-shrink-0" />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                style={{ background: orgProfile?.primaryColor ?? '#0047cc' }}
              >
                {companyName[0]?.toUpperCase()}
              </div>
            )}
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight truncate">{companyName}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.15em]">HR360 Demo</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-700 p-1"
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          {NAV.map((item, i) => (
            <SidebarItem key={String(i)} item={item} collapsed={collapsed as boolean} />
          ))}        </nav>

        {/* Bottom: role badge + collapse + restart */}
        <div className="border-t border-slate-100 p-3 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-violet-100 border border-violet-200 flex items-center justify-center text-[10px] font-black text-violet-600 flex-shrink-0">
                {roleLabel[0]}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-black text-slate-800 truncate">{roleLabel}</p>
                <p className="text-[8px] text-slate-400 uppercase tracking-widest">Demo Mode</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex w-full items-center justify-center gap-2 p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all text-xs"
          >
            <span className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}>◀</span>
            {!collapsed && <span className="text-[9px] font-black uppercase tracking-widest">Collapse</span>}
          </button>
          {!collapsed && (
            <button
              onClick={handleRestart}
              className="w-full py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
            >
              ↩ Restart Demo
            </button>
          )}
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top nav */}
        <header className="h-16 border-b border-slate-200 flex items-center px-4 md:px-6 bg-white justify-between z-50 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-slate-700 transition-all"
            >
              ☰
            </button>

            {/* Quick action buttons */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => setIsAIOpen(true)}
                id="ai-advisor-btn"
                className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-xl text-[10px] font-black uppercase tracking-wider text-violet-700 transition-all"
              >
                🤖 AI Advisor
              </button>
              <button
                onClick={() => setIsLeakageOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-[10px] font-black uppercase tracking-wider text-indigo-700 transition-all"
              >
                📊 Leakage Analysis
              </button>
            </div>

            {/* Progress indicator — guided mode only */}
            <ProgressIndicator compact />
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Live clock / clock-in */}
            <button
              onClick={() => setIsClockInOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-300 rounded-xl transition-all group"
            >
              <span className="text-sm">⏱️</span>
              <div className="text-left">
                <p className="text-[11px] font-black text-slate-800 tabular-nums">
                  {clockTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                </p>
                <p className="text-[8px] font-black text-violet-500 uppercase tracking-widest">Attendance</p>
              </div>
            </button>

            {/* Mode switcher */}
            <SandboxToggle compact />

            {/* Role badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-black"
                style={{ background: orgProfile?.primaryColor ?? '#0047cc' }}
              >
                {roleLabel[0]}
              </div>
              <span className="text-[10px] font-black text-slate-600 hidden sm:block">{roleLabel}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto relative bg-slate-50">
          {/* Subtle top gradient */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none -z-0 opacity-30"
            style={{ background: orgProfile?.primaryColor ?? '#0047cc' }}
          />

          <div className="relative z-10 p-4 md:p-8 max-w-[1400px] mx-auto">
            {/* Joyride — driven by useModuleWalkthrough for the active module */}
            <JoyrideController />

            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route index               element={<ModuleWrapper name="Dashboard"><Dashboard userProfile={userProfile} /></ModuleWrapper>} />
                <Route path="employees"    element={<ModuleWrapper name="Employees"><Employees /></ModuleWrapper>} />
                <Route path="roles"        element={<ModuleWrapper name="Role Management"><RoleManagement /></ModuleWrapper>} />
                <Route path="branches"     element={<ModuleWrapper name="Branches"><Branches /></ModuleWrapper>} />
                <Route path="attendance"   element={<ModuleWrapper name="Attendance"><Attendance /></ModuleWrapper>} />
                <Route path="leave"        element={<ModuleWrapper name="Leave"><Leave /></ModuleWrapper>} />
                <Route path="payroll"      element={<ModuleWrapper name="Payroll"><Payroll /></ModuleWrapper>} />
                <Route path="performance"  element={<ModuleWrapper name="Performance"><Performance onNotify={() => {}} /></ModuleWrapper>} />
                <Route path="talent"       element={<ModuleWrapper name="Talent Management"><TalentManagement /></ModuleWrapper>} />
                <Route path="goals"        element={<ModuleWrapper name="Goals"><Goals /></ModuleWrapper>} />
                <Route path="finance"      element={<ModuleWrapper name="Finance"><Finance /></ModuleWrapper>} />
                <Route path="procurement"  element={<ModuleWrapper name="Procurement"><Procurement /></ModuleWrapper>} />
                <Route path="crm"          element={<ModuleWrapper name="CRM"><CRM /></ModuleWrapper>} />
                <Route path="invoices"     element={<ModuleWrapper name="Invoices"><Invoices /></ModuleWrapper>} />
                <Route path="cabinet"      element={<ModuleWrapper name="Cabinet"><Cabinet /></ModuleWrapper>} />
                <Route path="intelligence" element={<ModuleWrapper name="Intelligence"><LeakageWidget standalone={true} /></ModuleWrapper>} />
                <Route path="chat"         element={<ModuleWrapper name="Team Chat"><Communication /></ModuleWrapper>} />
                <Route path="memo"         element={<ModuleWrapper name="Memo"><Memo /></ModuleWrapper>} />
                <Route path="settings"     element={<ModuleWrapper name="Settings"><Settings brand={brand} onUpdate={() => {}} userProfile={userProfile} onUpdateProfile={() => {}} /></ModuleWrapper>} />
                <Route path="*"            element={<Navigate to="/app" replace />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>

      {/* ── Modals ── */}
      <AIAdvisorModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        userName={roleLabel}
      />
      <ClockInModal
        isOpen={isClockInOpen}
        onClose={() => setIsClockInOpen(false)}
        userName={roleLabel}
      />
      <LeakageAnalysisModal
        isOpen={isLeakageOpen}
        onClose={() => setIsLeakageOpen(false)}
        userName={roleLabel}
      />

      {/* ── Guided demo engine — navigates + narrates automatically ── */}
      <GuidedFlowRunner />

      {/* ── Sandbox/Flows mode banner ── */}
      <SandboxBanner />
    </div>
  );
}
