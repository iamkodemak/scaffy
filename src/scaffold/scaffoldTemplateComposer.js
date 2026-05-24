/**
 * scaffoldTemplateComposer.js
 * Compose multiple templates together into a single scaffold run.
 */

const { getTemplate } = require('../templates/templateRegistry');
const { resolveAlias } = require('./scaffoldTemplateAlias');

const compositions = new Map();

/**
 * Register a named composition of templates.
 * @param {string} name - Composition name
 * @param {string[]} templateNames - Ordered list of template names or aliases
 */
function registerComposition(name, templateNames) {
  if (!name || typeof name !== 'string') throw new Error('Composition name must be a non-empty string');
  if (!Array.isArray(templateNames) || templateNames.length === 0) {
    throw new Error('templateNames must be a non-empty array');
  }
  compositions.set(name, [...templateNames]);
}

/**
 * Remove a registered composition.
 * @param {string} name
 */
function removeComposition(name) {
  compositions.delete(name);
}

/**
 * Check if a composition exists.
 * @param {string} name
 * @returns {boolean}
 */
function hasComposition(name) {
  return compositions.has(name);
}

/**
 * List all registered composition names.
 * @returns {string[]}
 */
function listCompositions() {
  return Array.from(compositions.keys());
}

/**
 * Resolve a composition into an ordered array of template objects.
 * Aliases are resolved before lookup.
 * @param {string} name
 * @returns {{ name: string, template: object }[]}
 */
function resolveComposition(name) {
  if (!compositions.has(name)) {
    throw new Error(`Composition "${name}" is not registered`);
  }
  const templateNames = compositions.get(name);
  return templateNames.map((rawName) => {
    const resolved = resolveAlias(rawName);
    const template = getTemplate(resolved);
    if (!template) throw new Error(`Template "${resolved}" not found (from "${rawName}")`);
    return { name: resolved, template };
  });
}

/**
 * Merge files from multiple templates, later templates override earlier ones
 * when file paths collide.
 * @param {string} name
 * @returns {{ files: object, variables: object }}
 */
function composeTemplates(name) {
  const resolved = resolveComposition(name);
  const mergedFiles = {};
  const mergedVariables = {};

  for (const { template } of resolved) {
    if (template.files) Object.assign(mergedFiles, template.files);
    if (template.variables) Object.assign(mergedVariables, template.variables);
  }

  return { files: mergedFiles, variables: mergedVariables };
}

/**
 * Clear all registered compositions (useful for testing).
 */
function clearCompositions() {
  compositions.clear();
}

module.exports = {
  registerComposition,
  removeComposition,
  hasComposition,
  listCompositions,
  resolveComposition,
  composeTemplates,
  clearCompositions,
};
