/**
 * scaffoldRateLimiter.js
 * Limits how frequently scaffold runs can be triggered within a time window.
 */

let maxRuns = 5;
let windowMs = 60_000; // 1 minute
const timestamps = [];

/**
 * Set the maximum number of scaffold runs allowed within the time window.
 * @param {number} n
 */
function setMaxRuns(n) {
  if (typeof n !== 'number' || n < 1) throw new Error('maxRuns must be a positive number');
  maxRuns = n;
}

/**
 * Set the rolling time window in milliseconds.
 * @param {number} ms
 */
function setWindowMs(ms) {
  if (typeof ms !== 'number' || ms < 1) throw new Error('windowMs must be a positive number');
  windowMs = ms;
}

function getMaxRuns() {
  return maxRuns;
}

function getWindowMs() {
  return windowMs;
}

/**
 * Reset configuration and internal state to defaults.
 */
function reset() {
  maxRuns = 5;
  windowMs = 60_000;
  timestamps.length = 0;
}

/**
 * Attempt to record a scaffold run. Returns true if allowed, false if rate-limited.
 * @param {number} [now] - optional timestamp override for testing
 * @returns {boolean}
 */
function tryAcquire(now = Date.now()) {
  // Evict timestamps outside the current window
  const cutoff = now - windowMs;
  while (timestamps.length > 0 && timestamps[0] <= cutoff) {
    timestamps.shift();
  }

  if (timestamps.length >= maxRuns) {
    return false;
  }

  timestamps.push(now);
  return true;
}

/**
 * Returns the number of runs recorded in the current window.
 * @param {number} [now]
 * @returns {number}
 */
function currentCount(now = Date.now()) {
  const cutoff = now - windowMs;
  return timestamps.filter(t => t > cutoff).length;
}

module.exports = {
  setMaxRuns,
  setWindowMs,
  getMaxRuns,
  getWindowMs,
  reset,
  tryAcquire,
  currentCount,
};
