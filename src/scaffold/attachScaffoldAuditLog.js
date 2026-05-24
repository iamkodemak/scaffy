/**
 * attachScaffoldAuditLog.js
 * Attaches audit logging to scaffold events.
 */

const { on } = require('./scaffoldEvents');
const { record } = require('./scaffoldAuditLog');

let attached = false;

function attachScaffoldAuditLog() {
  if (attached) return;

  on('scaffold:start', (ctx) => {
    record('scaffold:start', {
      template: ctx && ctx.template,
      outputDir: ctx && ctx.outputDir,
    });
  });

  on('scaffold:complete', (ctx) => {
    record('scaffold:complete', {
      template: ctx && ctx.template,
      outputDir: ctx && ctx.outputDir,
      filesWritten: ctx && ctx.filesWritten,
    });
  });

  on('scaffold:error', (err) => {
    record('scaffold:error', {
      message: err && err.message,
      stack: err && err.stack,
    });
  });

  on('scaffold:fileWrite', (info) => {
    record('scaffold:fileWrite', {
      filePath: info && info.filePath,
    });
  });

  attached = true;
}

function resetAttached() {
  attached = false;
}

module.exports = { attachScaffoldAuditLog, resetAttached };
