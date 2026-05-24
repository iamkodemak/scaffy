/**
 * validateTemplateCommand.js
 * CLI command to validate a template definition from a JSON file.
 */

const fs = require('fs');
const path = require('path');
const { validateTemplate } = require('../scaffold/scaffoldTemplateValidator');

/**
 * Loads and parses a JSON file from the given file path.
 * @param {string} filePath
 * @returns {object}
 */
function loadTemplateFile(filePath) {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }
  const raw = fs.readFileSync(resolved, 'utf8');
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`Failed to parse JSON from: ${resolved}`);
  }
}

/**
 * Executes the validate-template CLI command.
 * @param {string[]} args - CLI arguments after the command name
 * @param {{ out?: function }} options
 */
function validateTemplateCommand(args, options = {}) {
  const out = options.out || console.log;
  const err = options.err || console.error;

  const filePath = args[0];
  if (!filePath) {
    err('Usage: scaffy validate-template <template-file.json>');
    return { success: false, errors: ['No file path provided'] };
  }

  let template;
  try {
    template = loadTemplateFile(filePath);
  } catch (e) {
    err(`Error: ${e.message}`);
    return { success: false, errors: [e.message] };
  }

  const { valid, errors } = validateTemplate(template);

  if (valid) {
    out(`✔ Template "${template.name}" is valid.`);
    return { success: true, errors: [] };
  }

  err(`✖ Template validation failed with ${errors.length} error(s):`);
  errors.forEach((e, i) => err(`  ${i + 1}. ${e}`));
  return { success: false, errors };
}

module.exports = { validateTemplateCommand, loadTemplateFile };
