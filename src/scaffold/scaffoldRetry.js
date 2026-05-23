/**
 * scaffoldRetry.js
 * Retry logic for scaffold operations with configurable attempts and backoff.
 */

let defaultMaxAttempts = 3;
let defaultDelayMs = 200;
let defaultBackoffFactor = 2;

function setDefaultMaxAttempts(n) {
  defaultMaxAttempts = n;
}

function setDefaultDelay(ms) {
  defaultDelayMs = ms;
}

function setDefaultBackoffFactor(factor) {
  defaultBackoffFactor = factor;
}

function resetDefaults() {
  defaultMaxAttempts = 3;
  defaultDelayMs = 200;
  defaultBackoffFactor = 2;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retries an async function up to maxAttempts times with exponential backoff.
 * @param {Function} fn - Async function to retry.
 * @param {object} [options]
 * @param {number} [options.maxAttempts]
 * @param {number} [options.delayMs]
 * @param {number} [options.backoffFactor]
 * @param {Function} [options.shouldRetry] - (err) => boolean
 * @returns {Promise<any>}
 */
async function withRetry(fn, options = {}) {
  const maxAttempts = options.maxAttempts ?? defaultMaxAttempts;
  const delayMs = options.delayMs ?? defaultDelayMs;
  const backoffFactor = options.backoffFactor ?? defaultBackoffFactor;
  const shouldRetry = options.shouldRetry ?? (() => true);

  let lastError;
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastError = err;
      if (attempt === maxAttempts || !shouldRetry(err)) {
        break;
      }
      await sleep(currentDelay);
      currentDelay *= backoffFactor;
    }
  }

  const retryError = new Error(
    `Operation failed after ${maxAttempts} attempt(s): ${lastError.message}`
  );
  retryError.cause = lastError;
  throw retryError;
}

module.exports = {
  withRetry,
  setDefaultMaxAttempts,
  setDefaultDelay,
  setDefaultBackoffFactor,
  resetDefaults,
};
