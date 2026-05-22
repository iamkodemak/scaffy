/**
 * loadBuiltInHooks.js
 * Entry point that loads built-in hooks exactly once.
 */

const { registerBuiltInHooks } = require('./builtInHooks');

let loaded = false;

/**
 * Idempotently register all built-in lifecycle hooks.
 */
function loadBuiltInHooks() {
  if (loaded) return;
  registerBuiltInHooks();
  loaded = true;
}

/**
 * Reset the loaded flag (used in tests).
 */
function resetLoadedFlag() {
  loaded = false;
}

module.exports = { loadBuiltInHooks, resetLoadedFlag };
