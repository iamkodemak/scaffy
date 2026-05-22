/**
 * Template Scaffolder
 * Writes rendered template files to the target directory
 */

const fs = require('fs');
const path = require('path');
const { getTemplate } = require('./templateRegistry');
const { renderTemplateFiles } = require('./templateRenderer');

/**
 * Scaffold a project from a named template
 * @param {string} templateName
 * @param {string} targetDir - Absolute path to output directory
 * @param {object} variables - Variables for template substitution
 */
async function scaffold(templateName, targetDir, variables = {}) {
  const template = getTemplate(templateName);
  if (!template) {
    throw new Error(`Template "${templateName}" not found. Run 'scaffy list' to see available templates.`);
  }

  const renderedFiles = renderTemplateFiles(template.files, variables);

  for (const file of renderedFiles) {
    const filePath = path.join(targetDir, file.path);
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(filePath)) {
      console.warn(`Skipping existing file: ${file.path}`);
      continue;
    }

    fs.writeFileSync(filePath, file.content, 'utf-8');
    console.log(`  created  ${file.path}`);
  }

  console.log(`\n✔ Project scaffolded from template "${templateName}" into ${targetDir}`);
}

module.exports = { scaffold };
