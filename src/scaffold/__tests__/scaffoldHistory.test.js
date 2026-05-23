const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  setHistoryFile,
  resetHistoryFile,
  recordRun,
  getLastRun,
  clearHistory,
  listHistory,
} = require('../scaffoldHistory');

const tmpFile = path.join(os.tmpdir(), `scaffy-test-history-${Date.now()}.json`);

beforeEach(() => {
  setHistoryFile(tmpFile);
  clearHistory();
});

afterEach(() => {
  if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  resetHistoryFile();
});

describe('scaffoldHistory', () => {
  const mockContext = {
    templateName: 'express-api',
    outputDir: '/projects/my-app',
    variables: { name: 'my-app', port: 3000 },
    dryRun: false,
  };

  test('recordRun saves an entry and returns it', () => {
    const entry = recordRun(mockContext);
    expect(entry.templateName).toBe('express-api');
    expect(entry.outputDir).toBe('/projects/my-app');
    expect(entry.dryRun).toBe(false);
    expect(entry.timestamp).toBeDefined();
  });

  test('listHistory returns all recorded entries', () => {
    recordRun(mockContext);
    recordRun({ ...mockContext, templateName: 'cli-tool' });
    const history = listHistory();
    expect(history).toHaveLength(2);
    expect(history[1].templateName).toBe('cli-tool');
  });

  test('getLastRun returns the most recent entry', () => {
    recordRun(mockContext);
    recordRun({ ...mockContext, templateName: 'graphql-api' });
    const last = getLastRun();
    expect(last.templateName).toBe('graphql-api');
  });

  test('getLastRun returns null when history is empty', () => {
    expect(getLastRun()).toBeNull();
  });

  test('clearHistory removes the history file', () => {
    recordRun(mockContext);
    clearHistory();
    expect(fs.existsSync(tmpFile)).toBe(false);
    expect(listHistory()).toEqual([]);
  });

  test('recordRun stores a copy of variables, not a reference', () => {
    const vars = { name: 'original' };
    recordRun({ ...mockContext, variables: vars });
    vars.name = 'mutated';
    const saved = listHistory()[0];
    expect(saved.variables.name).toBe('original');
  });

  test('dryRun flag is coerced to boolean', () => {
    const entry = recordRun({ ...mockContext, dryRun: undefined });
    expect(entry.dryRun).toBe(false);
  });
});
