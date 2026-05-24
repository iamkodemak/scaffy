/**
 * scaffoldNotifier.js
 * Sends user-facing notifications at key scaffold lifecycle points.
 * Supports pluggable notification channels (console, callback, etc.).
 */

const channels = [];

const VALID_LEVELS = ['info', 'warn', 'error', 'success'];

function registerChannel(fn) {
  if (typeof fn !== 'function') {
    throw new TypeError('Notification channel must be a function');
  }
  channels.push(fn);
}

function clearChannels() {
  channels.length = 0;
}

function listChannels() {
  return [...channels];
}

function notify(level, message, meta = {}) {
  if (!VALID_LEVELS.includes(level)) {
    throw new Error(`Invalid notification level: "${level}". Must be one of: ${VALID_LEVELS.join(', ')}`);
  }
  if (typeof message !== 'string' || !message.trim()) {
    throw new Error('Notification message must be a non-empty string');
  }
  const payload = { level, message, meta, timestamp: new Date().toISOString() };
  for (const channel of channels) {
    channel(payload);
  }
}

function notifyStart(templateName, meta = {}) {
  notify('info', `Scaffolding started: ${templateName}`, meta);
}

function notifyComplete(templateName, meta = {}) {
  notify('success', `Scaffolding complete: ${templateName}`, meta);
}

function notifyError(templateName, error, meta = {}) {
  notify('error', `Scaffolding failed: ${templateName} — ${error.message || error}`, meta);
}

function notifyFileWritten(filePath, meta = {}) {
  notify('info', `File written: ${filePath}`, meta);
}

module.exports = {
  registerChannel,
  clearChannels,
  listChannels,
  notify,
  notifyStart,
  notifyComplete,
  notifyError,
  notifyFileWritten,
  VALID_LEVELS,
};
