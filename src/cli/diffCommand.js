const path = require('path');
const { diffFiles, formatDiff } = require('../scaffold/scaffoldDiff');
const { renderTemplateFiles } = require('../templates/templateRenderer');
const { getTemplate } = require('../templates/templateRegistry');
const { resolveVariables } = require('../variables/variableResolver');
const { loadConfigFile } = require('../config/configLoader');

/**
 * Runs the diff command: previews what files would change if scaffolding were applied.
 * @param {object} args  Parsed CLI args (templateName, outputDir, vars, config)
 * @param {object} io    { stdout, stderr }
 */
async function runDiffCommand(args, io = { stdout: process.stdout, stderr: process.stderr }) {
  const { templateName, outputDir = process.cwd(), vars = {}, config: configPath } = args;

  if (!templateName) {
    io.stderr.write('Error: template name is required for diff\n');
    return 1;
  }

  let config = {};
  if (configPath) {
    try {
      config = await loadConfigFile(configPath);
    } catch (err) {
      io.stderr.write(`Warning: could not load config: ${err.message}\n`);
    }
  }

  const template = getTemplate(templateName);
  if (!template) {
    io.stderr.write(`Error: template "${templateName}" not found\n`);
    return 1;
  }

  const mergedVars = resolveVariables(vars, config.variables || {}, template.defaults || {});

  let renderedFiles;
  try {
    renderedFiles = renderTemplateFiles(template.files || {}, mergedVars);
  } catch (err) {
    io.stderr.write(`Error rendering template: ${err.message}\n`);
    return 1;
  }

  const resolvedOutput = path.resolve(outputDir);
  const diffs = diffFiles(renderedFiles, resolvedOutput);

  const entries = Object.entries(diffs);
  if (entries.length === 0) {
    io.stdout.write('No files to diff.\n');
    return 0;
  }

  let hasChanges = false;
  for (const [filePath, diff] of entries) {
    if (diff.isNew || diff.additions > 0 || diff.deletions > 0) {
      hasChanges = true;
      io.stdout.write(formatDiff(filePath, diff) + '\n');
    }
  }

  if (!hasChanges) {
    io.stdout.write('All files are up to date. No changes detected.\n');
  }

  return 0;
}

module.exports = { runDiffCommand };
