import { randomBytes } from 'crypto';
import os from 'os';
import path from 'path';
import fs from 'fs';

import init from '../../commands/init';

describe('Testing init command', () => {
  let tempPath: string;

  beforeAll(() => {
    tempPath = path.join(os.tmpdir(), randomBytes(2).toString('hex'));
  });

  afterAll(() => {
    fs.rmSync(tempPath, { recursive: true, force: true });
  });

  it('should initialize empty repository successfully', (done) => {
    const output = init(tempPath);

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

    expect(output).toContain('Initialized');
    done();
  });

  it('should output reinitialized text when git repo is already initialized', () => {
    const output = init(tempPath);
    expect(output).toContain('Reinitialized');
  });
});
