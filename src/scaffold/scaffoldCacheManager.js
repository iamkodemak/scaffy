import { hashOptions, set, get, remove, clear, size } from './scaffoldCache.js';
import { isEnabled, getTTL } from './scaffoldCachePolicy.js';

/**
 * Attempt to retrieve a cached scaffold result for the given options.
 * Returns null if caching is disabled or no entry exists.
 * @param {object} options
 * @returns {object|null}
 */
export function retrieve(options) {
  if (!isEnabled()) return null;
  const key = hashOptions(options);
  return get(key) ?? null;
}

/**
 * Store a scaffold result in the cache under the hashed options key.
 * No-op if caching is disabled.
 * @param {object} options
 * @param {object} result
 */
export function store(options, result) {
  if (!isEnabled()) return;
  const key = hashOptions(options);
  const ttl = getTTL();
  set(key, result, ttl);
}

/**
 * Remove a specific cache entry by options.
 * @param {object} options
 */
export function invalidate(options) {
  const key = hashOptions(options);
  remove(key);
}

/**
 * Clear all cached scaffold results.
 */
export function clearAll() {
  clear();
}

/**
 * Return current cache statistics.
 * @returns {{ size: number, enabled: boolean, ttl: number }}
 */
export function stats() {
  return {
    size: size(),
    enabled: isEnabled(),
    ttl: getTTL(),
  };
}
