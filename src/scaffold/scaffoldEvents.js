/**
 * scaffoldEvents.js
 * Simple event emitter for scaffold lifecycle events.
 */

const listeners = {};

const VALID_EVENTS = [
  'scaffold:start',
  'scaffold:complete',
  'scaffold:error',
  'file:write',
  'file:skip',
  'template:render',
  'hook:run',
  'plugin:apply',
];

function on(event, listener) {
  if (!VALID_EVENTS.includes(event)) {
    throw new Error(`Unknown scaffold event: "${event}"`);
  }
  if (typeof listener !== 'function') {
    throw new TypeError('Event listener must be a function');
  }
  if (!listeners[event]) {
    listeners[event] = [];
  }
  listeners[event].push(listener);
}

function off(event, listener) {
  if (!listeners[event]) return;
  listeners[event] = listeners[event].filter((l) => l !== listener);
}

function emit(event, payload) {
  if (!listeners[event]) return;
  for (const listener of listeners[event]) {
    try {
      listener(payload);
    } catch (err) {
      // Listeners should not crash the scaffold run
      console.error(`[scaffy] Error in listener for "${event}":`, err.message);
    }
  }
}

function clearListeners(event) {
  if (event) {
    listeners[event] = [];
  } else {
    for (const key of Object.keys(listeners)) {
      listeners[key] = [];
    }
  }
}

function listValidEvents() {
  return [...VALID_EVENTS];
}

module.exports = { on, off, emit, clearListeners, listValidEvents, VALID_EVENTS };
