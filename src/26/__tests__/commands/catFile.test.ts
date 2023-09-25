import { createDummyFile, createTempGitRepo } from '../../jestHelpers';
import catFile from '../../commands/catFile';
import hashObject from '../../commands/hashObject';
import stream from 'stream';

async function hashDummyFile(): Promise<{
  text: string;
  filePath: string;
  objectHash: string;
}> {
  const { text, filePath, expectedHash } = createDummyFile();
  const stdoutStream = new stream.Writable();
  let objectHash = '';

  stdoutStream._write = function (chunk, encoding, next) {
    objectHash += chunk.toString();
    next();
  };

  return new Promise((res) => {
    stdoutStream.on('close', () => {
      objectHash = objectHash.trim();
      expect(objectHash).toBe(expectedHash);
      res({ text, filePath, objectHash: objectHash });
    });

    hashObject({ write: true, file: filePath, stdout: stdoutStream });
    stdoutStream.end();
  });
}

describe('Testing catFile command', () => {
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

  it('should output error for invalid args', (done) => {
    let finalData = '';

    stderrStream._write = function (chunk, encoding, next) {
      finalData += chunk.toString();
      next();
    };

    stderrStream.on('close', () => {
      expect(finalData).toContain('Invalid');
      done();
    });

    catFile({ object: 'object', stderr: stderrStream });
    stderrStream.end();
  });

  it('should output error for invalid object', (done) => {
    let finalData = '';

    stderrStream._write = function (chunk, encoding, next) {
      finalData += chunk.toString();
      next();
    };

    stderrStream.on('close', () => {
      expect(finalData).toContain('Invalid');
      done();
    });

    catFile({
      object: 'object',
      t: true,
      stderr: stderrStream
    });

    stderrStream.end();
  });

  it('should output correct content', (done) => {
    hashDummyFile().then(({ text, objectHash }) => {
      let finalData = '';

      stdoutStream._write = function (chunk, encoding, next) {
        finalData += chunk.toString();
        next();
      };

      stdoutStream.on('close', () => {
        expect(finalData).toBe(text);
        done();
      });

      catFile({ p: true, object: objectHash, stdout: stdoutStream });
      stdoutStream.end();
    });
  });

  it('should output correct type', (done) => {
    hashDummyFile().then(({ objectHash }) => {
      let finalData = '';

      stdoutStream._write = function (chunk, encoding, next) {
        finalData += chunk.toString();
        next();
      };

      stdoutStream.on('close', () => {
        expect(finalData.trim()).toBe('blob');
        done();
      });

      catFile({ t: true, object: objectHash, stdout: stdoutStream });
      stdoutStream.end();
    });
  });
});
