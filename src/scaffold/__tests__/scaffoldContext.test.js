const { createScaffoldContext, patchScaffoldContext } = require('../scaffoldContext');

describe('createScaffoldContext', () => {
  it('creates a context with defaults', () => {
    const ctx = createScaffoldContext({ template: 'express-api' });
    expect(ctx.template).toBe('express-api');
    expect(ctx.dryRun).toBe(false);
    expect(ctx.overwrite).toBe(false);
    expect(ctx.variables).toEqual({});
    expect(ctx.plugins).toEqual([]);
    expect(ctx.meta).toHaveProperty('createdAt');
    expect(ctx.meta).toHaveProperty('scaffyVersion');
  });

  it('applies provided variables', () => {
    const ctx = createScaffoldContext({ template: 'base' }, { projectName: 'myapp' });
    expect(ctx.variables.projectName).toBe('myapp');
  });

  it('sets dryRun and overwrite flags', () => {
    const ctx = createScaffoldContext({ template: 'base', dryRun: true, overwrite: true });
    expect(ctx.dryRun).toBe(true);
    expect(ctx.overwrite).toBe(true);
  });

  it('throws if options is not an object', () => {
    expect(() => createScaffoldContext(null)).toThrow('options must be a non-null object');
    expect(() => createScaffoldContext('string')).toThrow();
  });
});

describe('patchScaffoldContext', () => {
  let baseCtx;
  beforeEach(() => {
    baseCtx = createScaffoldContext({ template: 'base' }, { name: 'original' });
  });

  it('merges top-level fields', () => {
    const patched = patchScaffoldContext(baseCtx, { dryRun: true });
    expect(patched.dryRun).toBe(true);
    expect(patched.template).toBe('base');
  });

  it('merges variables without losing existing ones', () => {
    const patched = patchScaffoldContext(baseCtx, { variables: { author: 'Alice' } });
    expect(patched.variables.name).toBe('original');
    expect(patched.variables.author).toBe('Alice');
  });

  it('does not mutate the original context', () => {
    patchScaffoldContext(baseCtx, { dryRun: true, variables: { extra: 'val' } });
    expect(baseCtx.dryRun).toBe(false);
    expect(baseCtx.variables.extra).toBeUndefined();
  });

  it('throws if context is null', () => {
    expect(() => patchScaffoldContext(null, {})).toThrow('context must be a non-null object');
  });
});
