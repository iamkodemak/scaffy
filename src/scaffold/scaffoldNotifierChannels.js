/**
 * scaffoldNotifierChannels.js
 * Built-in notification channels for scaffoldNotifier.
 */

const LEVEL_PREFIXES = {
  info:    '[scaffy] ℹ',
  warn:    '[scaffy] ⚠',
  error:   '[scaffy] ✖',
  success: '[scaffy] ✔',
};

/**
 * Console channel — writes notifications to stdout/stderr.
 */
function consoleChannel({ level, message, timestamp }) {
  const prefix = LEVEL_PREFIXES[level] || '[scaffy]';
  const line = `${prefix} ${message}  (${timestamp})`;
  if (level === 'error') {
    console.error(line);
  } else {
    console.log(line);
  }
}

/**
 * Creates a collector channel that stores payloads in an array.
 * Useful for testing or programmatic inspection.
 */
function createCollectorChannel() {
  const collected = [];
  function channel(payload) {
    collected.push(payload);
  }
  channel.collected = collected;
  channel.clear = () => { collected.length = 0; };
  return channel;
}

module.exports = { consoleChannel, createCollectorChannel };
