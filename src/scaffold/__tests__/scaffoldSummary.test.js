const { formatScaffoldSummary, printScaffoldSummary } = require('../scaffoldSummary');

describe('formatScaffoldSummary', () => {
  const baseCtx = {
    template: 'express-api',
    outputDir: '/projects/myapp',
    dryRun: false,
    variables: { projectName: 'myapp', author: 'Alice' },
    renderedFiles: [
      { path: 'index.js', content: '' },
      { path: 'package.json', content: '' },
    ],
  };

  it('includes template name', () => {
    const summary = formatScaffoldSummary(baseCtx);
    expect(summary).toContain('express-api');
  });

  it('includes output directory', () => {
    const summary = formatScaffoldSummary(baseCtx);
    expect(summary).toContain('/projects/myapp');
  });

  it('includes file count', () => {
    const summary = formatScaffoldSummary(baseCtx);
    expect(summary).toContain('2');
  });

  it('includes variable keys', () => {
    const summary = formatScaffoldSummary(baseCtx);
    expect(summary).toContain('projectName');
    expect(summary).toContain('author');
  });

  it('shows dry-run indicator when dryRun is true', () => {
    const summary = formatScaffoldSummary({ ...baseCtx, dryRun: true });
    expect(summary.toLowerCase()).toContain('dry run');
  });

  it('handles missing renderedFiles gracefully', () => {
    const { renderedFiles, ...ctx } = baseCtx;
    const summary = formatScaffoldSummary(ctx);
    expect(summary).toContain('0');
  });
});

describe('printScaffoldSummary', () => {
  it('calls console.log with formatted summary', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    printScaffoldSummary({ template: 'base', outputDir: '/tmp', dryRun: false, variables: {}, renderedFiles: [] });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
