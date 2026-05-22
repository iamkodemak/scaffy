const fs = require('fs');
const path = require('path');

const DEFAULT_CONFIG_FILENAME = 'scaffy.config.json';

const defaultConfig = {
  templatesDir: null,
  pluginsDir: null,
  defaultTemplate: null,
  variables: {},
  outputDir: process.cwd(),
};

/**
 * Searches for a config file starting from the given directory up to the root.
 * @param {string} startDir
 * @returns {string|null} Resolved path to config file or null
 */
function findConfigFile(startDir = process.cwd()) {
  let current = path.resolve(startDir);
  while (true) {
    const candidate = path.join(current, DEFAULT_CONFIG_FILENAME);
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

/**
 * Loads and parses a scaffy config file.
 * @param {string} filePath Absolute path to the config file
 * @returns {object} Merged config object
 */
function loadConfigFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Config file not found: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to parse config file at ${filePath}: ${err.message}`);
  }
  return mergeConfig(defaultConfig, parsed);
}

/**
 * Merges user config over the default config (shallow merge with variables deep merge).
 * @param {object} base
 * @param {object} overrides
 * @returns {object}
 */
function mergeConfig(base, overrides) {
  return {
    ...base,
    ...overrides,
    variables: { ...base.variables, ...(overrides.variables || {}) },
  };
}

/**
 * Resolves config: loads from explicit path, auto-discovered path, or returns defaults.
 * @param {string|null} explicitPath
 * @returns {object}
 */
function resolveConfig(explicitPath = null) {
  const filePath = explicitPath || findConfigFile();
  if (!filePath) return { ...defaultConfig };
  return loadConfigFile(filePath);
}

module.exports = { findConfigFile, loadConfigFile, mergeConfig, resolveConfig, DEFAULT_CONFIG_FILENAME };
