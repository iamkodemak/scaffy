/**
 * scaffoldAuditLog.js
 * Records a tamper-evident audit trail of scaffold operations.
 */

const fs = require('fs');
const path = require('path');

let auditFile = path.resolve(process.cwd(), '.scaffy-audit.json');
let entries = [];

function setAuditFile(filePath) {
  auditFile = path.resolve(filePath);
}

function resetAuditFile() {
  auditFile = path.resolve(process.cwd(), '.scaffy-audit.json');
}

function resetEntries() {
  entries = [];
}

function createEntry(type, payload) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    timestamp: new Date().toISOString(),
    payload,
  };
}

function record(type, payload) {
  if (!type || typeof type !== 'string') throw new Error('Audit entry type is required');
  const entry = createEntry(type, payload || {});
  entries.push(entry);
  return entry;
}

function getEntries() {
  return [...entries];
}

function filterByType(type) {
  return entries.filter((e) => e.type === type);
}

function persist() {
  const dir = path.dirname(auditFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(auditFile, JSON.stringify(entries, null, 2), 'utf8');
}

function load() {
  if (!fs.existsSync(auditFile)) return [];
  try {
    const raw = fs.readFileSync(auditFile, 'utf8');
    entries = JSON.parse(raw);
    return [...entries];
  } catch {
    return [];
  }
}

module.exports = {
  setAuditFile,
  resetAuditFile,
  resetEntries,
  record,
  getEntries,
  filterByType,
  persist,
  load,
};
