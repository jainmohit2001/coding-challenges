// https://git-scm.com/book/en/v2/Git-Internals-Git-Objects
import path from 'path';
import fs from 'fs';
import { createDummyFile, createTempGitRepo } from '../../jestHelpers';
import hashObject from '../../commands/hashObject';
import stream, { Readable } from 'stream';

describe('Testing hashObject command', () => {
  let stdinStream: stream.Readable;
  let stdoutStream: stream.Writable;
  let stderrStream: stream.Writable;

  beforeEach(() => {
    stdinStream = new stream.Readable();
    stdoutStream = new stream.Writable();
    stderrStream = new stream.Writable();
  });

  afterEach(() => {
    stdinStream.destroy();
    stdoutStream.destroy();
    stderrStream.destroy();
  });

  createTempGitRepo();

  it('should output error on invalid args', (done) => {
    let finalData = '';

    stderrStream._write = function (chunk, encoding, next) {
      finalData += chunk.toString();
      next();
    };

    stderrStream.on('close', () => {
      expect(finalData).toContain('Invalid');
      done();
    });

    hashObject({ stderr: stderrStream });
    stderrStream.end();
  });

  it('should create hash for file', (done) => {
    const { filePath, expectedHash } = createDummyFile();

    let finalData = '';

    stdoutStream._write = function (chunk, encoding, next) {
      finalData = chunk.toString();
      next();
    };

    stdoutStream.on('close', () => {
      expect(finalData.trim()).toBe(expectedHash);
      done();
      fs.rmSync(filePath);
    });

    hashObject({ stdout: stdoutStream, file: filePath });
    stdoutStream.end();
  });

  it('should handle stdin option', (done) => {
    let finalData = '';
    const text = 'what is up, doc?';
    const expectedHash = 'bd9dbf5aae1a3862dd1526723246b20206e5fc37';
    stdinStream = Readable.from(Buffer.from(text));

    stdoutStream._write = function (chunk, encoding, next) {
      finalData = chunk.toString();
      next();
    };

    stdoutStream.on('close', () => {
      expect(finalData.trim()).toBe(expectedHash);
      done();
    });

    hashObject({
      stdin: stdinStream,
      stdout: stdoutStream,
      readFromStdin: true
    });

    stdoutStream.end();
  });

  it('should handle write option', (done) => {
    const { filePath, expectedHash } = createDummyFile();
    const pathToBlob = path.join(
      './.git/objects',
      expectedHash.substring(0, 2),
      expectedHash.substring(2, expectedHash.length)
    );

    let finalData = '';

    stdoutStream._write = function (chunk, encoding, next) {
      finalData = chunk.toString();
      next();
    };

    stdoutStream.on('close', () => {
      expect(finalData.trim()).toBe(expectedHash);
      expect(fs.existsSync(pathToBlob)).toBeTruthy();
      done();
      fs.rmSync(filePath);
    });

    hashObject({
      file: filePath,
      write: true,
      stdout: stdoutStream
    });
    stdoutStream.end();
  });
});
