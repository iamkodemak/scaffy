/**
 * scaffoldHistory.js
 * Tracks scaffold runs for auditing and repeat-run support.
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_HISTORY_FILE = '.scaffy-history.json';
const MAX_ENTRIES = 50;

let historyFilePath = DEFAULT_HISTORY_FILE;

function setHistoryFile(filePath) {
  historyFilePath = filePath;
}

function resetHistoryFile() {
  historyFilePath = DEFAULT_HISTORY_FILE;
}

function loadHistory() {
  try {
    if (!fs.existsSync(historyFilePath)) return [];
    const raw = fs.readFileSync(historyFilePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveHistory(entries) {
  const trimmed = entries.slice(-MAX_ENTRIES);
  fs.writeFileSync(historyFilePath, JSON.stringify(trimmed, null, 2), 'utf8');
}

function recordRun(context) {
  const { templateName, outputDir, variables, dryRun } = context;
  const entry = {
    timestamp: new Date().toISOString(),
    templateName,
    outputDir,
    variables: { ...variables },
    dryRun: Boolean(dryRun),
  };
  const entries = loadHistory();
  entries.push(entry);
  saveHistory(entries);
  return entry;
}

function getLastRun() {
  const entries = loadHistory();
  return entries.length > 0 ? entries[entries.length - 1] : null;
}

function clearHistory() {
  if (fs.existsSync(historyFilePath)) {
    fs.unlinkSync(historyFilePath);
  }
}

function listHistory() {
  return loadHistory();
}

module.exports = {
  setHistoryFile,
  resetHistoryFile,
  recordRun,
  getLastRun,
  clearHistory,
  listHistory,
};
