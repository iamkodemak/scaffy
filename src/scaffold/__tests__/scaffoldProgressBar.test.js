const { renderBar, renderStepList, renderProgress } = require('../scaffoldProgressBar');

describe('renderBar', () => {
  it('renders full bar at 100%', () => {
    const bar = renderBar(100, 10);
    expect(bar).toBe('[██████████] 100%');
  });

  it('renders empty bar at 0%', () => {
    const bar = renderBar(0, 10);
    expect(bar).toBe('[░░░░░░░░░░] 0%');
  });

  it('renders partial bar at 50%', () => {
    const bar = renderBar(50, 10);
    expect(bar).toBe('[█████░░░░░] 50%');
  });

  it('throws on invalid percent', () => {
    expect(() => renderBar(-1)).toThrow();
    expect(() => renderBar(101)).toThrow();
    expect(() => renderBar('bad')).toThrow();
  });
});

describe('renderStepList', () => {
  it('renders all step statuses', () => {
    const steps = [
      { label: 'validate', status: 'done' },
      { label: 'render', status: 'running' },
      { label: 'write', status: 'pending' },
      { label: 'hooks', status: 'failed', error: 'hook failed' },
    ];
    const output = renderStepList(steps);
    expect(output).toContain('● validate');
    expect(output).toContain('◑ render');
    expect(output).toContain('○ write');
    expect(output).toContain('✗ hooks (hook failed)');
  });

  it('throws on non-array', () => {
    expect(() => renderStepList(null)).toThrow();
  });
});

describe('renderProgress', () => {
  it('writes output and returns string', () => {
    const steps = [
      { label: 'a', status: 'done' },
      { label: 'b', status: 'pending' },
    ];
    const summary = { percent: 50, done: 1, total: 2 };
    const chunks = [];
    const fakeOut = { write: d => chunks.push(d) };
    const result = renderProgress(steps, summary, fakeOut);
    expect(chunks.join('')).toContain('50%');
    expect(result).toContain('1/2 steps');
  });
});
