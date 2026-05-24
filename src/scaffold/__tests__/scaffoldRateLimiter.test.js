const {
  setMaxRuns,
  setWindowMs,
  getMaxRuns,
  getWindowMs,
  reset,
  tryAcquire,
  currentCount,
} = require('../scaffoldRateLimiter');

beforeEach(() => {
  reset();
});

describe('configuration', () => {
  test('getMaxRuns returns default 5', () => {
    expect(getMaxRuns()).toBe(5);
  });

  test('getWindowMs returns default 60000', () => {
    expect(getWindowMs()).toBe(60_000);
  });

  test('setMaxRuns updates value', () => {
    setMaxRuns(3);
    expect(getMaxRuns()).toBe(3);
  });

  test('setWindowMs updates value', () => {
    setWindowMs(5000);
    expect(getWindowMs()).toBe(5000);
  });

  test('setMaxRuns throws on invalid value', () => {
    expect(() => setMaxRuns(0)).toThrow('maxRuns must be a positive number');
    expect(() => setMaxRuns('x')).toThrow('maxRuns must be a positive number');
  });

  test('setWindowMs throws on invalid value', () => {
    expect(() => setWindowMs(-1)).toThrow('windowMs must be a positive number');
    expect(() => setWindowMs(0)).toThrow('windowMs must be a positive number');
  });
});

describe('tryAcquire', () => {
  test('allows runs up to maxRuns within window', () => {
    setMaxRuns(3);
    const now = Date.now();
    expect(tryAcquire(now)).toBe(true);
    expect(tryAcquire(now + 100)).toBe(true);
    expect(tryAcquire(now + 200)).toBe(true);
    expect(tryAcquire(now + 300)).toBe(false);
  });

  test('allows runs again after window expires', () => {
    setMaxRuns(2);
    setWindowMs(1000);
    const now = Date.now();
    expect(tryAcquire(now)).toBe(true);
    expect(tryAcquire(now + 100)).toBe(true);
    expect(tryAcquire(now + 200)).toBe(false);
    // advance past window
    expect(tryAcquire(now + 1101)).toBe(true);
  });

  test('returns true for first run with defaults', () => {
    expect(tryAcquire()).toBe(true);
  });
});

describe('currentCount', () => {
  test('returns 0 initially', () => {
    expect(currentCount()).toBe(0);
  });

  test('reflects acquired runs within window', () => {
    const now = Date.now();
    tryAcquire(now);
    tryAcquire(now + 50);
    expect(currentCount(now + 100)).toBe(2);
  });

  test('excludes runs outside window', () => {
    setWindowMs(500);
    const now = Date.now();
    tryAcquire(now);
    tryAcquire(now + 100);
    expect(currentCount(now + 600)).toBe(0);
  });
});

describe('reset', () => {
  test('clears timestamps and restores defaults', () => {
    setMaxRuns(2);
    setWindowMs(2000);
    tryAcquire();
    reset();
    expect(getMaxRuns()).toBe(5);
    expect(getWindowMs()).toBe(60_000);
    expect(currentCount()).toBe(0);
  });
});
