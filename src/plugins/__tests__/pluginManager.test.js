const {
  registerPlugin,
  unregisterPlugin,
  runHook,
  listPlugins,
  clearPlugins,
  VALID_HOOKS,
} = require('../pluginManager');

beforeEach(() => {
  clearPlugins();
});

describe('registerPlugin', () => {
  test('registers a valid plugin', () => {
    registerPlugin('test-plugin', { beforeScaffold: (ctx) => ctx });
    expect(listPlugins()).toContain('test-plugin');
  });

  test('throws if name is not a string', () => {
    expect(() => registerPlugin(42, {})).toThrow('Plugin name must be a non-empty string');
  });

  test('throws if plugin is not an object', () => {
    expect(() => registerPlugin('bad', null)).toThrow('Plugin must be an object');
  });

  test('throws on invalid hook name', () => {
    expect(() => registerPlugin('bad', { onFoo: () => {} })).toThrow('Invalid hook');
  });

  test('throws if hook value is not a function', () => {
    expect(() => registerPlugin('bad', { beforeScaffold: 'not-a-fn' })).toThrow('must be a function');
  });

  test('throws on duplicate registration', () => {
    registerPlugin('dup', { afterScaffold: (ctx) => ctx });
    expect(() => registerPlugin('dup', { afterScaffold: (ctx) => ctx })).toThrow('already registered');
  });
});

describe('runHook', () => {
  test('runs hook and returns context', async () => {
    registerPlugin('adder', {
      beforeRender: (ctx) => ({ ...ctx, variables: { ...ctx.variables, added: true } }),
    });
    const result = await runHook('beforeRender', { variables: {} });
    expect(result.variables.added).toBe(true);
  });

  test('passes context through multiple plugins', async () => {
    registerPlugin('p1', { afterRender: (ctx) => ({ ...ctx, p1: true }) });
    registerPlugin('p2', { afterRender: (ctx) => ({ ...ctx, p2: true }) });
    const result = await runHook('afterRender', {});
    expect(result.p1).toBe(true);
    expect(result.p2).toBe(true);
  });

  test('throws on unknown hook', async () => {
    await expect(runHook('unknownHook', {})).rejects.toThrow('Unknown hook');
  });
});

describe('unregisterPlugin', () => {
  test('removes a registered plugin', () => {
    registerPlugin('removable', { beforeScaffold: (ctx) => ctx });
    unregisterPlugin('removable');
    expect(listPlugins()).not.toContain('removable');
  });

  test('throws if plugin not registered', () => {
    expect(() => unregisterPlugin('ghost')).toThrow('not registered');
  });
});

describe('VALID_HOOKS', () => {
  test('contains expected hooks', () => {
    expect(VALID_HOOKS).toEqual(expect.arrayContaining(['beforeScaffold', 'afterScaffold', 'beforeRender', 'afterRender']));
  });
});
