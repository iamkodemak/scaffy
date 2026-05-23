/**
 * scaffoldCachePolicy.js
 * Defines cache eligibility rules and TTL-based expiry policies
 * for scaffold context caching.
 */

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

let ttlMs = DEFAULT_TTL_MS;
let enabled = true;

function setEnabled(flag) {
  enabled = Boolean(flag);
}

function isEnabled() {
  return enabled;
}

function setTTL(ms) {
  if (typeof ms !== 'number' || ms < 0) {
    throw new Error('TTL must be a non-negative number in milliseconds');
  }
  ttlMs = ms;
}

function getTTL() {
  return ttlMs;
}

function resetTTL() {
  ttlMs = DEFAULT_TTL_MS;
}

/**
 * Returns true if the cached entry is still valid based on TTL.
 * @param {number} timestamp - Unix ms when the entry was stored
 */
function isEntryValid(timestamp) {
  if (ttlMs === 0) return true; // 0 means never expire
  return Date.now() - timestamp < ttlMs;
}

/**
 * Determines whether a given set of scaffold options is cacheable.
 * Options with prompts or dry-run mode are not cached.
 * @param {object} options
 */
function isCacheable(options) {
  if (!enabled) return false;
  if (options.dryRun) return false;
  if (options.interactive) return false;
  if (options.noCache) return false;
  return true;
}

module.exports = {
  setEnabled,
  isEnabled,
  setTTL,
  getTTL,
  resetTTL,
  isEntryValid,
  isCacheable,
};
