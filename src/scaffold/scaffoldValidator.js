const path = require('path');
const fs = require('fs');

const VALID_TEMPLATE_NAME = /^[a-zA-Z0-9_-]+$/;

function validateScaffoldOptions(options = {}) {
  const errors = [];

  if (!options.templateName && !options.configPath) {
    errors.push('Either templateName or configPath must be provided.');
  }

  if (options.templateName && !VALID_TEMPLATE_NAME.test(options.templateName)) {
    errors.push(`Invalid template name: "${options.templateName}". Only alphanumeric, dash, and underscore allowed.`);
  }

  if (!options.outputDir) {
    errors.push('outputDir is required.');
  } else {
    const resolved = path.resolve(options.outputDir);
    if (fs.existsSync(resolved) && !fs.statSync(resolved).isDirectory()) {
      errors.push(`outputDir "${options.outputDir}" exists but is not a directory.`);
    }
  }

  if (options.variables !== undefined && typeof options.variables !== 'object') {
    errors.push('variables must be a plain object.');
  }

  if (errors.length > 0) {
    throw new Error(`Scaffold validation failed:\n  - ${errors.join('\n  - ')}`);
  }

  return true;
}

module.exports = { validateScaffoldOptions };
