// ============================================
// FILE: src/demo/voice/NarratorAdminPanel.tsx
// PURPOSE: System Admin UI — switch narrator, configure keys,
//          test each provider, tune voice settings
// ============================================

import { useState, useCallback, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNarratorStore } from './narratorStore';
import { testProvider, speak, stop, primeAudioContext, startAmbience, stopAmbience } from './narrationEngine';
import { GROQ_TTS_VOICES } from './types';
import type { NarratorProvider, NarratorTestResult } from './types';
import { CacheAdminTab } from './CacheAdminTab';

type MainTab = 'providers' | 'settings' | 'cache';

// ── Ambience presets ───────────────────────────────────────────────────────────
// Local files served from public/audio/ambience/ — avoids CDN hotlink blocking.
const AMBIENCE_PRESETS = [
  {
    label: 'Minimalist Tech',
    icon:  '💻',
    url:   '/audio/ambience/oosongoo-background-music-224633.mp3',
  },
  {
    label: 'Soft Cinematic',
    icon:  '🎬',
    url:   '/audio/ambience/diamond_tunes-cinematic-sound-effect-327618.mp3',
  },
  {
    label: 'Corporate Flow',
    icon:  '🏢',
    url:   '/audio/ambience/prettyjohn1-corporate-background-music_33sec-483404.mp3',
  },
  {
    label: 'Narrative Bed',
    icon:  '🎙️',
    url:   '/audio/ambience/openmindaudio-podcast-background-relaxed-narrative-bed-469114.mp3',
  },
  {
    label: 'Space Ambient',
    icon:  '🌌',
    url:   '/audio/ambience/audiopapkin-ambient-soundscapes-004-space-atmosphere-303243.mp3',
  },
] as const;

const PROVIDER_META: Record<NarratorProvider, {
  label: string;
  icon: string;
  color: string;
  badge: string;
  description: string;
}> = {
  elevenlabs: {
    label:       'ElevenLabs',
    icon:        '⚡',
    color:       'from-amber-500 to-orange-600',
    badge:       'PREMIUM',
    description: 'Ultra-realistic neural voice. Requires API key. Best audio quality.',
  },
  groq: {
    label:       'Groq TTS',
    icon:        '🚀',
    color:       'from-emerald-500 to-teal-600',
    badge:       'FAST',
    description: 'Orpheus voices via Groq. Requires API key. Very fast, low latency.',
  },
};

export function NarratorAdminPanel() {
  const store = useNarratorStore();
  const [testResults, setTestResults] = useState<Partial<Record<NarratorProvider, NarratorTestResult>>>({});
  const [testing,     setTesting]     = useState<NarratorProvider | null>(null);
  const [activeTab,   setActiveTab]   = useState<NarratorProvider>('elevenlabs');
  const [mainTab,     setMainTab]     = useState<MainTab>('providers');
  const [previewText, setPreviewText] = useState('Welcome to HRcopilot. Your workforce intelligence platform is ready.');

  // ── Ambience preview (admin-only, one-shot 6s clip) ───────────────────────
  const previewRef   = useRef<HTMLAudioElement | null>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [previewing, setPreviewing] = useState(false);

  const stopAmbiencePreview = useCallback(() => {
    if (previewTimer.current) { clearTimeout(previewTimer.current); previewTimer.current = null; }
    if (previewRef.current) {
      previewRef.current.pause();
      previewRef.current.src = '';
      previewRef.current = null;
    }
    setPreviewing(false);
  }, []);

  const playAmbiencePreview = useCallback((url: string) => {
    // Stop any running preview first
    stopAmbiencePreview();
    primeAudioContext();
    const audio = new Audio(url);
    audio.volume = store.ambienceVolume;
    audio.loop   = false; // one-shot — never loops
    previewRef.current = audio;
    setPreviewing(true);
    audio.play().catch(() => setPreviewing(false));
    // Auto-stop after 6 seconds regardless
    previewTimer.current = setTimeout(stopAmbiencePreview, 6000);
    audio.onended = stopAmbiencePreview;
  }, [store.ambienceVolume, stopAmbiencePreview]);

  useEffect(() => {
    if (previewRef.current) previewRef.current.volume = store.ambienceVolume;
  }, [store.ambienceVolume]);

  useEffect(() => () => stopAmbiencePreview(), [stopAmbiencePreview]);

  const handleTest = useCallback(async (provider: NarratorProvider) => {
    setTesting(provider);
    const result = await testProvider(provider);
    setTestResults((prev) => ({ ...prev, [provider]: result }));
    setTesting(null);
  }, []);

  const handlePreview = useCallback(() => {
    if (store.status === 'speaking') { stop(); return; }
    // primeAudioContext MUST be called synchronously inside the click handler
    primeAudioContext();
    speak(previewText, { provider: activeTab });
  }, [previewText, activeTab, store.status]);

  if (!store.adminPanelOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="narrator-admin-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) store.closeAdminPanel(); }}
      >
        <motion.div
          key="narrator-admin-panel"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[20px] md:rounded-[28px] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden mx-2"
        >
          {/* ── Header ── */}
          <div className="px-4 md:px-8 py-4 md:py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-gradient-to-r from-[#0369a1]/10 to-[#0369a1]/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0369a1] to-[#075985] flex items-center justify-center text-white text-lg shadow-lg shadow-[#e0f2fe]0/30">
                🎙️
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Narrator System
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Admin Panel · Voice Configuration
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Active provider badge */}
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#bae6fd] dark:bg-[#e0f2fe]0/20 text-[#075985] dark:text-[#38bdf8]">
                Active: {PROVIDER_META[store.provider].label}
              </span>
              <button
                onClick={store.closeAdminPanel}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-4 md:p-8 space-y-5 md:space-y-6 max-h-[85vh] overflow-y-auto">

            {/* ── Main tab bar ── */}
            <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-2xl p-1">
              {([
                { id: 'providers', label: '🎙️ Providers' },
                { id: 'settings',  label: '⚙️ Settings'  },
                { id: 'cache',     label: '💾 Audio Cache' },
              ] as { id: MainTab; label: string }[]).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setMainTab(t.id)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    mainTab === t.id
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── Cache tab ── */}
            {mainTab === 'cache' && <CacheAdminTab />}

            {/* ── Providers + Settings tabs ── */}
            {mainTab !== 'cache' && (<>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                Select Narrator Provider
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {(Object.keys(PROVIDER_META) as NarratorProvider[]).map((p) => {
                  const meta    = PROVIDER_META[p];
                  const isActive = store.provider === p;
                  const result  = testResults[p];

                  return (
                    <button
                      key={p}
                      onClick={() => { store.setProvider(p); setActiveTab(p); }}
                      className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                        isActive
                          ? 'border-[#e0f2fe]0 bg-[#e0f2fe] dark:bg-[#e0f2fe]0/10 shadow-lg shadow-[#e0f2fe]0/10'
                          : 'border-slate-200 dark:border-white/10 hover:border-[#38bdf8] dark:hover:border-[#e0f2fe]0/40 bg-white dark:bg-white/5'
                      }`}
                    >
                      {/* No default badge — both providers are equal */}

                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-white text-sm mb-2 shadow-sm`}>
                        {meta.icon}
                      </div>
                      <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        {meta.label}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {meta.description}
                      </p>

                      {/* Test result */}
                      {result && (
                        <div className={`mt-2 flex items-center gap-1.5 text-[9px] font-bold uppercase ${
                          result.success ? 'text-emerald-600' : 'text-rose-500'
                        }`}>
                          <span>{result.success ? '✓' : '✗'}</span>
                          <span>{result.success ? `${result.latencyMs}ms` : result.error?.slice(0, 28)}</span>
                        </div>
                      )}

                      {isActive && (
                        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-[#e0f2fe]0 shadow-[0_0_6px_rgba(14,165,233,0.8)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Provider-specific config ── */}
            <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-5 border border-slate-200 dark:border-white/10">
              {/* Tab switcher */}
              <div className="flex gap-2 mb-5">
                {(Object.keys(PROVIDER_META) as NarratorProvider[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setActiveTab(p)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeTab === p
                        ? 'bg-[#0369a1] text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {PROVIDER_META[p].label}
                  </button>
                ))}
              </div>

              {/* ElevenLabs config */}
              {activeTab === 'elevenlabs' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      API Key
                    </label>
                    <input
                      type="password"
                      placeholder="sk-..."
                      value={store.elevenLabsApiKey}
                      onChange={(e) => store.updateConfig({ elevenLabsApiKey: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      Voice ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. EXAVITQu4vr4xnSDxMaL"
                      value={store.elevenLabsVoiceId}
                      onChange={(e) => store.updateConfig({ elevenLabsVoiceId: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      Model
                    </label>
                    <select
                      value={store.elevenLabsModel}
                      onChange={(e) => store.updateConfig({ elevenLabsModel: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    >
                      <option value="eleven_turbo_v2_5">Turbo v2.5 (Fastest)</option>
                      <option value="eleven_multilingual_v2">Multilingual v2 (Best quality)</option>
                      <option value="eleven_monolingual_v1">Monolingual v1 (Legacy)</option>
                    </select>
                  </div>
                  <InfoBox variant="warning">
                    ElevenLabs charges per character. Ensure your API key has sufficient credits before enabling for live demos.
                  </InfoBox>
                </div>
              )}

              {/* Groq TTS config */}
              {activeTab === 'groq' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      Groq API Key
                    </label>
                    <input
                      type="password"
                      placeholder="gsk_..."
                      value={store.groqApiKey}
                      onChange={(e) => store.updateConfig({ groqApiKey: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                    <p className="text-[9px] text-slate-400 mt-1">
                      Uses the same key as your existing Groq LLM integration (VITE_GROQ_API_KEY)
                    </p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      Voice
                    </label>
                    <select
                      value={store.groqVoice}
                      onChange={(e) => store.updateConfig({ groqVoice: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    >
                      {GROQ_TTS_VOICES.map((v) => (
                        <option key={v.id} value={v.id}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                  <InfoBox>
                    Groq TTS uses the PlayAI model via Groq's ultra-fast inference. Same API key as your LLM calls.
                  </InfoBox>
                </div>
              )}
            </div>

            {/* ── Shared settings ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Volume */}
              <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-200 dark:border-white/10">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Volume — {Math.round(store.volume * 100)}%
                </label>
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={store.volume}
                  onChange={(e) => store.updateConfig({ volume: parseFloat(e.target.value) })}
                  className="w-full accent-[#0369a1]"
                />
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => store.updateConfig({ muted: !store.muted })}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                      store.muted
                        ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'
                        : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {store.muted ? '🔇 Muted' : '🔊 Unmuted'}
                  </button>
                </div>
              </div>

              {/* Subtitles */}
              <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-200 dark:border-white/10">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Subtitles
                </label>
                <button
                  onClick={() => store.updateConfig({ subtitlesEnabled: !store.subtitlesEnabled })}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all mb-3 ${
                    store.subtitlesEnabled
                      ? 'bg-[#bae6fd] dark:bg-[#e0f2fe]0/20 text-[#075985] dark:text-[#38bdf8]'
                      : 'bg-slate-100 dark:bg-white/10 text-slate-500'
                  }`}
                >
                  {store.subtitlesEnabled ? '✓ Enabled' : '✗ Disabled'}
                </button>
                <div className="flex gap-1.5">
                  {(['sm', 'md', 'lg'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => store.updateConfig({ subtitleFontSize: size })}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                        store.subtitleFontSize === size
                          ? 'bg-[#0369a1] text-white'
                          : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {size.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ambience */}
              <div className="col-span-2 bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-200 dark:border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Background Ambience
                    </label>
                    <p className="text-[9px] text-slate-400 mt-0.5">Enable for live demo · click a track to audition</p>
                  </div>
                  <button
                    onClick={() => {
                      const next = !store.ambienceEnabled;
                      store.updateConfig({ ambienceEnabled: next });
                      if (next) startAmbience(); else stopAmbience();
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                      store.ambienceEnabled
                        ? 'bg-[#bae6fd] dark:bg-violet-500/20 text-[#075985] dark:text-violet-300 border border-violet-300 dark:border-violet-500/30'
                        : 'bg-slate-100 dark:bg-white/10 text-slate-500'
                    }`}
                  >
                    {store.ambienceEnabled ? '🎵 Enabled for demo' : '🔇 Off'}
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Preset buttons — click to audition 6s clip */}
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      {previewing
                        ? <span className="text-violet-500 dark:text-violet-400 animate-pulse">▶ Playing 6s preview…</span>
                        : 'Select track · click to audition'}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {AMBIENCE_PRESETS.map((preset) => {
                        const isActive  = store.ambienceUrl === preset.url;
                        const isPlaying = previewing && isActive;
                        return (
                          <button
                            key={preset.label}
                            onClick={() => {
                              store.updateConfig({ ambienceUrl: preset.url });
                              if (isPlaying) stopAmbiencePreview();
                              else playAmbiencePreview(preset.url);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                              isActive
                                ? 'bg-[#0369a1] text-white border-[#0369a1]'
                                : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border-transparent hover:border-violet-400/40'
                            }`}
                          >
                            {isPlaying
                              ? <span className="w-2 h-2 rounded-full bg-white animate-pulse flex-shrink-0" />
                              : <span>{preset.icon}</span>}
                            {preset.label}
                          </button>
                        );
                      })}
                      {previewing && (
                        <button onClick={stopAmbiencePreview}
                          className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 transition-all">
                          ⏹ Stop
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Volume slider */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      Music Volume — {Math.round(store.ambienceVolume * 100)}%
                    </label>
                    <input
                      type="range" min="0" max="0.5" step="0.01"
                      value={store.ambienceVolume}
                      onChange={(e) => store.updateConfig({ ambienceVolume: parseFloat(e.target.value) })}
                      className="w-full accent-[#0369a1]"
                    />
                    <p className="text-[9px] text-slate-400 mt-1">Ducks to 20% while narrator speaks · capped at 50%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Preview & Test ── */}
            <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-5 border border-slate-200 dark:border-white/10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                Preview & Test
              </p>
              <textarea
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                rows={2}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e0f2fe]0/30 resize-none mb-3"
              />
              <div className="flex gap-2 flex-wrap">
                {/* Preview with active provider */}
                <PreviewButton
                  status={store.status}
                  providerLabel={PROVIDER_META[activeTab].label}
                  onClick={handlePreview}
                />

                {/* Test each provider */}
                {(Object.keys(PROVIDER_META) as NarratorProvider[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => handleTest(p)}
                    disabled={testing !== null}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/20 transition-all disabled:opacity-50"
                  >
                    {testing === p ? (
                      <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      testResults[p] ? (testResults[p]!.success ? '✓' : '✗') : '⚡'
                    )}
                    Test {PROVIDER_META[p].label}
                  </button>
                ))}
              </div>

              {/* Status display */}
              {store.status !== 'idle' && (
                <div className="mt-3 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    store.status === 'speaking' ? 'bg-emerald-500 animate-pulse' :
                    store.status === 'loading'  ? 'bg-amber-500 animate-pulse' :
                    store.status === 'error'    ? 'bg-rose-500' : 'bg-slate-400'
                  }`} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {store.status === 'speaking' && `Speaking via ${PROVIDER_META[store.provider].label}…`}
                    {store.status === 'loading'  && 'Loading voice model…'}
                    {store.status === 'error'    && `Error: ${store.errorMessage}`}
                  </span>
                </div>
              )}
            </div>

            {/* ── Footer actions ── */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={store.resetConfig}
                className="text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
              >
                Reset to Defaults
              </button>
              <button
                onClick={store.closeAdminPanel}
                className="px-5 py-2.5 bg-[#0369a1] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#075985] transition-colors shadow-lg shadow-[#e0f2fe]0/20"
              >
                Save & Close
              </button>
            </div>
          </>)}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Helper components ──────────────────────────────────────────────────────────

function InfoBox({ children, variant = 'info' }: { children: ReactNode; variant?: 'info' | 'warning' }) {
  return (
    <div className={`flex gap-2 p-3 rounded-xl text-[11px] leading-relaxed ${
      variant === 'warning'
        ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20'
        : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20'
    }`}>
      <span className="flex-shrink-0">{variant === 'warning' ? '⚠️' : 'ℹ️'}</span>
      <span>{children}</span>
    </div>
  );
}

function PreviewButton({
  status, providerLabel, onClick,
}: {
  status: string;
  providerLabel: string;
  onClick: () => void;
}) {
  const isBusy = status === 'generating' || status === 'loading';
  const isSpeaking = status === 'speaking';

  return (
    <button
      onClick={onClick}
      disabled={isBusy}
      className={`
        relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl
        text-[10px] font-black uppercase tracking-widest
        transition-all duration-200 select-none
        disabled:cursor-not-allowed
        ${isSpeaking
          ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/30'
          : isBusy
            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 cursor-wait'
            : 'bg-[#0369a1] hover:bg-[#075985] hover:scale-105 active:scale-95 text-white shadow-lg shadow-[#e0f2fe]0/25 hover:shadow-[#e0f2fe]0/40 cursor-pointer'
        }
      `}
    >
      {/* Icon */}
      {isSpeaking ? (
         <span className="w-3.5 h-3.5 flex items-center justify-center">⏹</span>
      ) : isBusy ? (
        <span className="w-3.5 h-3.5 border-2 border-amber-400/40 border-t-amber-500 dark:border-amber-300/40 dark:border-t-amber-300 rounded-full animate-spin flex-shrink-0" />
      ) : (
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}

      {/* Label */}
      <span>
        {isSpeaking   ? 'Stop Audio'
         : isBusy     ? 'Synthesising…'
         : `Preview · ${providerLabel}`}
      </span>
    </button>
  );
}

