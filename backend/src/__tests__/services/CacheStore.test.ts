/**
 * CacheStore Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InMemoryCacheStore } from '../../services/cache/CacheStore.js';

describe('InMemoryCacheStore', () => {
  let cache: InMemoryCacheStore;

  beforeEach(() => {
    cache = new InMemoryCacheStore(1000); // 1 second TTL for testing
    vi.useFakeTimers();
  });

  describe('set and get', () => {
    it('should set and get a value', () => {
      cache.set('key1', { data: 'value1' });
      const result = cache.get('key1');

      expect(result).toEqual({ data: 'value1' });
    });

    it('should return null for non-existent key', () => {
      const result = cache.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should overwrite existing value', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');

      expect(cache.get('key1')).toBe('value2');
    });

    it('should handle different data types', () => {
      cache.set('string', 'text');
      cache.set('number', 42);
      cache.set('array', [1, 2, 3]);
      cache.set('object', { foo: 'bar' });

      expect(cache.get('string')).toBe('text');
      expect(cache.get('number')).toBe(42);
      expect(cache.get('array')).toEqual([1, 2, 3]);
      expect(cache.get('object')).toEqual({ foo: 'bar' });
    });
  });

  describe('TTL expiration', () => {
    it('should expire value after TTL', () => {
      cache.set('key1', 'value1', 1000);
      
      expect(cache.get('key1')).toBe('value1');

      vi.advanceTimersByTime(1001);

      expect(cache.get('key1')).toBeNull();
    });

    it('should use default TTL if not specified', () => {
      const customCache = new InMemoryCacheStore(5000);
      customCache.set('key1', 'value1');

      vi.advanceTimersByTime(4999);
      expect(customCache.get('key1')).toBe('value1');

      vi.advanceTimersByTime(2);
      expect(customCache.get('key1')).toBeNull();
    });

    it('should respect custom TTL', () => {
      cache.set('key1', 'value1', 2000);
      cache.set('key2', 'value2', 500);

      vi.advanceTimersByTime(600);

      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a key', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);

      cache.delete('key1');
      expect(cache.has('key1')).toBe(false);
    });

    it('should not throw error deleting non-existent key', () => {
      expect(() => cache.delete('nonexistent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all cache', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.clear();

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });
  });

  describe('size', () => {
    it('should return number of valid entries', () => {
      cache.set('key1', 'value1', 1000);
      cache.set('key2', 'value2', 1000);

      expect(cache.size()).toBe(2);
    });

    it('should not count expired entries in size', () => {
      cache.set('key1', 'value1', 1000);
      cache.set('key2', 'value2', 500);

      vi.advanceTimersByTime(600);

      expect(cache.size()).toBe(1);
    });

    it('should return 0 for empty cache', () => {
      expect(cache.size()).toBe(0);
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should return false for expired key', () => {
      cache.set('key1', 'value1', 1000);
      
      vi.advanceTimersByTime(1001);
      
      expect(cache.has('key1')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle null values', () => {
      cache.set('key1', null);
      expect(cache.get('key1')).toBeNull();
    });

    it('should handle undefined values', () => {
      cache.set('key1', undefined);
      const result = cache.get('key1');
      expect(result).toBeUndefined();
    });

    it('should handle large objects', () => {
      const largeObject = {
        data: Array(1000).fill('value')
      };

      cache.set('large', largeObject);
      expect(cache.get('large')).toEqual(largeObject);
    });
  });
});
