import path from 'path';
import { CachedTree } from '../objects/cachedTree';
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
  const cachedTree = new CachedTree();

  const hash = tree.root.calculateHash(gitRoot, writeToDisk, cachedTree);
  cachedTree.entries.sort((a, b) => a.name.localeCompare(b.name));
  index.cache = cachedTree;
  index.saveToDisk();
  return hash;
}

export default writeTree;
