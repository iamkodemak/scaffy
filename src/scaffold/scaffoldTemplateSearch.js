/**
 * scaffoldTemplateSearch.js
 * Provides fuzzy/keyword search over registered templates by name, tags, and description.
 */

const { listTemplates } = require('../templates/templateRegistry');
const { getTags } = require('./scaffoldTagManager');

/**
 * Normalize a string for comparison.
 * @param {string} str
 * @returns {string}
 */
function normalize(str) {
  return String(str || '').toLowerCase().trim();
}

/**
 * Score a template entry against a query.
 * Returns a numeric score (higher = better match). 0 means no match.
 * @param {string} templateName
 * @param {object} templateMeta  - { description, ... }
 * @param {string[]} tags
 * @param {string} query
 * @returns {number}
 */
function scoreTemplate(templateName, templateMeta, tags, query) {
  const q = normalize(query);
  if (!q) return 1;

  let score = 0;
  const name = normalize(templateName);
  const description = normalize(templateMeta && templateMeta.description);

  if (name === q) score += 10;
  else if (name.startsWith(q)) score += 6;
  else if (name.includes(q)) score += 3;

  if (description.includes(q)) score += 2;

  const normalizedTags = (tags || []).map(normalize);
  if (normalizedTags.includes(q)) score += 4;
  else if (normalizedTags.some((t) => t.includes(q))) score += 2;

  return score;
}

/**
 * Search templates by a query string.
 * @param {string} query
 * @param {{ limit?: number }} [options]
 * @returns {Array<{ name: string, score: number, description?: string, tags: string[] }>}
 */
function searchTemplates(query, options = {}) {
  const { limit = 10 } = options;
  const templates = listTemplates();

  const results = templates
    .map((name) => {
      const tags = getTags(name) || [];
      // templateMeta may carry a description if set; gracefully default.
      const score = scoreTemplate(name, {}, tags, query);
      return { name, score, tags };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return results;
}

/**
 * Return all templates whose tags intersect with the provided tag list.
 * @param {string[]} filterTags
 * @returns {string[]}
 */
function filterByTags(filterTags) {
  if (!Array.isArray(filterTags) || filterTags.length === 0) return [];
  const normalized = filterTags.map(normalize);
  return listTemplates().filter((name) => {
    const tags = (getTags(name) || []).map(normalize);
    return normalized.some((t) => tags.includes(t));
  });
}

module.exports = { searchTemplates, filterByTags, scoreTemplate };
