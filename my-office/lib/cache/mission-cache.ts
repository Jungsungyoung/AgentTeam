/**
 * Mission Cache
 * Simple in-memory cache for mission responses
 * Phase 3 will migrate to Redis for production
 */

import crypto from 'crypto';

interface CacheEntry {
  response: unknown;
  timestamp: number;
  hits: number;
}

class MissionCache {
  private cache: Map<string, CacheEntry>;
  private maxSize: number;
  private ttl: number; // Time to live in milliseconds

  constructor(maxSize = 100, ttl = 1000 * 60 * 60 * 24) {
    // Default: 24 hours
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  /**
   * Generate cache key from mission
   * Normalizes mission text and creates hash
   */
  getCacheKey(mission: string): string {
    // Normalize: lowercase, trim, remove extra spaces
    const normalized = mission.toLowerCase().trim().replace(/\s+/g, ' ');

    // Create SHA-256 hash
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Get cached response
   * Returns null if not found or expired
   */
  get(mission: string): unknown | null {
    const key = this.getCacheKey(mission);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Increment hit counter
    entry.hits++;
    return entry.response;
  }

  /**
   * Set cache entry
   * Implements LRU eviction when max size reached
   */
  set(mission: string, response: unknown): void {
    const key = this.getCacheKey(mission);

    // Check max size and evict oldest if needed
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    let totalHits = 0;
    const now = Date.now();
    let validEntries = 0;

    this.cache.forEach((entry) => {
      if (now - entry.timestamp <= this.ttl) {
        totalHits += entry.hits;
        validEntries++;
      }
    });

    return {
      size: this.cache.size,
      validEntries,
      totalHits,
      maxSize: this.maxSize,
      ttl: this.ttl,
    };
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): number {
    const now = Date.now();
    let cleaned = 0;

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    });

    return cleaned;
  }
}

// Export singleton instance
export const missionCache = new MissionCache();

// Export class for testing
export { MissionCache };
