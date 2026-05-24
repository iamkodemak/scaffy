/**
 * scaffoldTemplateAlias.js
 * Manages short alias names that map to full template identifiers.
 */

const aliases = new Map();

/**
 * Register an alias for a template name.
 * @param {string} alias
 * @param {string} templateName
 */
function registerAlias(alias, templateName) {
  if (!alias || typeof alias !== 'string') throw new Error('Alias must be a non-empty string');
  if (!templateName || typeof templateName !== 'string') throw new Error('templateName must be a non-empty string');
  aliases.set(alias, templateName);
}

/**
 * Remove a registered alias.
 * @param {string} alias
 * @returns {boolean} true if alias existed and was removed
 */
function removeAlias(alias) {
  return aliases.delete(alias);
}

/**
 * Resolve an alias to its template name.
 * Returns the alias itself if no mapping exists (pass-through).
 * @param {string} alias
 * @returns {string}
 */
function resolveAlias(alias) {
  return aliases.get(alias) ?? alias;
}

/**
 * Check whether an alias is registered.
 * @param {string} alias
 * @returns {boolean}
 */
function hasAlias(alias) {
  return aliases.has(alias);
}

/**
 * Return all registered aliases as a plain object { alias: templateName }.
 * @returns {Record<string, string>}
 */
function listAliases() {
  return Object.fromEntries(aliases);
}

/**
 * Clear all registered aliases (useful for testing).
 */
function clearAliases() {
  aliases.clear();
}

module.exports = {
  registerAlias,
  removeAlias,
  resolveAlias,
  hasAlias,
  listAliases,
  clearAliases,
};
