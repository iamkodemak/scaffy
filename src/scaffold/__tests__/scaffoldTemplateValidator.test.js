const {
  validateTemplate,
  validateTemplateName,
  validateTemplateFiles,
  validateTemplateVariables,
} = require('../scaffoldTemplateValidator');

describe('validateTemplateName', () => {
  it('returns null for valid names', () => {
    expect(validateTemplateName('my-template')).toBeNull();
    expect(validateTemplateName('express_app')).toBeNull();
    expect(validateTemplateName('App123')).toBeNull();
  });

  it('returns error for empty string', () => {
    expect(validateTemplateName('')).toMatch(/non-empty/);
    expect(validateTemplateName('   ')).toMatch(/non-empty/);
  });

  it('returns error for invalid characters', () => {
    expect(validateTemplateName('my template')).toMatch(/only contain/);
    expect(validateTemplateName('my/template')).toMatch(/only contain/);
  });

  it('returns error for non-string', () => {
    expect(validateTemplateName(42)).toMatch(/non-empty string/);
  });
});

describe('validateTemplateFiles', () => {
  it('returns null for valid files array', () => {
    expect(validateTemplateFiles([{ path: 'index.js', content: '' }])).toBeNull();
  });

  it('returns error for empty array', () => {
    expect(validateTemplateFiles([])).toMatch(/at least one/);
  });

  it('returns error for non-array', () => {
    expect(validateTemplateFiles('file.js')).toMatch(/at least one/);
  });

  it('returns error if a file entry has no path', () => {
    expect(validateTemplateFiles([{ content: 'hello' }])).toMatch(/path/);
  });

  it('returns error if content is not a string', () => {
    expect(validateTemplateFiles([{ path: 'a.js', content: 123 }])).toMatch(/content/);
  });
});

describe('validateTemplateVariables', () => {
  it('returns null when variables is undefined', () => {
    expect(validateTemplateVariables(undefined)).toBeNull();
  });

  it('returns null for valid variables', () => {
    expect(validateTemplateVariables([{ name: 'appName', type: 'string' }])).toBeNull();
  });

  it('returns error for non-array', () => {
    expect(validateTemplateVariables({})).toMatch(/must be an array/);
  });

  it('returns error for invalid type', () => {
    expect(validateTemplateVariables([{ name: 'x', type: 'object' }])).toMatch(/invalid type/);
  });

  it('returns error for variable with no name', () => {
    expect(validateTemplateVariables([{ type: 'string' }])).toMatch(/non-empty/);
  });
});

describe('validateTemplate', () => {
  const valid = {
    name: 'my-app',
    files: [{ path: 'index.js', content: 'console.log("hi")' }],
    variables: [{ name: 'port', type: 'number' }],
  };

  it('returns valid for a correct template', () => {
    const result = validateTemplate(valid);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns errors for null input', () => {
    const result = validateTemplate(null);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/non-null object/);
  });

  it('collects multiple errors', () => {
    const result = validateTemplate({ files: [] });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });

  it('passes without optional variables field', () => {
    const result = validateTemplate({ name: 'simple', files: [{ path: 'a.txt', content: '' }] });
    expect(result.valid).toBe(true);
  });
});
