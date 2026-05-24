const {
  registerChannel,
  clearChannels,
  listChannels,
  notify,
  notifyStart,
  notifyComplete,
  notifyError,
  notifyFileWritten,
  VALID_LEVELS,
} = require('../scaffoldNotifier');

beforeEach(() => clearChannels());

describe('registerChannel', () => {
  it('adds a function channel', () => {
    const fn = jest.fn();
    registerChannel(fn);
    expect(listChannels()).toHaveLength(1);
  });

  it('throws if channel is not a function', () => {
    expect(() => registerChannel('not-a-fn')).toThrow(TypeError);
  });
});

describe('notify', () => {
  it('dispatches payload to all channels', () => {
    const ch1 = jest.fn();
    const ch2 = jest.fn();
    registerChannel(ch1);
    registerChannel(ch2);
    notify('info', 'hello');
    expect(ch1).toHaveBeenCalledTimes(1);
    expect(ch2).toHaveBeenCalledTimes(1);
  });

  it('payload contains level, message, meta, timestamp', () => {
    const ch = jest.fn();
    registerChannel(ch);
    notify('warn', 'test msg', { foo: 1 });
    const payload = ch.mock.calls[0][0];
    expect(payload.level).toBe('warn');
    expect(payload.message).toBe('test msg');
    expect(payload.meta).toEqual({ foo: 1 });
    expect(typeof payload.timestamp).toBe('string');
  });

  it('throws on invalid level', () => {
    expect(() => notify('verbose', 'hi')).toThrow('Invalid notification level');
  });

  it('throws on empty message', () => {
    expect(() => notify('info', '   ')).toThrow('non-empty string');
  });
});

describe('convenience helpers', () => {
  let ch;
  beforeEach(() => { ch = jest.fn(); registerChannel(ch); });

  it('notifyStart sends info level', () => {
    notifyStart('myTemplate');
    expect(ch.mock.calls[0][0].level).toBe('info');
    expect(ch.mock.calls[0][0].message).toContain('myTemplate');
  });

  it('notifyComplete sends success level', () => {
    notifyComplete('myTemplate');
    expect(ch.mock.calls[0][0].level).toBe('success');
  });

  it('notifyError sends error level with message', () => {
    notifyError('myTemplate', new Error('boom'));
    expect(ch.mock.calls[0][0].level).toBe('error');
    expect(ch.mock.calls[0][0].message).toContain('boom');
  });

  it('notifyFileWritten sends info level with path', () => {
    notifyFileWritten('/some/file.js');
    expect(ch.mock.calls[0][0].message).toContain('/some/file.js');
  });
});

describe('VALID_LEVELS', () => {
  it('exports the four expected levels', () => {
    expect(VALID_LEVELS).toEqual(expect.arrayContaining(['info', 'warn', 'error', 'success']));
  });
});
