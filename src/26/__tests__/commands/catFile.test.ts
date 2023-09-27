import { createDummyFile, createTempGitRepo } from '../../jestHelpers';
import catFile from '../../commands/catFile';
import hashObject from '../../commands/hashObject';

function hashDummyFile(gitRoot: string): {
  text: string;
  filePath: string;
  objectHash: string;
} {
  const { text, filePath, expectedHash } = createDummyFile();
  const objectHash = hashObject({ gitRoot, write: true, file: filePath });
  expect(objectHash).toBe(expectedHash);
  return { text, filePath, objectHash: objectHash };
}

describe('Testing catFile command', () => {
  const gitRoot = createTempGitRepo();

  it('should output error for invalid args', () => {
    expect(() => catFile({ gitRoot, object: 'object' })).toThrow();
  });

  it('should output error for invalid object', () => {
    expect(() => catFile({ gitRoot, object: 'object', t: true })).toThrow();
  });

  it('should output correct content', () => {
    const { text, objectHash } = hashDummyFile(gitRoot);
    const output = catFile({
      gitRoot,
      p: true,
      object: objectHash
    });
    expect(output).toBe(text);
  });

  it('should output correct type', () => {
    const { objectHash } = hashDummyFile(gitRoot);
    const output = catFile({
      gitRoot,
      t: true,
      object: objectHash
    });
    expect(output).toBe('blob');
  });
});
