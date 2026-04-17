# HRcopilot Demo System — Implementation Spec
**Last Updated:** 15 April 2026  
**Status:** ~85% Complete  
**Goal:** Production-ready, self-selling enterprise demo with 12 modules, voice narration, cinematic subtitles, onboarding flow, and demo orchestration.

---

## CODEBASE AUDIT — WHAT EXISTS vs WHAT'S MISSING

### ✅ COMPLETE (Do Not Rebuild)

| System | Files |
|--------|-------|
| Voice/Narration Engine | `src/demo/voice/narrationEngine.ts`, `kokoroWorker.ts`, `narratorStore.ts`, `subtitleEngine.ts`, `CinematicSubtitles.tsx`, `VoiceControlBar.tsx`, `useNarration.ts` |
| Audio Cache (IndexedDB) | `src/demo/voice/audioCache.ts`, `preRecordedManager.ts`, `modelCache.ts` |
| Admin System | `src/demo/admin/AdminPage.tsx`, `AdminShell.tsx`, `AdminLogin.tsx`, `adminAuth.ts`, `AdminCredentialsTab.tsx` |
| Admin Voice Panels | `NarratorAdminPanel.tsx`, `CacheAdminTab.tsx`, `CacheAdminTabDark.tsx`, `NarratorInlinePanel.tsx` |
| Leakage Widget | `src/components/leakage/` — full engine, hooks, steps, UI (100%) |
| Core Modules (pages) | `Employees.tsx`, `Attendance.tsx`, `Payroll.tsx`, `Performance.tsx`, `Leave.tsx`, `Branches.tsx`, `RoleManagement.tsx`, `Communication.tsx`, `CRM.tsx`, `Finance.tsx`, `TalentManagement.tsx`, `Goals.tsx` |
| AI Advisor Widget | `components/AIAdvisorModal.tsx` |
| Data Layer | `demoData.ts` (seed data), `src/context/HRcopilotContext.tsx`, `src/lib/storage.ts`, `src/lib/cache.ts` |
| Onboarding Store | `src/demo/onboarding/onboardingStore.ts` |
| WelcomeZoom | `src/demo/onboarding/WelcomeZoom.tsx` |
| Landing Page | `pages/Landing.tsx` |
| Narration Scripts | `src/demo/voice/scripts/index.ts` (376 lines, all roles) |

---

### ❌ MISSING — Must Build

#### Priority 1: Onboarding Flow (3 missing screens)

| File | Purpose |
|------|---------|
| `src/demo/onboarding/RoleSelection.tsx` | 3 animated role cards (CEO / HR Manager / Accountant). On select → speak role narration → route to OrgProfile (CEO) or ModeSelection (others) |
| `src/demo/onboarding/OrganizationProfile.tsx` | CEO-only form: company name, brand color picker, logo upload, industry, employee count. Skip option. Applies CSS var `--brand-primary` on submit |
| `src/demo/onboarding/ModeSelection.tsx` | 3 mode cards: Guided Walkthrough / Sandbox Mode / Strategic Flows. Stores selection → routes to dashboard |

#### Priority 2: App Router & Shell

| File | Purpose |
|------|---------|
| `src/demo/DemoApp.tsx` | Root component with React Router. Routes: `/` → Landing, `/welcome` → WelcomeZoom, `/role` → RoleSelection, `/org-profile` → OrganizationProfile, `/mode` → ModeSelection, `/app` → MainShell. Wraps with ErrorBoundary + QueryClientProvider |
| `src/demo/MainShell.tsx` | Post-onboarding shell: Sidebar + TopNav + module routing for all 12 modules. Replaces current `src/App.tsx` tab system with proper routing. Shows VoiceControlBar, SandboxToggle, ProgressIndicator |

#### Priority 3: Demo Orchestration

| File | Purpose |
|------|---------|
| `src/demo/orchestrator/demoOrchestrator.ts` | Zustand store + controller. Manages: currentStep, isGuided, isSandbox, stepHistory. Methods: nextStep(), prevStep(), jumpTo(), pauseDemo(), resumeDemo(), resetDemo() |
| `src/demo/orchestrator/guidedFlow.ts` | Array of 9 guided steps (CEO Onboarding → Employees → Attendance → Payroll → AI Advisor → Leakage → Strategic Flows → Sandbox → Closing). Each step: { id, module, narrationKey, joyrideSteps[], durationMs } |
| `src/demo/orchestrator/strategicFlows.ts` | 6 flow definitions: Employee Lifecycle, Month-End Close, Manager Dashboard, Talent Acquisition, Compliance Audit, Financial Planning |

#### Priority 4: UI Infrastructure

| File | Purpose |
|------|---------|
| `src/demo/components/SandboxToggle.tsx` | Pill toggle: Guided / Sandbox / Flows. Calls orchestrator to switch mode. Shows current mode badge in TopNav |
| `src/demo/components/ProgressIndicator.tsx` | Horizontal step dots showing demo progress (9 steps). Highlights current, shows completed. Clickable in sandbox mode |
| `src/demo/components/ModuleWrapper.tsx` | ErrorBoundary wrapper for every module. Shows `<ModuleFallback name="..." />` on error. Logs to console |

#### Priority 5: Joyride Walkthroughs

| File | Purpose |
|------|---------|
| `src/demo/walkthroughs/index.ts` | Exports walkthrough step arrays for all 12 modules. Each module: 3–5 Joyride steps with target selectors, content, and narration keys |

---

## FULL USER EXPERIENCE FLOW

```
/ (Landing)
  ↓ "Explore Demo" click
/welcome (WelcomeZoom)
  → Framer Motion zoom-in (1.5s)
  → Quen: "Welcome to HRcopilot Explorer..."
  → Auto-advance after narration
/role (RoleSelection)
  → 3 animated cards: CEO / HR Manager / Accountant
  → Click → Quen speaks role narration
  → CEO → /org-profile
  → Others → /mode
/org-profile (OrganizationProfile) [CEO only]
  → Company name, brand color, logo, industry, headcount
  → Skip or Continue → /mode
/mode (ModeSelection)
  → 3 cards: Guided / Sandbox / Strategic Flows
  → Click → Quen speaks mode narration → /app
/app (MainShell)
  → Dashboard loads with all 12 modules
  → Guided: auto-starts demoOrchestrator flow
  → Sandbox: full free access
  → Flows: strategic flow selector
```

---

## IMPLEMENTATION PLAN (Ordered by Priority)

### Phase 1 — Onboarding Screens (Build First)
1. `RoleSelection.tsx` — 3 role cards, Framer Motion stagger, voice on select
2. `OrganizationProfile.tsx` — form with color picker, logo upload, live preview
3. `ModeSelection.tsx` — 3 mode cards, voice on select

### Phase 2 — App Router
4. `DemoApp.tsx` — React Router with all routes, ErrorBoundary, QueryClientProvider
5. `MainShell.tsx` — Sidebar + TopNav + all 12 module routes wired up

### Phase 3 — Orchestration
6. `demoOrchestrator.ts` — Zustand store + step controller
7. `guidedFlow.ts` — 9-step guided demo definition
8. `strategicFlows.ts` — 6 strategic flow definitions

### Phase 4 — UI Components
9. `SandboxToggle.tsx` — mode switcher
10. `ProgressIndicator.tsx` — step dots
11. `ModuleWrapper.tsx` — error isolation per module

### Phase 5 — Walkthroughs
12. `walkthroughs/index.ts` — Joyride steps for all 12 modules

---

## DESIGN STANDARDS

- Dark glassmorphism: `bg-white/5 backdrop-blur-md border border-white/10`
- Gradient: `from-indigo-600 to-purple-600` (primary), `from-gray-900 via-indigo-900 to-purple-900` (backgrounds)
- Border radius: `rounded-2xl` (cards), `rounded-full` (buttons/pills)
- Animations: Framer Motion `initial/animate/whileHover` on every interactive element
- Typography: `font-bold text-white` headings, `text-gray-300` body, `text-indigo-400` accents
- Brand color: CSS var `--brand-primary` applied by OrganizationProfile, consumed by MainShell

---

## TECH STACK (Confirmed Installed)

```
React 18 + TypeScript
Vite 5
TailwindCSS 3.4
Zustand 4.5 (with persist)
Framer Motion 11
React Router DOM 6
React Joyride 2.9.3
Dexie 4 (IndexedDB)
Kokoro TTS (kokoro-js)
react-error-boundary
Recharts 2.12
```

---

## NARRATION INTEGRATION PATTERN

Every onboarding screen and module uses the existing `useNarration` hook:

```typescript
import { useNarration } from '../voice/useNarration';

const { speak, stop, isSpeaking } = useNarration();

// Speak with role-aware script key
await speak("Welcome to HRcopilot...", { scriptId: 'hook.opening', role: 'CEO' });
```

Scripts are already defined in `src/demo/voice/scripts/index.ts` for all roles (CEO / HR / FINANCE).

---

## NOTES

- `src/App.tsx` (the simple tab-switcher) is the **old shell** — it will be replaced by `DemoApp.tsx` + `MainShell.tsx`
- The `pages/` folder contains all module pages — they are complete and just need to be wired into `MainShell.tsx`
- `src/demo/onboarding/onboardingStore.ts` already has the full state shape — the 3 missing screens just need to read/write from it
- Do NOT rebuild the voice system, leakage widget, admin system, or data layer — they are production-ready
