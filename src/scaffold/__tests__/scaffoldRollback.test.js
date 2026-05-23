const fs = require('fs');
const path = require('path');
const {
  trackWritten,
  getTrackedFiles,
  clearTracked,
  rollbackFiles,
  rollbackLastRun,
} = require('../scaffoldRollback');
const { loadHistory } = require('../scaffoldHistory');

jest.mock('fs');
jest.mock('../scaffoldHistory');

const mockLogger = { log: jest.fn(), error: jest.fn() };

beforeEach(() => {
  clearTracked();
  jest.clearAllMocks();
});

describe('trackWritten / getTrackedFiles / clearTracked', () => {
  it('tracks written files', () => {
    trackWritten('/a/b.js');
    trackWritten('/a/c.js');
    expect(getTrackedFiles()).toEqual(['/a/b.js', '/a/c.js']);
  });

  it('clears tracked files', () => {
    trackWritten('/a/b.js');
    clearTracked();
    expect(getTrackedFiles()).toHaveLength(0);
  });
});

describe('rollbackFiles', () => {
  it('removes existing files', async () => {
    fs.existsSync.mockReturnValue(true);
    fs.unlinkSync.mockImplementation(() => {});

    const result = await rollbackFiles(['/a/foo.js'], { logger: mockLogger });
    expect(result.removed).toContain('/a/foo.js');
    expect(result.failed).toHaveLength(0);
    expect(fs.unlinkSync).toHaveBeenCalledWith('/a/foo.js');
  });

  it('skips files that do not exist', async () => {
    fs.existsSync.mockReturnValue(false);

    const result = await rollbackFiles(['/a/missing.js'], { logger: mockLogger });
    expect(result.removed).toHaveLength(0);
    expect(result.failed).toHaveLength(0);
  });

  it('records failures on unlink error', async () => {
    fs.existsSync.mockReturnValue(true);
    fs.unlinkSync.mockImplementation(() => { throw new Error('perm denied'); });

    const result = await rollbackFiles(['/a/bad.js'], { logger: mockLogger });
    expect(result.failed[0].filePath).toBe('/a/bad.js');
    expect(result.failed[0].error).toMatch('perm denied');
  });

  it('performs dry run without deleting', async () => {
    const result = await rollbackFiles(['/a/dry.js'], { dryRun: true, logger: mockLogger });
    expect(result.removed).toContain('/a/dry.js');
    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });
});

describe('rollbackLastRun', () => {
  it('throws when no history exists', async () => {
    loadHistory.mockResolvedValue([]);
    await expect(rollbackLastRun({ logger: mockLogger })).rejects.toThrow('No scaffold history');
  });

  it('throws when last run has no files', async () => {
    loadHistory.mockResolvedValue([{ filesWritten: [] }]);
    await expect(rollbackLastRun({ logger: mockLogger })).rejects.toThrow('no files to roll back');
  });

  it('rolls back files from last history entry', async () => {
    loadHistory.mockResolvedValue([{ filesWritten: ['/out/index.js'] }]);
    fs.existsSync.mockReturnValue(true);
    fs.unlinkSync.mockImplementation(() => {});

    const result = await rollbackLastRun({ logger: mockLogger });
    expect(result.removed).toContain('/out/index.js');
  });
});
