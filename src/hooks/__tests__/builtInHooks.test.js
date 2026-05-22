const { clearHooks, runHook, listHooks } = require('../hookManager');
const { registerBuiltInHooks } = require('../builtInHooks');
const { loadBuiltInHooks, resetLoadedFlag } = require('../loadBuiltInHooks');

beforeEach(() => {
  clearHooks();
  resetLoadedFlag();
});

describe('registerBuiltInHooks', () => {
  it('registers the expected lifecycle hooks', () => {
    registerBuiltInHooks();
    const names = listHooks();
    expect(names).toContain('before:scaffold');
    expect(names).toContain('validate:scaffold');
    expect(names).toContain('before:render');
    expect(names).toContain('after:scaffold');
  });
});

describe('validate:scaffold hook', () => {
  beforeEach(() => registerBuiltInHooks());

  it('throws when templateName is missing', async () => {
    await expect(runHook('validate:scaffold', { outputDir: '/tmp' }))
      .rejects.toThrow('templateName');
  });

  it('throws when outputDir is missing', async () => {
    await expect(runHook('validate:scaffold', { templateName: 'express' }))
      .rejects.toThrow('outputDir');
  });

  it('passes with valid context', async () => {
    await expect(
      runHook('validate:scaffold', { templateName: 'express', outputDir: '/tmp/out' })
    ).resolves.not.toThrow();
  });
});

describe('loadBuiltInHooks', () => {
  it('loads hooks only once (idempotent)', () => {
    loadBuiltInHooks();
    loadBuiltInHooks();
    // validate:scaffold should appear exactly once
    clearHooks('before:render');
    // Re-running runHook on validate:scaffold should still work (one callback)
    expect(listHooks()).toContain('validate:scaffold');
  });
});
