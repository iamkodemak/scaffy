const {
  withRetry,
  setDefaultMaxAttempts,
  setDefaultDelay,
  setDefaultBackoffFactor,
  resetDefaults,
} = require('../scaffoldRetry');

beforeEach(() => {
  resetDefaults();
});

describe('withRetry', () => {
  it('resolves immediately if fn succeeds on first attempt', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const result = await withRetry(fn, { delayMs: 0 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and resolves when fn eventually succeeds', async () => {
    let calls = 0;
    const fn = jest.fn().mockImplementation(async () => {
      calls++;
      if (calls < 3) throw new Error('transient');
      return 'done';
    });
    const result = await withRetry(fn, { maxAttempts: 3, delayMs: 0 });
    expect(result).toBe('done');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws after exhausting all attempts', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('always fails'));
    await expect(
      withRetry(fn, { maxAttempts: 3, delayMs: 0 })
    ).rejects.toThrow('Operation failed after 3 attempt(s)');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('attaches cause to the thrown error', async () => {
    const original = new Error('root cause');
    const fn = jest.fn().mockRejectedValue(original);
    let caught;
    try {
      await withRetry(fn, { maxAttempts: 2, delayMs: 0 });
    } catch (err) {
      caught = err;
    }
    expect(caught.cause).toBe(original);
  });

  it('stops retrying when shouldRetry returns false', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('fatal'));
    await expect(
      withRetry(fn, { maxAttempts: 5, delayMs: 0, shouldRetry: () => false })
    ).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('passes attempt number to fn', async () => {
    const attempts = [];
    const fn = jest.fn().mockImplementation(async (attempt) => {
      attempts.push(attempt);
      if (attempt < 2) throw new Error('retry');
      return 'final';
    });
    await withRetry(fn, { maxAttempts: 3, delayMs: 0 });
    expect(attempts).toEqual([1, 2]);
  });

  it('respects custom defaults set via setters', async () => {
    setDefaultMaxAttempts(2);
    setDefaultDelay(0);
    setDefaultBackoffFactor(1);
    const fn = jest.fn().mockRejectedValue(new Error('fail'));
    await expect(withRetry(fn)).rejects.toThrow('after 2 attempt(s)');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
