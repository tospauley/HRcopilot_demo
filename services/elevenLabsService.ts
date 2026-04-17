/**
 * services/elevenLabsService.ts
 * Neural voice synthesis for HRcopilot — powered by ElevenLabs.
 *
 * Usage:
 *   import { speak, stopSpeech } from '../services/elevenLabsService';
 *   await speak('Here is your HR briefing for today.');
 *
 * Falls back to browser TTS (window.speechSynthesis) when no API key is set.
 */

const API_KEY  = import.meta.env.VITE_ELEVENLABS_API_KEY  as string | undefined;
const VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID as string | undefined;

const ELEVENLABS_URL = (voiceId: string) =>
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`;

function isConfigured(): boolean {
  return !!API_KEY && API_KEY.length > 10 && !!VOICE_ID;
}

// ─── Active audio tracking ────────────────────────────────────────────────────

let _currentAudio: HTMLAudioElement | null = null;

/** Stop any currently playing speech immediately. */
export function stopSpeech(): void {
  if (_currentAudio) {
    _currentAudio.pause();
    _currentAudio.src = '';
    _currentAudio = null;
  }
  // Web Speech is not used — nothing else to stop.
}

// ─── ElevenLabs TTS ───────────────────────────────────────────────────────────

async function speakElevenLabs(text: string): Promise<void> {
  const response = await fetch(ELEVENLABS_URL(VOICE_ID!), {
    method:  'POST',
    headers: {
      'xi-api-key':    API_KEY!,
      'Content-Type':  'application/json',
      'Accept':        'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id:         'eleven_turbo_v2_5',
      voice_settings: {
        stability:        0.5,
        similarity_boost: 0.75,
        style:            0.0,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
  }

  const blob      = await response.blob();
  const audioUrl  = URL.createObjectURL(blob);
  const audio     = new Audio(audioUrl);
  _currentAudio   = audio;

  await new Promise<void>((resolve, reject) => {
    audio.onended  = () => { URL.revokeObjectURL(audioUrl); resolve(); };
    audio.onerror  = (e) => { URL.revokeObjectURL(audioUrl); reject(e); };
    audio.play().catch(reject);
  });

  _currentAudio = null;
}

// ─── Browser TTS fallback — REMOVED ──────────────────────────────────────────
// Web Speech API is not used anywhere in this application.
// Alice (ElevenLabs) is the only voice. If ElevenLabs fails, silence.

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Speak the given text.
 * Uses ElevenLabs if configured, falls back to browser TTS.
 *
 * @param text     The text to speak.
 * @param options  Optional overrides.
 */
export async function speak(
  text: string,
  options: { forceNative?: boolean } = {},
): Promise<void> {
  stopSpeech();

  // Strip markdown before speaking
  const clean = text
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*?(.+?)\*\*?/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .trim();

  if (!options.forceNative && isConfigured()) {
    try {
      await speakElevenLabs(clean);
      return;
    } catch (err) {
      console.warn('[ElevenLabs] speak failed:', err);
    }
  }
  // No Web Speech fallback — silence if ElevenLabs is unavailable or not configured.
}

/** Returns true if ElevenLabs is configured and ready. */
export function isTTSConfigured(): boolean {
  return isConfigured();
}
