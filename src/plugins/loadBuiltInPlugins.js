/**
 * Registers all built-in scaffy plugins with the plugin manager.
 * Called once during CLI/API initialization.
 */

const { registerPlugin, listPlugins } = require('./pluginManager');
const { loggerPlugin, outputNormalizerPlugin, timestampPlugin } = require('./builtInPlugins');

const BUILT_IN_PLUGINS = [
  { name: 'scaffy:logger', plugin: loggerPlugin },
  { name: 'scaffy:outputNormalizer', plugin: outputNormalizerPlugin },
  { name: 'scaffy:timestamp', plugin: timestampPlugin },
];

/**
 * Load all built-in plugins, skipping any already registered.
 */
function loadBuiltInPlugins() {
  const existing = new Set(listPlugins());
  for (const { name, plugin } of BUILT_IN_PLUGINS) {
    if (!existing.has(name)) {
      registerPlugin(name, plugin);
    }
  }
}

module.exports = { loadBuiltInPlugins, BUILT_IN_PLUGINS };
