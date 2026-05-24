const {
  registerProfile,
  removeProfile,
  setActiveProfile,
  getActiveProfile,
  getProfileVars,
  listProfiles,
  resolveEnvVars,
  resetEnvManager,
} = require('../scaffoldEnvManager');

beforeEach(() => resetEnvManager());

describe('registerProfile', () => {
  it('registers a profile with variables', () => {
    registerProfile('staging', { apiUrl: 'https://staging.api' });
    expect(getProfileVars('staging')).toEqual({ apiUrl: 'https://staging.api' });
  });

  it('throws for invalid name', () => {
    expect(() => registerProfile('', {})).toThrow('non-empty string');
  });

  it('throws for non-object vars', () => {
    expect(() => registerProfile('test', 'bad')).toThrow('plain object');
  });
});

describe('removeProfile', () => {
  it('removes a registered profile', () => {
    registerProfile('temp', {});
    removeProfile('temp');
    expect(listProfiles()).not.toContain('temp');
  });

  it('resets active profile to default when removed', () => {
    registerProfile('myenv', {});
    setActiveProfile('myenv');
    removeProfile('myenv');
    expect(getActiveProfile()).toBe('default');
  });
});

describe('setActiveProfile', () => {
  it('sets the active profile', () => {
    registerProfile('prod', {});
    setActiveProfile('prod');
    expect(getActiveProfile()).toBe('prod');
  });

  it('throws for unregistered profile', () => {
    expect(() => setActiveProfile('ghost')).toThrow('not registered');
  });
});

describe('resolveEnvVars', () => {
  it('merges profile vars with overrides', () => {
    registerProfile('default', { host: 'localhost' });
    const result = resolveEnvVars({ port: '3000' });
    expect(result.host).toBe('localhost');
    expect(result.port).toBe('3000');
  });

  it('picks up SCAFFY_ prefixed process.env vars', () => {
    process.env.SCAFFY_REGION = 'us-east-1';
    const result = resolveEnvVars();
    expect(result.region).toBe('us-east-1');
    delete process.env.SCAFFY_REGION;
  });

  it('overrides take highest precedence', () => {
    registerProfile('default', { key: 'profile-value' });
    process.env.SCAFFY_KEY = 'env-value';
    const result = resolveEnvVars({ key: 'override-value' });
    expect(result.key).toBe('override-value');
    delete process.env.SCAFFY_KEY;
  });
});
