const {
  record,
  getEntries,
  filterByType,
  resetEntries,
  persist,
  load,
  setAuditFile,
  resetAuditFile,
} = require('../scaffoldAuditLog');
const fs = require('fs');
const path = require('path');
const os = require('os');

beforeEach(() => {
  resetEntries();
  resetAuditFile();
});

describe('record', () => {
  it('adds an entry with correct type and payload', () => {
    const entry = record('scaffold:start', { template: 'express' });
    expect(entry.type).toBe('scaffold:start');
    expect(entry.payload.template).toBe('express');
    expect(entry.id).toBeDefined();
    expect(entry.timestamp).toBeDefined();
  });

  it('throws if type is missing', () => {
    expect(() => record()).toThrow('Audit entry type is required');
  });

  it('stores entry in internal list', () => {
    record('scaffold:complete', {});
    expect(getEntries()).toHaveLength(1);
  });
});

describe('getEntries', () => {
  it('returns a copy of entries', () => {
    record('scaffold:start', {});
    const entries = getEntries();
    entries.push({ fake: true });
    expect(getEntries()).toHaveLength(1);
  });
});

describe('filterByType', () => {
  it('returns only entries of the given type', () => {
    record('scaffold:start', {});
    record('scaffold:error', { message: 'oops' });
    record('scaffold:start', {});
    const starts = filterByType('scaffold:start');
    expect(starts).toHaveLength(2);
    starts.forEach((e) => expect(e.type).toBe('scaffold:start'));
  });
});

describe('persist and load', () => {
  it('writes entries to file and reloads them', () => {
    const tmpFile = path.join(os.tmpdir(), `scaffy-audit-test-${Date.now()}.json`);
    setAuditFile(tmpFile);
    record('scaffold:start', { template: 'koa' });
    persist();
    resetEntries();
    const loaded = load();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].type).toBe('scaffold:start');
    fs.unlinkSync(tmpFile);
  });

  it('returns empty array when audit file does not exist', () => {
    setAuditFile('/nonexistent/path/audit.json');
    const result = load();
    expect(result).toEqual([]);
  });
});
