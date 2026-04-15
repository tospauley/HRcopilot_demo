// ============================================
// FILE: src/demo/orchestrator/guidedFlow.ts
// PURPOSE: 9-step guided demo flow definition.
//   Each step maps to a module route, a narration script key,
//   a duration, and optional Joyride spotlight targets.
//   The flow runner in GuidedFlowRunner.tsx consumes this.
// ============================================

import type { DemoStep } from './demoOrchestrator';

export const GUIDED_FLOW: DemoStep[] = [
  {
    id:           'intro',
    label:        'Welcome',
    module:       '',                       // stays on dashboard
    narrationKey: 'hook.opening',
    durationMs:   12_000,
    joyrideTarget: '#dashboard-kpis',
  },
  {
    id:           'employees',
    label:        'Employees',
    module:       'employees',
    narrationKey: 'talentManagement.hook',
    durationMs:   10_000,
    joyrideTarget: '#employees-table',
  },
  {
    id:           'attendance',
    label:        'Attendance',
    module:       'attendance',
    narrationKey: 'attendance.hook',
    durationMs:   15_000,
    joyrideTarget: '#attendance-map',
  },
  {
    id:           'payroll',
    label:        'Payroll',
    module:       'payroll',
    narrationKey: 'payroll.hook',
    durationMs:   15_000,
    joyrideTarget: '#payroll-run-btn',
  },
  {
    id:           'payroll-slip',
    label:        'Payslip',
    module:       'payroll',
    narrationKey: 'payroll.ledgerPost',
    durationMs:   12_000,
    joyrideTarget: '#payroll-run-btn',
    uiAction:     'open:payslip',
  },
  {
    id:           'procurement',
    label:        'Procurement',
    module:       'procurement',
    narrationKey: 'procurement.hook',
    durationMs:   12_000,
    joyrideTarget: '#procurement-table',
  },
  {
    id:           'performance',
    label:        'Performance',
    module:       'performance',
    narrationKey: 'performance.hook',
    durationMs:   10_000,
    joyrideTarget: '#performance-grid',
  },
  {
    id:           'ai-advisor',
    label:        'AI Advisor',
    module:       '',                       // modal overlay, no route change
    narrationKey: 'dashboard.advisor',
    durationMs:   10_000,
    joyrideTarget: '#ai-advisor-btn',
    uiAction:     'open:ai-advisor',
  },
  {
    id:           'leakage',
    label:        'Leakage Analysis',
    module:       '',                       // stay on current page — modal overlays it
    narrationKey: 'accountingFinance.costSavings',
    durationMs:   10_000,
    joyrideTarget: '#leakage-widget',
    uiAction:     'open:leakage',
  },
  {
    id:           'finance',
    label:        'Finance',
    module:       'finance',
    narrationKey: 'accountingFinance.hook',
    durationMs:   12_000,
    joyrideTarget: '#finance-ledger',
  },
  {
    id:           'closing',
    label:        'ROI Summary',
    module:       '',
    narrationKey: 'elevator.pitch.ceo',
    durationMs:   10_000,
    joyrideTarget: '#dashboard-kpis',
  },
];

// ── Role-aware narration key resolver ─────────────────────────────────────────
// Picks the right voice line from ALL_SCRIPTS based on the user's role.

import { UserRole } from '../../../types';
import { ALL_SCRIPTS } from '../voice/scripts/index';

type ScriptRole = 'CEO' | 'HR' | 'FINANCE';

function roleToScriptKey(role: UserRole | null): ScriptRole {
  if (role === UserRole.HR_MANAGER)  return 'HR';
  if (role === UserRole.ACCOUNTANT)  return 'FINANCE';
  return 'CEO';
}

/**
 * Resolve the narration text for a given step and user role.
 * Falls back to CEO line if the role-specific line doesn't exist.
 */
export function resolveNarration(step: DemoStep, role: UserRole | null): string {
  const scriptKey = roleToScriptKey(role);
  const entry     = ALL_SCRIPTS[step.narrationKey];
  if (!entry) return '';
  return entry[scriptKey] ?? entry['CEO'] ?? Object.values(entry)[0] ?? '';
}
