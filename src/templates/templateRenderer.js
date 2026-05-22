/**
 * Template Renderer
 * Renders template files by substituting variables with user-provided values
 */

const VARIABLE_PATTERN = /\{\{\s*([\w.]+)\s*\}\}/g;

/**
 * Render a template string by replacing {{variable}} placeholders
 * @param {string} template - Raw template string
 * @param {object} variables - Key-value pairs for substitution
 * @returns {string} Rendered string
 */
function renderString(template, variables = {}) {
  return template.replace(VARIABLE_PATTERN, (match, key) => {
    const value = resolveKey(variables, key);
    if (value === undefined) {
      console.warn(`Warning: template variable "${key}" is not defined`);
      return match;
    }
    return String(value);
  });
}

/**
 * Resolve a dot-notation key from an object
 * @param {object} obj
 * @param {string} key - e.g. "author.name"
 * @returns {*}
 */
function resolveKey(obj, key) {
  return key.split('.').reduce((acc, part) => {
    if (acc === null || acc === undefined) return undefined;
    return acc[part];
  }, obj);
}

/**
 * Render all files in a template definition
 * @param {object[]} files - Array of { path, content } objects
 * @param {object} variables
 * @returns {object[]} Rendered files with substituted paths and content
 */
function renderTemplateFiles(files, variables = {}) {
  return files.map((file) => ({
    path: renderString(file.path, variables),
    content: renderString(file.content, variables),
  }));
}

module.exports = { renderString, renderTemplateFiles, resolveKey };
