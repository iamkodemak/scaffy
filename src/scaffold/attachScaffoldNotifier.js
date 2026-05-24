/**
 * attachScaffoldNotifier.js
 * Wires scaffoldNotifier into the scaffoldEvents system so that
 * lifecycle events automatically trigger notifications.
 */

const { on } = require('./scaffoldEvents');
const {
  notifyStart,
  notifyComplete,
  notifyError,
  notifyFileWritten,
} = require('./scaffoldNotifier');

let attached = false;

function attachScaffoldNotifier() {
  if (attached) return;

  on('scaffold:start', ({ templateName, options }) => {
    notifyStart(templateName, { options });
  });

  on('scaffold:complete', ({ templateName, files }) => {
    notifyComplete(templateName, { fileCount: files ? files.length : 0 });
  });

  on('scaffold:error', ({ templateName, error }) => {
    notifyError(templateName, error);
  });

  on('scaffold:fileWrite', ({ filePath }) => {
    notifyFileWritten(filePath);
  });

  attached = true;
}

function resetAttached() {
  attached = false;
}

module.exports = { attachScaffoldNotifier, resetAttached };
