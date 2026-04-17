/**
 * HRcopilot In-Memory Query Cache
 *
 * A lightweight TTL-based cache for expensive derived computations
 * (department breakdowns, performance rankings, payroll summaries, etc.)
 * that don't need to recompute on every render.
 *
 * Usage:
 *   const result = queryCache.get('dept-breakdown', () => expensiveCompute(), 30_000);
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class QueryCache {
  private store = new Map<string, CacheEntry<any>>();

  /**
   * Get a cached value or compute + cache it.
   * @param key     Unique cache key
   * @param compute Function to run on cache miss
   * @param ttl     Time-to-live in ms (default 60s)
   */
  get<T>(key: string, compute: () => T, ttl = 60_000): T {
    const entry = this.store.get(key);
    if (entry && Date.now() < entry.expiresAt) {
      return entry.value as T;
    }
    const value = compute();
    this.store.set(key, { value, expiresAt: Date.now() + ttl });
    return value;
  }

  /** Invalidate a specific key */
  invalidate(key: string): void {
    this.store.delete(key);
  }

  /** Invalidate all keys matching a prefix */
  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  /** Wipe everything */
  clear(): void {
    this.store.clear();
  }

  /** How many entries are currently cached */
  get size(): number {
    return this.store.size;
  }
}

// Singleton — shared across the entire app
export const queryCache = new QueryCache();
