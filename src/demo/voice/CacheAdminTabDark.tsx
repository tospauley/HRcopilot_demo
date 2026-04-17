// ============================================
// FILE: src/demo/voice/CacheAdminTabDark.tsx
// PURPOSE: Audio cache tab — shows ElevenLabs/Groq blob cache.
//          Dark-first styling for the inline admin panel.
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { audioCacheDB, clearBlobAudioCache, type CachedBlobAudio } from './audioCache';
import { useNarratorStore } from './narratorStore';

const PROVIDER_ICONS: Record<string, string> = {
  elevenlabs: '⚡',
  groq:       '🚀',
};

export function CacheAdminTabDark() {
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
      // Estimate size from blob sizes
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
        {[
          { icon: '🗂️', label: 'Cached Scripts', value: loading ? '…' : String(entries.length), accent: 'violet' },
          { icon: '💾', label: 'Cache Size',      value: loading ? '…' : `${sizeKb} KB`,         accent: 'blue'   },
          { icon: '⚡', label: 'Total Hits',      value: loading ? '…' : String(totalHits),       accent: 'emerald'},
        ].map(({ icon, label, value, accent }) => (
          <div key={label} className={`rounded-2xl p-4 border ${
            accent === 'violet'  ? 'bg-[#e0f2fe]0/10 border-[#e0f2fe]0/20'  :
            accent === 'blue'    ? 'bg-blue-500/10 border-blue-500/20'      :
            'bg-emerald-500/10 border-emerald-500/20'
          }`}>
            <div className="text-2xl mb-2">{icon}</div>
            <p className={`text-xl font-black ${
              accent === 'violet'  ? 'text-[#38bdf8]'  :
              accent === 'blue'    ? 'text-blue-300'    :
              'text-emerald-300'
            }`}>{value}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Active provider ── */}
      <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-white uppercase tracking-tight mb-0.5">Active Provider</p>
          <p className="text-[9px] text-white/40">
            Cache is keyed by scriptId + provider + voiceId. Changing voice invalidates cache.
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-[#e0f2fe]0/20 text-[#38bdf8] text-[10px] font-black uppercase tracking-widest">
          {PROVIDER_ICONS[store.provider]} {store.provider}
        </span>
      </div>

      {/* ── Cached entries ── */}
      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
            Cached Audio ({entries.length})
          </p>
          <div className="flex gap-3">
            <button onClick={refresh} disabled={loading}
              className="text-[9px] font-black text-white/30 hover:text-[#0ea5e9] uppercase tracking-widest transition-colors">
              {loading ? '…' : '↻ Refresh'}
            </button>
            <button onClick={handleClear} disabled={clearing || entries.length === 0}
              className="text-[9px] font-black text-white/30 hover:text-rose-400 uppercase tracking-widest transition-colors disabled:opacity-30">
              {clearing ? 'Clearing…' : '🗑 Clear All'}
            </button>
          </div>
        </div>

        <div className="max-h-52 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="py-10 text-center space-y-1">
              <p className="text-2xl opacity-20">📭</p>
              <p className="text-[10px] text-white/30 font-medium">No cached audio yet.</p>
              <p className="text-[9px] text-white/20">
                Cache fills automatically as each narration plays for the first time.
              </p>
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.cacheKey}
                className="flex items-center justify-between px-5 py-2.5 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-base flex-shrink-0">
                    {PROVIDER_ICONS[entry.provider] ?? '🎙️'}
                  </span>
                  <span className="text-[10px] font-mono text-[#0ea5e9] flex-shrink-0 truncate max-w-[140px]">
                    {entry.scriptId}
                  </span>
                  <span className="text-[9px] text-white/30 truncate">
                    {entry.voiceId} · {entry.mimeType.split('/')[1]}
                  </span>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 ml-2">
                  <span className="text-[9px] text-white/30">{entry.hitCount} hits</span>
                  <span className="text-[9px] text-white/30">{Math.round(entry.blob.size / 1024)} KB</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── How it works ── */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
        <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-3">How the Cache Works</p>
        <div className="space-y-2.5">
          {[
            { icon: '⚡', label: 'Cache Hit',   desc: 'Plays instantly from IndexedDB — zero API calls, zero latency' },
            { icon: '🌐', label: 'Cache Miss',  desc: 'Fetches from ElevenLabs/Groq, then writes blob to IndexedDB' },
            { icon: '🔄', label: 'Auto-warm',   desc: 'Fills passively as each script plays for the first time' },
            { icon: '📦', label: 'Persistent',  desc: 'Survives page refresh — keyed by scriptId + provider + voiceId' },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3">
              <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>
              <div>
                <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest">{label}</span>
                <span className="text-[9px] text-blue-400/70 ml-2">{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

