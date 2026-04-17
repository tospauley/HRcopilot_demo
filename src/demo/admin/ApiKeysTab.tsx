// ============================================
// FILE: src/demo/admin/ApiKeysTab.tsx
// PURPOSE: Admin UI — manage Groq key pool (up to 10) + ElevenLabs pool (up to 10).
//   Keys saved to localStorage, pools reload instantly — no restart needed.
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  saveAdminKeys, getAdminKeys, getPoolStatus, withGroqKey, type PoolStatus,
} from '../../lib/groqKeyPool';
import {
  saveAdminElevenLabsKeys, getAdminElevenLabsKeys,
  getElevenLabsPoolStatus, withElevenLabsKey, type ElevenLabsPoolStatus, type ElevenLabsKeyEntry,
} from '../../lib/elevenLabsKeyPool';
import { useNarratorStore } from '../voice/narratorStore';

const MAX_KEYS = 10;

// ── Shared sub-components ──────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">{title}</h3>
      <p className="text-[10px] text-white/40 mt-0.5">{subtitle}</p>
    </div>
  );
}

function HealthBar({ total, healthy, rateLimited, invalid, extra }: {
  total: number; healthy: number; rateLimited: number; invalid: number; extra?: number;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 mb-4">
      {[
        { label: 'Total',        value: total,       color: 'text-white/60'   },
        { label: 'Healthy',      value: healthy,     color: 'text-emerald-400' },
        { label: 'Rate-limited', value: rateLimited, color: 'text-amber-400'   },
        { label: extra !== undefined ? 'Quota out' : 'Invalid', value: extra ?? invalid, color: extra !== undefined ? 'text-orange-400' : 'text-rose-400' },
      ].map(({ label, value, color }) => (
        <div key={label} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-center">
          <p className={`text-lg font-black ${color}`}>{value}</p>
          <p className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
}

function StatusPills({ keys }: { keys: { masked: string; healthy: boolean; rateLimited: boolean; invalid: boolean; cooldownLeft: number; source: string; quotaDepleted?: boolean }[] }) {
  if (!keys.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mb-4">
      {keys.map((k, i) => (
        <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold border ${
          k.invalid         ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
          k.quotaDepleted   ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
          k.rateLimited     ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                              'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            k.invalid ? 'bg-rose-500' : k.quotaDepleted ? 'bg-orange-500' : k.rateLimited ? 'bg-amber-500' : 'bg-emerald-500'
          }`} />
          {k.masked}
          {(k.rateLimited || k.quotaDepleted) && <span className="opacity-60">({k.cooldownLeft}s)</span>}
          <span className="text-white/20">{k.source}</span>
        </div>
      ))}
    </div>
  );
}

function SaveFeedback({ saved, error }: { saved: boolean; error: string }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="mt-3 flex items-center gap-2 px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
          <span className="text-rose-400">⚠</span>
          <p className="text-[11px] text-rose-400">{error}</p>
        </motion.div>
      )}
      {saved && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="mt-3 flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <span className="text-emerald-400">✓</span>
          <p className="text-[11px] text-emerald-400">Saved — pool reloaded instantly.</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Groq Pool Section ──────────────────────────────────────────────────────────

function GroqPoolSection() {
  const [keys,       setKeys]       = useState<string[]>(() => { const s = getAdminKeys(); return s.length ? s : ['']; });
  const [status,     setStatus]     = useState<PoolStatus>(() => getPoolStatus());
  const [saved,      setSaved]      = useState(false);
  const [error,      setError]      = useState('');
  const [showKeys,   setShowKeys]   = useState<boolean[]>(Array(MAX_KEYS).fill(false));

  useEffect(() => {
    const t = setInterval(() => setStatus(getPoolStatus()), 5_000);
    return () => clearInterval(t);
  }, []);

  const update  = (i: number, v: string) => setKeys((p) => { const n = [...p]; n[i] = v; return n; });
  const remove  = (i: number) => setKeys((p) => p.filter((_, j) => j !== i));
  const toggle  = (i: number) => setShowKeys((p) => { const n = [...p]; n[i] = !n[i]; return n; });

  const save = useCallback(() => {
    setError('');
    const valid = keys.map((k) => k.trim()).filter(Boolean);
    if (!valid.length) { setError('Add at least one Groq API key.'); return; }
    const bad = valid.filter((k) => !k.startsWith('gsk_') || k.length < 20);
    if (bad.length) { setError(`Invalid key: ${bad[0].slice(0, 14)}…`); return; }
    saveAdminKeys(valid);
    setStatus(getPoolStatus());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }, [keys]);

  return (
    <section>
      <div className="flex items-center justify-between mb-1">
        <SectionHeader title="Groq API Key Pool" subtitle="Up to 10 keys — auto-rotates on 429 rate-limit" />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 mb-4">
          <span className={`w-2 h-2 rounded-full ${status.healthy > 0 ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'bg-rose-500'}`} />
          <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{status.healthy}/{status.total} healthy</span>
        </div>
      </div>

      {status.total > 0 && <HealthBar total={status.total} healthy={status.healthy} rateLimited={status.rateLimited} invalid={status.invalid} />}
      <StatusPills keys={status.keys} />

      <div className="space-y-2">
        {keys.map((key, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[9px] font-black text-white/30 w-5 text-right flex-shrink-0">{i + 1}</span>
            <div className="relative flex-1">
              <input
                type={showKeys[i] ? 'text' : 'password'}
                value={key}
                onChange={(e) => update(i, e.target.value)}
                placeholder="gsk_..."
                spellCheck={false}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[12px] font-mono text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#e0f2fe]0/40 pr-10 transition-all"
              />
              <button type="button" onClick={() => toggle(i)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-[11px]">
                {showKeys[i] ? '🙈' : '👁'}
              </button>
            </div>
            {keys.length > 1 && (
              <button onClick={() => remove(i)}
                className="w-8 h-8 flex-shrink-0 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs transition-all">✕</button>
            )}
          </div>
        ))}
      </div>

      {keys.length < MAX_KEYS && (
        <button onClick={() => setKeys((p) => [...p, ''])}
          className="mt-3 flex items-center gap-2 text-[10px] font-black text-[#0ea5e9] hover:text-[#38bdf8] uppercase tracking-widest transition-colors">
          <span className="w-5 h-5 rounded-lg bg-[#e0f2fe]0/20 flex items-center justify-center text-xs">+</span>
          Add key ({keys.length}/{MAX_KEYS})
        </button>
      )}

      <SaveFeedback saved={saved} error={error} />

      <button onClick={save}
        className="mt-4 w-full py-3 bg-gradient-to-r from-[#0369a1] to-[#075985] text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-[#e0f2fe]0/20 hover:from-[#e0f2fe]0 hover:to-[#0369a1] transition-all">
        Save & Reload Groq Pool
      </button>

      <div className="mt-3 bg-white/5 border border-white/10 rounded-xl p-4">
        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">How it works</p>
        <ul className="space-y-1 text-[10px] text-white/40 leading-relaxed">
          <li>• Round-robins across all LLM + TTS calls</li>
          <li>• 429 → key pauses 60s, next key takes over instantly</li>
          <li>• 401 → key permanently removed from rotation</li>
          <li>• Free keys at <span className="text-[#0ea5e9] font-mono">console.groq.com</span> — no credit card</li>
        </ul>
      </div>
    </section>
  );
}

// ── ElevenLabs Pool Section ────────────────────────────────────────────────────

const DEFAULT_EL_MODEL = 'eleven_turbo_v2_5';

function ElevenLabsPoolSection() {
  const store = useNarratorStore();

  const [entries,  setEntries]  = useState<ElevenLabsKeyEntry[]>(() => {
    const saved = getAdminElevenLabsKeys();
    return saved.length ? saved : [{ apiKey: store.elevenLabsApiKey || '', voiceId: store.elevenLabsVoiceId || '', model: store.elevenLabsModel || DEFAULT_EL_MODEL }];
  });
  const [status,   setStatus]   = useState<ElevenLabsPoolStatus>(() => getElevenLabsPoolStatus());
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState('');
  const [showKeys, setShowKeys] = useState<boolean[]>(Array(MAX_KEYS).fill(false));

  useEffect(() => {
    const t = setInterval(() => setStatus(getElevenLabsPoolStatus()), 5_000);
    return () => clearInterval(t);
  }, []);

  const updateEntry = (i: number, field: keyof ElevenLabsKeyEntry, val: string) =>
    setEntries((p) => { const n = [...p]; n[i] = { ...n[i], [field]: val }; return n; });

  const remove = (i: number) => setEntries((p) => p.filter((_, j) => j !== i));
  const toggle = (i: number) => setShowKeys((p) => { const n = [...p]; n[i] = !n[i]; return n; });

  const save = useCallback(() => {
    setError('');
    const valid = entries.filter((e) => e.apiKey.trim().length > 10);
    if (!valid.length) { setError('Add at least one ElevenLabs API key.'); return; }
    const bad = valid.filter((e) => !e.apiKey.trim().startsWith('sk_'));
    if (bad.length) { setError(`Invalid key format (should start with sk_): ${bad[0].apiKey.slice(0, 10)}…`); return; }

    saveAdminElevenLabsKeys(valid);

    // Also sync first entry into narrator store so existing code paths work
    if (valid[0]) {
      store.updateConfig({
        elevenLabsApiKey:  valid[0].apiKey,
        elevenLabsVoiceId: valid[0].voiceId,
        elevenLabsModel:   valid[0].model || DEFAULT_EL_MODEL,
      });
    }

    setStatus(getElevenLabsPoolStatus());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }, [entries, store]);

  return (
    <section>
      <div className="flex items-center justify-between mb-1">
        <SectionHeader title="ElevenLabs Key Pool" subtitle="Up to 10 keys — rotates on 429 rate-limit or 402 quota exhaustion" />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 mb-4">
          <span className={`w-2 h-2 rounded-full ${status.healthy > 0 ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'bg-rose-500'}`} />
          <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{status.healthy}/{status.total} healthy</span>
        </div>
      </div>

      {status.total > 0 && (
        <HealthBar total={status.total} healthy={status.healthy} rateLimited={status.rateLimited} invalid={status.invalid} extra={status.quotaDepleted} />
      )}
      <StatusPills keys={status.keys.map((k) => ({ ...k, quotaDepleted: k.quotaDepleted }))} />

      <div className="space-y-3">
        {entries.map((entry, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Key {i + 1}</span>
              {entries.length > 1 && (
                <button onClick={() => remove(i)}
                  className="text-[9px] font-black text-rose-400/60 hover:text-rose-400 uppercase tracking-widest transition-colors">
                  Remove
                </button>
              )}
            </div>

            {/* API Key */}
            <div>
              <label className="block text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">API Key</label>
              <div className="relative">
                <input
                  type={showKeys[i] ? 'text' : 'password'}
                  value={entry.apiKey}
                  onChange={(e) => updateEntry(i, 'apiKey', e.target.value)}
                  placeholder="sk_..."
                  spellCheck={false}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-[12px] font-mono text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500/40 pr-10 transition-all"
                />
                <button type="button" onClick={() => toggle(i)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-[11px]">
                  {showKeys[i] ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Voice ID + Model — side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Voice ID</label>
                <input
                  type="text"
                  value={entry.voiceId}
                  onChange={(e) => updateEntry(i, 'voiceId', e.target.value)}
                  placeholder="e.g. Xb7hH8MSUJpSbSDYk0k2"
                  spellCheck={false}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-[11px] font-mono text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Model</label>
                <select
                  value={entry.model || DEFAULT_EL_MODEL}
                  onChange={(e) => updateEntry(i, 'model', e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-[11px] text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
                >
                  <option value="eleven_turbo_v2_5">Turbo v2.5 — Fastest</option>
                  <option value="eleven_multilingual_v2">Multilingual v2 — Best quality</option>
                  <option value="eleven_monolingual_v1">Monolingual v1 — Legacy</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {entries.length < MAX_KEYS && (
        <button
          onClick={() => setEntries((p) => [...p, { apiKey: '', voiceId: '', model: DEFAULT_EL_MODEL }])}
          className="mt-3 flex items-center gap-2 text-[10px] font-black text-amber-400 hover:text-amber-300 uppercase tracking-widest transition-colors">
          <span className="w-5 h-5 rounded-lg bg-amber-500/20 flex items-center justify-center text-xs">+</span>
          Add account ({entries.length}/{MAX_KEYS})
        </button>
      )}

      <SaveFeedback saved={saved} error={error} />

      <button onClick={save}
        className="mt-4 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-500 transition-all">
        Save & Reload ElevenLabs Pool
      </button>

      <div className="mt-3 bg-white/5 border border-white/10 rounded-xl p-4">
        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">How it works</p>
        <ul className="space-y-1 text-[10px] text-white/40 leading-relaxed">
          <li>• Each entry = one ElevenLabs account (different voice IDs allowed)</li>
          <li>• 429 → key pauses 60s, next account takes over instantly</li>
          <li>• 402 quota exhausted → key pauses 5 min</li>
          <li>• 401/403 → key permanently removed from rotation</li>
          <li>• Free tier: 10,000 chars/month per account</li>
        </ul>
      </div>
    </section>
  );
}

// ── Pool Stress Tester ─────────────────────────────────────────────────────────

type TestProvider = 'groq' | 'elevenlabs';

interface TestResult {
  id:        number;
  keyMasked: string;
  status:    'pending' | 'ok' | 'rate-limited' | 'quota' | 'invalid' | 'error';
  latencyMs: number | null;
  error:     string | null;
}

const TEST_TEXT = 'HRcopilot pool test.';

async function runGroqCall(id: number): Promise<TestResult> {
  const t0 = Date.now();
  let keyMasked = '—';
  try {
    await withGroqKey(async (key) => {
      keyMasked = `gsk_...${key.slice(-6)}`;
      const res = await fetch('https://api.groq.com/openai/v1/audio/speech', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'canopylabs/orpheus-v1-english', input: TEST_TEXT, voice: 'autumn', response_format: 'wav' }),
      });
      if (!res.ok) { const e: any = new Error(`${res.status}`); e.status = res.status; throw e; }
      await res.blob();
    });
    return { id, keyMasked, status: 'ok', latencyMs: Date.now() - t0, error: null };
  } catch (err: any) {
    const s = err?.status ?? 0;
    return { id, keyMasked, status: s === 429 ? 'rate-limited' : s === 401 ? 'invalid' : 'error', latencyMs: Date.now() - t0, error: err?.message ?? String(err) };
  }
}

async function runElevenLabsCall(id: number, fallbackVoiceId: string): Promise<TestResult> {
  const t0 = Date.now();
  let keyMasked = '—';
  try {
    await withElevenLabsKey(async (entry) => {
      keyMasked = `sk_...${entry.apiKey.slice(-6)}`;
      const vid = entry.voiceId || fallbackVoiceId;
      if (!vid) throw Object.assign(new Error('No voice ID configured'), { status: 0 });
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vid}/stream`, {
        method: 'POST',
        headers: { 'xi-api-key': entry.apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
        body: JSON.stringify({ text: TEST_TEXT, model_id: entry.model || 'eleven_turbo_v2_5', voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
      });
      if (!res.ok) { const body = await res.text().catch(()=>''); const e: any = new Error(`${res.status}: ${body}`); e.status = res.status; throw e; }
      await res.blob();
    });
    return { id, keyMasked, status: 'ok', latencyMs: Date.now() - t0, error: null };
  } catch (err: any) {
    const s = err?.status ?? 0;
    return { id, keyMasked, status: s === 429 ? 'rate-limited' : s === 402 ? 'quota' : (s === 401 || s === 403) ? 'invalid' : 'error', latencyMs: Date.now() - t0, error: err?.message ?? String(err) };
  }
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'text-white/30', ok: 'text-emerald-400',
  'rate-limited': 'text-amber-400', quota: 'text-orange-400',
  invalid: 'text-rose-400', error: 'text-rose-300',
};
const STATUS_ICON: Record<string, string> = {
  pending: '…', ok: '✓', 'rate-limited': '⏸', quota: '💳', invalid: '✗', error: '✗',
};

function StressTestSection() {
  const store = useNarratorStore();
  const [provider,    setProvider]    = useState<TestProvider>('groq');
  const [burst,       setBurst]       = useState(5);
  const [concurrency, setConcurrency] = useState(2);
  const [results,     setResults]     = useState<TestResult[]>([]);
  const [running,     setRunning]     = useState(false);
  const [groqStatus,  setGroqStatus]  = useState(() => getPoolStatus());
  const [elStatus,    setElStatus]    = useState(() => getElevenLabsPoolStatus());
  const abortRef = useRef(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => { setGroqStatus(getPoolStatus()); setElStatus(getElevenLabsPoolStatus()); }, 800);
    return () => clearInterval(t);
  }, [running]);

  const runTest = useCallback(async () => {
    setResults([]);
    setRunning(true);
    abortRef.current = false;
    const ids = Array.from({ length: burst }, (_, i) => i + 1);

    for (let i = 0; i < ids.length; i += concurrency) {
      if (abortRef.current) break;
      const batch = ids.slice(i, i + concurrency);

      // Show pending rows immediately
      setResults((prev) => [...prev, ...batch.map((id) => ({ id, keyMasked: '…', status: 'pending' as const, latencyMs: null, error: null }))]);

      const fresh = await Promise.all(
        batch.map((id) => provider === 'groq' ? runGroqCall(id) : runElevenLabsCall(id, store.elevenLabsVoiceId)),
      );

      setResults((prev) => prev.map((r) => fresh.find((f) => f.id === r.id) ?? r));
      if (i + concurrency < ids.length) await new Promise((r) => setTimeout(r, 250));
    }

    setGroqStatus(getPoolStatus());
    setElStatus(getElevenLabsPoolStatus());
    setRunning(false);
  }, [provider, burst, concurrency, store.elevenLabsVoiceId]);

  const activeStatus = provider === 'groq' ? groqStatus : elStatus;
  const poolKeys     = (activeStatus as any).keys ?? [];
  const summary      = results.reduce((a, r) => { a[r.status] = (a[r.status] ?? 0) + 1; return a; }, {} as Record<string, number>);

  return (
    <section>
      <SectionHeader title="Pool Stress Test" subtitle="Fire rapid requests to verify rotation works before a live demo" />

      {/* Config */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-[9px] font-black text-white/30 uppercase tracking-widest mb-1.5">Provider</label>
          <div className="flex gap-1">
            {(['groq', 'elevenlabs'] as TestProvider[]).map((p) => (
              <button key={p} onClick={() => setProvider(p)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  provider === p ? (p === 'groq' ? 'bg-[#0369a1] text-white' : 'bg-amber-500 text-white') : 'bg-white/5 text-white/40 hover:text-white/70'
                }`}>
                {p === 'groq' ? '🚀 Groq' : '⚡ EL'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[9px] font-black text-white/30 uppercase tracking-widest mb-1.5">Requests — {burst}</label>
          <input type="range" min={1} max={20} step={1} value={burst} onChange={(e) => setBurst(+e.target.value)} className="w-full accent-[#e0f2fe]0 mt-1" />
          <div className="flex justify-between text-[8px] text-white/20 mt-0.5"><span>1</span><span>10</span><span>20</span></div>
        </div>
        <div>
          <label className="block text-[9px] font-black text-white/30 uppercase tracking-widest mb-1.5">Concurrency — {concurrency}</label>
          <input type="range" min={1} max={5} step={1} value={concurrency} onChange={(e) => setConcurrency(+e.target.value)} className="w-full accent-[#e0f2fe]0 mt-1" />
          <div className="flex justify-between text-[8px] text-white/20 mt-0.5"><span>1</span><span>3</span><span>5</span></div>
        </div>
      </div>

      {/* Live pool health */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Pool now:</span>
        {poolKeys.length === 0 && <span className="text-[10px] text-rose-400">No keys configured</span>}
        {poolKeys.map((k: any, i: number) => (
          <span key={i} className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold border ${
            k.invalid ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
            (k.rateLimited || k.quotaDepleted) ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
            'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            {k.masked}{k.cooldownLeft > 0 ? ` (${k.cooldownLeft}s)` : ''}
          </span>
        ))}
      </div>

      {/* Run / Stop / Clear */}
      <div className="flex gap-2 mb-4">
        <button onClick={running ? () => { abortRef.current = true; } : runTest}
          disabled={poolKeys.length === 0}
          className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
            running ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-gradient-to-r from-[#0369a1] to-[#075985] hover:from-[#e0f2fe]0 hover:to-[#0369a1] text-white shadow-lg shadow-[#e0f2fe]0/20'
          }`}>
          {running ? '⏹ Stop' : `▶ Run ${burst} Requests`}
        </button>
        {results.length > 0 && !running && (
          <button onClick={() => setResults([])} className="px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest bg-white/5 text-white/40 hover:text-white/70 transition-all">
            Clear
          </button>
        )}
      </div>

      {/* Summary */}
      {results.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {Object.entries(summary).map(([s, count]) => (
            <span key={s} className={`px-2.5 py-1 rounded-lg text-[10px] font-black border bg-white/5 border-white/10 ${STATUS_COLOR[s]}`}>
              {STATUS_ICON[s]} {s}: {count}
            </span>
          ))}
        </div>
      )}

      {/* Request log */}
      {results.length > 0 && (
        <div className="bg-black/30 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Request Log</span>
            {running && <span className="flex items-center gap-1.5 text-[9px] text-amber-400"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />Running…</span>}
          </div>
          <div className="max-h-52 overflow-y-auto divide-y divide-white/5">
            {results.map((r) => (
              <motion.div key={r.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 px-4 py-2">
                <span className="text-[9px] text-white/20 w-5 text-right font-mono">{r.id}</span>
                <span className={`text-[11px] font-black w-4 ${STATUS_COLOR[r.status]}`}>
                  {r.status === 'pending'
                    ? <span className="w-3 h-3 border border-white/20 border-t-white/60 rounded-full animate-spin inline-block" />
                    : STATUS_ICON[r.status]}
                </span>
                <span className="text-[10px] font-mono text-white/50 flex-1">{r.keyMasked}</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${STATUS_COLOR[r.status]}`}>{r.status}</span>
                {r.latencyMs !== null && <span className="text-[9px] text-white/30 font-mono">{r.latencyMs}ms</span>}
                {r.error && r.status !== 'ok' && <span className="text-[9px] text-rose-400/60 truncate max-w-[120px]">{r.error}</span>}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 bg-white/5 border border-white/10 rounded-xl p-4">
        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">What to look for</p>
        <ul className="space-y-1 text-[10px] text-white/40 leading-relaxed">
          <li>• <span className="text-emerald-400">✓ ok</span> — request succeeded, shows which key was used</li>
          <li>• <span className="text-amber-400">⏸ rate-limited</span> — pool rotated to next key automatically</li>
          <li>• <span className="text-orange-400">💳 quota</span> — ElevenLabs free tier used up on that account</li>
          <li>• <span className="text-rose-400">✗ invalid</span> — bad key, permanently removed from pool</li>
          <li>• If all requests show ✓ across different keys — rotation is working</li>
        </ul>
      </div>
    </section>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────

export function ApiKeysTab() {
  return (
    <div className="max-w-2xl space-y-10">
      <GroqPoolSection />
      <div className="border-t border-white/10" />
      <ElevenLabsPoolSection />
      <div className="border-t border-white/10" />
      <StressTestSection />
    </div>
  );
}

