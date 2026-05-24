const {
  setDefaultTimeout,
  getDefaultTimeout,
  resetDefaultTimeout,
  withTimeout,
  DEFAULT_TIMEOUT_MS,
} = require('../scaffoldTimeout');

beforeEach(() => {
  resetDefaultTimeout();
});

describe('setDefaultTimeout / getDefaultTimeout', () => {
  it('returns the built-in default initially', () => {
    expect(getDefaultTimeout()).toBe(DEFAULT_TIMEOUT_MS);
  });

  it('updates the default timeout', () => {
    setDefaultTimeout(5000);
    expect(getDefaultTimeout()).toBe(5000);
  });

  it('allows setting timeout to 0 (disabled)', () => {
    setDefaultTimeout(0);
    expect(getDefaultTimeout()).toBe(0);
  });

  it('throws for negative values', () => {
    expect(() => setDefaultTimeout(-1)).toThrow('non-negative');
  });

  it('throws for non-number values', () => {
    expect(() => setDefaultTimeout('fast')).toThrow('non-negative');
  });
});

describe('resetDefaultTimeout', () => {
  it('restores the built-in default', () => {
    setDefaultTimeout(1000);
    resetDefaultTimeout();
    expect(getDefaultTimeout()).toBe(DEFAULT_TIMEOUT_MS);
  });
});

describe('withTimeout', () => {
  it('resolves when promise settles before timeout', async () => {
    const p = Promise.resolve('done');
    await expect(withTimeout(p, 1000)).resolves.toBe('done');
  });

  it('rejects when promise exceeds timeout', async () => {
    const p = new Promise((resolve) => setTimeout(resolve, 200));
    await expect(withTimeout(p, 50)).rejects.toMatchObject({
      code: 'SCAFFOLD_TIMEOUT',
    });
  });

  it('includes label in timeout error message', async () => {
    const p = new Promise((resolve) => setTimeout(resolve, 200));
    await expect(withTimeout(p, 50, 'myOp')).rejects.toThrow('"myOp"');
  });

  it('propagates rejection from the original promise', async () => {
    const p = Promise.reject(new Error('original error'));
    await expect(withTimeout(p, 1000)).rejects.toThrow('original error');
  });

  it('skips timeout when ms is 0', async () => {
    const p = new Promise((resolve) => setTimeout(() => resolve('ok'), 100));
    await expect(withTimeout(p, 0)).resolves.toBe('ok');
  });

  it('uses defaultTimeout when ms is not provided', async () => {
    setDefaultTimeout(50);
    const p = new Promise((resolve) => setTimeout(resolve, 200));
    await expect(withTimeout(p)).rejects.toMatchObject({ code: 'SCAFFOLD_TIMEOUT' });
  });

  it('throws synchronously for invalid ms argument', () => {
    expect(() => withTimeout(Promise.resolve(), -10)).toThrow('non-negative');
  });
});
