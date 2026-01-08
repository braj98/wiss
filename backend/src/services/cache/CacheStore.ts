/**
 * CacheStore Abstraction
 * 
 * Interface for cache storage with TTL support
 * Allows swapping implementations (in-memory, Redis, etc.)
 */

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Cache storage abstraction with TTL support
 */
export interface ICacheStore {
  /**
   * Get value from cache
   * @param key Cache key
   * @returns Value if exists and not expired, null otherwise
   */
  get<T>(key: string): T | null;

  /**
   * Set value in cache with TTL
   * @param key Cache key
   * @param value Value to cache
   * @param ttlMs TTL in milliseconds (default: 30 days)
   */
  set<T>(key: string, value: T, ttlMs?: number): void;

  /**
   * Delete key from cache
   * @param key Cache key
   */
  delete(key: string): void;

  /**
   * Clear all cache entries
   */
  clear(): void;

  /**
   * Get cache size (number of keys)
   */
  size(): number;

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean;
}

/**
 * In-memory cache store implementation
 * 
 * SOLID Principle: Single Responsibility
 * Only responsible for caching logic, no framework dependencies
 */
export class InMemoryCacheStore implements ICacheStore {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTtlMs: number;

  constructor(defaultTtlMs: number = 30 * 24 * 60 * 60 * 1000) {
    // 30 days default
    this.defaultTtlMs = defaultTtlMs;
    this.startCleanupInterval();
  }

  /**
   * Get value from cache if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Set value in cache with TTL
   */
  set<T>(key: string, value: T, ttlMs?: number): void {
    const expiresAt = Date.now() + (ttlMs ?? this.defaultTtlMs);

    this.cache.set(key, {
      value,
      expiresAt
    });
  }

  /**
   * Delete specific key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get number of valid (non-expired) cache entries
   */
  size(): number {
    let count = 0;
    const now = Date.now();

    for (const entry of this.cache.values()) {
      if (entry.expiresAt >= now) {
        count++;
      }
    }

    return count;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Periodic cleanup of expired entries
   * Runs every 5 minutes
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];

      for (const [key, entry] of this.cache.entries()) {
        if (entry.expiresAt < now) {
          keysToDelete.push(key);
        }
      }

      for (const key of keysToDelete) {
        this.cache.delete(key);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }
}
