/**
 * Minimal CLI argument parser for scaffy.
 * Supports flags of the form:
 *   --template <name>
 *   --output <dir>
 *   --config <file>
 *   --var key=value  (repeatable)
 */

function parseArgs(argv = process.argv.slice(2)) {
  const result = {
    template: null,
    output: null,
    config: null,
    vars: {},
    command: null,
  };

  const positional = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--template' || arg === '-t') {
      result.template = argv[++i] || null;
    } else if (arg === '--output' || arg === '-o') {
      result.output = argv[++i] || null;
    } else if (arg === '--config' || arg === '-c') {
      result.config = argv[++i] || null;
    } else if (arg === '--var' || arg === '-v') {
      const pair = argv[++i] || '';
      const eqIdx = pair.indexOf('=');
      if (eqIdx !== -1) {
        const key = pair.slice(0, eqIdx).trim();
        const value = pair.slice(eqIdx + 1).trim();
        if (key) result.vars[key] = value;
      }
    } else if (!arg.startsWith('-')) {
      positional.push(arg);
    }
  }

  if (positional.length > 0) {
    result.command = positional[0];
    if (positional[1] && !result.template) {
      result.template = positional[1];
    }
  }

  return result;
}

module.exports = { parseArgs };
