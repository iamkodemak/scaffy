/**
 * scaffoldTimeout.js
 * Provides timeout enforcement for scaffold operations.
 */

const DEFAULT_TIMEOUT_MS = 30000;
const NO_TIMEOUT = 0;

let defaultTimeout = DEFAULT_TIMEOUT_MS;

/**
 * Set the default timeout in milliseconds.
 * Pass 0 to disable timeout.
 * @param {number} ms
 */
function setDefaultTimeout(ms) {
  if (typeof ms !== 'number' || ms < 0) {
    throw new Error('Timeout must be a non-negative number');
  }
  defaultTimeout = ms;
}

/**
 * Get the current default timeout.
 * @returns {number}
 */
function getDefaultTimeout() {
  return defaultTimeout;
}

/**
 * Reset timeout to the built-in default.
 */
function resetDefaultTimeout() {
  defaultTimeout = DEFAULT_TIMEOUT_MS;
}

/**
 * Wrap a promise with a timeout.
 * Rejects with a TimeoutError if the promise does not settle within `ms` ms.
 * If ms === 0, no timeout is applied.
 *
 * @param {Promise} promise
 * @param {number} [ms] - milliseconds; defaults to defaultTimeout
 * @param {string} [label] - optional label for error message
 * @returns {Promise}
 */
function withTimeout(promise, ms, label) {
  const timeoutMs = ms !== undefined ? ms : defaultTimeout;

  if (timeoutMs === NO_TIMEOUT) {
    return promise;
  }

  if (typeof timeoutMs !== 'number' || timeoutMs < 0) {
    throw new Error('Timeout must be a non-negative number');
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const msg = label
        ? `Operation "${label}" timed out after ${timeoutMs}ms`
        : `Operation timed out after ${timeoutMs}ms`;
      const err = new Error(msg);
      err.code = 'SCAFFOLD_TIMEOUT';
      reject(err);
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

module.exports = {
  setDefaultTimeout,
  getDefaultTimeout,
  resetDefaultTimeout,
  withTimeout,
  DEFAULT_TIMEOUT_MS,
};
