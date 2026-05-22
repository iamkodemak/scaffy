/**
 * scaffoldPipeline.js
 * Orchestrates the ordered steps of the scaffold process.
 */

const { createScaffoldContext, patchScaffoldContext } = require('./scaffoldContext');
const { validateScaffoldOptions } = require('./scaffoldValidator');
const { resolveVariables } = require('../variables');
const { getTemplate } = require('../templates/templateRegistry');
const { renderTemplateFiles } = require('../templates/templateRenderer');
const { writeFiles } = require('../output/outputWriter');
const { DryRunWriter } = require('../output/dryRunWriter');

/**
 * Runs the full scaffold pipeline.
 * @param {object} options - Raw scaffold options
 * @param {object} [extraVars={}] - Additional variables (e.g. from CLI flags)
 * @returns {Promise<object>} Final scaffold context
 */
async function runScaffoldPipeline(options, extraVars = {}) {
  validateScaffoldOptions(options);

  const template = getTemplate(options.template);
  const resolvedVars = await resolveVariables(template.variables || {}, extraVars);

  let ctx = createScaffoldContext(options, resolvedVars);

  const renderedFiles = renderTemplateFiles(template.files, ctx.variables);

  ctx = patchScaffoldContext(ctx, { renderedFiles });

  if (ctx.dryRun) {
    const writer = new DryRunWriter();
    await writer.writeFiles(renderedFiles, ctx.outputDir);
  } else {
    await writeFiles(renderedFiles, ctx.outputDir, { overwrite: ctx.overwrite });
  }

  return ctx;
}

module.exports = { runScaffoldPipeline };
