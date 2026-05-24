/**
 * scaffoldTagManager.js
 * Manages tags for scaffold templates, enabling filtering and categorization.
 */

const tagRegistry = new Map();

/**
 * Register tags for a given template name.
 * @param {string} templateName
 * @param {string[]} tags
 */
function registerTags(templateName, tags) {
  if (!templateName || typeof templateName !== 'string') {
    throw new Error('templateName must be a non-empty string');
  }
  if (!Array.isArray(tags)) {
    throw new Error('tags must be an array');
  }
  const normalized = tags.map(t => t.trim().toLowerCase()).filter(Boolean);
  tagRegistry.set(templateName, normalized);
}

/**
 * Get tags for a given template name.
 * @param {string} templateName
 * @returns {string[]}
 */
function getTags(templateName) {
  return tagRegistry.get(templateName) || [];
}

/**
 * Find all template names that include ALL of the given tags.
 * @param {string[]} tags
 * @returns {string[]}
 */
function findByTags(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return [];
  const normalized = tags.map(t => t.trim().toLowerCase());
  const results = [];
  for (const [templateName, templateTags] of tagRegistry.entries()) {
    if (normalized.every(tag => templateTags.includes(tag))) {
      results.push(templateName);
    }
  }
  return results;
}

/**
 * List all unique tags across all registered templates.
 * @returns {string[]}
 */
function listAllTags() {
  const all = new Set();
  for (const tags of tagRegistry.values()) {
    tags.forEach(t => all.add(t));
  }
  return Array.from(all).sort();
}

/**
 * Remove tags for a given template.
 * @param {string} templateName
 */
function removeTags(templateName) {
  tagRegistry.delete(templateName);
}

/**
 * Clear all registered tags.
 */
function clearTags() {
  tagRegistry.clear();
}

module.exports = {
  registerTags,
  getTags,
  findByTags,
  listAllTags,
  removeTags,
  clearTags,
};
