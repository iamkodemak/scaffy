/**
 * hookManager.js
 * Lifecycle hook system for scaffy — allows plugins and templates to
 * register callbacks at well-known points in the scaffolding pipeline.
 */

const hooks = new Map();

/**
 * Register a callback for a named hook.
 * @param {string} hookName
 * @param {Function} callback  async (context) => void | any
 */
function registerHook(hookName, callback) {
  if (typeof hookName !== 'string' || !hookName) {
    throw new Error('hookName must be a non-empty string');
  }
  if (typeof callback !== 'function') {
    throw new Error('callback must be a function');
  }
  if (!hooks.has(hookName)) {
    hooks.set(hookName, []);
  }
  hooks.get(hookName).push(callback);
}

/**
 * Run all callbacks registered for a hook in registration order.
 * Each callback receives the shared context object.
 * @param {string} hookName
 * @param {object} context  mutable context passed through all callbacks
 * @returns {Promise<object>} the (possibly mutated) context
 */
async function runHook(hookName, context = {}) {
  const callbacks = hooks.get(hookName) || [];
  for (const cb of callbacks) {
    await cb(context);
  }
  return context;
}

/**
 * Remove all callbacks for a specific hook, or clear everything.
 * @param {string} [hookName]  omit to clear all hooks
 */
function clearHooks(hookName) {
  if (hookName) {
    hooks.delete(hookName);
  } else {
    hooks.clear();
  }
}

/**
 * List registered hook names.
 * @returns {string[]}
 */
function listHooks() {
  return Array.from(hooks.keys());
}

module.exports = { registerHook, runHook, clearHooks, listHooks };
