/**
 * Simple in-memory LRU-style cache with optional TTL support.
 */

let maxSize = 50;
const store = new Map();

export function hashOptions(options) {
  return JSON.stringify(
    Object.keys(options)
      .sort()
      .reduce((acc, k) => { acc[k] = options[k]; return acc; }, {})
  );
}

export function setMaxSize(n) {
  maxSize = n;
}

export function getMaxSize() {
  return maxSize;
}

export function set(key, value, ttlSeconds = 0) {
  if (store.size >= maxSize) {
    const firstKey = store.keys().next().value;
    store.delete(firstKey);
  }
  const expiresAt = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
  store.set(key, { value, expiresAt });
}

export function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function remove(key) {
  store.delete(key);
}

export function clear() {
  store.clear();
}

export function size() {
  return store.size;
}

export function keys() {
  return Array.from(store.keys());
}
