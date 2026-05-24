/**
 * scaffoldTemplateValidator.js
 * Validates template definitions before registration or use.
 */

const REQUIRED_FIELDS = ['name', 'files'];
const VALID_VARIABLE_TYPES = ['string', 'number', 'boolean'];

function validateTemplateName(name) {
  if (typeof name !== 'string' || name.trim().length === 0) {
    return 'Template name must be a non-empty string';
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    return 'Template name may only contain letters, numbers, hyphens, and underscores';
  }
  return null;
}

function validateTemplateFiles(files) {
  if (!Array.isArray(files) || files.length === 0) {
    return 'Template must define at least one file entry';
  }
  for (const file of files) {
    if (typeof file.path !== 'string' || file.path.trim().length === 0) {
      return 'Each template file entry must have a non-empty "path" string';
    }
    if (typeof file.content !== 'string') {
      return `Template file "${file.path}" must have a string "content" field`;
    }
  }
  return null;
}

function validateTemplateVariables(variables) {
  if (variables === undefined) return null;
  if (!Array.isArray(variables)) {
    return '"variables" must be an array';
  }
  for (const v of variables) {
    if (typeof v.name !== 'string' || v.name.trim().length === 0) {
      return 'Each variable must have a non-empty "name" string';
    }
    if (v.type !== undefined && !VALID_VARIABLE_TYPES.includes(v.type)) {
      return `Variable "${v.name}" has invalid type "${v.type}". Must be one of: ${VALID_VARIABLE_TYPES.join(', ')}`;
    }
  }
  return null;
}

/**
 * Validates a template definition object.
 * @param {object} template
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateTemplate(template) {
  const errors = [];

  if (!template || typeof template !== 'object') {
    return { valid: false, errors: ['Template must be a non-null object'] };
  }

  for (const field of REQUIRED_FIELDS) {
    if (!(field in template)) {
      errors.push(`Missing required field: "${field}"`);
    }
  }

  const nameError = validateTemplateName(template.name);
  if (nameError) errors.push(nameError);

  const filesError = validateTemplateFiles(template.files);
  if (filesError) errors.push(filesError);

  const varsError = validateTemplateVariables(template.variables);
  if (varsError) errors.push(varsError);

  return { valid: errors.length === 0, errors };
}

module.exports = { validateTemplate, validateTemplateName, validateTemplateFiles, validateTemplateVariables };
