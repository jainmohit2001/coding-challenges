import { randomBytes } from 'crypto';
import path from 'path';
import fs from 'fs';
import os from 'os';
import init from './commands/init';

const root = process.cwd();

/**
 * Creates a temp directory to be used as git repo.
 * The cwd of the process is also changed to the temp directory.
 *
 * @export
 * @returns {string}
 */
export function createTempGitRepo(): string {
  const gitRoot = path.join(os.tmpdir(), randomBytes(2).toString('hex'));

  beforeAll(() => {
    // Create a new temp dir and change the cwd of the process.
    fs.mkdirSync(gitRoot);
    process.chdir(gitRoot);
    init();
  });

  afterAll(() => {
    // Move the process back to root before cleanup to prevent ENOENT error.
    process.chdir(root);
    fs.rmSync(gitRoot, { recursive: true, force: true });
  });

  return gitRoot;
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
