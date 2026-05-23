const { logger, setLogLevel, setLogOutput, resetLogger } = require('../scaffoldLogger');

describe('scaffoldLogger', () => {
  let mockOutput;

  beforeEach(() => {
    mockOutput = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
    setLogOutput(mockOutput);
    resetLogger();
    setLogOutput(mockOutput); // re-apply after reset
  });

  afterEach(() => {
    resetLogger();
  });

  describe('setLogLevel', () => {
    it('throws for an invalid log level', () => {
      expect(() => setLogLevel('verbose')).toThrow('Invalid log level: "verbose"');
    });

    it('accepts all valid levels without throwing', () => {
      ['silent', 'error', 'warn', 'info', 'debug'].forEach((level) => {
        expect(() => setLogLevel(level)).not.toThrow();
      });
    });
  });

  describe('logger.info', () => {
    it('logs info messages at default level', () => {
      logger.info('project initialised');
      expect(mockOutput.log).toHaveBeenCalledWith('[scaffy:INFO] project initialised');
    });

    it('suppresses info messages when level is warn', () => {
      setLogLevel('warn');
      logger.info('should be hidden');
      expect(mockOutput.log).not.toHaveBeenCalled();
    });
  });

  describe('logger.debug', () => {
    it('suppresses debug messages at info level', () => {
      logger.debug('debug detail');
      expect(mockOutput.log).not.toHaveBeenCalled();
    });

    it('logs debug messages when level is debug', () => {
      setLogLevel('debug');
      logger.debug('debug detail');
      expect(mockOutput.log).toHaveBeenCalledWith('[scaffy:DEBUG] debug detail');
    });
  });

  describe('logger.warn', () => {
    it('logs warn messages using console.warn', () => {
      logger.warn('missing optional field');
      expect(mockOutput.warn).toHaveBeenCalledWith('[scaffy:WARN] missing optional field');
    });
  });

  describe('logger.error', () => {
    it('logs error messages using console.error', () => {
      logger.error('something went wrong');
      expect(mockOutput.error).toHaveBeenCalledWith('[scaffy:ERROR] something went wrong');
    });

    it('still logs errors when level is warn', () => {
      setLogLevel('warn');
      logger.error('critical failure');
      expect(mockOutput.error).toHaveBeenCalled();
    });
  });

  describe('silent level', () => {
    it('suppresses all messages', () => {
      setLogLevel('silent');
      logger.error('nope');
      logger.warn('nope');
      logger.info('nope');
      logger.debug('nope');
      expect(mockOutput.log).not.toHaveBeenCalled();
      expect(mockOutput.warn).not.toHaveBeenCalled();
      expect(mockOutput.error).not.toHaveBeenCalled();
    });
  });
});
