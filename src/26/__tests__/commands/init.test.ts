import { randomBytes } from 'crypto';
import os from 'os';
import path from 'path';
import fs from 'fs';

import init from '../../commands/init';
import stream from 'stream';

describe('Testing init command', () => {
  let tempPath: string;

  beforeAll(() => {
    tempPath = path.join(os.tmpdir(), randomBytes(2).toString('hex'));
  });

  afterAll(() => {
    fs.rmSync(tempPath, { recursive: true, force: true });
  });

  it('should initialize empty repository successfully', (done) => {
    const stdoutStream = new stream.Writable();

    let finalData = '';
    stdoutStream._write = function (chunk, encoding, next) {
      finalData += chunk.toString();
      next();
    };

    init({ directory: tempPath, stdout: stdoutStream });

    expect(fs.existsSync(path.join(tempPath, '.git'))).toBeTruthy();
    expect(fs.existsSync(path.join(tempPath, '.git', 'HEAD'))).toBeTruthy();
    expect(fs.existsSync(path.join(tempPath, '.git', 'config'))).toBeTruthy();
    expect(
      fs.existsSync(path.join(tempPath, '.git', 'description'))
    ).toBeTruthy();
    expect(fs.existsSync(path.join(tempPath, '.git', 'hooks'))).toBeTruthy();
    expect(fs.existsSync(path.join(tempPath, '.git', 'info'))).toBeTruthy();
    expect(
      fs.existsSync(path.join(tempPath, '.git', 'info', 'exclude'))
    ).toBeTruthy();
    expect(fs.existsSync(path.join(tempPath, '.git', 'objects'))).toBeTruthy();
    expect(
      fs.existsSync(path.join(tempPath, '.git', 'objects', 'info'))
    ).toBeTruthy();
    expect(
      fs.existsSync(path.join(tempPath, '.git', 'objects', 'pack'))
    ).toBeTruthy();
    expect(fs.existsSync(path.join(tempPath, '.git', 'refs'))).toBeTruthy();

    stdoutStream.on('close', () => {
      expect(finalData).toContain('Initialized');
      done();
    });

    stdoutStream.destroy();
  });
});
