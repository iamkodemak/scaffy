const progress = require('../scaffoldProgress');

beforeEach(() => {
  progress.reset();
});

describe('setSteps / getSteps', () => {
  it('sets steps and returns copies', () => {
    progress.setSteps(['a', 'b', 'c']);
    const steps = progress.getSteps();
    expect(steps).toHaveLength(3);
    expect(steps[0]).toMatchObject({ index: 0, label: 'a', status: 'pending' });
  });

  it('throws on empty array', () => {
    expect(() => progress.setSteps([])).toThrow('non-empty array');
  });

  it('throws on non-array', () => {
    expect(() => progress.setSteps('bad')).toThrow();
  });
});

describe('start / complete / fail', () => {
  beforeEach(() => progress.setSteps(['step1', 'step2', 'step3']));

  it('marks step as running', () => {
    progress.start(0);
    expect(progress.getSteps()[0].status).toBe('running');
  });

  it('marks step as done', () => {
    progress.start(0);
    progress.complete(0);
    expect(progress.getSteps()[0].status).toBe('done');
  });

  it('marks step as failed with error', () => {
    progress.fail(1, new Error('oops'));
    const step = progress.getSteps()[1];
    expect(step.status).toBe('failed');
    expect(step.error).toBe('oops');
  });

  it('throws on invalid index', () => {
    expect(() => progress.start(99)).toThrow('Invalid step index');
    expect(() => progress.complete(-1)).toThrow('Invalid step index');
  });
});

describe('getSummary', () => {
  it('returns correct percentages and counts', () => {
    progress.setSteps(['a', 'b', 'c', 'd']);
    progress.complete(0);
    progress.complete(1);
    progress.fail(2, 'err');
    const s = progress.getSummary();
    expect(s.total).toBe(4);
    expect(s.done).toBe(2);
    expect(s.failed).toBe(1);
    expect(s.pending).toBe(1);
    expect(s.percent).toBe(50);
  });
});

describe('onUpdate', () => {
  it('calls callback when step changes', () => {
    const cb = jest.fn();
    progress.setSteps(['x', 'y']);
    progress.onUpdate(cb);
    progress.start(0);
    expect(cb).toHaveBeenCalledTimes(1);
    const [steps, summary] = cb.mock.calls[0];
    expect(steps[0].status).toBe('running');
    expect(summary.running).toBe(1);
  });

  it('throws if not a function', () => {
    expect(() => progress.onUpdate('bad')).toThrow('function');
  });
});
