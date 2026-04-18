// ============================================
// FILE: src/demo/voice/narrationEngine.ts
// PURPOSE: 3-layer narration engine (Kokoro removed)
//
//   Layer 1 — ElevenLabs (if configured)
//   Layer 2 — Groq TTS   (if configured)
//   Layer 3 — Cinematic subtitles only (always works)
//
//   Fallback order: primary provider → other provider → subtitles
// ============================================

import { subtitleEngine } from './subtitleEngine';
import { useNarratorStore } from './narratorStore';
import { withGroqKey } from '../../lib/groqKeyPool';
import { withElevenLabsKey } from '../../lib/elevenLabsKeyPool';
import { cacheBlobAudio, getCachedBlobAudio } from './audioCache';
import type { NarratorProvider, SpeakOptions, NarratorTestResult } from './types';

// ── Lazy orchestrator accessor — avoids circular import TDZ ──────────────────
// narrationEngine ← (barrel) ← DemoApp ← MainShell ← demoOrchestrator
// Importing demoOrchestrator statically here creates a cycle that Rollup
// resolves with a TDZ. We break it by loading the module lazily at runtime.
let _getOrchestratorState: (() => { status: string }) | null = null;
let _subscribeOrchestrator: ((cb: (s: { status: string }) => void) => void) | null = null;

function _initOrchestrator(): void {
  if (_getOrchestratorState) return;
  // Dynamic import is async but we only need it after the first user gesture,
  // so by the time it's called all modules are fully initialized.
  import('../orchestrator/demoOrchestrator').then(({ useDemoOrchestrator }) => {
    _getOrchestratorState    = () => useDemoOrchestrator.getState();
    _subscribeOrchestrator   = (cb) => useDemoOrchestrator.subscribe(cb);
    // Wire up the subscription now that the module is loaded
    _wireOrchestratorSubscription();
  }).catch(() => { /* non-fatal — ambience lifecycle just won't auto-wire */ });
}

// ── Audio context ──────────────────────────────────────────────────────────────

let _audioCtx: AudioContext | null = null;

if (typeof document !== 'undefined') {
  const resume = () => { if (_audioCtx?.state === 'suspended') _audioCtx.resume().catch(() => {}); };
  document.addEventListener('click',      resume, { passive: true });
  document.addEventListener('touchstart', resume, { passive: true });
  document.addEventListener('keydown',    resume, { passive: true });
}

export function primeAudioContext(): void {
  if (!_audioCtx || _audioCtx.state === 'closed') {
    _audioCtx = new AudioContext({ sampleRate: 24000 });
    (window as any)._audioCtx = _audioCtx;
  }
  if (_audioCtx.state === 'suspended') _audioCtx.resume().catch(() => {});
  // Do NOT auto-start ambience here — ambience only starts when the demo
  // explicitly calls startAmbience(). primeAudioContext is called on every
  // user gesture (including admin panel opens) and must not trigger playback.
}

export function ensureAudioContextRunning(): Promise<void> {
  if (!_audioCtx || _audioCtx.state === 'running') return Promise.resolve();
  return _audioCtx.resume().catch(() => {});
}

// ── Active playback tracking ───────────────────────────────────────────────────

let _currentAudio: HTMLAudioElement | null = null;
let _isSpeaking = false;
// Monotonically-increasing token — each speak() call gets its own.
// Any async work that sees a stale token knows it has been superseded.
let _speakToken = 0;
// scriptId of the currently-speaking narration (used for cache keying)
let _currentScriptId: string | null = null;

// ── Background Ambience ────────────────────────────────────────────────────────
//
// Lifecycle:
//   startAmbience()  — demo begins    → fade in, loop
//   pauseAmbience()  — demo paused    → fade out, keep position (do NOT destroy)
//   resumeAmbience() — demo resumed   → fade back in from same position
//   stopAmbience()   — demo stopped / exited → fade out, then destroy
//
// Ducking (narration playing over ambience):
//   setDucking(true)  → fade to 20% of configured volume (fast, 400ms)
//   setDucking(false) → swell back to full volume (slow, 700ms)
//
// Admin panel preview uses a SEPARATE one-shot Audio element — never touches
// _ambientAudio so it cannot interfere with the live demo loop.

let _ambientAudio: HTMLAudioElement | null = null;
let _isDucked        = false;
let _fadeRaf: number | null = null;
let _loadedAmbienceUrl = '';

// ── Core fade utility ──────────────────────────────────────────────────────────

/**
 * Smoothly interpolate _ambientAudio.volume toward `target` over `durationMs`.
 * Cancels any in-progress fade before starting a new one.
 * Resolves when the fade completes (or is superseded).
 */
function _fadeTo(target: number, durationMs = 600): Promise<void> {
  return new Promise((resolve) => {
    if (_fadeRaf !== null) { cancelAnimationFrame(_fadeRaf); _fadeRaf = null; }
    if (!_ambientAudio) { resolve(); return; }

    const audio     = _ambientAudio;
    const start     = audio.volume;
    const startTime = performance.now();

    const step = (now: number) => {
      if (!_ambientAudio || _ambientAudio !== audio) { resolve(); return; } // superseded
      const t      = Math.min((now - startTime) / durationMs, 1);
      const eased  = 1 - Math.pow(1 - t, 3); // ease-out cubic
      audio.volume = Math.max(0, Math.min(1, start + (target - start) * eased));
      if (t < 1) {
        _fadeRaf = requestAnimationFrame(step);
      } else {
        audio.volume = target;
        _fadeRaf = null;
        resolve();
      }
    };

    _fadeRaf = requestAnimationFrame(step);
  });
}

// ── Public ambience API ────────────────────────────────────────────────────────

/**
 * Start the ambient loop from the beginning.
 * Call when the demo starts. Requires a prior user gesture.
 * No-op if ambienceEnabled is false or narrator is muted.
 */
export function startAmbience(): void {
  const state = useNarratorStore.getState();
  if (!state.ambienceEnabled || state.muted) return;

  // Create the element once — reuse across pause/resume cycles
  if (!_ambientAudio) {
    _ambientAudio        = new Audio();
    _ambientAudio.loop   = true;
    _ambientAudio.volume = 0; // start silent, fade in
  }

  // Switch track if the URL changed
  if (_loadedAmbienceUrl !== state.ambienceUrl) {
    _loadedAmbienceUrl   = state.ambienceUrl;
    _ambientAudio.src    = state.ambienceUrl;
    _ambientAudio.currentTime = 0;
  }

  _ambientAudio.play().catch(() => {});
  _fadeTo(state.ambienceVolume, 800); // fade in over 800ms
}

/**
 * Pause the ambient loop, preserving playback position.
 * Call when the demo is paused. Fades out before pausing.
 */
export async function pauseAmbience(): Promise<void> {
  if (!_ambientAudio || _ambientAudio.paused) return;
  await _fadeTo(0, 500);
  _ambientAudio?.pause(); // pause after fade — position is preserved
}

/**
 * Resume the ambient loop from where it was paused.
 * Call when the demo resumes.
 */
export function resumeAmbience(): void {
  const state = useNarratorStore.getState();
  if (!state.ambienceEnabled || state.muted) return;
  if (!_ambientAudio) { startAmbience(); return; }

  _ambientAudio.play().catch(() => {});
  _fadeTo(state.ambienceVolume, 600);
}

/**
 * Stop and fully tear down the ambient loop.
 * Call when the demo stops, exits, or the user explicitly stops it.
 * Fades out gracefully before destroying the element.
 */
export async function stopAmbience(): Promise<void> {
  if (!_ambientAudio) return;
  const audio = _ambientAudio;
  await _fadeTo(0, 400);
  audio.pause();
  audio.src = '';
  if (_ambientAudio === audio) {
    _ambientAudio      = null;
    _loadedAmbienceUrl = '';
  }
  _isDucked = false;
}

/**
 * Sync volume and track URL on a running loop (called from settings panel).
 * Does NOT start or stop playback — use start/pause/resume/stop for that.
 */
export function syncAmbience(): void {
  const state = useNarratorStore.getState();
  if (!_ambientAudio) return;

  if (!state.ambienceEnabled || state.muted) {
    stopAmbience();
    return;
  }

  // Switch track if URL changed
  if (_loadedAmbienceUrl !== state.ambienceUrl) {
    _loadedAmbienceUrl        = state.ambienceUrl;
    _ambientAudio.src         = state.ambienceUrl;
    _ambientAudio.currentTime = 0;
    _ambientAudio.play().catch(() => {});
  }

  // Sync volume (only when not mid-duck-fade)
  if (!_isDucked && _fadeRaf === null) {
    _ambientAudio.volume = Math.max(0, Math.min(1, state.ambienceVolume));
  }
}

// ── Ducking ────────────────────────────────────────────────────────────────────

/** Duck: fade to 20% while narrator speaks; swell back when done. */
function setDucking(ducked: boolean): void {
  if (_isDucked === ducked) return;
  _isDucked = ducked;
  if (!_ambientAudio) return;

  const { ambienceVolume } = useNarratorStore.getState();
  const target = ducked ? ambienceVolume * 0.2 : ambienceVolume;
  _fadeTo(target, ducked ? 400 : 700); // duck fast, swell slow
}

// ── React to store changes (volume slider / mute toggle) ──────────────────────
// Wrapped in a function and called via dynamic import to avoid Rollup TDZ:
// narrationEngine (top-level) → narratorStore (const) = TDZ in production bundle.
function _wireNarratorStoreSubscription(): void {
  useNarratorStore.subscribe((state, prevState) => {
    const volumeChanged  = state.ambienceVolume !== prevState.ambienceVolume;
    const mutedChanged   = state.muted          !== prevState.muted;
    const enabledChanged = state.ambienceEnabled !== prevState.ambienceEnabled;
    const urlChanged     = state.ambienceUrl    !== prevState.ambienceUrl;

    if (!volumeChanged && !mutedChanged && !enabledChanged && !urlChanged) return;

    if (!state.ambienceEnabled || state.muted) {
      stopAmbience();
      return;
    }

    if (_ambientAudio) {
      if (urlChanged) syncAmbience();
      // Only update volume when not mid-duck
      if ((volumeChanged || mutedChanged) && !_isDucked && _fadeRaf === null) {
        _fadeTo(state.ambienceVolume, 300);
      }
    }
  });
}
// Defer until after all modules have initialized — prevents Rollup TDZ
setTimeout(_wireNarratorStoreSubscription, 0);

function stopActiveAudio(): void {
  try { _currentAudio?.pause(); } catch { /* ignore */ }
  _currentAudio = null;
  _isSpeaking = false;
  // Only swell back if we were actually ducked — avoids a volume jump
  // when stop() is called before any narration has played.
  if (_isDucked) setDucking(false);
}

// ── Text sanitiser ─────────────────────────────────────────────────────────────

export function sanitise(text: string): string {
  return text
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*?(.+?)\*\*?/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Valid Orpheus voices ───────────────────────────────────────────────────────

const ORPHEUS_VOICES = ['autumn','diana','hannah','austin','daniel','troy'] as const;
type OrpheusVoice = typeof ORPHEUS_VOICES[number];

function resolveGroqVoice(stored: string): OrpheusVoice {
  return (ORPHEUS_VOICES as readonly string[]).includes(stored)
    ? stored as OrpheusVoice
    : 'autumn';
}

// ── Static file lookup ─────────────────────────────────────────────────────────
// Checks public/audio/narration/<scriptId>.<role>.mp3 (or .wav).
// Files are pre-generated once and committed to the repo, so they're served
// from CDN on every visit — no API calls, no browser cache dependency.
//
// Filename convention (mirrors pregenerate-narration.mjs):
//   hook-opening.CEO.mp3   (dots in scriptId replaced with dashes)
//
// role is optional — if omitted we try without a role suffix too, which
// covers single-role scripts like 'closing.ceo' stored as closing-ceo.mp3.

async function tryStaticAudio(
  scriptId: string,
  role: string | null,
  volume: number,
  muted: boolean,
  token: number,
): Promise<boolean> {
  const safe = scriptId.replace(/[^a-zA-Z0-9_-]/g, '-');

  const candidates: string[] = [];
  if (role) {
    candidates.push(`/audio/narration/${safe}.${role}.mp3`);
    candidates.push(`/audio/narration/${safe}.${role}.wav`);
  }
  candidates.push(`/audio/narration/${safe}.mp3`);
  candidates.push(`/audio/narration/${safe}.wav`);

  console.log(`[NarrationEngine] 🔍 tryStaticAudio — scriptId="${scriptId}" role="${role}" safe="${safe}"`);

  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        cache:   'no-cache',
        headers: { Accept: 'audio/mpeg, audio/wav, audio/*' },
      });
      if (!res.ok) {
        console.log(`[NarrationEngine] 🔍 ${url} → ${res.status} MISS`);
        continue;
      }
      // Vite SPA fallback serves index.html (text/html) for unknown paths —
      // reject anything that isn't an audio content-type.
      const ct = res.headers.get('content-type') ?? '';
      if (!ct.includes('audio') && !ct.includes('octet-stream') && !ct.includes('mpeg')) {
        console.log(`[NarrationEngine] 🔍 ${url} → wrong content-type "${ct}" (SPA fallback?) — skip`);
        continue;
      }
      if (token !== _speakToken) return true;
      console.log(`[NarrationEngine] ✅ Static HIT: ${url} (${ct})`);
      const blob = await res.blob();
      if (token !== _speakToken) return true;
      await playAudioBlob(blob, volume, muted, token);
      return true;
    } catch (err) {
      console.warn(`[NarrationEngine] 🔍 ${url} → ERROR:`, err);
    }
  }
  console.log(`[NarrationEngine] ℹ️ No static file for "${scriptId}" — will use API`);
  return false;
}

// ── Layer 1: ElevenLabs ────────────────────────────────────────────────────────

async function speakElevenLabs(
  text: string, token: number,
  scriptId: string | null = _currentScriptId,
  role: string | null = null,
): Promise<void> {
  const { volume, muted, elevenLabsVoiceId } = useNarratorStore.getState();

  // ── Static file (pre-generated, committed to repo) ─────────────────────────
  if (scriptId) {
    const served = await tryStaticAudio(scriptId, role, volume, muted, token);
    if (served) return;
  }

  // ── IndexedDB cache hit ────────────────────────────────────────────────────
  if (scriptId) {
    const cached = await getCachedBlobAudio(scriptId, 'elevenlabs', elevenLabsVoiceId || 'default');
    if (cached && token === _speakToken) {
      console.log(`[NarrationEngine] 🎯 Cache hit: ${scriptId}`);
      await playAudioBlob(cached.blob, volume, muted, token);
      return;
    }
  }

  if (token !== _speakToken) return;

  const audioBlob = await withElevenLabsKey(async (entry) => {
    const voiceId = entry.voiceId || useNarratorStore.getState().elevenLabsVoiceId;
    const model   = entry.model   || useNarratorStore.getState().elevenLabsModel || 'eleven_turbo_v2_5';

    if (!voiceId) throw Object.assign(new Error('ElevenLabs voice ID not configured'), { status: 0 });

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method:  'POST',
        headers: { 'xi-api-key': entry.apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
        body: JSON.stringify({
          text,
          model_id:       model,
          voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true },
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      const err: any = new Error(`ElevenLabs ${res.status}: ${body || res.statusText}`);
      err.status = res.status;
      throw err;
    }
    return res.blob();
  });

  if (token !== _speakToken) return; // superseded while fetching

  // ── Cache write ────────────────────────────────────────────────────────────
  if (scriptId) {
    const voiceId = useNarratorStore.getState().elevenLabsVoiceId || 'default';
    cacheBlobAudio(scriptId, 'elevenlabs', voiceId, audioBlob, 'audio/mpeg').catch(() => {});
  }

  await playAudioBlob(audioBlob, volume, muted, token);
}

// ── Layer 2: Groq TTS ──────────────────────────────────────────────────────────

async function speakGroq(
  text: string, token: number,
  scriptId: string | null = _currentScriptId,
  role: string | null = null,
): Promise<void> {
  const { groqVoice, volume, muted } = useNarratorStore.getState();
  const voice = resolveGroqVoice(groqVoice);

  // ── Static file (pre-generated, committed to repo) ─────────────────────────
  if (scriptId) {
    const served = await tryStaticAudio(scriptId, role, volume, muted, token);
    if (served) return;
  }

  // ── IndexedDB cache hit ────────────────────────────────────────────────────
  if (scriptId) {
    const cached = await getCachedBlobAudio(scriptId, 'groq', voice);
    if (cached && token === _speakToken) {
      console.log(`[NarrationEngine] 🎯 Cache hit: ${scriptId}`);
      await playAudioBlob(cached.blob, volume, muted, token);
      return;
    }
  }

  if (token !== _speakToken) return;

  const audioBlob = await withGroqKey(async (key) => {
    const res = await fetch('https://api.groq.com/openai/v1/audio/speech', {
      method:  'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model:           'canopylabs/orpheus-v1-english',
        input:           text,
        voice,
        response_format: 'wav',
      }),
    });

    if (!res.ok) {
      const err: any = new Error(`Groq TTS ${res.status}: ${res.statusText}`);
      err.status = res.status;
      throw err;
    }
    return res.blob();
  });

  if (token !== _speakToken) return; // superseded while fetching

  // ── Cache write ────────────────────────────────────────────────────────────
  if (scriptId) {
    cacheBlobAudio(scriptId, 'groq', voice, audioBlob, 'audio/wav').catch(() => {});
  }

  await playAudioBlob(audioBlob, volume, muted, token);
}

// ── Shared audio blob player ───────────────────────────────────────────────────

async function playAudioBlob(blob: Blob, volume: number, muted: boolean, token: number): Promise<void> {
  // Bail out if a newer speak() call has already superseded us
  if (token !== _speakToken) return;

  const url   = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.volume = muted ? 0 : Math.max(0, Math.min(1, volume));
  _currentAudio = audio;

  useNarratorStore.getState().setStatus('speaking');
  setDucking(true);

  try {
    await new Promise<void>((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(url);
        if (_currentAudio === audio) _currentAudio = null;
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        if (_currentAudio === audio) _currentAudio = null;
        reject(new Error('Audio playback error'));
      };
      audio.play().catch(reject);
    });
  } finally {
    // Always swell ambience back — whether narration ended naturally,
    // errored, or was superseded by a newer token.
    if (_isDucked) setDucking(false);
  }

  // If we were superseded mid-playback, treat it as a silent cancellation
  if (token !== _speakToken) return;
}

// ── Layer 3: Subtitles-only ────────────────────────────────────────────────────

async function speakSubtitlesOnly(text: string): Promise<void> {
  const lines   = subtitleEngine.parseToLines(text, 1.0);
  const totalMs = lines.reduce((s, l) => Math.max(s, l.startDelayMs + l.durationMs), 0);
  subtitleEngine.playLines(lines);
  setDucking(true);
  await new Promise<void>((r) => setTimeout(r, totalMs + 120));
  if (_isDucked) setDucking(false);
}

// ── Subtitle wiring ────────────────────────────────────────────────────────────

function startSubtitles(text: string, onWord?: (w: string, i: number) => void): void {
  const store = useNarratorStore.getState();
  subtitleEngine.onWord((word, idx) => {
    store.setCurrentWord(word, idx);
    onWord?.(word, idx);
  });
  subtitleEngine.playLines(subtitleEngine.parseToLines(text, 1.0));
}

// ── Main speak function ────────────────────────────────────────────────────────

export interface SpeakWithIdOptions extends SpeakOptions {
  scriptId?: string;
  role?: string; // e.g. 'CEO' | 'HR' | 'FINANCE' — used for static file lookup
}

export async function speak(text: string, opts: SpeakWithIdOptions = {}): Promise<void> {
  const store    = useNarratorStore.getState();
  const provider = opts.provider ?? store.provider;
  const clean    = sanitise(text);

  if (!clean) return;

  const token = ++_speakToken;
  const capturedScriptId = opts.scriptId ?? null;
  const capturedRole     = opts.role     ?? null;
  _currentScriptId = capturedScriptId;

  stopActiveAudio();
  subtitleEngine.stop();
  primeAudioContext();

  if (token !== _speakToken) return;

  _isSpeaking = true;
  store.setStatus('loading');
  store.setCurrentText(clean);
  store.setError(null);

  startSubtitles(clean, opts.onWord);

  try {
    if (provider === 'elevenlabs') {
      await speakElevenLabs(clean, token, capturedScriptId, capturedRole);
    } else {
      await speakGroq(clean, token, capturedScriptId, capturedRole);
    }

    // Superseded mid-playback — a newer speak() took over, don't call onDone
    if (token !== _speakToken) return;

    store.setStatus('idle');
    store.setError(null);
    opts.onDone?.();

  } catch (primaryErr) {
    if (token !== _speakToken) return;

    const primaryMsg = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);
    console.warn(`[NarrationEngine] ${provider} failed: ${primaryMsg}`);

    let recovered = false;

    try {
      if (provider === 'elevenlabs') {
        await speakGroq(clean, token, capturedScriptId, capturedRole);
      } else {
        await speakElevenLabs(clean, token, capturedScriptId, capturedRole);
      }
      if (token === _speakToken) {
        recovered = true;
        console.log('[NarrationEngine] ↩ Recovered via fallback provider');
      }
    } catch { /* fall through to subtitles */ }

    if (token !== _speakToken) return;

    if (!recovered) {
      console.log('[NarrationEngine] ↩ Subtitles-only fallback');
      await speakSubtitlesOnly(clean);
    }

    if (token !== _speakToken) return;

    store.setError(recovered ? null : primaryMsg);
    store.setStatus('idle');
    opts.onDone?.();
    opts.onError?.(primaryErr instanceof Error ? primaryErr : new Error(primaryMsg));

  } finally {
    if (token === _speakToken) {
      _isSpeaking = false;
      subtitleEngine.stop();
    }
  }
}

// ── Stop ──────────────────────────────────────────────────────────────────────

export function stop(): void {
  stopActiveAudio();
  subtitleEngine.stop();
  const store = useNarratorStore.getState();
  store.setStatus('idle');
  store.setCurrentText('');
  store.setCurrentWord('', -1);
}

export function isSpeaking(): boolean { return _isSpeaking; }

// ── Provider test ─────────────────────────────────────────────────────────────

export async function testProvider(provider: NarratorProvider): Promise<NarratorTestResult> {
  const t0    = Date.now();
  const token = ++_speakToken; // claim the token so playback works normally
  _currentScriptId = null;     // no caching for test calls
  try {
    if (provider === 'elevenlabs') await speakElevenLabs('HRcopilot voice system ready.', token, null);
    else                           await speakGroq('HRcopilot voice system ready.', token, null);
    return { provider, success: true,  latencyMs: Date.now() - t0 };
  } catch (err) {
    return { provider, success: false, latencyMs: Date.now() - t0,
      error: err instanceof Error ? err.message : String(err) };
  }
}


// ── Demo lifecycle → ambience wiring ─────────────────────────────────────────
// Watches the demo orchestrator and drives ambience accordingly.
// Uses a lazy dynamic import to break the circular dependency:
//   narrationEngine → (voice barrel) → DemoApp → MainShell → demoOrchestrator
//                                                           ↑ would TDZ here
let _prevDemoStatus: string = 'idle';

function _wireOrchestratorSubscription(): void {
  if (!_subscribeOrchestrator || !_getOrchestratorState) return;
  _prevDemoStatus = _getOrchestratorState().status;

  _subscribeOrchestrator((state) => {
    if (state.status === _prevDemoStatus) return;
    const prev = _prevDemoStatus;
    _prevDemoStatus = state.status;

    if (state.status === 'running') {
      if (prev === 'paused') {
        resumeAmbience();
      } else {
        startAmbience();
      }
    } else if (state.status === 'paused') {
      pauseAmbience();
      stop();
    } else {
      // idle or complete — full teardown
      stopAmbience();
      stop();
    }
  });
}

// Kick off the lazy load immediately — it resolves async after all modules
// are initialized, so no TDZ risk.
_initOrchestrator();
