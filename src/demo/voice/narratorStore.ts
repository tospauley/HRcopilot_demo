// ============================================
// FILE: src/demo/voice/narratorStore.ts
// PURPOSE: Zustand store — narrator config + runtime state
// Kokoro removed. ElevenLabs and Groq only.
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NarratorConfig, NarratorProvider, NarratorStatus } from './types';
import { DEFAULT_NARRATOR_CONFIG } from './types';

// ── One-time localStorage migration ───────────────────────────────────────────
// Clears any stale kokoro/PlayAI values left from previous sessions.
try {
  const raw = localStorage.getItem('HRcopilot_narrator_config');
  if (raw) {
    const parsed = JSON.parse(raw);
    const s = parsed?.state;
    if (s) {
      // Provider: kokoro → groq
      if (s.provider === 'kokoro') s.provider = 'groq';
      // Voice: any non-Orpheus name → autumn
      const validOrpheus = ['autumn','diana','hannah','austin','daniel','troy'];
      if (s.groqVoice && !validOrpheus.includes(s.groqVoice)) s.groqVoice = 'autumn';
      localStorage.setItem('HRcopilot_narrator_config', JSON.stringify(parsed));
    }
  }
} catch { /* non-fatal */ }

// ── Auto-detect best available provider ───────────────────────────────────────
function detectBestProvider(): NarratorProvider {
  const el  = import.meta.env.VITE_ELEVENLABS_API_KEY  as string | undefined;
  const elV = import.meta.env.VITE_ELEVENLABS_VOICE_ID as string | undefined;
  const gr  = import.meta.env.VITE_GROQ_API_KEY        as string | undefined;
  const valid = (k?: string) => !!k && !k.startsWith('your_') && k.length > 10;
  if (valid(el) && valid(elV)) return 'elevenlabs';
  return 'groq';
}

interface NarratorRuntimeState {
  status:         NarratorStatus;
  currentText:    string;
  currentWord:    string;
  wordIndex:      number;
  errorMessage:   string | null;
  adminPanelOpen: boolean;
}

interface NarratorActions {
  setProvider:      (p: NarratorProvider) => void;
  updateConfig:     (patch: Partial<NarratorConfig>) => void;
  resetConfig:      () => void;
  setStatus:        (s: NarratorStatus) => void;
  setCurrentText:   (t: string) => void;
  setCurrentWord:   (word: string, idx: number) => void;
  setError:         (msg: string | null) => void;
  openAdminPanel:   () => void;
  closeAdminPanel:  () => void;
  toggleAdminPanel: () => void;
}

type NarratorStore = NarratorConfig & NarratorRuntimeState & NarratorActions;

export const useNarratorStore = create<NarratorStore>()(
  persist(
    (set) => ({
      ...DEFAULT_NARRATOR_CONFIG,
      // Runtime (never persisted)
      status:         'idle',
      currentText:    '',
      currentWord:    '',
      wordIndex:      -1,
      errorMessage:   null,
      adminPanelOpen: false,

      setProvider:      (p) => set({ provider: p }),
      updateConfig:     (patch) => set((s) => ({ ...s, ...patch })),
      resetConfig:      () => set({ ...DEFAULT_NARRATOR_CONFIG }),
      setStatus:        (status) => set({ status }),
      setCurrentText:   (currentText) => set({ currentText }),
      setCurrentWord:   (currentWord, wordIndex) => set({ currentWord, wordIndex }),
      setError:         (errorMessage) => set({ errorMessage }),
      openAdminPanel:   () => set({ adminPanelOpen: true }),
      closeAdminPanel:  () => set({ adminPanelOpen: false }),
      toggleAdminPanel: () => set((s) => ({ adminPanelOpen: !s.adminPanelOpen })),
    }),
    {
      name:    'HRcopilot_narrator_config',
      version: 2, // bump when shape changes — triggers onRehydrateStorage cleanly
      partialize: (s) => ({
        provider:          s.provider,
        elevenLabsApiKey:  s.elevenLabsApiKey,
        elevenLabsVoiceId: s.elevenLabsVoiceId,
        elevenLabsModel:   s.elevenLabsModel,
        groqApiKey:        s.groqApiKey,
        groqVoice:         s.groqVoice,
        volume:            s.volume,
        muted:             s.muted,
        subtitlesEnabled:  s.subtitlesEnabled,
        subtitleFontSize:  s.subtitleFontSize,
        // ambienceEnabled intentionally NOT persisted — always starts off.
        ambienceVolume:    s.ambienceVolume,
        ambienceUrl:       s.ambienceUrl,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Fix stale provider
        if ((state.provider as string) === 'kokoro') state.provider = 'groq';
        // Fix invalid Groq voice
        const validOrpheus = ['autumn','diana','hannah','austin','daniel','troy'];
        if (!validOrpheus.includes(state.groqVoice)) state.groqVoice = 'autumn';
        // Seed from env ONLY if the stored value is blank — never overwrite user choices
        const el  = import.meta.env.VITE_ELEVENLABS_API_KEY  as string | undefined;
        const elV = import.meta.env.VITE_ELEVENLABS_VOICE_ID as string | undefined;
        const gr  = import.meta.env.VITE_GROQ_API_KEY        as string | undefined;
        if (!state.elevenLabsApiKey  && el)  state.elevenLabsApiKey  = el;
        if (!state.elevenLabsVoiceId && elV) state.elevenLabsVoiceId = elV;
        if (!state.groqApiKey        && gr)  state.groqApiKey        = gr;
        // Auto-detect best provider based on what keys are now available
        state.provider = detectBestProvider();
      },
    },
  ),
);
