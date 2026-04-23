// server/src/services/cache.ts
// Simple in-memory TTL cache for weather and NDVI data.
// Prevents hammering external APIs when MongoDB analysis cache is invalidated.

import logger from '../utils/logger';

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const store = new Map<string, CacheEntry>();

/**
 * Sanitize a string for safe use as a cache key segment.
 * Removes any characters that aren't alphanumeric, dash, underscore, or dot.
 */
export function sanitizeKeySegment(input: string): string {
  return input.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 64);
}

/** Retrieve a cached value if it hasn't expired. Returns `null` on miss. */
export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }

  return entry.data as T;
}

/** Store a value with a TTL (in milliseconds). */
export function cacheSet(key: string, data: unknown, ttlMs: number): void {
  store.set(key, { data, expiresAt: Date.now() + ttlMs });
  logger.info(`Cache SET ${key} (TTL ${Math.round(ttlMs / 60_000)}min)`);
}
