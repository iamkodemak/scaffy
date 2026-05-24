/**
 * pluginLifecycleValidator.js
 * Validates that a plugin object conforms to the expected interface.
 */

const KNOWN_LIFECYCLES = [
  'onBeforeScaffold',
  'onAfterScaffold',
  'onScaffoldError',
];

const REQUIRED_FIELDS = ['name'];

/**
 * Validates a plugin definition.
 * @param {object} plugin
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validatePlugin(plugin) {
  const errors = [];

  if (!plugin || typeof plugin !== 'object') {
    return { valid: false, errors: ['Plugin must be a non-null object.'] };
  }

  for (const field of REQUIRED_FIELDS) {
    if (!plugin[field] || typeof plugin[field] !== 'string') {
      errors.push(`Plugin is missing required string field: "${field}".`);
    }
  }

  for (const lifecycle of KNOWN_LIFECYCLES) {
    if (lifecycle in plugin && typeof plugin[lifecycle] !== 'function') {
      errors.push(`Plugin field "${lifecycle}" must be a function if provided.`);
    }
  }

  const unknownKeys = Object.keys(plugin).filter(
    (k) => !REQUIRED_FIELDS.includes(k) && !KNOWN_LIFECYCLES.includes(k)
  );
  if (unknownKeys.length > 0) {
    errors.push(`Plugin has unrecognised fields: ${unknownKeys.join(', ')}.`);
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validatePlugin, KNOWN_LIFECYCLES };
