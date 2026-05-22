const fs = require('fs');
const path = require('path');
const os = require('os');
const { ensureDir, writeFile, writeFiles } = require('../outputWriter');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scaffy-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('ensureDir', () => {
  it('creates a directory that does not exist', () => {
    const target = path.join(tmpDir, 'new', 'nested', 'dir');
    ensureDir(target);
    expect(fs.existsSync(target)).toBe(true);
  });

  it('does not throw if directory already exists', () => {
    expect(() => ensureDir(tmpDir)).not.toThrow();
  });
});

describe('writeFile', () => {
  it('writes content to a new file', () => {
    const filePath = path.join(tmpDir, 'hello.txt');
    writeFile(filePath, 'hello world');
    expect(fs.readFileSync(filePath, 'utf8')).toBe('hello world');
  });

  it('creates nested directories automatically', () => {
    const filePath = path.join(tmpDir, 'a', 'b', 'c.txt');
    writeFile(filePath, 'nested');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('throws if file exists and overwrite is false', () => {
    const filePath = path.join(tmpDir, 'exists.txt');
    fs.writeFileSync(filePath, 'original');
    expect(() => writeFile(filePath, 'new content')).toThrow(/already exists/);
  });

  it('overwrites file when overwrite option is true', () => {
    const filePath = path.join(tmpDir, 'overwrite.txt');
    fs.writeFileSync(filePath, 'original');
    writeFile(filePath, 'updated', { overwrite: true });
    expect(fs.readFileSync(filePath, 'utf8')).toBe('updated');
  });
});

describe('writeFiles', () => {
  it('writes multiple files relative to baseDir', () => {
    const files = [
      { path: 'src/index.js', content: 'console.log(1)' },
      { path: 'README.md', content: '# Hello' },
    ];
    writeFiles(files, { baseDir: tmpDir });
    expect(fs.existsSync(path.join(tmpDir, 'src/index.js'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'README.md'))).toBe(true);
  });

  it('throws when files array is empty', () => {
    expect(() => writeFiles([], { baseDir: tmpDir })).toThrow(/non-empty array/);
  });

  it('returns the list of absolute paths written', () => {
    const files = [{ path: 'out.txt', content: 'data' }];
    const result = writeFiles(files, { baseDir: tmpDir });
    expect(result).toHaveLength(1);
    expect(path.isAbsolute(result[0])).toBe(true);
  });
});
