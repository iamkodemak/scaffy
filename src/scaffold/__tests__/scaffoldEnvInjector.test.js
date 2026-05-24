const { attachEnvInjector, resetAttached } = require('../scaffoldEnvInjector');
const { registerProfile, resetEnvManager } = require('../scaffoldEnvManager');

beforeEach(() => {
  resetAttached();
  resetEnvManager();
});

function makeMockHooks() {
  const registered = {};
  return {
    registerHook: (event, fn) => { registered[event] = fn; },
    trigger: (event, ctx) => registered[event] && registered[event](ctx),
  };
}

describe('attachEnvInjector', () => {
  it('registers a beforeScaffold hook', () => {
    const hooks = makeMockHooks();
    attachEnvInjector(hooks);
    expect(typeof hooks.trigger).toBe('function');
  });

  it('injects env vars into context.variables', () => {
    registerProfile('default', { framework: 'express' });
    const hooks = makeMockHooks();
    attachEnvInjector(hooks);
    const ctx = { variables: { appName: 'myapp' } };
    hooks.trigger('beforeScaffold', ctx);
    expect(ctx.variables.framework).toBe('express');
    expect(ctx.variables.appName).toBe('myapp');
  });

  it('does not overwrite existing context variables with profile vars', () => {
    registerProfile('default', { port: '3000' });
    const hooks = makeMockHooks();
    attachEnvInjector(hooks);
    const ctx = { variables: { port: '8080' } };
    hooks.trigger('beforeScaffold', ctx);
    expect(ctx.variables.port).toBe('8080');
  });

  it('applies explicit overrides', () => {
    const hooks = makeMockHooks();
    attachEnvInjector(hooks, { overrides: { debug: 'true' } });
    const ctx = { variables: {} };
    hooks.trigger('beforeScaffold', ctx);
    expect(ctx.variables.debug).toBe('true');
  });

  it('only attaches once even if called multiple times', () => {
    const hooks = makeMockHooks();
    let callCount = 0;
    const origRegister = hooks.registerHook;
    hooks.registerHook = (e, fn) => { callCount++; origRegister(e, fn); };
    attachEnvInjector(hooks);
    attachEnvInjector(hooks);
    expect(callCount).toBe(1);
  });
});
