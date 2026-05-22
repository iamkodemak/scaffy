const { resolveConfig } = require('../config/configLoader');
const { validateConfig } = require('../config/configValidator');
const { loadBuiltInTemplates, getTemplate } = require('../templates/templateRegistry');
const { renderTemplateFiles } = require('../templates/templateRenderer');
const { loadBuiltInPlugins } = require('../plugins/loadBuiltInPlugins');
const path = require('path');

/**
 * Initialise all built-in resources (templates + plugins).
 */
async function bootstrap() {
  await loadBuiltInTemplates();
  await loadBuiltInPlugins();
}

/**
 * Run the scaffolding process from a parsed CLI args object.
 *
 * @param {object} args  - Parsed arguments (template, output, config, vars)
 * @returns {Promise<void>}
 */
async function runCli(args) {
  const { template: templateName, output, config: configPath, vars = {} } = args;

  if (!templateName) {
    throw new Error('A template name is required. Use --template <name>.');
  }

  await bootstrap();

  const rawConfig = await resolveConfig(configPath || null);
  const config = validateConfig(rawConfig);

  const template = getTemplate(templateName);
  if (!template) {
    throw new Error(`Template "${templateName}" not found. Run \`scaffy list\` to see available templates.`);
  }

  const mergedVars = Object.assign({}, config.defaultVars || {}, template.defaultVars || {}, vars);
  const outputDir = output ? path.resolve(output) : process.cwd();

  await renderTemplateFiles(template, mergedVars, outputDir);

  console.log(`✔  Scaffolded "${templateName}" into ${outputDir}`);
}

module.exports = { runCli, bootstrap };
