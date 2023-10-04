import { createHash } from 'crypto';
import { FileMode } from '../enums';
import { fileType, parseObject } from '../utils';
import zlib from 'zlib';
import fs from 'fs';
import path from 'path';
import { NULL, RELATIVE_PATH_TO_OBJECT_DIR, SPACE } from '../constants';
import { CachedTree, CachedTreeEntry } from './cachedTree';
import { Index } from './index';
import { Stack } from '../../utils/stack';

export class Tree {
  /**
   * The root of this tree.
   *
   * @type {TreeNode}
   */
  root: TreeNode;

  /**
   * A map with key = path to file and value = TreeNode object of a file.
   * This is used to iterate over the files present in tree and to fetch nodes.
   *
   * @type {Map<string, TreeNode>}
   */
  map: Map<string, TreeNode>;

  constructor() {
    this.root = new TreeNode('', '', FileMode.DIR);
    this.map = new Map<string, TreeNode>();
  }

  /**
   * Given an Index class instance,
   * this function iterates over the IndexEntries and inserts it into the tree.
   *
   * @param {Index} index
   */
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

  /**
   * Insert the given TreeNode into the tree.
   *
   * @param {TreeNode} node
   */
  insert(node: TreeNode) {
    const names = node.path.split('/');
    let tempRoot = this.root;
    let pathTillNow = '';

    let i = 0;

    // Add TreeNode for each DIR if not present.
    // last entry of the names list represent the name of the file.
    for (i = 0; i < names.length - 1; i++) {
      const name = names[i];

      pathTillNow = path.join(pathTillNow, name);

      if (tempRoot.children.get(name) === undefined) {
        const newNode = new TreeNode(pathTillNow, name, FileMode.DIR);
        tempRoot.children.set(name, newNode);

        // We are adding a new tree under the tempRoot
        tempRoot.subTreeCount++;
      }
      if (node.mode === FileMode.REGULAR) {
        // When we are adding a file under this tempRoot
        tempRoot.entryCount++;
      } else {
        // When we are adding a DIR under this tempRoot
        tempRoot.entryCount += node.entryCount;
      }

      // Move down towards the leaf.
      tempRoot = tempRoot.children.get(name)!;
    }

    // If the new node is the root itself, then reassign the root.
    if (node.path === this.root.path) {
      this.root = node;
      return;
    }

    // Finally add the file or dir
    tempRoot.children.set(names[i], node);

    if (node.mode === FileMode.REGULAR) {
      tempRoot.entryCount++;

      // Store the node in the map for fast retrieval.
      this.map.set(node.path, node);
    } else {
      tempRoot.entryCount += node.entryCount;
      tempRoot.subTreeCount += 1;
    }
  }

  getNode(pathToFile: string): TreeNode | undefined {
    return this.map.get(pathToFile);
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
   * Hash of the TreeNode.
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

    // Make sure a hash is provided when creating a TreeNode for file
    if (mode === FileMode.REGULAR && hash === undefined) {
      throw new Error(`No hash provided with file ${path}`);
    }
  }

  /**
   * Calculates the hash of the root and optionally save the tree to the disk.
   * All the Trees are also pushed to the provided CachedTee class.
   * The entries of CachedTree are NOT sorted by the path of the files.
   *
   * @param {string} gitRoot
   * @param {boolean} [writeToDisk=false]
   * @param {CachedTree} cachedTree
   * @returns {string}
   */
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

    // Create a CachedTreeEntry and add ito the provided CachedTree
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
 * @returns {Tree}
 */
export function decodeTree(gitRoot: string, treeHash: string): Tree {
  // Check if the given hash is a valid tree object
  const gitObject = parseObject(gitRoot, treeHash);
  if (gitObject.type !== 'tree') {
    throw new Error('The given object is not a tree object');
  }

  const tree = new Tree();

  // The Stack contains the TreeNode corresponding to directories.
  const stack: Stack<TreeNode> = new Stack<TreeNode>();
  const newRoot = new TreeNode('', '', FileMode.DIR, treeHash);
  tree.root = newRoot;
  stack.push(newRoot);

  while (stack.size() > 0) {
    // Pop the TreeNode from the stack. This is actually a directory
    const node = stack.pop()!;

    // Get the corresponding object from the storage
    const gitObject = parseObject(gitRoot, node.hash!);
    const data = gitObject.data;
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

      if (mode === FileMode.DIR) {
        // If a DIR is found, create a new Node and push into the stack.
        // It will be processed later on.
        const newNode = new TreeNode(
          path.join(node.path, name),
          name,
          mode,
          hash
        );
        stack.push(newNode);

        // Insert the dir into tree
        tree.insert(newNode);
      } else {
        // Found a file. Insert into the tree.
        const newNode = new TreeNode(
          path.join(node.path, name),
          name,
          mode,
          hash
        );
        tree.insert(newNode);
      }
    }
  }

  return tree;
}
