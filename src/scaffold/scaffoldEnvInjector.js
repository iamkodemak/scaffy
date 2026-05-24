/**
 * scaffoldEnvInjector.js
 * Attaches env variable resolution to the scaffold pipeline context.
 * Merges resolved env vars into context.variables before rendering.
 */

const { resolveEnvVars } = require('./scaffoldEnvManager');

let attached = false;

/**
 * Attaches the env injector to scaffold lifecycle hooks.
 * @param {object} hooks - hookManager instance with registerHook
 * @param {object} [options]
 * @param {object} [options.overrides] - explicit variable overrides
 */
function attachEnvInjector(hooks, options = {}) {
  if (attached) return;

  hooks.registerHook('beforeScaffold', (context) => {
    const envVars = resolveEnvVars(options.overrides || {});
    context.variables = { ...envVars, ...(context.variables || {}) };
  });

  attached = true;
}

function resetAttached() {
  attached = false;
}

module.exports = { attachEnvInjector, resetAttached };
