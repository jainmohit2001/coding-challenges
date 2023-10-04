import { CachedTree } from '../objects/cachedTree';
import IndexParser from '../indexParser';
import { Tree } from '../objects/tree';

/**
 * The main function that performs the 'write-tree' command.
 *
 * @param {string} gitRoot
 * @returns {string}
 */
function writeTree(gitRoot: string): string {
  const index = new IndexParser(gitRoot).parse();

  const tree = new Tree();
  tree.build(index);

  // Change this to false for debugging purposes
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
