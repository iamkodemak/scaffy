const fs = require('fs');
const path = require('path');
const { validateTemplateCommand, loadTemplateFile } = require('../validateTemplateCommand');

jest.mock('fs');

describe('loadTemplateFile', () => {
  it('throws if file does not exist', () => {
    fs.existsSync.mockReturnValue(false);
    expect(() => loadTemplateFile('missing.json')).toThrow(/File not found/);
  });

  it('throws if file is invalid JSON', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('not json {{');
    expect(() => loadTemplateFile('bad.json')).toThrow(/Failed to parse JSON/);
  });

  it('returns parsed object for valid JSON', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify({ name: 'test', files: [] }));
    const result = loadTemplateFile('template.json');
    expect(result.name).toBe('test');
  });
});

describe('validateTemplateCommand', () => {
  const validTemplate = {
    name: 'my-app',
    files: [{ path: 'index.js', content: 'console.log("hi")' }],
  };

  beforeEach(() => {
    fs.existsSync.mockReturnValue(true);
  });

  it('returns failure when no file path provided', () => {
    const err = jest.fn();
    const result = validateTemplateCommand([], { err });
    expect(result.success).toBe(false);
    expect(err).toHaveBeenCalledWith(expect.stringMatching(/Usage/));
  });

  it('returns failure when file does not exist', () => {
    fs.existsSync.mockReturnValue(false);
    const err = jest.fn();
    const result = validateTemplateCommand(['ghost.json'], { err });
    expect(result.success).toBe(false);
    expect(result.errors[0]).toMatch(/File not found/);
  });

  it('returns success for a valid template file', () => {
    fs.readFileSync.mockReturnValue(JSON.stringify(validTemplate));
    const out = jest.fn();
    const result = validateTemplateCommand(['template.json'], { out });
    expect(result.success).toBe(true);
    expect(out).toHaveBeenCalledWith(expect.stringMatching(/valid/));
  });

  it('returns failure and lists errors for invalid template', () => {
    fs.readFileSync.mockReturnValue(JSON.stringify({ files: [] }));
    const out = jest.fn();
    const err = jest.fn();
    const result = validateTemplateCommand(['bad-template.json'], { out, err });
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(err).toHaveBeenCalledWith(expect.stringMatching(/failed/));
  });

  it('returns failure for invalid JSON file', () => {
    fs.readFileSync.mockReturnValue('{ broken json');
    const err = jest.fn();
    const result = validateTemplateCommand(['broken.json'], { err });
    expect(result.success).toBe(false);
    expect(result.errors[0]).toMatch(/parse/);
  });
});
