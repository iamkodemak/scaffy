/**
 * Cache policy configuration for scaffold result caching.
 * Controls whether caching is active and the default TTL.
 */

const DEFAULT_TTL = 300; // seconds

let enabled = true;
let ttl = DEFAULT_TTL;

export function setEnabled(value) {
  enabled = Boolean(value);
}

export function isEnabled() {
  return enabled;
}

export function setTTL(seconds) {
  if (typeof seconds !== 'number' || seconds < 0) {
    throw new Error(`TTL must be a non-negative number, got: ${seconds}`);
  }
  ttl = seconds;
}

export function getTTL() {
  return ttl;
}

export function resetTTL() {
  ttl = DEFAULT_TTL;
}

/**
 * Apply cache policy from a config object.
 * @param {{ cache?: { enabled?: boolean, ttl?: number } }} config
 */
export function applyPolicyFromConfig(config) {
  const cacheConfig = config?.cache ?? {};
  if (typeof cacheConfig.enabled === 'boolean') {
    setEnabled(cacheConfig.enabled);
  }
  if (typeof cacheConfig.ttl === 'number') {
    setTTL(cacheConfig.ttl);
  }
}

/**
 * Reset policy to defaults (useful in tests).
 */
export function resetPolicy() {
  enabled = true;
  ttl = DEFAULT_TTL;
}
