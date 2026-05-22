const { registerHook, runHook, clearHooks, listHooks } = require('../hookManager');

beforeEach(() => {
  clearHooks();
});

describe('registerHook', () => {
  it('registers a callback for a hook name', () => {
    registerHook('before:scaffold', async () => {});
    expect(listHooks()).toContain('before:scaffold');
  });

  it('throws when hookName is not a string', () => {
    expect(() => registerHook(42, () => {})).toThrow('hookName must be a non-empty string');
  });

  it('throws when callback is not a function', () => {
    expect(() => registerHook('before:scaffold', 'nope')).toThrow('callback must be a function');
  });

  it('allows multiple callbacks on the same hook', () => {
    registerHook('after:render', async () => {});
    registerHook('after:render', async () => {});
    // Both registered — listHooks still shows one unique name
    expect(listHooks().filter((h) => h === 'after:render')).toHaveLength(1);
  });
});

describe('runHook', () => {
  it('calls all registered callbacks in order', async () => {
    const order = [];
    registerHook('test:hook', async () => order.push(1));
    registerHook('test:hook', async () => order.push(2));
    await runHook('test:hook', {});
    expect(order).toEqual([1, 2]);
  });

  it('passes context to each callback', async () => {
    registerHook('test:ctx', async (ctx) => { ctx.touched = true; });
    const ctx = {};
    await runHook('test:ctx', ctx);
    expect(ctx.touched).toBe(true);
  });

  it('returns the mutated context', async () => {
    registerHook('test:ret', async (ctx) => { ctx.value = 42; });
    const result = await runHook('test:ret', {});
    expect(result.value).toBe(42);
  });

  it('resolves with empty context when no callbacks registered', async () => {
    const result = await runHook('nonexistent:hook', { x: 1 });
    expect(result).toEqual({ x: 1 });
  });

  it('propagates errors thrown inside callbacks', async () => {
    registerHook('error:hook', async () => { throw new Error('hook failed'); });
    await expect(runHook('error:hook', {})).rejects.toThrow('hook failed');
  });
});

describe('clearHooks', () => {
  it('removes callbacks for a specific hook', () => {
    registerHook('a', async () => {});
    registerHook('b', async () => {});
    clearHooks('a');
    expect(listHooks()).not.toContain('a');
    expect(listHooks()).toContain('b');
  });

  it('clears all hooks when called with no argument', () => {
    registerHook('a', async () => {});
    registerHook('b', async () => {});
    clearHooks();
    expect(listHooks()).toHaveLength(0);
  });
});
