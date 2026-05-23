const { registerEventBridge, resetBridge } = require('../scaffoldEventBridge');
const { on, emit, clearListeners } = require('../scaffoldEvents');
const hookManager = require('../../hooks/hookManager');

jest.mock('../../hooks/hookManager', () => ({
  registerHook: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  clearListeners();
  resetBridge();
});

describe('scaffoldEventBridge', () => {
  test('registerEventBridge() registers hooks for all lifecycle events', () => {
    registerEventBridge();
    expect(hookManager.registerHook).toHaveBeenCalledWith(
      'beforeScaffold',
      expect.any(Function)
    );
    expect(hookManager.registerHook).toHaveBeenCalledWith(
      'afterScaffold',
      expect.any(Function)
    );
    expect(hookManager.registerHook).toHaveBeenCalledWith(
      'onScaffoldError',
      expect.any(Function)
    );
    expect(hookManager.registerHook).toHaveBeenCalledTimes(7);
  });

  test('registerEventBridge() is idempotent', () => {
    registerEventBridge();
    registerEventBridge();
    expect(hookManager.registerHook).toHaveBeenCalledTimes(7);
  });

  test('resetBridge() allows re-registration', () => {
    registerEventBridge();
    resetBridge();
    registerEventBridge();
    expect(hookManager.registerHook).toHaveBeenCalledTimes(14);
  });

  test('bridge hook forwards payload to scaffold:start event', () => {
    const listener = jest.fn();
    on('scaffold:start', listener);

    // Grab the registered hook callback for 'beforeScaffold'
    registerEventBridge();
    const [[, cb]] = hookManager.registerHook.mock.calls.filter(
      ([name]) => name === 'beforeScaffold'
    );
    cb({ project: 'myapp' });

    expect(listener).toHaveBeenCalledWith({ project: 'myapp' });
  });
});
