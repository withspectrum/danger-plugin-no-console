import noConsole from './';

const files = {
  'src/log.js': 'function add(a, b) {\n  console.log(a, b);\n  return a + b;\n}',
  'src/clean.js': 'function add(a, b) {\n  return a + b;\n}',
  'src/error.js': 'function add(a, b) {\n  console.error(a, b);\n  return a + b;\n}',
}

const fileNames = Object.keys(files);

// Mock the Danger API
global.danger = {
  git: {
    modified_files: [fileNames[0], fileNames[1]],
    created_files: [fileNames[2]]
  },
  github: {
    utils: {
      fileContents: (path) => new Promise(res => {
        res(files[path])
      })
    }
  }
}

beforeEach(() => {
  global.fail = jest.fn()
})

afterEach(() => {
  global.fail = undefined
})

describe('noConsole()', () => {
  it('should fail any files with a console.log in it', async () => {
    await noConsole();
    expect(global.fail).toHaveBeenCalledTimes(2);
  });

  it('should respect the whitelist of console properties', async () => {
    await noConsole({ whitelist: ['error'] });
    expect(global.fail).toHaveBeenCalledTimes(1);
  })
})
