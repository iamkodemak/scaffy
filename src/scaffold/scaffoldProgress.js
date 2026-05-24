/**
 * scaffoldProgress.js
 * Tracks and reports progress of a scaffold run across multiple steps.
 */

let _steps = [];
let _currentIndex = -1;
let _onUpdate = null;

function setSteps(steps) {
  if (!Array.isArray(steps) || steps.length === 0) {
    throw new Error('steps must be a non-empty array');
  }
  _steps = steps.map((label, i) => ({ index: i, label, status: 'pending' }));
  _currentIndex = -1;
}

function getSteps() {
  return _steps.map(s => ({ ...s }));
}

function onUpdate(fn) {
  if (typeof fn !== 'function') throw new Error('onUpdate requires a function');
  _onUpdate = fn;
}

function _notify() {
  if (typeof _onUpdate === 'function') {
    _onUpdate(getSteps(), getSummary());
  }
}

function start(index) {
  if (index < 0 || index >= _steps.length) throw new Error(`Invalid step index: ${index}`);
  _currentIndex = index;
  _steps[index].status = 'running';
  _steps[index].startedAt = Date.now();
  _notify();
}

function complete(index) {
  if (index < 0 || index >= _steps.length) throw new Error(`Invalid step index: ${index}`);
  _steps[index].status = 'done';
  _steps[index].completedAt = Date.now();
  _notify();
}

function fail(index, error) {
  if (index < 0 || index >= _steps.length) throw new Error(`Invalid step index: ${index}`);
  _steps[index].status = 'failed';
  _steps[index].error = error ? error.message || String(error) : 'unknown error';
  _steps[index].completedAt = Date.now();
  _notify();
}

function getSummary() {
  const total = _steps.length;
  const done = _steps.filter(s => s.status === 'done').length;
  const failed = _steps.filter(s => s.status === 'failed').length;
  const pending = _steps.filter(s => s.status === 'pending').length;
  const running = _steps.filter(s => s.status === 'running').length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return { total, done, failed, pending, running, percent };
}

function reset() {
  _steps = [];
  _currentIndex = -1;
  _onUpdate = null;
}

module.exports = { setSteps, getSteps, onUpdate, start, complete, fail, getSummary, reset };
