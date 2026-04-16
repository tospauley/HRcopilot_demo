// ============================================
// FILE: src/demo/voice/index.ts
// PURPOSE: Barrel export for the voice system (Kokoro removed)
// ============================================

export { speak, stop, isSpeaking, testProvider, sanitise, primeAudioContext, ensureAudioContextRunning, startAmbience, pauseAmbience, resumeAmbience, stopAmbience, syncAmbience } from './narrationEngine';
export { subtitleEngine } from './subtitleEngine';
export { useNarratorStore } from './narratorStore';
export { useNarration } from './useNarration';
export { CinematicSubtitles } from './CinematicSubtitles';
export { NarratorAdminPanel } from './NarratorAdminPanel';
export { VoiceControlBar } from './VoiceControlBar';
export { CacheAdminTab } from './CacheAdminTab';
export { getFromCache, saveToCache, preGenerateAll, getPreGenProgress, nukeCache, getCacheAdminData } from './preRecordedManager';
export { audioCacheDB, cacheAudio, getCachedAudio, clearAudioCache, getCacheSizeKb, cacheBlobAudio, getCachedBlobAudio, clearBlobAudioCache } from './audioCache';
export type {
  NarratorProvider,
  NarratorStatus,
  NarratorConfig,
  SpeakOptions,
  NarratorTestResult,
  SubtitleWord,
  SubtitleLine,
  SilenceFill,
  SilenceFillType,
} from './types';
export { DEFAULT_NARRATOR_CONFIG, GROQ_TTS_VOICES } from './types';
