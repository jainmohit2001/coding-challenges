import path from 'path';
import { CachedTree, CachedTreeEntry } from '../objects/cachedTree';
import IndexParser from '../indexParser';
import { Tree, TreeNode } from '../objects/tree';
import { FileMode } from '../enums';

function writeTree(gitRoot: string): string {
  const index = new IndexParser(gitRoot).parse();

  const tree = new Tree();

  index.entries.forEach((e) => {
    const newNode = new TreeNode(
      e.name,
      path.basename(e.name),
      FileMode.REGULAR,
      e.hash
    );
    tree.insert(newNode);
  });

  const writeToDisk = true;
  const hash = tree.root.calculateHash(gitRoot, writeToDisk);

  const cachedTreeEntry: CachedTreeEntry = {
    name: '',
    hash: hash,
    subTreeCount: tree.root.children.size,
    entryCount: tree.root.entryCount
  };

  index.cache = new CachedTree([cachedTreeEntry]);
  index.saveToDisk();
  return hash;
}

export default writeTree;
