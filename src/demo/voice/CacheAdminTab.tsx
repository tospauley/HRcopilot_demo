// ============================================
// FILE: src/demo/voice/CacheAdminTab.tsx
// PURPOSE: Audio cache tab — shows ElevenLabs/Groq blob cache.
//          Light/dark styling for NarratorAdminPanel.
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { audioCacheDB, clearBlobAudioCache, type CachedBlobAudio } from './audioCache';
import { useNarratorStore } from './narratorStore';

const PROVIDER_ICONS: Record<string, string> = {
  elevenlabs: '⚡',
  groq:       '🚀',
};

export function CacheAdminTab() {
  const store = useNarratorStore();
  const [entries,  setEntries]  = useState<CachedBlobAudio[]>([]);
  const [sizeKb,   setSizeKb]   = useState(0);
  const [loading,  setLoading]  = useState(false);
  const [clearing, setClearing] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await audioCacheDB.blobAudio.orderBy('cachedAt').reverse().toArray();
      setEntries(rows);
      let total = 0;
      for (const r of rows) total += r.blob.size;
      setSizeKb(Math.round(total / 1024));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleClear = useCallback(async () => {
    setClearing(true);
    await clearBlobAudioCache();
    await refresh();
    setClearing(false);
  }, [refresh]);

  const totalHits = entries.reduce((s, e) => s + e.hitCount, 0);

  return (
    <div className="space-y-5">

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Cached Scripts" value={loading ? '…' : String(entries.length)} icon="🗂️" color="violet" />
        <StatCard label="Cache Size"     value={loading ? '…' : `${sizeKb} KB`}         icon="💾" color="blue"   />
        <StatCard label="Total Hits"     value={loading ? '…' : String(totalHits)}       icon="⚡" color="emerald"/>
      </div>

      {/* ── Active provider ── */}
      <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-200 dark:border-white/10 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight mb-0.5">
            Active Provider
          </p>
          <p className="text-[9px] text-slate-500">
            Cache keyed by scriptId + provider + voiceId. Changing voice invalidates cache.
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 text-[10px] font-black uppercase tracking-widest">
          {PROVIDER_ICONS[store.provider]} {store.provider}
        </span>
      </div>

      {/* ── Cached entries ── */}
      <div className="bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-white/10">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            Cached Audio ({entries.length})
          </p>
          <div className="flex gap-2">
            <button onClick={refresh} disabled={loading}
              className="text-[9px] font-black text-slate-400 hover:text-violet-600 uppercase tracking-widest transition-colors">
              {loading ? '…' : '↻ Refresh'}
            </button>
            <button onClick={handleClear} disabled={clearing || entries.length === 0}
              className="text-[9px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors disabled:opacity-40">
              {clearing ? 'Clearing…' : '🗑 Clear All'}
            </button>
          </div>
        </div>

        <div className="max-h-48 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-[10px] text-slate-400 font-medium">No cached audio yet.</p>
              <p className="text-[9px] text-slate-400 mt-1">
                Cache fills automatically as each narration plays for the first time.
              </p>
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.cacheKey}
                className="flex items-center justify-between px-5 py-2.5 border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-base flex-shrink-0">
                    {PROVIDER_ICONS[entry.provider] ?? '🎙️'}
                  </span>
                  <span className="text-[10px] font-mono text-violet-600 dark:text-violet-400 flex-shrink-0 truncate max-w-[140px]">
                    {entry.scriptId}
                  </span>
                  <span className="text-[9px] text-slate-400 truncate">
                    {entry.voiceId} · {entry.mimeType.split('/')[1]}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                  <span className="text-[9px] text-slate-400">{entry.hitCount} hits</span>
                  <span className="text-[9px] text-slate-400">{Math.round(entry.blob.size / 1024)} KB</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── How it works ── */}
      <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-4">
        <p className="text-[10px] font-black text-blue-700 dark:text-blue-300 uppercase tracking-widest mb-2">
          How the cache works
        </p>
        <div className="space-y-1.5">
          {[
            ['⚡', 'Cache Hit',  'Plays instantly from IndexedDB — zero API calls, zero latency'],
            ['🌐', 'Cache Miss', 'Fetches from ElevenLabs/Groq, then writes blob to IndexedDB'],
            ['🔄', 'Auto-warm',  'Fills passively as each script plays for the first time'],
            ['📦', 'Persistent', 'Survives page refresh — keyed by scriptId + provider + voiceId'],
          ].map(([icon, label, desc]) => (
            <div key={label} className="flex items-start gap-2">
              <span className="text-sm flex-shrink-0">{icon}</span>
              <div>
                <span className="text-[9px] font-black text-blue-700 dark:text-blue-300 uppercase tracking-widest">{label}</span>
                <span className="text-[9px] text-blue-600 dark:text-blue-400 ml-1.5">{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: {
  label: string; value: string; icon: string; color: 'violet' | 'blue' | 'emerald';
}) {
  const cls = {
    violet:  'bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20 text-violet-700 dark:text-violet-300',
    blue:    'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  }[color];
  return (
    <div className={`rounded-2xl p-4 border ${cls}`}>
      <div className="text-xl mb-1">{icon}</div>
      <p className="text-lg font-black">{value}</p>
      <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">{label}</p>
    </div>
  );
}
