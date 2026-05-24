const { registerPlugin, clearPlugins } = require('../../plugins/pluginManager');
const { clearHooks, listHooks } = require('../../hooks/hookManager');
const {
  attachPluginHooks,
  invokePluginLifecycle,
  resetAttached,
} = require('../scaffoldPluginHooks');

beforeEach(() => {
  clearPlugins();
  clearHooks();
  resetAttached();
});

describe('attachPluginHooks', () => {
  it('registers beforeScaffold, afterScaffold, and onError hooks', () => {
    attachPluginHooks();
    const hooks = listHooks();
    expect(hooks).toContain('beforeScaffold');
    expect(hooks).toContain('afterScaffold');
    expect(hooks).toContain('onError');
  });

  it('is idempotent — calling twice does not duplicate hooks', () => {
    attachPluginHooks();
    attachPluginHooks();
    const hooks = listHooks();
    // Each event name should appear exactly once
    const counts = hooks.reduce((acc, h) => { acc[h] = (acc[h] || 0) + 1; return acc; }, {});
    expect(counts['beforeScaffold']).toBe(1);
    expect(counts['afterScaffold']).toBe(1);
  });
});

describe('invokePluginLifecycle', () => {
  it('calls the named lifecycle method on each plugin', async () => {
    const onBeforeScaffold = jest.fn();
    registerPlugin({ name: 'p1', onBeforeScaffold });
    const ctx = { template: 'express' };
    await invokePluginLifecycle('onBeforeScaffold', ctx);
    expect(onBeforeScaffold).toHaveBeenCalledWith(ctx);
  });

  it('skips plugins that do not define the lifecycle method', async () => {
    registerPlugin({ name: 'p2' }); // no onAfterScaffold
    await expect(invokePluginLifecycle('onAfterScaffold', {})).resolves.toBeUndefined();
  });

  it('calls lifecycle on multiple plugins in registration order', async () => {
    const order = [];
    registerPlugin({ name: 'a', onBeforeScaffold: async () => order.push('a') });
    registerPlugin({ name: 'b', onBeforeScaffold: async () => order.push('b') });
    await invokePluginLifecycle('onBeforeScaffold', {});
    expect(order).toEqual(['a', 'b']);
  });

  it('propagates errors thrown by a plugin lifecycle method', async () => {
    registerPlugin({
      name: 'bad',
      onBeforeScaffold: async () => { throw new Error('plugin boom'); },
    });
    await expect(invokePluginLifecycle('onBeforeScaffold', {})).rejects.toThrow('plugin boom');
  });
});
