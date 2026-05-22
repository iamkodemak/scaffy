/**
 * Plugin Manager
 * Allows registration and execution of scaffy plugins that can hook into the scaffolding lifecycle.
 */

const plugins = new Map();

const VALID_HOOKS = ['beforeScaffold', 'afterScaffold', 'beforeRender', 'afterRender'];

/**
 * Register a plugin with the plugin manager.
 * @param {string} name - Unique plugin name
 * @param {object} plugin - Plugin object with hook functions
 */
function registerPlugin(name, plugin) {
  if (!name || typeof name !== 'string') {
    throw new Error('Plugin name must be a non-empty string');
  }
  if (!plugin || typeof plugin !== 'object') {
    throw new Error('Plugin must be an object');
  }

  const hooks = Object.keys(plugin);
  for (const hook of hooks) {
    if (!VALID_HOOKS.includes(hook)) {
      throw new Error(`Invalid hook "${hook}". Valid hooks: ${VALID_HOOKS.join(', ')}`);
    }
    if (typeof plugin[hook] !== 'function') {
      throw new Error(`Hook "${hook}" must be a function`);
    }
  }

  if (plugins.has(name)) {
    throw new Error(`Plugin "${name}" is already registered`);
  }

  plugins.set(name, plugin);
}

/**
 * Execute all registered plugins for a given hook.
 * @param {string} hook - The lifecycle hook name
 * @param {object} context - Context passed to each plugin hook
 * @returns {Promise<object>} - Potentially mutated context
 */
async function runHook(hook, context = {}) {
  if (!VALID_HOOKS.includes(hook)) {
    throw new Error(`Unknown hook: "${hook}"`);
  }

  let ctx = { ...context };
  for (const [, plugin] of plugins) {
    if (typeof plugin[hook] === 'function') {
      ctx = (await plugin[hook](ctx)) || ctx;
    }
  }
  return ctx;
}

/**
 * Remove a registered plugin by name.
 * @param {string} name
 */
function unregisterPlugin(name) {
  if (!plugins.has(name)) {
    throw new Error(`Plugin "${name}" is not registered`);
  }
  plugins.delete(name);
}

/**
 * List all registered plugin names.
 * @returns {string[]}
 */
function listPlugins() {
  return Array.from(plugins.keys());
}

/**
 * Clear all registered plugins (useful for testing).
 */
function clearPlugins() {
  plugins.clear();
}

module.exports = { registerPlugin, unregisterPlugin, runHook, listPlugins, clearPlugins, VALID_HOOKS };
