const {
  registerAlias,
  removeAlias,
  resolveAlias,
  hasAlias,
  listAliases,
  clearAliases,
} = require('../scaffoldTemplateAlias');

beforeEach(() => {
  clearAliases();
});

describe('registerAlias', () => {
  it('registers a valid alias', () => {
    registerAlias('node', 'node-express-starter');
    expect(hasAlias('node')).toBe(true);
  });

  it('throws when alias is empty', () => {
    expect(() => registerAlias('', 'some-template')).toThrow('Alias must be a non-empty string');
  });

  it('throws when templateName is empty', () => {
    expect(() => registerAlias('node', '')).toThrow('templateName must be a non-empty string');
  });

  it('throws when alias is not a string', () => {
    expect(() => registerAlias(42, 'some-template')).toThrow('Alias must be a non-empty string');
  });

  it('overwrites an existing alias', () => {
    registerAlias('node', 'old-template');
    registerAlias('node', 'new-template');
    expect(resolveAlias('node')).toBe('new-template');
  });
});

describe('resolveAlias', () => {
  it('returns the mapped template name', () => {
    registerAlias('ts', 'typescript-starter');
    expect(resolveAlias('ts')).toBe('typescript-starter');
  });

  it('returns the input unchanged when no alias is registered', () => {
    expect(resolveAlias('unknown-alias')).toBe('unknown-alias');
  });
});

describe('removeAlias', () => {
  it('removes a registered alias and returns true', () => {
    registerAlias('api', 'rest-api-template');
    expect(removeAlias('api')).toBe(true);
    expect(hasAlias('api')).toBe(false);
  });

  it('returns false when alias does not exist', () => {
    expect(removeAlias('nonexistent')).toBe(false);
  });
});

describe('listAliases', () => {
  it('returns an empty object when no aliases are registered', () => {
    expect(listAliases()).toEqual({});
  });

  it('returns all registered aliases', () => {
    registerAlias('node', 'node-starter');
    registerAlias('ts', 'typescript-starter');
    expect(listAliases()).toEqual({
      node: 'node-starter',
      ts: 'typescript-starter',
    });
  });
});

describe('clearAliases', () => {
  it('removes all aliases', () => {
    registerAlias('a', 'template-a');
    registerAlias('b', 'template-b');
    clearAliases();
    expect(listAliases()).toEqual({});
  });
});
