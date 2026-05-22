/**
 * Template Registry
 * Manages available project templates for scaffy
 */

const path = require('path');
const fs = require('fs');

const BUILT_IN_TEMPLATES_DIR = path.join(__dirname, 'built-in');

const templateRegistry = new Map();

/**
 * Register a template with the registry
 * @param {string} name - Template name
 * @param {object} config - Template configuration
 */
function registerTemplate(name, config) {
  if (!name || typeof name !== 'string') {
    throw new Error('Template name must be a non-empty string');
  }
  if (!config || !config.description || !config.files) {
    throw new Error(`Template "${name}" must have description and files`);
  }
  templateRegistry.set(name, { name, ...config });
}

/**
 * Load all built-in templates from the templates directory
 */
function loadBuiltInTemplates() {
  if (!fs.existsSync(BUILT_IN_TEMPLATES_DIR)) return;
  const entries = fs.readdirSync(BUILT_IN_TEMPLATES_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const configPath = path.join(BUILT_IN_TEMPLATES_DIR, entry.name, 'template.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        registerTemplate(entry.name, config);
      }
    }
  }
}

/**
 * Get a template by name
 * @param {string} name
 * @returns {object|null}
 */
function getTemplate(name) {
  return templateRegistry.get(name) || null;
}

/**
 * List all registered templates
 * @returns {object[]}
 */
function listTemplates() {
  return Array.from(templateRegistry.values());
}

module.exports = { registerTemplate, loadBuiltInTemplates, getTemplate, listTemplates };
