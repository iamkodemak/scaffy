const { loggerPlugin, outputNormalizerPlugin, timestampPlugin } = require('../builtInPlugins');
const path = require('path');

describe('loggerPlugin', () => {
  test('beforeScaffold logs and returns context', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const ctx = { templateName: 'express-api' };
    const result = loggerPlugin.beforeScaffold(ctx);
    expect(result).toEqual(ctx);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('express-api'));
    spy.mockRestore();
  });

  test('afterScaffold logs file count', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const ctx = { filesWritten: ['a.js', 'b.js'] };
    loggerPlugin.afterScaffold(ctx);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('2'));
    spy.mockRestore();
  });
});

describe('outputNormalizerPlugin', () => {
  test('resolves relative outputDir to absolute', () => {
    const ctx = { outputDir: 'my-project' };
    const result = outputNormalizerPlugin.beforeScaffold(ctx);
    expect(path.isAbsolute(result.outputDir)).toBe(true);
    expect(result.outputDir).toBe(path.resolve(process.cwd(), 'my-project'));
  });

  test('leaves absolute outputDir unchanged', () => {
    const absPath = '/tmp/my-project';
    const ctx = { outputDir: absPath };
    const result = outputNormalizerPlugin.beforeScaffold(ctx);
    expect(result.outputDir).toBe(absPath);
  });

  test('returns context unchanged if no outputDir', () => {
    const ctx = { templateName: 'test' };
    const result = outputNormalizerPlugin.beforeScaffold(ctx);
    expect(result).toEqual(ctx);
  });
});

describe('timestampPlugin', () => {
  test('injects scaffoldedAt into variables', () => {
    const ctx = { variables: { projectName: 'foo' } };
    const result = timestampPlugin.beforeRender(ctx);
    expect(result.variables.scaffoldedAt).toBeDefined();
    expect(new Date(result.variables.scaffoldedAt).toString()).not.toBe('Invalid Date');
  });

  test('preserves existing variables', () => {
    const ctx = { variables: { projectName: 'bar', author: 'Alice' } };
    const result = timestampPlugin.beforeRender(ctx);
    expect(result.variables.projectName).toBe('bar');
    expect(result.variables.author).toBe('Alice');
  });
});
