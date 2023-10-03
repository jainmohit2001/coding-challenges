import { CachedTree } from '../objects/cachedTree';
import IndexParser from '../indexParser';
import { Tree } from '../objects/tree';

function writeTree(gitRoot: string): string {
  const index = new IndexParser(gitRoot).parse();

  const tree = new Tree();
  tree.build(index);

  const writeToDisk = true;
  const cachedTree = new CachedTree();

  const hash = tree.root.calculateHash(gitRoot, writeToDisk, cachedTree);

  // Ensure entries in cachedTree are sorted by their names.
  cachedTree.entries.sort((a, b) => a.name.localeCompare(b.name));

  // Invalidate the previous cachedTree and update the index.
  index.cache = cachedTree;
  index.saveToDisk();
  return hash;
}

export default writeTree;
