// https://git-scm.com/book/en/v2/Git-Internals-Git-Objects
import path from 'path';
import fs from 'fs';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { createDummyFile, createTempGitRepo } from '../../jestHelpers';

const pathToIndex = path.join(process.cwd(), './build/26/index.js');

describe('Testing hashObject command', () => {
  let gitProcess: ChildProcessWithoutNullStreams;

  createTempGitRepo();

  afterEach(() => {
    gitProcess.kill('SIGINT');
  });

  it('should output error on invalid args', (done) => {
    gitProcess = spawn('node', [pathToIndex, 'hash-object']);

    gitProcess.stderr.on('data', (data) => {
      expect(data.toString()).toContain('Invalid');
      done();
    });
  });

  it('should create hash for file', (done) => {
    const { filePath, expectedHash } = createDummyFile();

    gitProcess = spawn('node', [pathToIndex, 'hash-object', filePath]);
    let finalData = '';

    gitProcess.stdout.on('data', (data) => {
      finalData = data.toString();
    });

    gitProcess.on('close', () => {
      expect(finalData.trim()).toBe(expectedHash);
      done();
      fs.rmSync(filePath);
    });
  });

  it('should handle stdin option', (done) => {
    const text = 'what is up, doc?';
    const expectedHash = 'bd9dbf5aae1a3862dd1526723246b20206e5fc37';
    gitProcess = spawn('node', [pathToIndex, 'hash-object', '--stdin']);
    let finalData = '';

    gitProcess.stdout.on('data', (data) => {
      finalData += data.toString();
    });

    gitProcess.on('close', () => {
      expect(finalData.trim()).toBe(expectedHash);
      done();
    });

    gitProcess.stdin.write(Buffer.from(text));
    gitProcess.stdin.end();
  });

  it('should handle write option', (done) => {
    const { filePath, expectedHash } = createDummyFile();
    const pathToBlob = path.join(
      './.git/objects',
      expectedHash.substring(0, 2),
      expectedHash.substring(2, expectedHash.length)
    );

    gitProcess = spawn('node', [pathToIndex, 'hash-object', '-w', filePath]);
    let finalData = '';

    gitProcess.stdout.on('data', (data) => {
      finalData = data.toString();
    });

    gitProcess.on('close', () => {
      expect(finalData.trim()).toBe(expectedHash);
      expect(fs.existsSync(pathToBlob)).toBeTruthy();
      done();
      fs.rmSync(filePath);
    });
  });
});
