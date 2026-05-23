const fs = require('fs');
const path = require('path');
const { loadHistory } = require('./scaffoldHistory');

const _written = [];

function trackWritten(filePath) {
  _written.push(filePath);
}

function getTrackedFiles() {
  return [..._written];
}

function clearTracked() {
  _written.length = 0;
}

async function rollbackFiles(filePaths, { dryRun = false, logger = console } = {}) {
  const removed = [];
  const failed = [];

  for (const filePath of filePaths) {
    try {
      if (dryRun) {
        logger.log(`[dry-run] Would remove: ${filePath}`);
        removed.push(filePath);
        continue;
      }
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        removed.push(filePath);
        logger.log(`Removed: ${filePath}`);
      } else {
        logger.log(`Skipped (not found): ${filePath}`);
      }
    } catch (err) {
      failed.push({ filePath, error: err.message });
      logger.error(`Failed to remove ${filePath}: ${err.message}`);
    }
  }

  return { removed, failed };
}

async function rollbackLastRun({ dryRun = false, logger = console } = {}) {
  const history = await loadHistory();
  if (!history || history.length === 0) {
    throw new Error('No scaffold history found to roll back.');
  }

  const lastRun = history[history.length - 1];
  const files = lastRun.filesWritten || [];

  if (files.length === 0) {
    throw new Error('Last run recorded no files to roll back.');
  }

  return rollbackFiles(files, { dryRun, logger });
}

module.exports = {
  trackWritten,
  getTrackedFiles,
  clearTracked,
  rollbackFiles,
  rollbackLastRun,
};
