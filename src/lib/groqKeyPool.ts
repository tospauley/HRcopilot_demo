// ============================================
// FILE: src/lib/groqKeyPool.ts
// PURPOSE: Multi-key Groq API pool with automatic rotation on rate-limit.
//
//   Keys are loaded from TWO sources (merged, deduplicated):
//     1. .env.local  — VITE_GROQ_API_KEY, VITE_GROQ_API_KEY_2 … _10
//     2. localStorage — 'HRcopilot_groq_keys' (set via Admin Panel UI)
//
//   Admin panel keys take precedence and can be updated at runtime
//   without restarting the dev server.
//
//   Behaviour:
//     - Round-robins across healthy keys
//     - 429 → marks key rate-limited for COOLDOWN_MS, tries next
//     - 401 → marks key invalid permanently
//     - All exhausted → throws with clear message
//     - Cooldown expires → key re-enters pool automatically
// ============================================

const COOLDOWN_MS      = 60_000;          // 1 min — Groq rate-limit window
const STORAGE_KEY      = 'HRcopilot_groq_keys'; // localStorage key for admin-managed keys

// ── Load keys ─────────────────────────────────────────────────────────────────

function loadEnvKeys(): string[] {
  const slots = [
    import.meta.env.VITE_GROQ_API_KEY,
    import.meta.env.VITE_GROQ_API_KEY_2,
    import.meta.env.VITE_GROQ_API_KEY_3,
    import.meta.env.VITE_GROQ_API_KEY_4,
    import.meta.env.VITE_GROQ_API_KEY_5,
    import.meta.env.VITE_GROQ_API_KEY_6,
    import.meta.env.VITE_GROQ_API_KEY_7,
    import.meta.env.VITE_GROQ_API_KEY_8,
    import.meta.env.VITE_GROQ_API_KEY_9,
    import.meta.env.VITE_GROQ_API_KEY_10,
  ] as (string | undefined)[];
  return slots.filter((k): k is string => isValidKey(k));
}

function loadStorageKeys(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.filter(isValidKey) : [];
  } catch {
    return [];
  }
}

function isValidKey(k: string | undefined): k is string {
  return !!k && !k.startsWith('your_') && k.trim().length > 10;
}

function mergeKeys(): string[] {
  const env     = loadEnvKeys();
  const stored  = loadStorageKeys();
  // Deduplicate — stored keys first (admin-managed take priority)
  const seen    = new Set<string>();
  const merged: string[] = [];
  for (const k of [...stored, ...env]) {
    const trimmed = k.trim();
    if (!seen.has(trimmed)) { seen.add(trimmed); merged.push(trimmed); }
  }
  return merged;
}

// ── Key state ──────────────────────────────────────────────────────────────────

interface KeyState {
  key:           string;
  rateLimitedAt: number | null;
  invalid:       boolean;
}

let _pool: KeyState[] = mergeKeys().map((key) => ({ key, rateLimitedAt: null, invalid: false }));
let _currentIndex = 0;

// ── Pool helpers ───────────────────────────────────────────────────────────────

function isHealthy(s: KeyState): boolean {
  if (s.invalid) return false;
  if (s.rateLimitedAt === null) return true;
  if (Date.now() - s.rateLimitedAt > COOLDOWN_MS) {
    s.rateLimitedAt = null;
    return true;
  }
  return false;
}

// ── Public: pool management ────────────────────────────────────────────────────

/**
 * Reload the pool from env + localStorage.
 * Call this after saving new keys via the admin panel.
 */
export function reloadPool(): void {
  const fresh = mergeKeys();
  // Preserve rate-limit state for keys that already exist
  const existing = new Map(_pool.map((s) => [s.key, s]));
  _pool = fresh.map((key) => existing.get(key) ?? { key, rateLimitedAt: null, invalid: false });
  _currentIndex = 0;
  console.log(`[GroqKeyPool] Pool reloaded — ${_pool.length} key(s)`);
}

/**
 * Save admin-managed keys to localStorage and reload the pool.
 * Keys are stored as a plain JSON array of strings.
 */
export function saveAdminKeys(keys: string[]): void {
  const valid = keys.map((k) => k.trim()).filter(isValidKey);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
  reloadPool();
}

/**
 * Get the current admin-managed keys (from localStorage).
 * Returns raw strings including empty slots for the UI.
 */
export function getAdminKeys(): string[] {
  return loadStorageKeys();
}

/** Get the next healthy key (round-robin). Returns null if all exhausted. */
export function getNextKey(): string | null {
  const healthy = _pool.filter(isHealthy);
  if (healthy.length === 0) return null;
  _currentIndex = _currentIndex % healthy.length;
  const state = healthy[_currentIndex];
  _currentIndex = (_currentIndex + 1) % healthy.length;
  return state.key;
}

export function markRateLimited(key: string): void {
  const s = _pool.find((x) => x.key === key);
  if (s) {
    s.rateLimitedAt = Date.now();
    console.warn(`[GroqKeyPool] ...${key.slice(-6)} rate-limited — cooldown ${COOLDOWN_MS / 1000}s`);
  }
}

export function markInvalid(key: string): void {
  const s = _pool.find((x) => x.key === key);
  if (s) {
    s.invalid = true;
    console.error(`[GroqKeyPool] ...${key.slice(-6)} invalid (401) — removed`);
  }
}

export interface PoolStatus {
  total:        number;
  healthy:      number;
  rateLimited:  number;
  invalid:      number;
  cooldownSecs: number;
  keys: {
    masked:        string;
    healthy:       boolean;
    rateLimited:   boolean;
    invalid:       boolean;
    cooldownLeft:  number; // seconds remaining, 0 if not rate-limited
    source:        'env' | 'admin';
  }[];
}

export function getPoolStatus(): PoolStatus {
  const now     = Date.now();
  const envKeys = new Set(loadEnvKeys());
  return {
    total:       _pool.length,
    healthy:     _pool.filter(isHealthy).length,
    rateLimited: _pool.filter((s) => !s.invalid && s.rateLimitedAt !== null && now - s.rateLimitedAt <= COOLDOWN_MS).length,
    invalid:     _pool.filter((s) => s.invalid).length,
    cooldownSecs: COOLDOWN_MS / 1000,
    keys: _pool.map((s) => {
      const rl = !s.invalid && s.rateLimitedAt !== null && now - s.rateLimitedAt <= COOLDOWN_MS;
      return {
        masked:       `gsk_...${s.key.slice(-6)}`,
        healthy:      isHealthy(s),
        rateLimited:  rl,
        invalid:      s.invalid,
        cooldownLeft: rl ? Math.ceil((COOLDOWN_MS - (now - s.rateLimitedAt!)) / 1000) : 0,
        source:       envKeys.has(s.key) ? 'env' : 'admin',
      };
    }),
  };
}

// ── Retry wrapper ──────────────────────────────────────────────────────────────

export async function withGroqKey<T>(fn: (key: string) => Promise<T>): Promise<T> {
  const tried = new Set<string>();

  while (true) {
    const key = getNextKey();

    if (!key) {
      throw new Error(
        `[GroqKeyPool] All ${_pool.length} Groq key(s) exhausted. ` +
        `Add more keys in Admin Panel → API Keys, or wait ${COOLDOWN_MS / 1000}s for cooldown.`,
      );
    }

    if (tried.has(key)) {
      throw new Error('[GroqKeyPool] Cycled through all available keys without success.');
    }
    tried.add(key);

    try {
      return await fn(key);
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status ?? err?.statusCode;
      if (status === 429) { markRateLimited(key); continue; }
      if (status === 401) { markInvalid(key);     continue; }
      throw err;
    }
  }
}
