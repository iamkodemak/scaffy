/**
 * scaffoldProgressReporter.js
 * Attaches a progress reporter to scaffold events, updating scaffoldProgress.
 */

const progress = require('./scaffoldProgress');
const { on } = require('./scaffoldEvents');

const STEPS = [
  'validate',
  'load-config',
  'resolve-variables',
  'render-templates',
  'write-files',
  'run-hooks',
  'finalize',
];

const STEP_INDEX = Object.fromEntries(STEPS.map((s, i) => [s, i]));

let _attached = false;

function attachProgressReporter(customSteps) {
  if (_attached) return;
  const steps = customSteps && customSteps.length ? customSteps : STEPS;
  progress.setSteps(steps);

  on('scaffold:step:start', ({ step }) => {
    const idx = STEP_INDEX[step];
    if (idx !== undefined) progress.start(idx);
  });

  on('scaffold:step:complete', ({ step }) => {
    const idx = STEP_INDEX[step];
    if (idx !== undefined) progress.complete(idx);
  });

  on('scaffold:step:fail', ({ step, error }) => {
    const idx = STEP_INDEX[step];
    if (idx !== undefined) progress.fail(idx, error);
  });

  _attached = true;
}

function resetAttached() {
  _attached = false;
}

function getDefaultSteps() {
  return [...STEPS];
}

module.exports = { attachProgressReporter, resetAttached, getDefaultSteps };
