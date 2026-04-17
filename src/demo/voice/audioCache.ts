// ============================================
// FILE: src/demo/voice/audioCache.ts
// PURPOSE: Dexie (IndexedDB) schema for Kokoro-generated audio blobs.
//          Keyed by scriptId + voiceId + speed so cache invalidates
//          automatically when voice settings change.
// ============================================

import Dexie, { type Table } from 'dexie';

// ── Schema ─────────────────────────────────────────────────────────────────────

export interface CachedAudio {
  /** Composite key: `${scriptId}::${voiceId}::${speed}` */
  cacheKey:    string;
  scriptId:    string;
  voiceId:     string;
  speed:       number;
  /** Raw PCM Float32Array stored directly in IndexedDB (BLOB) */
  pcmData:     Float32Array;
  sampleRate:  number;
  /** Duration in ms — used to drive subtitle timing */
  durationMs:  number;
  cachedAt:    number; // Date.now()
  /** How many times this entry has been served from cache */
  hitCount:    number;
}

export interface CacheStats {
  id:          1; // singleton row
  totalEntries: number;
  totalHits:   number;
  totalMisses: number;
  lastUpdated: number;
}

/** Cached audio blob from ElevenLabs or Groq TTS */
export interface CachedBlobAudio {
  /** Composite key: `${scriptId}::${provider}::${voiceId}` */
  cacheKey:  string;
  scriptId:  string;
  provider:  string; // 'elevenlabs' | 'groq'
  voiceId:   string;
  blob:      Blob;
  mimeType:  string; // 'audio/mpeg' | 'audio/wav'
  cachedAt:  number;
  hitCount:  number;
}

// ── Dexie database ─────────────────────────────────────────────────────────────

class AudioCacheDB extends Dexie {
  audio!:     Table<CachedAudio,     string>;
  blobAudio!: Table<CachedBlobAudio, string>;
  stats!:     Table<CacheStats,      number>;

  constructor() {
    super('HRcopilot_audio_cache');
    this.version(1).stores({
      audio: 'cacheKey, scriptId, voiceId, cachedAt',
      stats: 'id',
    });
    // v2 adds blob storage for ElevenLabs / Groq
    this.version(2).stores({
      audio:     'cacheKey, scriptId, voiceId, cachedAt',
      blobAudio: 'cacheKey, scriptId, provider, cachedAt',
      stats:     'id',
    });
  }
}

export const audioCacheDB = new AudioCacheDB();

// ── Helpers ────────────────────────────────────────────────────────────────────

export function makeCacheKey(scriptId: string, voiceId: string, speed: number): string {
  return `${scriptId}::${voiceId}::${speed.toFixed(2)}`;
}

/** Initialise stats row if it doesn't exist */
async function ensureStats(): Promise<void> {
  const existing = await audioCacheDB.stats.get(1);
  if (!existing) {
    await audioCacheDB.stats.put({
      id: 1, totalEntries: 0, totalHits: 0, totalMisses: 0, lastUpdated: Date.now(),
    });
  }
}

async function bumpStat(field: 'totalHits' | 'totalMisses' | 'totalEntries'): Promise<void> {
  await ensureStats();
  await audioCacheDB.stats
    .where('id').equals(1)
    .modify((row) => { row[field]++; row.lastUpdated = Date.now(); });
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Store a Kokoro-generated audio result in IndexedDB.
 * PCM Float32Array is converted to a plain number[] for storage.
 */
export async function cacheAudio(
  scriptId:   string,
  voiceId:    string,
  speed:      number,
  pcm:        Float32Array,
  sampleRate: number,
): Promise<void> {
  const cacheKey  = makeCacheKey(scriptId, voiceId, speed);
  const durationMs = Math.round((pcm.length / sampleRate) * 1000);

  await audioCacheDB.audio.put({
    cacheKey,
    scriptId,
    voiceId,
    speed,
    pcmData:    pcm,
    sampleRate,
    durationMs,
    cachedAt:   Date.now(),
    hitCount:   0,
  });

  await bumpStat('totalEntries');
}

/**
 * Retrieve a cached audio entry. Returns null on cache miss.
 * Increments hitCount on hit.
 */
export async function getCachedAudio(
  scriptId: string,
  voiceId:  string,
  speed:    number,
): Promise<CachedAudio | null> {
  const cacheKey = makeCacheKey(scriptId, voiceId, speed);
  const entry    = await audioCacheDB.audio.get(cacheKey);

  if (!entry) {
    await bumpStat('totalMisses');
    return null;
  }

  // Increment hit count
  await audioCacheDB.audio
    .where('cacheKey').equals(cacheKey)
    .modify((row) => { row.hitCount++; });

  await bumpStat('totalHits');
  return entry;
}

/** All cached entries — used by admin panel */
export async function getAllCachedEntries(): Promise<CachedAudio[]> {
  return audioCacheDB.audio.orderBy('cachedAt').reverse().toArray();
}

/** Cache stats — used by admin panel */
export async function getCacheStats(): Promise<CacheStats | null> {
  await ensureStats();
  return audioCacheDB.stats.get(1) ?? null;
}

/** Delete a single entry */
export async function deleteCachedEntry(cacheKey: string): Promise<void> {
  await audioCacheDB.audio.delete(cacheKey);
}

/** Wipe entire cache */
export async function clearAudioCache(): Promise<void> {
  await audioCacheDB.audio.clear();
  await audioCacheDB.stats.put({
    id: 1, totalEntries: 0, totalHits: 0, totalMisses: 0, lastUpdated: Date.now(),
  });
}

/** Approximate cache size in KB */
export async function getCacheSizeKb(): Promise<number> {
  const entries = await audioCacheDB.audio.toArray();
  const totalFloats = entries.reduce((sum, e) => sum + e.pcmData.length, 0);
  // Float32 = 4 bytes each, convert to KB
  return Math.round((totalFloats * 4) / 1024);
}

// ── Blob audio cache (ElevenLabs / Groq) ──────────────────────────────────────

export function makeBlobCacheKey(scriptId: string, provider: string, voiceId: string): string {
  return `${scriptId}::${provider}::${voiceId}`;
}

/** Store a TTS blob from ElevenLabs or Groq. Fails silently. */
export async function cacheBlobAudio(
  scriptId: string,
  provider: string,
  voiceId:  string,
  blob:     Blob,
  mimeType: string,
): Promise<void> {
  const cacheKey = makeBlobCacheKey(scriptId, provider, voiceId);
  await audioCacheDB.blobAudio.put({
    cacheKey, scriptId, provider, voiceId, blob, mimeType,
    cachedAt: Date.now(),
    hitCount: 0,
  });
  await bumpStat('totalEntries');
}

/** Retrieve a cached blob. Returns null on miss. */
export async function getCachedBlobAudio(
  scriptId: string,
  provider: string,
  voiceId:  string,
): Promise<CachedBlobAudio | null> {
  const cacheKey = makeBlobCacheKey(scriptId, provider, voiceId);
  const entry    = await audioCacheDB.blobAudio.get(cacheKey);

  if (!entry) {
    await bumpStat('totalMisses');
    return null;
  }

  await audioCacheDB.blobAudio
    .where('cacheKey').equals(cacheKey)
    .modify((row) => { row.hitCount++; });
  await bumpStat('totalHits');
  return entry;
}

/** Wipe blob cache */
export async function clearBlobAudioCache(): Promise<void> {
  await audioCacheDB.blobAudio.clear();
}

export { type CachedBlobAudio };
