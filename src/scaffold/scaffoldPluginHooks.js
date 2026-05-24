/**
 * scaffoldPluginHooks.js
 * Bridges plugin lifecycle with hook manager during scaffolding.
 */

const { listPlugins } = require('../plugins/pluginManager');
const { registerHook } = require('../hooks/hookManager');

let attached = false;

/**
 * Calls a named lifecycle method on all registered plugins, if defined.
 * @param {string} lifecycle - e.g. 'onBeforeScaffold', 'onAfterScaffold'
 * @param {object} context - scaffold context passed to each plugin
 */
async function invokePluginLifecycle(lifecycle, context) {
  const plugins = listPlugins();
  for (const plugin of plugins) {
    if (typeof plugin[lifecycle] === 'function') {
      await plugin[lifecycle](context);
    }
  }
}

/**
 * Registers hooks that delegate to plugin lifecycle methods.
 * Idempotent — only registers once per process unless reset.
 */
function attachPluginHooks() {
  if (attached) return;

  registerHook('beforeScaffold', async (context) => {
    await invokePluginLifecycle('onBeforeScaffold', context);
  });

  registerHook('afterScaffold', async (context) => {
    await invokePluginLifecycle('onAfterScaffold', context);
  });

  registerHook('onError', async (context) => {
    await invokePluginLifecycle('onScaffoldError', context);
  });

  attached = true;
}

function resetAttached() {
  attached = false;
}

module.exports = { attachPluginHooks, invokePluginLifecycle, resetAttached };
