import {
  createDummyFile,
  createTempGitRepo,
  mockGetSignature
} from '../../jestHelpers';
import catFile from '../../commands/catFile';
import hashObject from '../../commands/hashObject';
import writeTree from '../../commands/writeTree';
import updateIndex from '../../commands/updateIndex';
import { FileMode } from '../../enums';
import { fileModeString } from '../../utils';
import commitTree from '../../commands/commitTree';

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
  mockGetSignature();

  let treeHash = '';
  let commitHash = '';

  it('should output error for invalid args', () => {
    expect(() => catFile({ gitRoot, object: 'object' })).toThrow();
  });

  it('should output error for invalid object', () => {
    expect(() => catFile({ gitRoot, object: 'object', t: true })).toThrow();
  });

  it('should output correct content - blob', () => {
    const { text, objectHash } = hashDummyFile(gitRoot);
    const output = catFile({
      gitRoot,
      p: true,
      object: objectHash
    });
    expect(output).toBe(text);
  });

  it('should output correct type - blob', () => {
    const { objectHash } = hashDummyFile(gitRoot);
    const output = catFile({
      gitRoot,
      t: true,
      object: objectHash
    });
    expect(output).toBe('blob');
  });

  it('should output correct content - tree', () => {
    updateIndex({ gitRoot, files: ['.'] });
    treeHash = writeTree(gitRoot);
    const output = catFile({
      gitRoot,
      p: true,
      object: treeHash
    });
    expect(output).toContain(fileModeString.get(FileMode.REGULAR));
  });

  it('should output correct type - tree', () => {
    updateIndex({ gitRoot, files: ['.'] });
    const hash = writeTree(gitRoot);
    const output = catFile({
      gitRoot,
      t: true,
      object: hash
    });
    expect(output).toBe('tree');
  });

  it('should output correct content - commit', () => {
    const message = 'First commit';
    commitHash = commitTree({ gitRoot, treeHash, message: message });
    const output = catFile({
      gitRoot,
      p: true,
      object: commitHash
    });
    expect(output).toContain(treeHash);
    expect(output).toContain(message);
  });

  it('should output correct type - commit', () => {
    const output = catFile({
      gitRoot,
      t: true,
      object: commitHash
    });
    expect(output).toBe('commit');
  });
});
