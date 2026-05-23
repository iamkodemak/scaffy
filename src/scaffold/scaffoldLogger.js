/**
 * scaffoldLogger.js
 * Provides structured logging utilities for scaffold operations.
 */

const LOG_LEVELS = { silent: 0, error: 1, warn: 2, info: 3, debug: 4 };

let currentLevel = 'info';
let logOutput = console;

/**
 * Set the active log level.
 * @param {'silent'|'error'|'warn'|'info'|'debug'} level
 */
function setLogLevel(level) {
  if (!(level in LOG_LEVELS)) {
    throw new Error(`Invalid log level: "${level}". Valid levels: ${Object.keys(LOG_LEVELS).join(', ')}`);
  }
  currentLevel = level;
}

/**
 * Override the output target (useful for testing).
 * @param {{ log: Function, warn: Function, error: Function }} target
 */
function setLogOutput(target) {
  logOutput = target;
}

/**
 * Reset the logger to defaults.
 */
function resetLogger() {
  currentLevel = 'info';
  logOutput = console;
}

function shouldLog(level) {
  return LOG_LEVELS[level] <= LOG_LEVELS[currentLevel];
}

function formatMessage(level, message) {
  const prefix = `[scaffy:${level.toUpperCase()}]`;
  return `${prefix} ${message}`;
}

const logger = {
  debug(message) {
    if (shouldLog('debug')) logOutput.log(formatMessage('debug', message));
  },
  info(message) {
    if (shouldLog('info')) logOutput.log(formatMessage('info', message));
  },
  warn(message) {
    if (shouldLog('warn')) logOutput.warn(formatMessage('warn', message));
  },
  error(message) {
    if (shouldLog('error')) logOutput.error(formatMessage('error', message));
  },
};

module.exports = { logger, setLogLevel, setLogOutput, resetLogger };
