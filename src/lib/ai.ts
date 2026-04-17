/**
 * src/lib/ai.ts
 * Central AI client initializer for HRcopilot.
 *
 * Active services:
 *   • Groq       — primary LLM (llama-3.3-70b-versatile, fast inference)
 *   • ElevenLabs — neural voice synthesis
 *
 * Groq uses a multi-key pool (groqKeyPool.ts) — add up to 5 keys in .env.local:
 *   VITE_GROQ_API_KEY=gsk_...
 *   VITE_GROQ_API_KEY_2=gsk_...
 *   VITE_GROQ_API_KEY_3=gsk_...
 * On 429 rate-limit the pool rotates to the next key automatically.
 */

import Groq from 'groq-sdk';
import { withGroqKey, getNextKey } from './groqKeyPool';

// ─── Config ───────────────────────────────────────────────────────────────────

export const ELEVENLABS_KEY      = import.meta.env.VITE_ELEVENLABS_API_KEY  as string | undefined;
export const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID as string | undefined;

export const GROQ_MODEL = 'llama-3.3-70b-versatile';

// ─── Groq client factory (pool-aware) ────────────────────────────────────────
// Returns a fresh Groq client for the given key.
// We don't cache a singleton anymore — the pool picks the key per-call.

function makeGroqClient(apiKey: string): Groq {
  return new Groq({ apiKey, dangerouslyAllowBrowser: true });
}

/** Returns a client using the next healthy key, or null if pool is empty. */
export function getGroqClient(): Groq | null {
  const key = getNextKey();
  return key ? makeGroqClient(key) : null;
}

// ─── Shared chat helper ───────────────────────────────────────────────────────

/**
 * Single-turn Groq chat completion with automatic key rotation on 429.
 * Returns '' if no keys are configured.
 */
export async function groqChat(
  systemPrompt: string,
  userMessage:  string,
  maxTokens = 512,
): Promise<string> {
  const hasPool = !!getNextKey();
  if (!hasPool) return '';

  const res = await withGroqKey((key) =>
    makeGroqClient(key).chat.completions.create({
      model:       GROQ_MODEL,
      temperature: 0.4,
      max_tokens:  maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage  },
      ],
    }),
  );

  return res.choices[0]?.message?.content?.trim() ?? '';
}

/**
 * Multi-turn Groq chat completion with automatic key rotation on 429.
 */
export async function groqChatMultiTurn(
  systemPrompt: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  maxTokens = 700,
): Promise<string> {
  const hasPool = !!getNextKey();
  if (!hasPool) return '';

  const res = await withGroqKey((key) =>
    makeGroqClient(key).chat.completions.create({
      model:       GROQ_MODEL,
      temperature: 0.5,
      max_tokens:  maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
      ],
    }),
  );

  return res.choices[0]?.message?.content?.trim() ?? '';
}

/** Safely parse the first JSON object or array found in an LLM response. */
export function safeParse<T>(text: string, fallback: T): T {
  try {
    const objMatch = text.match(/\{[\s\S]*\}/);
    const arrMatch = text.match(/\[[\s\S]*\]/);
    const raw      = objMatch?.[0] ?? arrMatch?.[0];
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
