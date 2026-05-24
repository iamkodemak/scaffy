const {
  registerTags,
  getTags,
  findByTags,
  listAllTags,
  removeTags,
  clearTags,
} = require('../scaffoldTagManager');

beforeEach(() => {
  clearTags();
});

describe('registerTags', () => {
  it('registers tags for a template', () => {
    registerTags('express-api', ['node', 'express', 'rest']);
    expect(getTags('express-api')).toEqual(['node', 'express', 'rest']);
  });

  it('normalizes tags to lowercase and trims whitespace', () => {
    registerTags('my-template', ['  Node ', 'EXPRESS']);
    expect(getTags('my-template')).toEqual(['node', 'express']);
  });

  it('throws if templateName is not a string', () => {
    expect(() => registerTags(null, ['tag'])).toThrow('templateName must be a non-empty string');
  });

  it('throws if tags is not an array', () => {
    expect(() => registerTags('tmpl', 'tag')).toThrow('tags must be an array');
  });

  it('overwrites existing tags on re-register', () => {
    registerTags('tmpl', ['a', 'b']);
    registerTags('tmpl', ['c']);
    expect(getTags('tmpl')).toEqual(['c']);
  });
});

describe('getTags', () => {
  it('returns empty array for unknown template', () => {
    expect(getTags('unknown')).toEqual([]);
  });
});

describe('findByTags', () => {
  beforeEach(() => {
    registerTags('express-api', ['node', 'express', 'rest']);
    registerTags('fastify-api', ['node', 'fastify', 'rest']);
    registerTags('react-app', ['frontend', 'react']);
  });

  it('finds templates matching all given tags', () => {
    expect(findByTags(['node', 'rest'])).toEqual(expect.arrayContaining(['express-api', 'fastify-api']));
  });

  it('returns only exact matches for all tags', () => {
    expect(findByTags(['node', 'express'])).toEqual(['express-api']);
  });

  it('returns empty array when no match', () => {
    expect(findByTags(['python'])).toEqual([]);
  });

  it('returns empty array for empty tags input', () => {
    expect(findByTags([])).toEqual([]);
  });
});

describe('listAllTags', () => {
  it('lists all unique tags sorted', () => {
    registerTags('a', ['node', 'rest']);
    registerTags('b', ['node', 'graphql']);
    expect(listAllTags()).toEqual(['graphql', 'node', 'rest']);
  });

  it('returns empty array when no tags registered', () => {
    expect(listAllTags()).toEqual([]);
  });
});

describe('removeTags', () => {
  it('removes tags for a specific template', () => {
    registerTags('tmpl', ['a', 'b']);
    removeTags('tmpl');
    expect(getTags('tmpl')).toEqual([]);
  });

  it('does not throw for unknown template', () => {
    expect(() => removeTags('nonexistent')).not.toThrow();
  });
});
