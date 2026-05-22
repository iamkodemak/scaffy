/**
 * variables/index.js
 * Public API for the variable resolution feature.
 */

const { resolveVariables, mergeVariables, validateRequiredVars, BUILT_IN_VARS } = require('./variableResolver');
const { promptForVariables } = require('./variablePrompt');

/**
 * High-level helper: resolves variables, prompting interactively for any
 * that are missing when interactive mode is enabled.
 *
 * @param {object} options
 * @param {object} options.defaults
 * @param {object} options.configVars
 * @param {object} options.cliVars
 * @param {string[]} options.required
 * @param {boolean} [options.interactive=false]
 * @returns {Promise<object>} fully resolved variable map
 */
async function resolveWithPrompt({
  defaults = {},
  configVars = {},
  cliVars = {},
  required = [],
  interactive = false,
} = {}) {
  const { BUILT_IN_VARS: builtIns } = require('./variableResolver');
  const builtInValues = Object.fromEntries(
    Object.entries(builtIns).map(([k, fn]) => [k, fn()])
  );
  const partial = { ...builtInValues, ...defaults, ...configVars, ...cliVars };
  const { missing } = validateRequiredVars(required, partial);

  let prompted = {};
  if (interactive && missing.length > 0) {
    prompted = await promptForVariables(missing, defaults);
  }

  return resolveVariables({
    defaults,
    configVars,
    cliVars: { ...cliVars, ...prompted },
    required,
  });
}

module.exports = {
  resolveVariables,
  mergeVariables,
  validateRequiredVars,
  promptForVariables,
  resolveWithPrompt,
  BUILT_IN_VARS,
};
