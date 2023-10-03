import { randomBytes } from 'crypto';
import { createTempGitRepo } from '../../jestHelpers';
import fs from 'fs';
import updateIndex from '../../commands/updateIndex';
import path from 'path';
import writeTree from '../../commands/writeTree';
import commitTree from '../../commands/commitTree';
import { decodeCommit } from '../../objects/commit';

describe('Testing commit tree command', () => {
  const gitRoot = createTempGitRepo();
  const files: { name: string; content: Buffer }[] = [
    { name: 'text1.txt', content: randomBytes(32) },
    { name: 'dir1/text2.txt', content: randomBytes(32) },
    { name: 'dir1/dir2/text3.txt', content: randomBytes(32) },
    { name: 'dir3/text4.txt', content: randomBytes(32) }
  ];
  const files2: { name: string; content: Buffer }[] = [
    { name: 'text5.txt', content: randomBytes(32) }
  ];

  let firstTreeHash: string;
  let firstCommitHash: string;
  const firstMessage = 'First commit';

  let secondTreeHash: string;
  let secondCommitHash: string;
  const secondMessage = 'Second commit';

  it('should create the first commit object successfully', () => {
    // Create files in git repo
    files.forEach(({ name, content }) => {
      fs.mkdirSync(path.dirname(name), { recursive: true });
      fs.writeFileSync(name, content);
    });

    // perform "git add ." command
    updateIndex({ gitRoot, files: ['.'] });

    // Perform write tree command
    firstTreeHash = writeTree(gitRoot);

    firstCommitHash = commitTree({
      gitRoot,
      treeHash: firstTreeHash,
      message: firstMessage
    });
    const commitObject = decodeCommit(gitRoot, firstCommitHash);
    expect(commitObject.message).toBe(firstMessage);
    expect(commitObject.treeHash).toBe(firstTreeHash);
    expect(commitObject.parentHashes).toStrictEqual([]);
  });

  it('should create the second commit object with parent successfully', () => {
    // Create new files in git repo
    files2.forEach(({ name, content }) => {
      fs.mkdirSync(path.dirname(name), { recursive: true });
      fs.writeFileSync(name, content);
    });

    // perform "git add ." command
    updateIndex({ gitRoot, files: ['.'] });

    // Perform write tree command
    secondTreeHash = writeTree(gitRoot);

    secondCommitHash = commitTree({
      gitRoot,
      treeHash: secondTreeHash,
      parents: [firstCommitHash],
      message: secondMessage
    });

    const commitObject = decodeCommit(gitRoot, secondCommitHash);
    expect(commitObject.message).toBe(secondMessage);
    expect(commitObject.treeHash).toBe(secondTreeHash);
    expect(commitObject.parentHashes).toStrictEqual([firstCommitHash]);
  });
});
