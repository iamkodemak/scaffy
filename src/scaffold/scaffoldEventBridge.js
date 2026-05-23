/**
 * scaffoldEventBridge.js
 * Wires scaffold lifecycle hooks into the event emitter so external
 * consumers can subscribe without touching internal hook manager.
 */

const { emit } = require('./scaffoldEvents');
const { registerHook } = require('../hooks/hookManager');

let bridgeRegistered = false;

function registerEventBridge() {
  if (bridgeRegistered) return;

  registerHook('beforeScaffold', (ctx) => emit('scaffold:start', ctx));
  registerHook('afterScaffold', (ctx) => emit('scaffold:complete', ctx));
  registerHook('onScaffoldError', (ctx) => emit('scaffold:error', ctx));
  registerHook('beforeFileWrite', (ctx) => emit('file:write', ctx));
  registerHook('afterTemplateRender', (ctx) => emit('template:render', ctx));
  registerHook('beforeHookRun', (ctx) => emit('hook:run', ctx));
  registerHook('afterPluginApply', (ctx) => emit('plugin:apply', ctx));

  bridgeRegistered = true;
}

function resetBridge() {
  bridgeRegistered = false;
}

module.exports = { registerEventBridge, resetBridge };
