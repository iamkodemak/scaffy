const { renderString, renderTemplateFiles, resolveKey } = require('../templateRenderer');

describe('resolveKey', () => {
  test('resolves top-level key', () => {
    expect(resolveKey({ name: 'scaffy' }, 'name')).toBe('scaffy');
  });

  test('resolves nested dot-notation key', () => {
    expect(resolveKey({ author: { name: 'Alice' } }, 'author.name')).toBe('Alice');
  });

  test('returns undefined for missing key', () => {
    expect(resolveKey({}, 'missing')).toBeUndefined();
  });

  test('returns undefined for partially missing nested key', () => {
    expect(resolveKey({ author: {} }, 'author.name')).toBeUndefined();
  });
});

describe('renderString', () => {
  test('replaces a single variable', () => {
    expect(renderString('Hello, {{ name }}!', { name: 'World' })).toBe('Hello, World!');
  });

  test('replaces multiple variables', () => {
    const result = renderString('{{a}} + {{b}}', { a: '1', b: '2' });
    expect(result).toBe('1 + 2');
  });

  test('leaves unknown variables intact and warns', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const result = renderString('{{unknown}}', {});
    expect(result).toBe('{{unknown}}');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('resolves nested variable', () => {
    expect(renderString('by {{ author.name }}', { author: { name: 'Bob' } })).toBe('by Bob');
  });

  test('handles string with no template variables', () => {
    expect(renderString('no variables here', { name: 'unused' })).toBe('no variables here');
  });

  test('handles empty string', () => {
    expect(renderString('', { name: 'World' })).toBe('');
  });
});

describe('renderTemplateFiles', () => {
  test('renders both path and content', () => {
    const files = [{ path: '{{name}}/index.js', content: 'const x = "{{name}}";' }];
    const result = renderTemplateFiles(files, { name: 'myapp' });
    expect(result[0].path).toBe('myapp/index.js');
    expect(result[0].content).toBe('const x = "myapp";');
  });

  test('renders multiple files', () => {
    const files = [
      { path: '{{name}}/index.js', content: '// {{name}}' },
      { path: '{{name}}/README.md', content: '# {{name}}' },
    ];
    const result = renderTemplateFiles(files, { name: 'myapp' });
    expect(result).toHaveLength(2);
    expect(result[1].path).toBe('myapp/README.md');
    expect(result[1].content).toBe('# myapp');
  });
});
