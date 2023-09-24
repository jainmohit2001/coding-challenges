import path from 'path';
import {
  ChildProcessWithoutNullStreams,
  spawn,
  spawnSync
} from 'child_process';
import { createDummyFile, createTempGitRepo } from '../../jestHelpers';

const pathToIndex = path.join(process.cwd(), './build/26/index.js');

function handleDummyFile() {
  const { text, filePath, expectedHash } = createDummyFile();
  const spawnSyncReturn = spawnSync('node', [
    pathToIndex,
    'hash-object',
    '-w',
    filePath
  ]);

  const objectHash = spawnSyncReturn.stdout.toString().trim();
  expect(objectHash).toBe(expectedHash);
  return { text, filePath, objectHash };
}

describe('Testing catFile command', () => {
  let gitProcess: ChildProcessWithoutNullStreams;

  createTempGitRepo();

  afterEach(() => {
    gitProcess.kill('SIGINT');
  });

  it('should output error for invalid args', (done) => {
    gitProcess = spawn('node', [pathToIndex, 'cat-file', 'object']);

    gitProcess.stderr.on('data', (data) => {
      expect(data.toString()).toContain('Invalid');
      done();
    });
  });

  it('should output error for invalid object', (done) => {
    gitProcess = spawn('node', [pathToIndex, 'cat-file', '-t', 'object']);

    gitProcess.stderr.on('data', (data) => {
      expect(data.toString()).toContain('Invalid');
      done();
    });
  });

  it('should output correct content', (done) => {
    const { text, objectHash } = handleDummyFile();

    gitProcess = spawn('node', [pathToIndex, 'cat-file', '-p', objectHash]);
    let finalData = '';

    gitProcess.stdout.on('data', (data) => {
      finalData += data.toString();
    });

    gitProcess.on('close', () => {
      expect(finalData).toBe(text);
      done();
    });
  });

  it('should output correct type', (done) => {
    const { objectHash } = handleDummyFile();

    gitProcess = spawn('node', [pathToIndex, 'cat-file', '-t', objectHash]);
    let finalData = '';

    gitProcess.stdout.on('data', (data) => {
      finalData += data.toString();
    });

    gitProcess.on('close', () => {
      expect(finalData.trim()).toBe('blob');
      done();
    });
  });
});
