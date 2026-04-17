// ============================================
// FILE: src/lib/elevenLabsKeyPool.ts
// PURPOSE: Multi-key ElevenLabs pool with automatic rotation.
//
//   Each ElevenLabs key can have its own voice ID (accounts differ).
//   Keys loaded from TWO sources (merged, deduplicated):
//     1. .env.local:
//          VITE_ELEVENLABS_API_KEY   + VITE_ELEVENLABS_VOICE_ID    ← slot 1
//          VITE_ELEVENLABS_API_KEY_2 + VITE_ELEVENLABS_VOICE_ID_2  ← slot 2
//          … up to _10
//     2. localStorage 'HRcopilot_elevenlabs_keys' (set via Admin Panel)
//
//   Rotation triggers:
//     - 429 Too Many Requests  → rate-limited, cooldown 60s
//     - 401 Unauthorized       → invalid key, permanently removed
//     - 402 Payment Required   → quota exhausted, cooldown 300s
//     - 403 Forbidden          → same as 401
// ============================================

const RATELIMIT_COOLDOWN_MS = 60_000;   // 1 min
const QUOTA_COOLDOWN_MS     = 300_000;  // 5 min — quota resets on billing cycle, but retry sooner
const STORAGE_KEY           = 'HRcopilot_elevenlabs_keys';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ElevenLabsKeyEntry {
  apiKey:  string;
  voiceId: string;
  model:   string;
}

interface KeyState extends ElevenLabsKeyEntry {
  limitedAt: number | null;
  cooldownMs: number;
  invalid:    boolean;
}

// ── Load keys ─────────────────────────────────────────────────────────────────

function isValidKey(k: string | undefined): k is string {
  return !!k && !k.startsWith('your_') && k.trim().length > 10;
}

const DEFAULT_MODEL = 'eleven_turbo_v2_5';

function loadEnvEntries(): ElevenLabsKeyEntry[] {
  const slots = [
    { k: import.meta.env.VITE_ELEVENLABS_API_KEY,    v: import.meta.env.VITE_ELEVENLABS_VOICE_ID    },
    { k: import.meta.env.VITE_ELEVENLABS_API_KEY_2,  v: import.meta.env.VITE_ELEVENLABS_VOICE_ID_2  },
    { k: import.meta.env.VITE_ELEVENLABS_API_KEY_3,  v: import.meta.env.VITE_ELEVENLABS_VOICE_ID_3  },
    { k: import.meta.env.VITE_ELEVENLABS_API_KEY_4,  v: import.meta.env.VITE_ELEVENLABS_VOICE_ID_4  },
    { k: import.meta.env.VITE_ELEVENLABS_API_KEY_5,  v: import.meta.env.VITE_ELEVENLABS_VOICE_ID_5  },
    { k: import.meta.env.VITE_ELEVENLABS_API_KEY_6,  v: import.meta.env.VITE_ELEVENLABS_VOICE_ID_6  },
    { k: import.meta.env.VITE_ELEVENLABS_API_KEY_7,  v: import.meta.env.VITE_ELEVENLABS_VOICE_ID_7  },
    { k: import.meta.env.VITE_ELEVENLABS_API_KEY_8,  v: import.meta.env.VITE_ELEVENLABS_VOICE_ID_8  },
    { k: import.meta.env.VITE_ELEVENLABS_API_KEY_9,  v: import.meta.env.VITE_ELEVENLABS_VOICE_ID_9  },
    { k: import.meta.env.VITE_ELEVENLABS_API_KEY_10, v: import.meta.env.VITE_ELEVENLABS_VOICE_ID_10 },
  ] as { k: string | undefined; v: string | undefined }[];

  return slots
    .filter(({ k }) => isValidKey(k))
    .map(({ k, v }) => ({
      apiKey:  k!.trim(),
      voiceId: (v ?? '').trim(),
      model:   DEFAULT_MODEL,
    }));
}

function loadStorageEntries(): ElevenLabsKeyEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ElevenLabsKeyEntry[];
    return Array.isArray(parsed)
      ? parsed.filter((e) => isValidKey(e?.apiKey))
      : [];
  } catch {
    return [];
  }
}

function mergeEntries(): ElevenLabsKeyEntry[] {
  const stored = loadStorageEntries();
  const env    = loadEnvEntries();
  const seen   = new Set<string>();
  const merged: ElevenLabsKeyEntry[] = [];
  for (const e of [...stored, ...env]) {
    const key = e.apiKey.trim();
    if (!seen.has(key)) { seen.add(key); merged.push({ ...e, apiKey: key }); }
  }
  return merged;
}

// ── Pool state ─────────────────────────────────────────────────────────────────

let _pool: KeyState[] = mergeEntries().map((e) => ({
  ...e, limitedAt: null, cooldownMs: RATELIMIT_COOLDOWN_MS, invalid: false,
}));
let _idx = 0;

function isHealthy(s: KeyState): boolean {
  if (s.invalid) return false;
  if (s.limitedAt === null) return true;
  if (Date.now() - s.limitedAt > s.cooldownMs) {
    s.limitedAt = null;
    return true;
  }
  return false;
}

// ── Public: pool management ────────────────────────────────────────────────────

export function reloadElevenLabsPool(): void {
  const fresh    = mergeEntries();
  const existing = new Map(_pool.map((s) => [s.apiKey, s]));
  _pool = fresh.map((e) => existing.get(e.apiKey) ?? {
    ...e, limitedAt: null, cooldownMs: RATELIMIT_COOLDOWN_MS, invalid: false,
  });
  _idx = 0;
  console.log(`[ElevenLabsPool] Reloaded — ${_pool.length} key(s)`);
}

export function saveAdminElevenLabsKeys(entries: ElevenLabsKeyEntry[]): void {
  const valid = entries.filter((e) => isValidKey(e.apiKey));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
  reloadElevenLabsPool();
}

export function getAdminElevenLabsKeys(): ElevenLabsKeyEntry[] {
  return loadStorageEntries();
}

export function getNextElevenLabsEntry(): ElevenLabsKeyEntry | null {
  const healthy = _pool.filter(isHealthy);
  if (healthy.length === 0) return null;
  _idx = _idx % healthy.length;
  const entry = healthy[_idx];
  _idx = (_idx + 1) % healthy.length;
  return entry;
}

export function markElevenLabsRateLimited(apiKey: string): void {
  const s = _pool.find((x) => x.apiKey === apiKey);
  if (s) {
    s.limitedAt  = Date.now();
    s.cooldownMs = RATELIMIT_COOLDOWN_MS;
    console.warn(`[ElevenLabsPool] ...${apiKey.slice(-6)} rate-limited — cooldown ${RATELIMIT_COOLDOWN_MS / 1000}s`);
  }
}

export function markElevenLabsQuotaExhausted(apiKey: string): void {
  const s = _pool.find((x) => x.apiKey === apiKey);
  if (s) {
    s.limitedAt  = Date.now();
    s.cooldownMs = QUOTA_COOLDOWN_MS;
    console.warn(`[ElevenLabsPool] ...${apiKey.slice(-6)} quota exhausted — cooldown ${QUOTA_COOLDOWN_MS / 1000}s`);
  }
}

export function markElevenLabsInvalid(apiKey: string): void {
  const s = _pool.find((x) => x.apiKey === apiKey);
  if (s) {
    s.invalid = true;
    console.error(`[ElevenLabsPool] ...${apiKey.slice(-6)} invalid (401/403) — removed`);
  }
}

// ── Pool status ────────────────────────────────────────────────────────────────

export interface ElevenLabsPoolStatus {
  total:       number;
  healthy:     number;
  rateLimited: number;
  quotaDepleted: number;
  invalid:     number;
  keys: {
    masked:       string;
    voiceId:      string;
    healthy:      boolean;
    rateLimited:  boolean;
    quotaDepleted: boolean;
    invalid:      boolean;
    cooldownLeft: number;
    source:       'env' | 'admin';
  }[];
}

export function getElevenLabsPoolStatus(): ElevenLabsPoolStatus {
  const now      = Date.now();
  const envKeys  = new Set(loadEnvEntries().map((e) => e.apiKey));
  return {
    total:         _pool.length,
    healthy:       _pool.filter(isHealthy).length,
    rateLimited:   _pool.filter((s) => !s.invalid && s.limitedAt !== null && s.cooldownMs === RATELIMIT_COOLDOWN_MS && now - s.limitedAt <= s.cooldownMs).length,
    quotaDepleted: _pool.filter((s) => !s.invalid && s.limitedAt !== null && s.cooldownMs === QUOTA_COOLDOWN_MS    && now - s.limitedAt <= s.cooldownMs).length,
    invalid:       _pool.filter((s) => s.invalid).length,
    keys: _pool.map((s) => {
      const limited = !s.invalid && s.limitedAt !== null && now - s.limitedAt <= s.cooldownMs;
      return {
        masked:        `sk_...${s.apiKey.slice(-6)}`,
        voiceId:       s.voiceId || '—',
        healthy:       isHealthy(s),
        rateLimited:   limited && s.cooldownMs === RATELIMIT_COOLDOWN_MS,
        quotaDepleted: limited && s.cooldownMs === QUOTA_COOLDOWN_MS,
        invalid:       s.invalid,
        cooldownLeft:  limited ? Math.ceil((s.cooldownMs - (now - s.limitedAt!)) / 1000) : 0,
        source:        envKeys.has(s.apiKey) ? 'env' : 'admin',
      };
    }),
  };
}

// ── Retry wrapper ──────────────────────────────────────────────────────────────

export async function withElevenLabsKey<T>(
  fn: (entry: ElevenLabsKeyEntry) => Promise<T>,
): Promise<T> {
  const tried = new Set<string>();

  while (true) {
    const entry = getNextElevenLabsEntry();

    if (!entry) {
      throw new Error(
        `[ElevenLabsPool] All ${_pool.length} ElevenLabs key(s) exhausted. ` +
        `Add more keys in Admin Panel → API Keys, or wait for cooldown.`,
      );
    }

    if (tried.has(entry.apiKey)) {
      throw new Error('[ElevenLabsPool] Cycled through all available keys without success.');
    }
    tried.add(entry.apiKey);

    try {
      return await fn(entry);
    } catch (err: any) {
      const status = err?.status ?? err?.statusCode;
      if (status === 429)                    { markElevenLabsRateLimited(entry.apiKey);    continue; }
      if (status === 402)                    { markElevenLabsQuotaExhausted(entry.apiKey); continue; }
      // ElevenLabs returns 401 for BOTH bad keys AND quota_exceeded — inspect body
      if (status === 401) {
        const msg = err?.message ?? '';
        if (msg.includes('quota_exceeded') || msg.includes('quota')) {
          console.warn(`[ElevenLabsPool] ...${entry.apiKey.slice(-6)} quota exhausted — rotating to next key`);
          markElevenLabsQuotaExhausted(entry.apiKey); continue;
        }
        console.error(`[ElevenLabsPool] ...${entry.apiKey.slice(-6)} invalid key — removing permanently`);
        markElevenLabsInvalid(entry.apiKey); continue;
      }
      if (status === 403)  { markElevenLabsInvalid(entry.apiKey); continue; }
      throw err;
    }
  }
}
