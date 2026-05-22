/**
 * scaffoldContext.js
 * Creates and manages the context object passed through the scaffold pipeline.
 */

/**
 * Creates a scaffold context from options and resolved variables.
 * @param {object} options - Scaffold options (template, output, etc.)
 * @param {object} variables - Resolved variables
 * @returns {object} Scaffold context
 */
function createScaffoldContext(options, variables = {}) {
  if (!options || typeof options !== 'object') {
    throw new Error('options must be a non-null object');
  }

  return {
    template: options.template || null,
    outputDir: options.outputDir || process.cwd(),
    variables: { ...variables },
    dryRun: options.dryRun === true,
    overwrite: options.overwrite === true,
    hooks: options.hooks || {},
    plugins: options.plugins || [],
    meta: {
      createdAt: new Date().toISOString(),
      scaffyVersion: process.env.npm_package_version || 'unknown',
    },
  };
}

/**
 * Merges additional data into an existing context (immutably).
 * @param {object} context - Existing scaffold context
 * @param {object} patch - Fields to merge in
 * @returns {object} New scaffold context
 */
function patchScaffoldContext(context, patch = {}) {
  if (!context || typeof context !== 'object') {
    throw new Error('context must be a non-null object');
  }
  return {
    ...context,
    ...patch,
    variables: {
      ...context.variables,
      ...(patch.variables || {}),
    },
    meta: {
      ...context.meta,
      ...(patch.meta || {}),
    },
  };
}

module.exports = { createScaffoldContext, patchScaffoldContext };
