const { runCli } = require('../cliRunner');

jest.mock('../../templates/templateRegistry', () => ({
  loadBuiltInTemplates: jest.fn().mockResolvedValue(undefined),
  getTemplate: jest.fn(),
}));
jest.mock('../../templates/templateRenderer', () => ({
  renderTemplateFiles: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../plugins/loadBuiltInPlugins', () => ({
  loadBuiltInPlugins: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../config/configLoader', () => ({
  resolveConfig: jest.fn().mockResolvedValue({ defaultVars: {} }),
}));
jest.mock('../../config/configValidator', () => ({
  validateConfig: jest.fn((c) => c),
}));

const { getTemplate } = require('../../templates/templateRegistry');
const { renderTemplateFiles } = require('../../templates/templateRenderer');

describe('runCli', () => {
  beforeEach(() => jest.clearAllMocks());

  it('throws when no template name is provided', async () => {
    await expect(runCli({})).rejects.toThrow('A template name is required');
  });

  it('throws when the requested template does not exist', async () => {
    getTemplate.mockReturnValue(null);
    await expect(runCli({ template: 'ghost' })).rejects.toThrow('Template "ghost" not found');
  });

  it('calls renderTemplateFiles with merged vars and resolved output dir', async () => {
    const fakeTemplate = { name: 'express', defaultVars: { port: '3000' } };
    getTemplate.mockReturnValue(fakeTemplate);

    await runCli({ template: 'express', output: '/tmp/out', vars: { author: 'Alice' } });

    expect(renderTemplateFiles).toHaveBeenCalledWith(
      fakeTemplate,
      { port: '3000', author: 'Alice' },
      '/tmp/out'
    );
  });

  it('uses cwd as output dir when --output is omitted', async () => {
    const fakeTemplate = { name: 'express', defaultVars: {} };
    getTemplate.mockReturnValue(fakeTemplate);

    await runCli({ template: 'express' });

    const [, , outputDir] = renderTemplateFiles.mock.calls[0];
    expect(outputDir).toBe(process.cwd());
  });
});
