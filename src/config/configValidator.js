const fs = require('fs');

const VALID_KEYS = ['templatesDir', 'pluginsDir', 'defaultTemplate', 'variables', 'outputDir'];

/**
 * Validates a resolved config object.
 * @param {object} config
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateConfig(config) {
  const errors = [];

  if (typeof config !== 'object' || config === null) {
    return { valid: false, errors: ['Config must be a non-null object.'] };
  }

  const unknownKeys = Object.keys(config).filter((k) => !VALID_KEYS.includes(k));
  if (unknownKeys.length > 0) {
    errors.push(`Unknown config keys: ${unknownKeys.join(', ')}`);
  }

  if (config.templatesDir !== null && config.templatesDir !== undefined) {
    if (typeof config.templatesDir !== 'string') {
      errors.push('"templatesDir" must be a string path.');
    } else if (!fs.existsSync(config.templatesDir)) {
      errors.push(`"templatesDir" does not exist: ${config.templatesDir}`);
    }
  }

  if (config.pluginsDir !== null && config.pluginsDir !== undefined) {
    if (typeof config.pluginsDir !== 'string') {
      errors.push('"pluginsDir" must be a string path.');
    } else if (!fs.existsSync(config.pluginsDir)) {
      errors.push(`"pluginsDir" does not exist: ${config.pluginsDir}`);
    }
  }

  if (config.defaultTemplate !== null && config.defaultTemplate !== undefined) {
    if (typeof config.defaultTemplate !== 'string') {
      errors.push('"defaultTemplate" must be a string.');
    }
  }

  if (config.variables !== null && config.variables !== undefined) {
    if (typeof config.variables !== 'object' || Array.isArray(config.variables)) {
      errors.push('"variables" must be a plain object.');
    }
  }

  if (config.outputDir !== null && config.outputDir !== undefined) {
    if (typeof config.outputDir !== 'string') {
      errors.push('"outputDir" must be a string path.');
    }
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validateConfig, VALID_KEYS };
