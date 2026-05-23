import { retrieve, store, invalidate, clearAll, stats } from './scaffoldCacheManager.js';
import { set, get, remove, clear, size } from './scaffoldCache.js';
import { isEnabled, getTTL } from './scaffoldCachePolicy.js';

jest.mock('./scaffoldCache.js');
jest.mock('./scaffoldCachePolicy.js');

describe('scaffoldCacheManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isEnabled.mockReturnValue(true);
    getTTL.mockReturnValue(300);
  });

  describe('retrieve', () => {
    it('returns null when cache is disabled', () => {
      isEnabled.mockReturnValue(false);
      expect(retrieve({ template: 'express' })).toBeNull();
      expect(get).not.toHaveBeenCalled();
    });

    it('returns cached value when found', () => {
      get.mockReturnValue({ files: ['index.js'] });
      const result = retrieve({ template: 'express' });
      expect(result).toEqual({ files: ['index.js'] });
      expect(get).toHaveBeenCalledTimes(1);
    });

    it('returns null when cache miss', () => {
      get.mockReturnValue(null);
      expect(retrieve({ template: 'express' })).toBeNull();
    });
  });

  describe('store', () => {
    it('does nothing when cache is disabled', () => {
      isEnabled.mockReturnValue(false);
      store({ template: 'express' }, { files: [] });
      expect(set).not.toHaveBeenCalled();
    });

    it('stores value with TTL when enabled', () => {
      store({ template: 'express' }, { files: ['index.js'] });
      expect(set).toHaveBeenCalledWith(
        expect.any(String),
        { files: ['index.js'] },
        300
      );
    });
  });

  describe('invalidate', () => {
    it('calls remove with hashed key', () => {
      invalidate({ template: 'express' });
      expect(remove).toHaveBeenCalledWith(expect.any(String));
    });
  });

  describe('clearAll', () => {
    it('delegates to cache clear', () => {
      clearAll();
      expect(clear).toHaveBeenCalled();
    });
  });

  describe('stats', () => {
    it('returns size and enabled status', () => {
      size.mockReturnValue(5);
      const result = stats();
      expect(result).toEqual({ size: 5, enabled: true, ttl: 300 });
    });
  });
});
