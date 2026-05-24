const { searchTemplates, filterByTags, scoreTemplate } = require('../scaffoldTemplateSearch');
const templateRegistry = require('../../templates/templateRegistry');
const tagManager = require('../scaffoldTagManager');

jest.mock('../../templates/templateRegistry');
jest.mock('../scaffoldTagManager');

describe('scoreTemplate', () => {
  it('returns 0 for no match', () => {
    expect(scoreTemplate('express-api', {}, [], 'react')).toBe(0);
  });

  it('gives highest score for exact name match', () => {
    const exact = scoreTemplate('express-api', {}, [], 'express-api');
    const partial = scoreTemplate('express-api', {}, [], 'express');
    expect(exact).toBeGreaterThan(partial);
  });

  it('scores tag match', () => {
    expect(scoreTemplate('my-tpl', {}, ['node', 'api'], 'api')).toBeGreaterThan(0);
  });

  it('returns 1 for empty query (all match)', () => {
    expect(scoreTemplate('anything', {}, [], '')).toBe(1);
  });
});

describe('searchTemplates', () => {
  beforeEach(() => {
    templateRegistry.listTemplates.mockReturnValue(['express-api', 'fastify-app', 'react-spa', 'node-cli']);
    tagManager.getTags.mockImplementation((name) => {
      const map = {
        'express-api': ['node', 'api', 'express'],
        'fastify-app': ['node', 'api', 'fastify'],
        'react-spa': ['frontend', 'react'],
        'node-cli': ['node', 'cli'],
      };
      return map[name] || [];
    });
  });

  it('returns matching templates sorted by score', () => {
    const results = searchTemplates('node');
    expect(results.length).toBeGreaterThan(0);
    results.forEach((r) => expect(r.score).toBeGreaterThan(0));
  });

  it('returns empty array when no templates match', () => {
    const results = searchTemplates('python');
    expect(results).toEqual([]);
  });

  it('respects the limit option', () => {
    const results = searchTemplates('node', { limit: 2 });
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('returns all templates for empty query', () => {
    const results = searchTemplates('');
    expect(results.length).toBe(4);
  });
});

describe('filterByTags', () => {
  beforeEach(() => {
    templateRegistry.listTemplates.mockReturnValue(['express-api', 'react-spa', 'node-cli']);
    tagManager.getTags.mockImplementation((name) => {
      const map = {
        'express-api': ['node', 'api'],
        'react-spa': ['frontend', 'react'],
        'node-cli': ['node', 'cli'],
      };
      return map[name] || [];
    });
  });

  it('returns templates matching any of the provided tags', () => {
    const results = filterByTags(['node']);
    expect(results).toContain('express-api');
    expect(results).toContain('node-cli');
    expect(results).not.toContain('react-spa');
  });

  it('returns empty array for empty tag list', () => {
    expect(filterByTags([])).toEqual([]);
  });

  it('returns empty array for non-matching tags', () => {
    expect(filterByTags(['python'])).toEqual([]);
  });
});
