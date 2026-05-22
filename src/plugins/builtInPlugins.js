/**
 * Built-in plugins bundled with scaffy.
 * These provide sensible defaults for common scaffolding tasks.
 */

const path = require('path');

/**
 * Logger plugin — logs lifecycle events to the console.
 */
const loggerPlugin = {
  beforeScaffold(ctx) {
    console.log(`[scaffy] Starting scaffold for template: ${ctx.templateName || 'unknown'}`);
    return ctx;
  },
  afterScaffold(ctx) {
    const count = ctx.filesWritten ? ctx.filesWritten.length : 0;
    console.log(`[scaffy] Scaffold complete. ${count} file(s) written.`);
    return ctx;
  },
};

/**
 * Output normalizer plugin — ensures outputDir is an absolute path.
 */
const outputNormalizerPlugin = {
  beforeScaffold(ctx) {
    if (ctx.outputDir && !path.isAbsolute(ctx.outputDir)) {
      return { ...ctx, outputDir: path.resolve(process.cwd(), ctx.outputDir) };
    }
    return ctx;
  },
};

/**
 * Timestamp injector plugin — injects a scaffoldedAt timestamp into context variables.
 */
const timestampPlugin = {
  beforeRender(ctx) {
    return {
      ...ctx,
      variables: {
        ...ctx.variables,
        scaffoldedAt: new Date().toISOString(),
      },
    };
  },
};

module.exports = { loggerPlugin, outputNormalizerPlugin, timestampPlugin };
