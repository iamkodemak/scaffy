/**
 * scaffoldQueue.js
 * Manages a queue of scaffold jobs with concurrency control.
 */

const DEFAULT_CONCURRENCY = 1;

let queue = [];
let running = 0;
let maxConcurrency = DEFAULT_CONCURRENCY;
let processedCount = 0;
let failedCount = 0;

function setMaxConcurrency(n) {
  if (typeof n !== 'number' || n < 1) {
    throw new Error('maxConcurrency must be a positive number');
  }
  maxConcurrency = n;
}

function getMaxConcurrency() {
  return maxConcurrency;
}

function reset() {
  queue = [];
  running = 0;
  maxConcurrency = DEFAULT_CONCURRENCY;
  processedCount = 0;
  failedCount = 0;
}

function stats() {
  return {
    queued: queue.length,
    running,
    processed: processedCount,
    failed: failedCount,
  };
}

async function _next() {
  if (running >= maxConcurrency || queue.length === 0) return;

  const { job, resolve, reject } = queue.shift();
  running++;

  try {
    const result = await job();
    processedCount++;
    resolve(result);
  } catch (err) {
    failedCount++;
    reject(err);
  } finally {
    running--;
    _next();
  }
}

function enqueue(job) {
  if (typeof job !== 'function') {
    return Promise.reject(new Error('job must be a function'));
  }
  return new Promise((resolve, reject) => {
    queue.push({ job, resolve, reject });
    _next();
  });
}

function clearQueue() {
  const dropped = queue.length;
  queue = [];
  return dropped;
}

module.exports = {
  setMaxConcurrency,
  getMaxConcurrency,
  enqueue,
  clearQueue,
  stats,
  reset,
};
