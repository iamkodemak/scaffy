const { registerTemplate, getTemplate, listTemplates } = require('../templateRegistry');

const SAMPLE_TEMPLATE = {
  description: 'A simple Node.js app',
  files: [
    { path: 'index.js', content: 'console.log("hello");' },
    { path: 'package.json', content: '{"name": "{{name}}"}' },
  ],
};

beforeEach(() => {
  // Reset registry between tests by re-requiring (clear module cache)
  jest.resetModules();
});

describe('registerTemplate', () => {
  test('registers a valid template', () => {
    registerTemplate('node-basic', SAMPLE_TEMPLATE);
    const tpl = getTemplate('node-basic');
    expect(tpl).not.toBeNull();
    expect(tpl.name).toBe('node-basic');
    expect(tpl.description).toBe('A simple Node.js app');
  });

  test('throws on missing name', () => {
    expect(() => registerTemplate('', SAMPLE_TEMPLATE)).toThrow();
  });

  test('throws on missing config fields', () => {
    expect(() => registerTemplate('bad', { description: 'only desc' })).toThrow();
  });

  test('overwrites existing template with same name', () => {
    registerTemplate('dupe', SAMPLE_TEMPLATE);
    registerTemplate('dupe', { ...SAMPLE_TEMPLATE, description: 'Updated' });
    expect(getTemplate('dupe').description).toBe('Updated');
  });
});

describe('getTemplate', () => {
  test('returns null for unknown template', () => {
    expect(getTemplate('nonexistent')).toBeNull();
  });
});

describe('listTemplates', () => {
  test('returns array of registered templates', () => {
    registerTemplate('list-test', SAMPLE_TEMPLATE);
    const list = listTemplates();
    expect(Array.isArray(list)).toBe(true);
    expect(list.some((t) => t.name === 'list-test')).toBe(true);
  });
});
