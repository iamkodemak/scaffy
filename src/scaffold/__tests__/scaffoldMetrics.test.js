const {
  recordRun,
  getMetrics,
  getSummary,
  resetMetrics,
} = require('../scaffoldMetrics');

beforeEach(() => {
  resetMetrics();
});

describe('recordRun', () => {
  it('increments totalRuns on each call', () => {
    recordRun({ template: 'express', filesWritten: 3, durationMs: 120 });
    recordRun({ template: 'express', filesWritten: 2, durationMs: 80 });
    expect(getMetrics().totalRuns).toBe(2);
  });

  it('tracks successful and failed runs separately', () => {
    recordRun({ template: 'express', success: true });
    recordRun({ template: 'express', success: false });
    const m = getMetrics();
    expect(m.successfulRuns).toBe(1);
    expect(m.failedRuns).toBe(1);
  });

  it('accumulates filesWritten and totalDuration', () => {
    recordRun({ template: 'koa', filesWritten: 4, durationMs: 200 });
    recordRun({ template: 'koa', filesWritten: 6, durationMs: 300 });
    const m = getMetrics();
    expect(m.totalFilesWritten).toBe(10);
    expect(m.totalDuration).toBe(500);
  });

  it('tracks per-template usage', () => {
    recordRun({ template: 'express', filesWritten: 2, durationMs: 100 });
    recordRun({ template: 'fastify', filesWritten: 3, durationMs: 150 });
    const { templateUsage } = getMetrics();
    expect(templateUsage.express.runs).toBe(1);
    expect(templateUsage.fastify.filesWritten).toBe(3);
  });

  it('throws if template is missing', () => {
    expect(() => recordRun({ filesWritten: 1 })).toThrow('template name is required');
  });
});

describe('getSummary', () => {
  it('returns N/A successRate when no runs recorded', () => {
    expect(getSummary().successRate).toBe('N/A');
  });

  it('calculates successRate correctly', () => {
    recordRun({ template: 'express', success: true });
    recordRun({ template: 'express', success: true });
    recordRun({ template: 'express', success: false });
    expect(getSummary().successRate).toBe('66.7%');
  });

  it('identifies the top template by run count', () => {
    recordRun({ template: 'express' });
    recordRun({ template: 'express' });
    recordRun({ template: 'fastify' });
    expect(getSummary().topTemplate).toBe('express');
  });

  it('returns null topTemplate when no runs recorded', () => {
    expect(getSummary().topTemplate).toBeNull();
  });

  it('computes average duration', () => {
    recordRun({ template: 'express', durationMs: 100 });
    recordRun({ template: 'express', durationMs: 200 });
    expect(getSummary().avgDurationMs).toBe(150);
  });
});

describe('resetMetrics', () => {
  it('resets all counters to zero', () => {
    recordRun({ template: 'express', filesWritten: 5, durationMs: 300 });
    resetMetrics();
    const m = getMetrics();
    expect(m.totalRuns).toBe(0);
    expect(m.totalFilesWritten).toBe(0);
    expect(m.templateUsage).toEqual({});
  });
});
