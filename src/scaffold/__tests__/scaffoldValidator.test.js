const { validateScaffoldOptions } = require('../scaffoldValidator');
const fs = require('fs');
const path = require('path');

jest.mock('fs');

describe('validateScaffoldOptions', () => {
  beforeEach(() => {
    fs.existsSync.mockReturnValue(false);
  });

  it('passes with valid options', () => {
    expect(() =>
      validateScaffoldOptions({ templateName: 'node-app', outputDir: './out' })
    ).not.toThrow();
  });

  it('throws if neither templateName nor configPath is provided', () => {
    expect(() =>
      validateScaffoldOptions({ outputDir: './out' })
    ).toThrow('Either templateName or configPath must be provided.');
  });

  it('throws if templateName contains invalid characters', () => {
    expect(() =>
      validateScaffoldOptions({ templateName: 'bad name!', outputDir: './out' })
    ).toThrow('Invalid template name');
  });

  it('throws if outputDir is missing', () => {
    expect(() =>
      validateScaffoldOptions({ templateName: 'node-app' })
    ).toThrow('outputDir is required.');
  });

  it('throws if outputDir exists but is not a directory', () => {
    fs.existsSync.mockReturnValue(true);
    fs.statSync.mockReturnValue({ isDirectory: () => false });
    expect(() =>
      validateScaffoldOptions({ templateName: 'node-app', outputDir: './file.txt' })
    ).toThrow('exists but is not a directory');
  });

  it('throws if variables is not an object', () => {
    expect(() =>
      validateScaffoldOptions({ templateName: 'node-app', outputDir: './out', variables: 'bad' })
    ).toThrow('variables must be a plain object.');
  });
});
