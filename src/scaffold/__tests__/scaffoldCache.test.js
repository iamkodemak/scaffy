const cache = require('../scaffoldCache');

beforeEach(() => {
  cache.clear();
  cache.setMaxSize(50);
});

describe('scaffoldCache', () => {
  const opts = { template: 'express', name: 'my-app' };
  const ctx = { resolved: true, vars: { name: 'my-app' } };

  test('stores and retrieves a context', () => {
    cache.set(opts, ctx);
    expect(cache.get(opts)).toEqual(ctx);
  });

  test('has() returns true after set', () => {
    cache.set(opts, ctx);
    expect(cache.has(opts)).toBe(true);
  });

  test('has() returns false for unknown options', () => {
    expect(cache.has({ template: 'unknown' })).toBe(false);
  });

  test('invalidate() removes a specific entry', () => {
    cache.set(opts, ctx);
    cache.invalidate(opts);
    expect(cache.has(opts)).toBe(false);
  });

  test('clear() empties the cache', () => {
    cache.set(opts, ctx);
    cache.set({ template: 'koa' }, ctx);
    cache.clear();
    expect(cache.size()).toBe(0);
  });

  test('evicts oldest entry when maxSize is reached', () => {
    cache.setMaxSize(2);
    const a = { template: 'a' };
    const b = { template: 'b' };
    const c = { template: 'c' };
    cache.set(a, ctx);
    cache.set(b, ctx);
    cache.set(c, ctx);
    expect(cache.size()).toBe(2);
    expect(cache.has(a)).toBe(false);
    expect(cache.has(b)).toBe(true);
    expect(cache.has(c)).toBe(true);
  });

  test('hashOptions produces consistent hash', () => {
    const h1 = cache.hashOptions({ a: 1, b: 2 });
    const h2 = cache.hashOptions({ b: 2, a: 1 });
    expect(h1).toBe(h2);
  });

  test('setMaxSize throws on invalid value', () => {
    expect(() => cache.setMaxSize(0)).toThrow();
    expect(() => cache.setMaxSize('ten')).toThrow();
  });

  test('listKeys returns all stored keys', () => {
    cache.set(opts, ctx);
    expect(cache.listKeys()).toHaveLength(1);
  });
});
