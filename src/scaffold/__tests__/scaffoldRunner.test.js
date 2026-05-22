const { scaffoldProject } = require('../scaffoldRunner');
const { getTemplate } = require('../../templates/templateRegistry');
const { renderTemplateFiles } = require('../../templates/templateRenderer');
const { resolveVariables } = require('../../variables/variableResolver');
const { resolveConfig } = require('../../config/configLoader');
const { validateConfig } = require('../../config/configValidator');
const { writeFiles } = require('../../output/outputWriter');

jest.mock('../../templates/templateRegistry');
jest.mock('../../templates/templateRenderer');
jest.mock('../../variables/variableResolver');
jest.mock('../../config/configLoader');
jest.mock('../../config/configValidator');
jest.mock('../../output/outputWriter');
jest.mock('../../hooks/hookManager', () => ({ listHooks: () => [] }));

describe('scaffoldProject', () => {
  const mockTemplate = { name: 'node-app', files: [], variables: {} };
  const mockVars = { projectName: 'my-app' };

  beforeEach(() => {
    jest.clearAllMocks();
    resolveConfig.mockResolvedValue({ defaultTemplate: 'node-app', variables: {} });
    validateConfig.mockReturnValue(true);
    getTemplate.mockReturnValue(mockTemplate);
    resolveVariables.mockResolvedValue(mockVars);
    renderTemplateFiles.mockReturnValue([{ path: 'index.js', content: '' }]);
    writeFiles.mockResolvedValue(undefined);
  });

  it('runs the scaffold pipeline and returns result', async () => {
    const result = await scaffoldProject({ templateName: 'node-app', outputDir: './out' });
    expect(result.files).toHaveLength(1);
    expect(result.variables).toEqual(mockVars);
    expect(result.dryRun).toBe(false);
  });

  it('throws if template is not found', async () => {
    getTemplate.mockReturnValue(null);
    await expect(scaffoldProject({ templateName: 'missing', outputDir: './out' }))
      .rejects.toThrow('Template "missing" not found.');
  });

  it('does not call writeFiles in dry run mode', async () => {
    await scaffoldProject({ templateName: 'node-app', outputDir: './out', dryRun: true });
    expect(writeFiles).not.toHaveBeenCalled();
  });
});
