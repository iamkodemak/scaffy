const { diffContent, diffFiles, formatDiff } = require('../scaffoldDiff');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('diffContent', () => {
  test('marks file as new when existingContent is null', () => {
    const result = diffContent(null, 'hello\nworld');
    expect(result.isNew).toBe(true);
    expect(result.additions).toBe(2);
    expect(result.deletions).toBe(0);
  });

  test('returns empty hunks for identical content', () => {
    const content = 'line1\nline2';
    const result = diffContent(content, content);
    expect(result.isNew).toBe(false);
    expect(result.hunks).toHaveLength(0);
    expect(result.additions).toBe(0);
    expect(result.deletions).toBe(0);
  });

  test('detects added lines', () => {
    const result = diffContent('line1', 'line1\nline2');
    expect(result.additions).toBe(1);
    expect(result.deletions).toBe(0);
    const addHunk = result.hunks.find(h => h.type === 'add');
    expect(addHunk).toBeDefined();
    expect(addHunk.content).toBe('line2');
  });

  test('detects removed lines', () => {
    const result = diffContent('line1\nline2', 'line1');
    expect(result.deletions).toBe(1);
    expect(result.additions).toBe(0);
    const removeHunk = result.hunks.find(h => h.type === 'remove');
    expect(removeHunk).toBeDefined();
    expect(removeHunk.content).toBe('line2');
  });

  test('detects modified lines', () => {
    const result = diffContent('foo', 'bar');
    expect(result.additions).toBe(1);
    expect(result.deletions).toBe(1);
  });
});

describe('diffFiles', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scaffy-diff-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('marks non-existent file as new', () => {
    const results = diffFiles({ 'newfile.txt': 'content' }, tmpDir);
    expect(results['newfile.txt'].isNew).toBe(true);
  });

  test('diffs existing file correctly', () => {
    fs.writeFileSync(path.join(tmpDir, 'existing.txt'), 'old content');
    const results = diffFiles({ 'existing.txt': 'new content' }, tmpDir);
    expect(results['existing.txt'].isNew).toBe(false);
    expect(results['existing.txt'].additions).toBeGreaterThan(0);
  });

  test('returns no hunks for unchanged file', () => {
    fs.writeFileSync(path.join(tmpDir, 'same.txt'), 'same');
    const results = diffFiles({ 'same.txt': 'same' }, tmpDir);
    expect(results['same.txt'].hunks).toHaveLength(0);
  });
});

describe('formatDiff', () => {
  test('includes [NEW] label for new files', () => {
    const diff = { isNew: true, additions: 3, deletions: 0, hunks: [] };
    const output = formatDiff('src/index.js', diff);
    expect(output).toContain('[NEW]');
    expect(output).toContain('src/index.js');
  });

  test('includes [MODIFIED] label for changed files', () => {
    const diff = { isNew: false, additions: 1, deletions: 1, hunks: [] };
    const output = formatDiff('src/app.js', diff);
    expect(output).toContain('[MODIFIED]');
  });

  test('renders hunk lines with +/- prefix', () => {
    const diff = {
      isNew: false, additions: 1, deletions: 1,
      hunks: [
        { type: 'remove', lineNo: 1, content: 'old' },
        { type: 'add', lineNo: 1, content: 'new' }
      ]
    };
    const output = formatDiff('file.txt', diff);
    expect(output).toContain('- 1: old');
    expect(output).toContain('+ 1: new');
  });
});
