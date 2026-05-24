/**
 * envCommand.js
 * CLI command for managing scaffold env profiles.
 * Usage:
 *   scaffy env add <profile> --vars key=value,...
 *   scaffy env remove <profile>
 *   scaffy env list
 *   scaffy env use <profile>
 */

const {
  registerProfile,
  removeProfile,
  setActiveProfile,
  getActiveProfile,
  listProfiles,
} = require('../scaffold/scaffoldEnvManager');

function parseVarPairs(varStrings = []) {
  const result = {};
  for (const pair of varStrings) {
    const idx = pair.indexOf('=');
    if (idx === -1) throw new Error(`Invalid variable format: "${pair}". Expected key=value`);
    const key = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    result[key] = value;
  }
  return result;
}

function envCommand(argv, output = console) {
  const [subcommand, name, ...rest] = argv;

  switch (subcommand) {
    case 'add': {
      if (!name) { output.error('Profile name required'); return 1; }
      const varFlags = rest.filter(r => !r.startsWith('--'));
      const vars = parseVarPairs(varFlags);
      registerProfile(name, vars);
      output.log(`Profile "${name}" registered with ${Object.keys(vars).length} variable(s).`);
      return 0;
    }
    case 'remove': {
      if (!name) { output.error('Profile name required'); return 1; }
      removeProfile(name);
      output.log(`Profile "${name}" removed.`);
      return 0;
    }
    case 'use': {
      if (!name) { output.error('Profile name required'); return 1; }
      setActiveProfile(name);
      output.log(`Active profile set to "${name}".`);
      return 0;
    }
    case 'list': {
      const all = listProfiles();
      const active = getActiveProfile();
      if (all.length === 0) { output.log('No profiles registered.'); return 0; }
      output.log('Registered profiles:');
      for (const p of all) output.log(`  ${p === active ? '*' : ' '} ${p}`);
      return 0;
    }
    default:
      output.error(`Unknown env subcommand: "${subcommand}". Use add, remove, use, or list.`);
      return 1;
  }
}

module.exports = { envCommand, parseVarPairs };
