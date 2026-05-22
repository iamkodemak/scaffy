const { resolveConfig } = require('../config/configLoader');
const { validateConfig } = require('../config/configValidator');
const { getTemplate } = require('../templates/templateRegistry');
const { renderTemplateFiles } = require('../templates/templateRenderer');
const { resolveVariables } = require('../variables/variableResolver');
const { writeFiles } = require('../output/outputWriter');
const { DryRunWriter } = require('../output/dryRunWriter');
const { listHooks } = require('../hooks/hookManager');

async function runHooks(event, context) {
  const hooks = listHooks(event);
  for (const hook of hooks) {
    await hook(context);
  }
}

async function scaffoldProject(options = {}) {
  const { templateName, outputDir, variables = {}, dryRun = false, configPath } = options;

  const config = await resolveConfig(configPath);
  validateConfig(config);

  const template = getTemplate(templateName || config.defaultTemplate);
  if (!template) {
    throw new Error(`Template "${templateName || config.defaultTemplate}" not found.`);
  }

  const mergedVars = await resolveVariables(variables, template.variables || {}, config.variables || {});

  const context = { template, variables: mergedVars, outputDir, config };
  await runHooks('before:scaffold', context);

  const renderedFiles = renderTemplateFiles(template.files, mergedVars);

  const writer = dryRun ? new DryRunWriter() : { writeFiles };
  await writer.writeFiles(renderedFiles, outputDir);

  await runHooks('after:scaffold', context);

  return { files: renderedFiles, variables: mergedVars, dryRun };
}

module.exports = { scaffoldProject };
