const { runScaffoldPipeline } = require('../scaffoldPipeline');
const { validateScaffoldOptions } = require('../scaffoldValidator');
const { resolveVariables } = require('../../variables');
const { getTemplate } = require('../../templates/templateRegistry');
const { renderTemplateFiles } = require('../../templates/templateRenderer');
const { writeFiles } = require('../../output/outputWriter');
const { DryRunWriter } = require('../../output/dryRunWriter');

jest.mock('../scaffoldValidator');
jest.mock('../../variables');
jest.mock('../../templates/templateRegistry');
jest.mock('../../templates/templateRenderer');
jest.mock('../../output/outputWriter');
jest.mock('../../output/dryRunWriter');

const MOCK_TEMPLATE = {
  name: 'test-template',
  variables: { projectName: { required: true } },
  files: [{ path: 'index.js', content: 'console.log("{{projectName}}");' }],
};

const MOCK_RENDERED = [{ path: 'index.js', content: 'console.log("myapp");' }];

beforeEach(() => {
  jest.clearAllMocks();
  validateScaffoldOptions.mockReturnValue(true);
  getTemplate.mockReturnValue(MOCK_TEMPLATE);
  resolveVariables.mockResolvedValue({ projectName: 'myapp' });
  renderTemplateFiles.mockReturnValue(MOCK_RENDERED);
  writeFiles.mockResolvedValue();
});

describe('runScaffoldPipeline', () => {
  it('runs all pipeline steps in order', async () => {
    const ctx = await runScaffoldPipeline({ template: 'test-template', outputDir: '/out' });
    expect(validateScaffoldOptions).toHaveBeenCalledWith({ template: 'test-template', outputDir: '/out' });
    expect(getTemplate).toHaveBeenCalledWith('test-template');
    expect(resolveVariables).toHaveBeenCalled();
    expect(renderTemplateFiles).toHaveBeenCalledWith(MOCK_TEMPLATE.files, { projectName: 'myapp' });
    expect(writeFiles).toHaveBeenCalledWith(MOCK_RENDERED, '/out', { overwrite: false });
    expect(ctx.template).toBe('test-template');
  });

  it('uses DryRunWriter when dryRun is true', async () => {
    const mockWriteFiles = jest.fn().mockResolvedValue();
    DryRunWriter.mockImplementation(() => ({ writeFiles: mockWriteFiles }));

    await runScaffoldPipeline({ template: 'test-template', outputDir: '/out', dryRun: true });

    expect(DryRunWriter).toHaveBeenCalled();
    expect(mockWriteFiles).toHaveBeenCalledWith(MOCK_RENDERED, '/out');
    expect(writeFiles).not.toHaveBeenCalled();
  });

  it('returns context with renderedFiles attached', async () => {
    const ctx = await runScaffoldPipeline({ template: 'test-template', outputDir: '/out' });
    expect(ctx.renderedFiles).toEqual(MOCK_RENDERED);
  });
});
