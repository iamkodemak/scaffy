/**
 * builtInHooks.js
 * Registers the built-in lifecycle hooks used by the scaffolding pipeline.
 *
 * Hook execution order:
 *   before:scaffold  → validate:scaffold → after:scaffold
 *   before:render    → after:render
 */

const { registerHook } = require('./hookManager');

function registerBuiltInHooks() {
  // Log scaffold start
  registerHook('before:scaffold', async (ctx) => {
    if (ctx.logger) {
      ctx.logger.info(`Scaffolding template: ${ctx.templateName || 'unknown'}`);
    }
  });

  // Basic validation gate
  registerHook('validate:scaffold', async (ctx) => {
    if (!ctx.templateName) {
      throw new Error('scaffold context is missing required field: templateName');
    }
    if (!ctx.outputDir) {
      throw new Error('scaffold context is missing required field: outputDir');
    }
  });

  // Log render start
  registerHook('before:render', async (ctx) => {
    if (ctx.logger) {
      ctx.logger.info(`Rendering ${ctx.files ? ctx.files.length : 0} file(s)`);
    }
  });

  // Log scaffold completion
  registerHook('after:scaffold', async (ctx) => {
    if (ctx.logger) {
      ctx.logger.info(`Scaffold complete → ${ctx.outputDir}`);
    }
  });
}

module.exports = { registerBuiltInHooks };
