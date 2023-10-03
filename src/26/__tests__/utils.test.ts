import path from 'path';
import { createTempGitRepo } from '../jestHelpers';
import fs from 'fs';
import { randomBytes, randomInt } from 'crypto';
import {
  getCurrentBranchName,
  getFileStats,
  getFiles,
  getIgnoredGlobPatterns,
  getSignature,
  isValidSHA1,
  parseObjectHeader
} from '../utils';
import { getTimeAndTimeZone } from '../objects/signature';
import { GitObjectType } from '../types';

describe('Testing utils', () => {
  const gitRoot = createTempGitRepo();
  const gitignoreContent = ['.idea/**', '**/node_modules/**', '**/build/**'];
  const files: { name: string; content: Buffer }[] = [
    { name: 'text1.txt', content: randomBytes(32) },
    { name: 'dir1/text2.txt', content: randomBytes(32) },
    { name: 'node_modules/module/index.ts', content: randomBytes(32) }
  ];
  const names = files.map(({ name }) => {
    return name;
  });
  names.push('.gitignore');

  beforeAll(() => {
    fs.writeFileSync(
      path.join(gitRoot, '.gitignore'),
      gitignoreContent.join('\r\n')
    );
    files.forEach(({ name, content }) => {
      fs.mkdirSync(path.dirname(path.join(gitRoot, name)), { recursive: true });
      fs.writeFileSync(name, content);
    });
  });

  it('should parse .gitignore successfully', () => {
    const data = getIgnoredGlobPatterns(gitRoot);
    gitignoreContent.forEach((pattern) => {
      expect(data.indexOf(pattern)).toBeGreaterThanOrEqual(0);
    });
  });

  it('should get files and successfully', () => {
    const data = getFiles(gitRoot, gitRoot);

    data.forEach((file) => {
      expect(names.indexOf(file)).toBeGreaterThanOrEqual(0);
    });
  });

  it('should get file stats successfully', () => {
    const data = getFileStats(gitRoot);

    data.forEach((stat, key) => {
      expect(names.indexOf(key)).toBeGreaterThanOrEqual(0);
    });
  });

  it('should throw error when no HEAD file is found', () => {
    expect(() => getCurrentBranchName(randomBytes(2).toString())).toThrow();
  });

  it('should get the current branch name successfully', () => {
    const data = getCurrentBranchName(gitRoot);
    expect(data.trim()).toBe('master');
  });

  it('should convert date object to time and timezone offset', () => {
    const date = new Date();
    const seconds = Math.floor(date.getTime() / 1000);
    const output = getTimeAndTimeZone(date).trim();
    const [sec, timezone] = output.split(' ');

    expect(parseInt(sec)).toBe(seconds);
    const timezoneInMin =
      (timezone[0] === '+' ? -1 : 1) *
      (parseInt(timezone.substring(1, 3)) * 60 +
        parseInt(timezone.substring(3, 5)));
    expect(timezoneInMin).toBe(date.getTimezoneOffset());
  });

  it('should get signature successfully', () => {
    const signature = getSignature();
    expect(signature.email).not.toBe(undefined);
    expect(signature.name).not.toBe(undefined);
  });

  it('should parse object header successfully', () => {
    const objectType: GitObjectType = 'commit';
    const byteLength = randomInt(100, 10000);
    const buffer = Buffer.from(`${objectType} ${byteLength}`);
    const header = parseObjectHeader(buffer);

    expect(header.type).toBe(objectType);
    expect(header.length).toBe(byteLength);
  });

  const invalidHashes = ['', '12', '12 ', '12~', 'h'];
  invalidHashes.forEach((hash) => {
    it(`should return false for invalid hash ${hash}`, () => {
      expect(isValidSHA1(hash)).toBeFalsy();
    });
  });
});
