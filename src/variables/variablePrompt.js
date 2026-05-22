/**
 * variablePrompt.js
 * Prompts the user interactively for missing required variables.
 */

const readline = require('readline');

/**
 * Asks a single question via stdin/stdout.
 * @param {readline.Interface} rl
 * @param {string} question
 * @returns {Promise<string>}
 */
function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

/**
 * Prompts the user for each missing variable.
 * @param {string[]} missing - list of variable names to prompt for
 * @param {object} [defaults={}] - optional default values shown in prompt
 * @returns {Promise<object>} collected variable map
 */
async function promptForVariables(missing, defaults = {}) {
  if (!missing || missing.length === 0) return {};

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const collected = {};
  try {
    for (const key of missing) {
      const hint = defaults[key] ? ` (default: ${defaults[key]})` : '';
      const answer = await ask(rl, `  Enter value for "${key}"${hint}: `);
      collected[key] = answer || defaults[key] || '';
    }
  } finally {
    rl.close();
  }

  return collected;
}

module.exports = { promptForVariables };
