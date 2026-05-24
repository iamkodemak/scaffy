/**
 * scaffoldEnvManager.js
 * Manages environment variable injection into scaffold contexts.
 * Supports env profiles (e.g., development, production) and variable overrides.
 */

const profiles = {};
let activeProfile = 'default';

function registerProfile(name, vars = {}) {
  if (!name || typeof name !== 'string') throw new Error('Profile name must be a non-empty string');
  if (typeof vars !== 'object' || Array.isArray(vars)) throw new Error('Profile vars must be a plain object');
  profiles[name] = { ...vars };
}

function removeProfile(name) {
  delete profiles[name];
  if (activeProfile === name) activeProfile = 'default';
}

function setActiveProfile(name) {
  if (!profiles[name] && name !== 'default') throw new Error(`Profile "${name}" is not registered`);
  activeProfile = name;
}

function getActiveProfile() {
  return activeProfile;
}

function getProfileVars(name = activeProfile) {
  return { ...(profiles[name] || {}) };
}

function listProfiles() {
  return Object.keys(profiles);
}

/**
 * Resolves env vars for a scaffold run by merging:
 * 1. Active profile vars
 * 2. process.env entries prefixed with SCAFFY_
 * 3. Explicit overrides passed in
 */
function resolveEnvVars(overrides = {}) {
  const profileVars = getProfileVars();
  const processVars = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith('SCAFFY_')) {
      const stripped = key.slice(7).toLowerCase();
      processVars[stripped] = value;
    }
  }
  return { ...profileVars, ...processVars, ...overrides };
}

function resetEnvManager() {
  for (const key of Object.keys(profiles)) delete profiles[key];
  activeProfile = 'default';
}

module.exports = {
  registerProfile,
  removeProfile,
  setActiveProfile,
  getActiveProfile,
  getProfileVars,
  listProfiles,
  resolveEnvVars,
  resetEnvManager,
};
