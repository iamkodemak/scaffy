/**
 * variableResolver.js
 * Resolves and validates template variables from multiple sources.
 */

const BUILT_IN_VARS = {
  year: () => new Date().getFullYear().toString(),
  date: () => new Date().toISOString().split('T')[0],
  timestamp: () => Date.now().toString(),
};

/**
 * Merges variable sources in priority order:
 * built-ins < defaults < config < cli overrides
 */
function mergeVariables(defaults = {}, configVars = {}, cliVars = {}) {
  const builtIns = Object.fromEntries(
    Object.entries(BUILT_IN_VARS).map(([k, fn]) => [k, fn()])
  );
  return { ...builtIns, ...defaults, ...configVars, ...cliVars };
}

/**
 * Validates that all required variable names are present in the resolved map.
 * @param {string[]} required - list of required variable names
 * @param {object} resolved - resolved variable map
 * @returns {{ valid: boolean, missing: string[] }}
 */
function validateRequiredVars(required = [], resolved = {}) {
  const missing = required.filter((key) => !(key in resolved) || resolved[key] === undefined);
  return { valid: missing.length === 0, missing };
}

/**
 * Resolves variables for a scaffold run.
 * @param {object} options
 * @param {object} options.defaults - template default variables
 * @param {object} options.configVars - variables from scaffy config file
 * @param {object} options.cliVars - variables passed via CLI flags
 * @param {string[]} options.required - required variable names
 * @returns {object} resolved variable map
 */
function resolveVariables({ defaults = {}, configVars = {}, cliVars = {}, required = [] } = {}) {
  const resolved = mergeVariables(defaults, configVars, cliVars);
  const { valid, missing } = validateRequiredVars(required, resolved);
  if (!valid) {
    throw new Error(`Missing required variables: ${missing.join(', ')}`);
  }
  return resolved;
}

module.exports = { mergeVariables, validateRequiredVars, resolveVariables, BUILT_IN_VARS };
