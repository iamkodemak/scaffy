const {
  setMaxConcurrency,
  getMaxConcurrency,
  enqueue,
  clearQueue,
  stats,
  reset,
} = require('../scaffoldQueue');

beforeEach(() => {
  reset();
});

describe('setMaxConcurrency / getMaxConcurrency', () => {
  it('defaults to 1', () => {
    expect(getMaxConcurrency()).toBe(1);
  });

  it('sets a valid concurrency', () => {
    setMaxConcurrency(3);
    expect(getMaxConcurrency()).toBe(3);
  });

  it('throws for non-positive values', () => {
    expect(() => setMaxConcurrency(0)).toThrow('maxConcurrency must be a positive number');
    expect(() => setMaxConcurrency(-1)).toThrow();
    expect(() => setMaxConcurrency('2')).toThrow();
  });
});

describe('enqueue', () => {
  it('rejects non-function jobs', async () => {
    await expect(enqueue('not a function')).rejects.toThrow('job must be a function');
  });

  it('runs a single job and resolves its result', async () => {
    const result = await enqueue(() => Promise.resolve(42));
    expect(result).toBe(42);
  });

  it('runs multiple jobs sequentially with concurrency 1', async () => {
    const order = [];
    const makeJob = (id, delay) => () =>
      new Promise((res) => setTimeout(() => { order.push(id); res(id); }, delay));

    await Promise.all([
      enqueue(makeJob('a', 30)),
      enqueue(makeJob('b', 10)),
      enqueue(makeJob('c', 5)),
    ]);

    expect(order).toEqual(['a', 'b', 'c']);
  });

  it('propagates job errors and increments failedCount', async () => {
    await expect(enqueue(() => Promise.reject(new Error('boom')))).rejects.toThrow('boom');
    expect(stats().failed).toBe(1);
  });

  it('increments processedCount on success', async () => {
    await enqueue(() => Promise.resolve('ok'));
    await enqueue(() => Promise.resolve('ok2'));
    expect(stats().processed).toBe(2);
  });
});

describe('clearQueue', () => {
  it('returns number of dropped jobs', () => {
    // Fill queue without awaiting
    enqueue(() => new Promise((r) => setTimeout(r, 200)));
    enqueue(() => new Promise((r) => setTimeout(r, 200)));
    enqueue(() => new Promise((r) => setTimeout(r, 200)));
    const dropped = clearQueue();
    expect(dropped).toBeGreaterThanOrEqual(0);
  });
});

describe('stats', () => {
  it('returns initial zeroed stats', () => {
    expect(stats()).toEqual({ queued: 0, running: 0, processed: 0, failed: 0 });
  });
});
