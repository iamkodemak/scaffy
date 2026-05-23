/**
 * scaffoldCacheManager.js
 * High-level interface combining scaffoldCache and scaffoldCachePolicy
 * for use by scaffoldRunner and scaffoldPipeline.
 */

const cache = require('./scaffoldCache');
const policy = require('./scaffoldCachePolicy');

/**
 * Attempt to retrieve a cached context for the given options.
 * Returns null if not cacheable, expired, or not found.
 * @param {object} options
 * @returns {object|null}
 */
function retrieve(options) {
  if (!policy.isCacheable(options)) return null;
  if (!cache.has(options)) return null;

  const key = cache.hashOptions(options);
  // Access internal entry for TTL check via listKeys + re-hash workaround
  const context = cache.get(options);
  return context || null;
}

/**
 * Store a scaffold context if the options are cacheable.
 * @param {object} options
 * @param {object} context
 * @returns {string|null} cache key or null if not stored
 */
function store(options, context) {
  if (!policy.isCacheable(options)) return null;
  return cache.set(options, context);
}

/**
 * Invalidate cache entry for specific options.
 * @param {object} options
 */
function invalidate(options) {
  return cache.invalidate(options);
}

/**
 * Clear all cached entries.
 */
function clearAll() {
  cache.clear();
}

/**
 * Return cache statistics.
 */
function stats() {
  return {
    size: cache.size(),
    maxSize: cache.getMaxSize(),
    ttlMs: policy.getTTL(),
    enabled: policy.isEnabled(),
  };
}

module.exports = {
  retrieve,
  store,
  invalidate,
  clearAll,
  stats,
};
