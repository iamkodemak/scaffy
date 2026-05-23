/**
 * scaffoldEventsLogger.js
 * Attaches console-based logging to scaffold lifecycle events.
 * Can be enabled/disabled independently of the main scaffold logger.
 */

const { on, off, clearListeners } = require('./scaffoldEvents');
const { shouldLog, formatMessage } = require('./scaffoldLogger');

const boundHandlers = {};

function handleStart(ctx) {
  if (shouldLog('info')) {
    console.log(formatMessage('info', `Scaffold started: ${ctx.projectName || '(unnamed)'}`, ctx));
  }
}

function handleComplete(ctx) {
  if (shouldLog('info')) {
    console.log(formatMessage('info', `Scaffold complete: ${ctx.projectName || '(unnamed)'}`, ctx));
  }
}

function handleError(ctx) {
  if (shouldLog('error')) {
    console.error(formatMessage('error', `Scaffold error: ${ctx.error?.message || 'unknown'}`, ctx));
  }
}

function handleFileWrite(ctx) {
  if (shouldLog('debug')) {
    console.log(formatMessage('debug', `Writing file: ${ctx.filePath}`, ctx));
  }
}

function attachEventsLogger() {
  if (boundHandlers.attached) return;
  on('scaffold:start', handleStart);
  on('scaffold:complete', handleComplete);
  on('scaffold:error', handleError);
  on('file:write', handleFileWrite);
  boundHandlers.attached = true;
}

function detachEventsLogger() {
  off('scaffold:start', handleStart);
  off('scaffold:complete', handleComplete);
  off('scaffold:error', handleError);
  off('file:write', handleFileWrite);
  boundHandlers.attached = false;
}

module.exports = { attachEventsLogger, detachEventsLogger };
