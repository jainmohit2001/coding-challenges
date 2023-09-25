// https://git-scm.com/book/en/v2/Git-Internals-Git-Objects
import path from 'path';
import fs from 'fs';
import { createDummyFile, createTempGitRepo } from '../../jestHelpers';
import hashObject from '../../commands/hashObject';
import { Readable } from 'stream';

describe('Testing hashObject command', () => {
  createTempGitRepo();

  it('should output error on invalid args', () => {
    expect(() => hashObject({})).toThrow();
  });

  it('should create hash for file', () => {
    const { filePath, expectedHash } = createDummyFile();

    const hash = hashObject({ file: filePath });
    expect(hash.trim()).toBe(expectedHash);
  });

  it('should handle stdin option', () => {
    const text = 'what is up, doc?';
    const expectedHash = 'bd9dbf5aae1a3862dd1526723246b20206e5fc37';
    const stdinStream = Readable.from(Buffer.from(text));

    const hash = hashObject({
      stdin: stdinStream,
      readFromStdin: true
    });
    expect(hash.trim()).toBe(expectedHash);
    stdinStream.destroy();
  });

  it('should handle write option', () => {
    const { filePath, expectedHash } = createDummyFile();
    const pathToBlob = path.join(
      './.git/objects',
      expectedHash.substring(0, 2),
      expectedHash.substring(2, expectedHash.length)
    );

    const hash = hashObject({
      file: filePath,
      write: true
    });

    expect(hash.trim()).toBe(expectedHash);
    expect(fs.existsSync(pathToBlob)).toBeTruthy();
  });
});
