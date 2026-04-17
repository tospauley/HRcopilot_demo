// ============================================
// FILE: src/demo/onboarding/onboardingStore.ts
// PURPOSE: Zustand store for onboarding state.
//          Uses sessionStorage so it resets on new tab/session.
// ============================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserRole } from '../../../types';

export type OnboardingStep =
  | 'landing'
  | 'welcome-zoom'
  | 'role-selection'
  | 'org-profile'
  | 'mode-selection'
  | 'preparing'
  | 'complete';

export type DemoMode = 'guided' | 'sandbox' | 'flows';

export interface OrgProfile {
  companyName: string;
  primaryColor: string;
  logoDataUrl: string | null;
  industry: string;
  employeeCount: string;
}

interface OnboardingState {
  step:       OnboardingStep;
  role:       UserRole | null;
  demoMode:   DemoMode | null;
  orgProfile: OrgProfile | null;
  // Actions
  setStep:       (s: OnboardingStep) => void;
  setRole:       (r: UserRole) => void;
  setDemoMode:   (m: DemoMode) => void;
  setOrgProfile: (p: OrgProfile) => void;
  reset:         () => void;
}

const DEFAULTS: Pick<OnboardingState, 'step' | 'role' | 'demoMode' | 'orgProfile'> = {
  step:       'landing',
  role:       null,
  demoMode:   null,
  orgProfile: null,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setStep:       (step)       => set({ step }),
      setRole:       (role)       => set({ role }),
      setDemoMode:   (demoMode)   => set({ demoMode }),
      setOrgProfile: (orgProfile) => set({ orgProfile }),
      reset:         ()           => set({ ...DEFAULTS }),
    }),
    {
      name:    'HRcopilot_onboarding',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        step:       s.step,
        role:       s.role,
        demoMode:   s.demoMode,
        orgProfile: s.orgProfile,
      }),
    },
  ),
);
