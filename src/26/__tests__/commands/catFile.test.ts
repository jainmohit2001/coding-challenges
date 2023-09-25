import { createDummyFile, createTempGitRepo } from '../../jestHelpers';
import catFile from '../../commands/catFile';
import hashObject from '../../commands/hashObject';

function hashDummyFile(): {
  text: string;
  filePath: string;
  objectHash: string;
} {
  const { text, filePath, expectedHash } = createDummyFile();
  const objectHash = hashObject({ write: true, file: filePath });
  expect(objectHash).toBe(expectedHash);
  return { text, filePath, objectHash: objectHash };
}

describe('Testing catFile command', () => {
  createTempGitRepo();

  it('should output error for invalid args', () => {
    expect(() => catFile({ object: 'object' })).toThrow();
  });

  it('should output error for invalid object', () => {
    expect(() => catFile({ object: 'object', t: true })).toThrow();
  });

  it('should output correct content', () => {
    const { text, objectHash } = hashDummyFile();
    const output = catFile({
      p: true,
      object: objectHash
    });
    expect(output).toBe(text);
  });

  it('should output correct type', () => {
    const { objectHash } = hashDummyFile();
    const output = catFile({
      t: true,
      object: objectHash
    });
    expect(output).toBe('blob');
  });
});
