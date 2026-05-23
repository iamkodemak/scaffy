/**
 * scaffoldMetrics.js
 * Tracks performance and usage metrics for scaffold runs.
 */

let metrics = {
  totalRuns: 0,
  successfulRuns: 0,
  failedRuns: 0,
  totalFilesWritten: 0,
  totalDuration: 0,
  templateUsage: {},
};

function resetMetrics() {
  metrics = {
    totalRuns: 0,
    successfulRuns: 0,
    failedRuns: 0,
    totalFilesWritten: 0,
    totalDuration: 0,
    templateUsage: {},
  };
}

function recordRun({ template, filesWritten = 0, durationMs = 0, success = true }) {
  if (!template) throw new Error('template name is required to record a run');

  metrics.totalRuns += 1;
  metrics.totalFilesWritten += filesWritten;
  metrics.totalDuration += durationMs;

  if (success) {
    metrics.successfulRuns += 1;
  } else {
    metrics.failedRuns += 1;
  }

  if (!metrics.templateUsage[template]) {
    metrics.templateUsage[template] = { runs: 0, filesWritten: 0, totalDuration: 0 };
  }
  metrics.templateUsage[template].runs += 1;
  metrics.templateUsage[template].filesWritten += filesWritten;
  metrics.templateUsage[template].totalDuration += durationMs;
}

function getMetrics() {
  return { ...metrics, templateUsage: { ...metrics.templateUsage } };
}

function getSummary() {
  const avgDuration =
    metrics.totalRuns > 0
      ? (metrics.totalDuration / metrics.totalRuns).toFixed(2)
      : '0.00';
  return {
    totalRuns: metrics.totalRuns,
    successRate:
      metrics.totalRuns > 0
        ? `${((metrics.successfulRuns / metrics.totalRuns) * 100).toFixed(1)}%`
        : 'N/A',
    avgDurationMs: parseFloat(avgDuration),
    totalFilesWritten: metrics.totalFilesWritten,
    topTemplate: getTopTemplate(),
  };
}

function getTopTemplate() {
  const entries = Object.entries(metrics.templateUsage);
  if (entries.length === 0) return null;
  return entries.reduce((top, [name, data]) =>
    data.runs > (top[1]?.runs ?? 0) ? [name, data] : top
  , entries[0])[0];
}

module.exports = { recordRun, getMetrics, getSummary, resetMetrics };
