// ============================================
// FILE: src/demo/walkthroughs/index.ts
// PURPOSE: Joyride step definitions for all 12 modules.
//   Targets use IDs that exist in the actual page components,
//   or 'body' as a centered fallback for pages without specific targets.
// ============================================

import type { Step } from 'react-joyride';

export interface DemoJoyrideStep extends Step {
  narrationKey?: string;
}

// ── Shared Joyride styles ─────────────────────────────────────────────────────
export const JOYRIDE_STYLES = {
  options: {
    primaryColor:    '#0369a1',
    backgroundColor: '#ffffff',
    textColor:       '#1e293b',
    arrowColor:      '#ffffff',
    overlayColor:    'rgba(15, 10, 30, 0.6)',
    zIndex:          9999,
  },
  tooltip: {
    borderRadius:  '16px',
    padding:       '20px 24px',
    fontSize:      '14px',
    boxShadow:     '0 20px 60px rgba(0,0,0,0.2)',
    border:        '1px solid rgba(3,105,161,0.15)',
  },
  tooltipTitle: {
    fontSize:      '13px',
    fontWeight:    900,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    color:         '#0369a1',
    marginBottom:  '8px',
  },
  buttonNext: {
    borderRadius:  '10px',
    padding:       '8px 18px',
    fontSize:      '11px',
    fontWeight:    900,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    background:    'linear-gradient(135deg, #0369a1, #2563eb)',
  },
  buttonSkip: {
    color:    '#94a3b8',
    fontSize: '11px',
  },
  buttonBack: {
    color:    '#64748b',
    fontSize: '11px',
  },
  beacon: {
    inner: '#0369a1',
    outer: 'rgba(3,105,161,0.3)',
  },
};

// ── 1. Dashboard ──────────────────────────────────────────────────────────────
export const dashboardWalkthrough: DemoJoyrideStep[] = [
  {
    target:        '#dashboard-overview',
    content:       'Your command centre — headcount, attendance rate, payroll summary, and financial health. All live, all in one view.',
    narrationKey:  'dashboard.overview',
    placement:     'bottom',
    disableBeacon: true,
    title:         'Executive Dashboard',
  },
  {
    target:        '#ai-advisor-btn',
    content:       'The AI Advisor reads your live data and surfaces the one insight that matters most right now — not a generic report.',
    narrationKey:  'dashboard.advisor',
    placement:     'bottom',
    title:         'AI Advisor',
  },
];

// ── 2. Employees ──────────────────────────────────────────────────────────────
export const employeesWalkthrough: DemoJoyrideStep[] = [
  {
    target:        'body',
    content:       'Every employee record in one searchable, filterable table. Department, role, status, and salary — all visible at a glance.',
    narrationKey:  'talentManagement.hook',
    placement:     'center',
    disableBeacon: true,
    title:         'Employee Directory',
  },
  {
    target:        'body',
    content:       'Add a new employee in three steps — personal details, role assignment, and payroll setup. Takes under two minutes.',
    narrationKey:  'talentManagement.pipeline',
    placement:     'center',
    title:         'Add Employee',
  },
];

// ── 3. Attendance ─────────────────────────────────────────────────────────────
export const attendanceWalkthrough: DemoJoyrideStep[] = [
  {
    target:        'body',
    content:       'The geofence map shows your approved clock-in zones. Employees outside the boundary are blocked — GPS spoofing is detected server-side.',
    narrationKey:  'attendance.hook',
    placement:     'center',
    disableBeacon: true,
    title:         'Biometric Attendance',
  },
  {
    target:        'body',
    content:       'Clock-in runs three simultaneous checks: face recognition, geofence validation, and IP whitelisting. All three must pass.',
    narrationKey:  'attendance.clockInInitiate',
    placement:     'center',
    title:         'Three-Layer Verification',
  },
  {
    target:        'body',
    content:       'Every verified clock-in is an immutable record — timestamped, biometrically flagged, and linked directly to the payroll engine.',
    narrationKey:  'attendance.clockInSuccess',
    placement:     'center',
    title:         'Verified Records',
  },
];

// ── 4. Payroll ────────────────────────────────────────────────────────────────
export const payrollWalkthrough: DemoJoyrideStep[] = [
  {
    target:        'body',
    content:       'One click runs payroll for all active employees — pulling verified attendance, applying deductions, and calculating statutory obligations automatically.',
    narrationKey:  'payroll.hook',
    placement:     'center',
    disableBeacon: true,
    title:         'Automated Payroll',
  },
  {
    target:        'body',
    content:       'Payroll posts directly to the general ledger the moment it is approved. The audit trail runs from clock-in to ledger entry.',
    narrationKey:  'payroll.ledgerPost',
    placement:     'center',
    title:         'Ledger Integration',
  },
];

// ── 5. Performance ────────────────────────────────────────────────────────────
export const performanceWalkthrough: DemoJoyrideStep[] = [
  {
    target:        'body',
    content:       'Evaluation templates define scoring categories and weights — configured once by HR, applied consistently across every department.',
    narrationKey:  'performance.hook',
    placement:     'center',
    disableBeacon: true,
    title:         'Performance Management',
  },
  {
    target:        'body',
    content:       'When the composite score crosses the bonus threshold, a payroll adjustment queues automatically — no email to HR required.',
    narrationKey:  'performance.payrollTrigger',
    placement:     'center',
    title:         'Performance-Linked Pay',
  },
];

// ── 6. Leave ──────────────────────────────────────────────────────────────────
export const leaveWalkthrough: DemoJoyrideStep[] = [
  {
    target:        'body',
    content:       'All leave requests in one view — pending, approved, and rejected. Real-time balances update automatically when requests are approved.',
    narrationKey:  'costsavings.turnover',
    placement:     'center',
    disableBeacon: true,
    title:         'Leave Management',
  },
];

// ── 7. Finance ────────────────────────────────────────────────────────────────
export const financeWalkthrough: DemoJoyrideStep[] = [
  {
    target:        'body',
    content:       'The general ledger — every transaction posted automatically from payroll, procurement, and invoices. Always current, always reconciled.',
    narrationKey:  'accountingFinance.hook',
    placement:     'center',
    disableBeacon: true,
    title:         'Accounting & Finance',
  },
  {
    target:        'body',
    content:       'Month-end close in under 24 hours — attendance locked, payroll posted, expenses reconciled, reports generated in one automated sequence.',
    narrationKey:  'accountingFinance.financialClose',
    placement:     'center',
    title:         'Month-End Close',
  },
];

// ── 8. CRM ────────────────────────────────────────────────────────────────────
export const crmWalkthrough: DemoJoyrideStep[] = [
  {
    target:        'body',
    content:       'Your full sales pipeline — every deal scored by AI against historical win patterns. Focus on the opportunities most likely to close.',
    narrationKey:  'crmSales.hook',
    placement:     'center',
    disableBeacon: true,
    title:         'CRM & Sales Pipeline',
  },
];

// ── 9. Talent Management ──────────────────────────────────────────────────────
export const talentWalkthrough: DemoJoyrideStep[] = [
  {
    target:        'body',
    content:       'Your hiring funnel — applications, screenings, interviews, offers, and hires — visible in real time.',
    narrationKey:  'talentManagement.hook',
    placement:     'center',
    disableBeacon: true,
    title:         'Talent Acquisition',
  },
];

// ── 10. Branches ──────────────────────────────────────────────────────────────
export const branchesWalkthrough: DemoJoyrideStep[] = [
  {
    target:        'body',
    content:       'Every branch location with headcount, attendance rate, and payroll cost. Each branch has its own geofence radius.',
    narrationKey:  'dashboard.overview',
    placement:     'center',
    disableBeacon: true,
    title:         'Branch Management',
  },
];

// ── 11. Procurement ───────────────────────────────────────────────────────────
export const procurementWalkthrough: DemoJoyrideStep[] = [
  {
    target:        'body',
    content:       'Every purchase request goes through the same controlled approval workflow. Three-way match verification runs automatically before any payment is released.',
    narrationKey:  'procurement.hook',
    placement:     'center',
    disableBeacon: true,
    title:         'Procurement Control',
  },
];

// ── 12. Communication ─────────────────────────────────────────────────────────
export const communicationWalkthrough: DemoJoyrideStep[] = [
  {
    target:        'body',
    content:       'Team channels organised by department. Broadcast memos to the entire organisation with read receipts and acknowledgement tracking.',
    narrationKey:  'dashboard.overview',
    placement:     'center',
    disableBeacon: true,
    title:         'Team Communication',
  },
];

// ── Master export map ─────────────────────────────────────────────────────────
export const MODULE_WALKTHROUGHS: Record<string, DemoJoyrideStep[]> = {
  dashboard:     dashboardWalkthrough,
  employees:     employeesWalkthrough,
  attendance:    attendanceWalkthrough,
  payroll:       payrollWalkthrough,
  performance:   performanceWalkthrough,
  leave:         leaveWalkthrough,
  finance:       financeWalkthrough,
  crm:           crmWalkthrough,
  talent:        talentWalkthrough,
  branches:      branchesWalkthrough,
  procurement:   procurementWalkthrough,
  communication: communicationWalkthrough,
};

