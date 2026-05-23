/**
 * scaffoldCache.js
 * Caches resolved scaffold contexts to avoid redundant processing
 * on repeated runs with the same options.
 */

const crypto = require('crypto');

let cache = new Map();
let maxSize = 50;

function hashOptions(options) {
  const normalized = JSON.stringify(options, Object.keys(options).sort());
  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 16);
}

function setMaxSize(size) {
  if (typeof size !== 'number' || size < 1) {
    throw new Error('maxSize must be a positive number');
  }
  maxSize = size;
}

function getMaxSize() {
  return maxSize;
}

function set(options, context) {
  const key = hashOptions(options);
  if (cache.size >= maxSize) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, { context, timestamp: Date.now() });
  return key;
}

function get(options) {
  const key = hashOptions(options);
  const entry = cache.get(key);
  return entry ? entry.context : null;
}

function has(options) {
  return cache.has(hashOptions(options));
}

function invalidate(options) {
  const key = hashOptions(options);
  return cache.delete(key);
}

function clear() {
  cache.clear();
}

function size() {
  return cache.size;
}

function listKeys() {
  return Array.from(cache.keys());
}

module.exports = {
  set,
  get,
  has,
  invalidate,
  clear,
  size,
  listKeys,
  setMaxSize,
  getMaxSize,
  hashOptions,
};
