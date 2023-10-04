import { randomBytes } from 'crypto';
import { createTempGitRepo } from '../../jestHelpers';
import fs from 'fs';
import path from 'path';
import updateIndex from '../../commands/updateIndex';
import writeTree from '../../commands/writeTree';
import { decodeTree } from '../../objects/tree';
import IndexParser from '../../indexParser';
import { CachedTree } from '../../objects/cachedTree';

describe('Testing write tree command', () => {
  const gitRoot = createTempGitRepo();
  const files: { name: string; content: Buffer }[] = [
    { name: 'text1.txt', content: randomBytes(32) },
    { name: 'dir1/text2.txt', content: randomBytes(32) },
    { name: 'dir1/dir2/text3.txt', content: randomBytes(32) },
    { name: 'dir3/text4.txt', content: randomBytes(32) }
  ];
  const rootNodeChildrenSize = 3;
  const rootNodeSubtreeCount = 2;
  const rootNodeEntryCount = 4;

  beforeAll(() => {
    // Create files in git repo
    files.forEach(({ name, content }) => {
      fs.mkdirSync(path.dirname(name), { recursive: true });
      fs.writeFileSync(name, content);
    });

    // perform "git add ." command
    updateIndex({ gitRoot, files: ['.'] });
  });

  it('should write tree successfully', () => {
    const treeHash = writeTree(gitRoot);
    const index = new IndexParser(gitRoot).parse();
    const tree = decodeTree(gitRoot, treeHash);

    // Check properties of root
    expect(tree.root.children.size).toBe(rootNodeChildrenSize);
    expect(tree.root.entryCount).toBe(rootNodeEntryCount);
    expect(tree.root.subTreeCount).toBe(rootNodeSubtreeCount);
    expect(tree.root.hash).toBe(treeHash);

    // Check if all the files are present in Tree
    files.forEach(({ name }) => {
      const node = tree.getNode(name);
      const indexEntry = index.getEntry(name);

      expect(node).not.toBe(undefined);
      expect(indexEntry).not.toBe(undefined);
      if (node && indexEntry) {
        expect(node.path).toBe(name);
        expect(node.hash).toBe(indexEntry.hash);
      }
    });

    const cachedTree = new CachedTree();
    expect(tree.root.calculateHash(gitRoot, false, cachedTree)).toBe(treeHash);
    cachedTree.entries = cachedTree.entries.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    expect(cachedTree).toStrictEqual(index.cache);
  });
});
