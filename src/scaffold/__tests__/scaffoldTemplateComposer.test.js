const {
  registerComposition,
  removeComposition,
  hasComposition,
  listCompositions,
  resolveComposition,
  composeTemplates,
  clearCompositions,
} = require('../scaffoldTemplateComposer');

const templateRegistry = require('../../templates/templateRegistry');
const templateAlias = require('../scaffoldTemplateAlias');

jest.mock('../../templates/templateRegistry');
jest.mock('../scaffoldTemplateAlias');

describe('scaffoldTemplateComposer', () => {
  beforeEach(() => {
    clearCompositions();
    jest.clearAllMocks();
    // Default: resolveAlias returns the name unchanged
    templateAlias.resolveAlias.mockImplementation((n) => n);
  });

  describe('registerComposition', () => {
    it('registers a valid composition', () => {
      registerComposition('full-app', ['base', 'express', 'eslint']);
      expect(hasComposition('full-app')).toBe(true);
    });

    it('throws on empty name', () => {
      expect(() => registerComposition('', ['base'])).toThrow('non-empty string');
    });

    it('throws on empty templateNames array', () => {
      expect(() => registerComposition('comp', [])).toThrow('non-empty array');
    });

    it('throws when templateNames is not an array', () => {
      expect(() => registerComposition('comp', 'base')).toThrow('non-empty array');
    });
  });

  describe('removeComposition', () => {
    it('removes an existing composition', () => {
      registerComposition('to-remove', ['base']);
      removeComposition('to-remove');
      expect(hasComposition('to-remove')).toBe(false);
    });

    it('does not throw when removing non-existent composition', () => {
      expect(() => removeComposition('ghost')).not.toThrow();
    });
  });

  describe('listCompositions', () => {
    it('returns all registered composition names', () => {
      registerComposition('alpha', ['base']);
      registerComposition('beta', ['express']);
      expect(listCompositions()).toEqual(expect.arrayContaining(['alpha', 'beta']));
    });
  });

  describe('resolveComposition', () => {
    it('resolves templates for a composition', () => {
      registerComposition('app', ['base', 'express']);
      templateRegistry.getTemplate
        .mockReturnValueOnce({ files: { 'index.js': '' } })
        .mockReturnValueOnce({ files: { 'server.js': '' } });

      const result = resolveComposition('app');
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('base');
      expect(result[1].name).toBe('express');
    });

    it('throws when composition is not registered', () => {
      expect(() => resolveComposition('missing')).toThrow('not registered');
    });

    it('throws when a template is not found', () => {
      registerComposition('bad', ['nonexistent']);
      templateRegistry.getTemplate.mockReturnValue(null);
      expect(() => resolveComposition('bad')).toThrow('not found');
    });

    it('resolves aliases before template lookup', () => {
      registerComposition('aliased', ['exp']);
      templateAlias.resolveAlias.mockReturnValue('express');
      templateRegistry.getTemplate.mockReturnValue({ files: {} });
      const result = resolveComposition('aliased');
      expect(templateAlias.resolveAlias).toHaveBeenCalledWith('exp');
      expect(result[0].name).toBe('express');
    });
  });

  describe('composeTemplates', () => {
    it('merges files and variables from all templates', () => {
      registerComposition('merged', ['a', 'b']);
      templateRegistry.getTemplate
        .mockReturnValueOnce({ files: { 'a.js': 'aaa' }, variables: { FOO: '1' } })
        .mockReturnValueOnce({ files: { 'b.js': 'bbb' }, variables: { BAR: '2' } });

      const { files, variables } = composeTemplates('merged');
      expect(files).toEqual({ 'a.js': 'aaa', 'b.js': 'bbb' });
      expect(variables).toEqual({ FOO: '1', BAR: '2' });
    });

    it('later templates override earlier ones on file collision', () => {
      registerComposition('override', ['first', 'second']);
      templateRegistry.getTemplate
        .mockReturnValueOnce({ files: { 'index.js': 'v1' } })
        .mockReturnValueOnce({ files: { 'index.js': 'v2' } });

      const { files } = composeTemplates('override');
      expect(files['index.js']).toBe('v2');
    });
  });
});
