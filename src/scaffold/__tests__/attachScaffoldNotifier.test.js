const { emit, clearListeners } = require('../scaffoldEvents');
const { attachScaffoldNotifier, resetAttached } = require('../attachScaffoldNotifier');
const { registerChannel, clearChannels } = require('../scaffoldNotifier');

beforeEach(() => {
  clearListeners();
  clearChannels();
  resetAttached();
});

describe('attachScaffoldNotifier', () => {
  it('notifies on scaffold:start', () => {
    const ch = jest.fn();
    registerChannel(ch);
    attachScaffoldNotifier();
    emit('scaffold:start', { templateName: 'express-api', options: {} });
    expect(ch).toHaveBeenCalledTimes(1);
    const payload = ch.mock.calls[0][0];
    expect(payload.level).toBe('info');
    expect(payload.message).toContain('express-api');
  });

  it('notifies on scaffold:complete with success level', () => {
    const ch = jest.fn();
    registerChannel(ch);
    attachScaffoldNotifier();
    emit('scaffold:complete', { templateName: 'express-api', files: ['a', 'b'] });
    expect(ch.mock.calls[0][0].level).toBe('success');
    expect(ch.mock.calls[0][0].meta.fileCount).toBe(2);
  });

  it('notifies on scaffold:error with error level', () => {
    const ch = jest.fn();
    registerChannel(ch);
    attachScaffoldNotifier();
    emit('scaffold:error', { templateName: 'express-api', error: new Error('fail') });
    expect(ch.mock.calls[0][0].level).toBe('error');
    expect(ch.mock.calls[0][0].message).toContain('fail');
  });

  it('notifies on scaffold:fileWrite', () => {
    const ch = jest.fn();
    registerChannel(ch);
    attachScaffoldNotifier();
    emit('scaffold:fileWrite', { filePath: 'src/index.js' });
    expect(ch.mock.calls[0][0].message).toContain('src/index.js');
  });

  it('does not attach twice when called multiple times', () => {
    const ch = jest.fn();
    registerChannel(ch);
    attachScaffoldNotifier();
    attachScaffoldNotifier();
    emit('scaffold:start', { templateName: 'tpl', options: {} });
    expect(ch).toHaveBeenCalledTimes(1);
  });
});
