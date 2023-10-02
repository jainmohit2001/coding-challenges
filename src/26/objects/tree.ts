import { createHash } from 'crypto';
import { FileMode } from '../enums';
import { fileType, parseObject } from '../utils';
import zlib from 'zlib';
import fs from 'fs';
import path from 'path';
import { NULL, RELATIVE_PATH_TO_OBJECT_DIR, SPACE } from '../constants';
import { CachedTree, CachedTreeEntry } from './cachedTree';
import { Index } from './index';

export class Tree {
  root: TreeNode;

  constructor() {
    this.root = new TreeNode('', '', FileMode.DIR);
  }

  build(index: Index) {
    index.entries.forEach((e) => {
      const newNode = new TreeNode(
        e.name,
        path.basename(e.name),
        FileMode.REGULAR,
        e.hash
      );
      this.insert(newNode);
    });
  }

  insert(node: TreeNode) {
    const names = node.path.split('/');
    let tempRoot = this.root;
    let pathTillNow = '';

    let i = 0;

    // Add TreeNode for each DIR if not present.
    // last entry of the names list represent the name of the file.
    for (i = 0; i < names.length - 1; i++) {
      const name = names[i];

      pathTillNow += name;

      if (tempRoot.children.get(name) === undefined) {
        const newNode = new TreeNode(pathTillNow, name, FileMode.DIR);
        tempRoot.children.set(name, newNode);

        // We are adding a new tree under the tempRoot
        tempRoot.subTreeCount++;
      }
      // We are adding a file under this tempRoot
      tempRoot.entryCount++;

      // Move down the DIR towards the leaf.
      tempRoot = tempRoot.children.get(name)!;
    }

    // Finally add the file
    tempRoot.children.set(names[i], node);
    tempRoot.entryCount++;
  }
}

export class TreeNode {
  /**
   * The relative path to this file or dir in the working tree from the gitRoot.
   *
   * @type {string}
   */
  path: string;

  /**
   * The name of the TreeNode.
   * For files it is the filename.
   * For directories it is the name of the directory.
   *
   * @type {string}
   */
  name: string;

  /**
   * For regular files it is FileMode.REGULAR.
   * For directories it is FileMode.DIR.
   *
   * @type {FileMode}
   */
  mode: FileMode;

  /**
   * The map of children that this Node has.
   * The key is the name (NOT path) of the Node.
   *
   * @type {Map<string, TreeNode>}
   */
  children: Map<string, TreeNode>;

  /**
   * Hash of the tree.
   * For file it is passed while creating a node.
   * For directories it is undefined at first,
   * and then calculated later using the calculateHash function
   *
   * @type {?string}
   */
  hash?: string;

  /**
   * Number of entries in the index that is covered by the
   * tree this node represents.
   * For a file (leaf node) it is always zero.
   *
   * @type {number}
   */
  entryCount: number;

  /**
   * Number of subtrees this tree has.
   * For a file (leaf node) it is always zero.
   *
   * @type {number}
   */
  subTreeCount: number;

  constructor(path: string, name: string, mode: FileMode, hash?: string) {
    this.path = path;
    this.hash = hash;
    this.name = name;
    this.mode = mode;
    this.children = new Map<string, TreeNode>();
    this.entryCount = 0;
    this.subTreeCount = 0;

    if (mode === FileMode.REGULAR && hash === undefined) {
      throw new Error(`No hash provided with file ${path}`);
    }
  }

  calculateHash(
    gitRoot: string,
    writeToDisk: boolean = false,
    cachedTree: CachedTree
  ): string {
    // If this is a file
    if (this.mode === FileMode.REGULAR) {
      return this.hash!;
    }

    const buffers: Buffer[] = [];

    // Add entry for each children.
    // If the child is a DIR, calculate the hash by recursive function call.
    this.children.forEach((node) => {
      const hash = node.calculateHash(gitRoot, writeToDisk, cachedTree);
      buffers.push(
        Buffer.concat([
          Buffer.from(`${node.mode.toString(8)} ${node.name}\0`),
          Buffer.from(hash, 'hex')
        ])
      );
    });

    // Prepare the object to be stored
    const content = Buffer.concat(buffers);
    const header = Buffer.from(
      `${fileType.get(this.mode)} ${content.byteLength}\0`
    );
    const store = Buffer.concat([header, content]);

    const hash = createHash('sha1').update(store).digest('hex');

    const cachedTreeEntry: CachedTreeEntry = {
      name: this.name,
      hash: hash,
      subTreeCount: this.subTreeCount,
      entryCount: this.entryCount
    };
    cachedTree.add(cachedTreeEntry);

    if (writeToDisk) {
      const zlibContent = zlib.deflateSync(store);
      const pathToBlob = path.join(
        gitRoot,
        RELATIVE_PATH_TO_OBJECT_DIR,
        hash.substring(0, 2),
        hash.substring(2, hash.length)
      );
      fs.mkdirSync(path.dirname(pathToBlob), { recursive: true });
      fs.writeFileSync(pathToBlob, zlibContent, { encoding: 'hex' });
    }
    return hash;
  }
}

/**
 * This function decodes a tree referenced by a hash.
 *
 * @export
 * @param {string} gitRoot
 * @param {string} treeHash
 * @param {string} [pathPrefix='']
 * @returns {Tree}
 */
export function decodeTree(
  gitRoot: string,
  treeHash: string,
  pathPrefix: string = ''
): Tree {
  const gitObject = parseObject(gitRoot, treeHash);

  if (gitObject.type !== 'tree') {
    throw new Error('The given object is not a tree object');
  }
  const data = gitObject.data;

  const tree = new Tree();
  tree.root.path = path.join(pathPrefix, tree.root.path);
  tree.root.hash = treeHash;

  let i = 0;

  for (i = 0; i < data.length; ) {
    // Format of each entry:
    // <mode><SPACE><filename><NULL><hash>
    const modeStartPos = i;
    while (data[i] !== SPACE) {
      i++;
    }
    const mode = parseInt(data.subarray(modeStartPos, i).toString(), 8);
    i++;

    const nameStartPos = i;
    while (data[i] !== NULL) {
      i++;
    }
    const name = data.subarray(nameStartPos, i).toString();
    i++;

    const hash = data.subarray(i, i + 20).toString('hex');
    i += 20;

    let node: TreeNode;

    if (mode === FileMode.DIR) {
      // Recursively decode subtree.
      // The prefixPath will be "<tree.root.path>/<name>"
      const subTree = decodeTree(
        gitRoot,
        hash,
        path.join(tree.root.path, name)
      );

      node = subTree.root;
      // Update the name for this node
      node.name = name;
    } else {
      // The path to this new file is relative to the root of the tree.
      node = new TreeNode(path.join(tree.root.path, name), name, mode, hash);
      // console.log(node);
    }

    tree.insert(node);
  }
  return tree;
}
