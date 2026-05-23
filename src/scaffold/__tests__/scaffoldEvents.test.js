const {
  on,
  off,
  emit,
  clearListeners,
  listValidEvents,
  VALID_EVENTS,
} = require('../scaffoldEvents');

beforeEach(() => clearListeners());

describe('scaffoldEvents', () => {
  test('on() registers a listener and emit() calls it', () => {
    const fn = jest.fn();
    on('scaffold:start', fn);
    emit('scaffold:start', { project: 'test' });
    expect(fn).toHaveBeenCalledWith({ project: 'test' });
  });

  test('multiple listeners for same event are all called', () => {
    const a = jest.fn();
    const b = jest.fn();
    on('file:write', a);
    on('file:write', b);
    emit('file:write', {});
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  test('off() removes a specific listener', () => {
    const fn = jest.fn();
    on('scaffold:complete', fn);
    off('scaffold:complete', fn);
    emit('scaffold:complete', {});
    expect(fn).not.toHaveBeenCalled();
  });

  test('emit() does not throw when no listeners registered', () => {
    expect(() => emit('scaffold:error', {})).not.toThrow();
  });

  test('on() throws for unknown events', () => {
    expect(() => on('unknown:event', jest.fn())).toThrow(
      'Unknown scaffold event: "unknown:event"'
    );
  });

  test('on() throws when listener is not a function', () => {
    expect(() => on('scaffold:start', 'not-a-fn')).toThrow(
      'Event listener must be a function'
    );
  });

  test('clearListeners() clears all listeners for a specific event', () => {
    const fn = jest.fn();
    on('hook:run', fn);
    clearListeners('hook:run');
    emit('hook:run', {});
    expect(fn).not.toHaveBeenCalled();
  });

  test('clearListeners() with no arg clears all events', () => {
    const fn = jest.fn();
    on('scaffold:start', fn);
    on('file:write', fn);
    clearListeners();
    emit('scaffold:start', {});
    emit('file:write', {});
    expect(fn).not.toHaveBeenCalled();
  });

  test('listValidEvents() returns all valid event names', () => {
    expect(listValidEvents()).toEqual(VALID_EVENTS);
  });

  test('listener exceptions are caught and do not propagate', () => {
    on('plugin:apply', () => { throw new Error('boom'); });
    expect(() => emit('plugin:apply', {})).not.toThrow();
  });
});
