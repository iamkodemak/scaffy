const {
  mergeVariables,
  validateRequiredVars,
  resolveVariables,
  BUILT_IN_VARS,
} = require('../variableResolver');

describe('BUILT_IN_VARS', () => {
  it('provides year, date, and timestamp', () => {
    expect(Object.keys(BUILT_IN_VARS)).toEqual(expect.arrayContaining(['year', 'date', 'timestamp']));
    expect(BUILT_IN_VARS.year()).toMatch(/^\d{4}$/);
    expect(BUILT_IN_VARS.date()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number(BUILT_IN_VARS.timestamp())).toBeGreaterThan(0);
  });
});

describe('mergeVariables', () => {
  it('merges in correct priority order', () => {
    const result = mergeVariables(
      { name: 'default', foo: 'bar' },
      { name: 'config' },
      { name: 'cli' }
    );
    expect(result.name).toBe('cli');
    expect(result.foo).toBe('bar');
  });

  it('includes built-in variables', () => {
    const result = mergeVariables();
    expect(result).toHaveProperty('year');
    expect(result).toHaveProperty('date');
  });
});

describe('validateRequiredVars', () => {
  it('returns valid when all required vars are present', () => {
    const { valid, missing } = validateRequiredVars(['name', 'version'], { name: 'app', version: '1.0' });
    expect(valid).toBe(true);
    expect(missing).toHaveLength(0);
  });

  it('returns missing vars when absent', () => {
    const { valid, missing } = validateRequiredVars(['name', 'author'], { name: 'app' });
    expect(valid).toBe(false);
    expect(missing).toContain('author');
  });
});

describe('resolveVariables', () => {
  it('resolves variables from all sources', () => {
    const result = resolveVariables({
      defaults: { version: '1.0.0' },
      configVars: { author: 'Alice' },
      cliVars: { name: 'my-app' },
      required: ['name', 'author'],
    });
    expect(result.name).toBe('my-app');
    expect(result.author).toBe('Alice');
    expect(result.version).toBe('1.0.0');
  });

  it('throws when required vars are missing', () => {
    expect(() =>
      resolveVariables({ required: ['name'], cliVars: {} })
    ).toThrow(/Missing required variables: name/);
  });
});
