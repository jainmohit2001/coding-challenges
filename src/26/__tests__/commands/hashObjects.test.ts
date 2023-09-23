// https://git-scm.com/book/en/v2/Git-Internals-Git-Objects
import path from 'path';
import os from 'os';
import fs from 'fs';
import { randomBytes } from 'crypto';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';

const pathToIndex = './build/26/index.js';

describe('Testing hashObject command', () => {
  let gitProcess: ChildProcessWithoutNullStreams;

  afterEach(() => {
    gitProcess.kill('SIGINT');
  });

  it('should raise error on invalid args', (done) => {
    gitProcess = spawn('node', [pathToIndex, 'hash-object']);

    gitProcess.stderr.on('data', (data) => {
      expect(data.toString()).toContain('Invalid');
      done();
    });
  });

  it('should create hash for file', (done) => {
    const text = 'what is up, doc?';
    const filePath = path.join(os.tmpdir(), randomBytes(4).toString());
    fs.writeFileSync(filePath, text);
    const expectedHash = 'bd9dbf5aae1a3862dd1526723246b20206e5fc37';

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
});
