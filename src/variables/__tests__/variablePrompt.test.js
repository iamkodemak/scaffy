const readline = require('readline');
const { promptForVariables } = require('../variablePrompt');

jest.mock('readline');

describe('promptForVariables', () => {
  let mockRl;

  beforeEach(() => {
    mockRl = {
      question: jest.fn(),
      close: jest.fn(),
    };
    readline.createInterface.mockReturnValue(mockRl);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty object when no missing vars', async () => {
    const result = await promptForVariables([]);
    expect(result).toEqual({});
    expect(readline.createInterface).not.toHaveBeenCalled();
  });

  it('prompts for each missing variable and collects answers', async () => {
    mockRl.question
      .mockImplementationOnce((q, cb) => cb('my-app'))
      .mockImplementationOnce((q, cb) => cb('Alice'));

    const result = await promptForVariables(['name', 'author']);

    expect(result).toEqual({ name: 'my-app', author: 'Alice' });
    expect(mockRl.close).toHaveBeenCalled();
  });

  it('uses default value when answer is empty', async () => {
    mockRl.question.mockImplementationOnce((q, cb) => cb(''));

    const result = await promptForVariables(['version'], { version: '1.0.0' });

    expect(result.version).toBe('1.0.0');
  });

  it('closes readline interface even if prompt loop finishes', async () => {
    mockRl.question.mockImplementationOnce((q, cb) => cb('value'));
    await promptForVariables(['key']);
    expect(mockRl.close).toHaveBeenCalledTimes(1);
  });
});
