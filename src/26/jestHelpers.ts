import { randomBytes } from 'crypto';
import path from 'path';
import fs from 'fs';
import os from 'os';
import init from './commands/init';

const root = process.cwd();

export function createTempGitRepo(): string {
  const tempPath = path.join(os.tmpdir(), randomBytes(2).toString('hex'));

  beforeAll(() => {
    // Create a new temp dir and change the cwd of the process.
    fs.mkdirSync(tempPath);
    process.chdir(tempPath);
    init({});
  });

  afterAll(() => {
    // Move the process back to root before cleanup to prevent ENOENT error.
    process.chdir(root);
    fs.rmSync(tempPath, { recursive: true, force: true });
  });

  return tempPath;
}

export function createDummyFile(): {
  text: string;
  filePath: string;
  expectedHash: string;
} {
  const text = 'what is up, doc?';
  const filePath = './temp.txt';
  fs.writeFileSync(filePath, text);
  const expectedHash = 'bd9dbf5aae1a3862dd1526723246b20206e5fc37';
  return { text, filePath, expectedHash };
}
