const policy = require('../scaffoldCachePolicy');

beforeEach(() => {
  policy.setEnabled(true);
  policy.resetTTL();
});

describe('scaffoldCachePolicy', () => {
  describe('isCacheable', () => {
    test('returns true for standard options', () => {
      expect(policy.isCacheable({ template: 'express', name: 'app' })).toBe(true);
    });

    test('returns false when cache is disabled', () => {
      policy.setEnabled(false);
      expect(policy.isCacheable({ template: 'express' })).toBe(false);
    });

    test('returns false for dryRun options', () => {
      expect(policy.isCacheable({ template: 'express', dryRun: true })).toBe(false);
    });

    test('returns false for interactive options', () => {
      expect(policy.isCacheable({ template: 'express', interactive: true })).toBe(false);
    });

    test('returns false when noCache flag is set', () => {
      expect(policy.isCacheable({ template: 'express', noCache: true })).toBe(false);
    });
  });

  describe('isEntryValid', () => {
    test('returns true for fresh entry', () => {
      expect(policy.isEntryValid(Date.now() - 1000)).toBe(true);
    });

    test('returns false for expired entry', () => {
      policy.setTTL(500);
      expect(policy.isEntryValid(Date.now() - 1000)).toBe(false);
    });

    test('TTL of 0 means entries never expire', () => {
      policy.setTTL(0);
      expect(policy.isEntryValid(Date.now() - 9999999)).toBe(true);
    });
  });

  describe('setTTL', () => {
    test('updates TTL value', () => {
      policy.setTTL(10000);
      expect(policy.getTTL()).toBe(10000);
    });

    test('throws on negative TTL', () => {
      expect(() => policy.setTTL(-1)).toThrow();
    });

    test('throws on non-number TTL', () => {
      expect(() => policy.setTTL('5m')).toThrow();
    });

    test('resetTTL restores default', () => {
      policy.setTTL(1000);
      policy.resetTTL();
      expect(policy.getTTL()).toBe(5 * 60 * 1000);
    });
  });
});
