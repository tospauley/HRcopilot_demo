/**
 * HRcopilot Persistent Local Storage Layer
 *
 * - Versioned: bumping STORAGE_VERSION wipes stale data automatically
 * - Debounced writes: state changes are batched (300ms) to avoid thrashing
 * - Selective persistence: only mutable collections are stored
 *   (static reference data like attendanceTrend stays in demoData)
 * - Reset: clearPersistedState() wipes storage and reloads from demoData
 */

const STORAGE_KEY   = 'HRcopilot_state';
const STORAGE_VERSION = 3; // bump this to invalidate old persisted data

// Collections that are user-mutable and should survive page refresh
export const PERSISTED_COLLECTIONS = [
  'employees',
  'attendance',
  'leaveRequests',
  'leaveBalances',
  'payrollLines',
  'payrollRuns',
  'payrollPeriods',
  'crmDeals',
  'crmContacts',
  'objectives',
  'candidates',
  'jobOpenings',
  'recognitions',
  'purchaseOrders',
  'vendors',
  'requisitions',
  'branches',
  'memos',
  'chatMessages',
  'teamPerformance',
  'changeLog',
] as const;

export type PersistedKey = typeof PERSISTED_COLLECTIONS[number];

type PersistedPayload = {
  version: number;
  savedAt: string;
  data: Partial<Record<PersistedKey, any[]>>;
};

// ── Read ──────────────────────────────────────────────────────────────────────

export function loadPersistedState(): Partial<Record<PersistedKey, any[]>> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: PersistedPayload = JSON.parse(raw);

    // Version mismatch → discard stale data
    if (parsed.version !== STORAGE_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

// ── Write (debounced) ─────────────────────────────────────────────────────────

let writeTimer: ReturnType<typeof setTimeout> | null = null;

export function persistState(data: Partial<Record<PersistedKey, any[]>>): void {
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(() => {
    try {
      const payload: PersistedPayload = {
        version: STORAGE_VERSION,
        savedAt: new Date().toISOString(),
        data,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      // Storage quota exceeded — fail silently
      console.warn('[HRcopilot] localStorage write failed:', e);
    }
  }, 300);
}

// ── Reset ─────────────────────────────────────────────────────────────────────

export function clearPersistedState(): void {
  if (writeTimer) clearTimeout(writeTimer);
  localStorage.removeItem(STORAGE_KEY);
}

// ── Meta ──────────────────────────────────────────────────────────────────────

export function getStorageMeta(): { savedAt: string | null; sizeKb: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { savedAt: null, sizeKb: 0 };
    const parsed: PersistedPayload = JSON.parse(raw);
    return {
      savedAt: parsed.savedAt,
      sizeKb: Math.round((raw.length * 2) / 1024), // UTF-16 approx
    };
  } catch {
    return { savedAt: null, sizeKb: 0 };
  }
}
