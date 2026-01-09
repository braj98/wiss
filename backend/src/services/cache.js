/**
 * Simple in-memory cache implementation
 */
export class CacheStore {
  constructor(ttlMs = 30 * 24 * 60 * 1000) { // 30 days TTL
    this.cache = new Map();
    this.ttlMs = ttlMs;
    this.startCleanupInterval();
  }

  get(key) {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key, value, ttlMs = this.ttlMs) {
    const entry = {
      value,
      expiresAt: Date.now() + ttlMs
    };

    this.cache.set(key, entry);
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  getStats() {
    const now = Date.now();
    let count = 0;

    for (const entry of this.cache.values()) {
      if (entry.expiresAt >= now) {
        count++;
      }
    }

    return {
      size: count,
      keys: Array.from(this.cache.keys())
    };
  }

  has(key) {
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

  startCleanupInterval() {
    setInterval(() => {
      const now = Date.now();
      const keysToDelete = [];

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
