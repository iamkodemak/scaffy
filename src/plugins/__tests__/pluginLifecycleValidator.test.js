const { validatePlugin, KNOWN_LIFECYCLES } = require('../pluginLifecycleValidator');

describe('validatePlugin', () => {
  it('returns valid for a minimal correct plugin', () => {
    const result = validatePlugin({ name: 'my-plugin' });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns valid for a plugin with all known lifecycle hooks', () => {
    const plugin = {
      name: 'full-plugin',
      onBeforeScaffold: async () => {},
      onAfterScaffold: async () => {},
      onScaffoldError: async () => {},
    };
    const result = validatePlugin(plugin);
    expect(result.valid).toBe(true);
  });

  it('returns invalid when name is missing', () => {
    const result = validatePlugin({ onBeforeScaffold: () => {} });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('name'))).toBe(true);
  });

  it('returns invalid when a lifecycle field is not a function', () => {
    const result = validatePlugin({ name: 'bad', onAfterScaffold: 'not-a-fn' });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('onAfterScaffold'))).toBe(true);
  });

  it('returns invalid when unrecognised fields are present', () => {
    const result = validatePlugin({ name: 'p', unknownField: true });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('unknownField'))).toBe(true);
  });

  it('returns invalid for null input', () => {
    const result = validatePlugin(null);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/non-null object/);
  });

  it('exports KNOWN_LIFECYCLES as a non-empty array', () => {
    expect(Array.isArray(KNOWN_LIFECYCLES)).toBe(true);
    expect(KNOWN_LIFECYCLES.length).toBeGreaterThan(0);
  });
});
