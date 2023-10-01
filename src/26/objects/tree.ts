import { createHash } from 'crypto';
import { FileMode } from '../enums';
import { fileType } from '../utils';
import zlib from 'zlib';
import fs from 'fs';
import path from 'path';
import { RELATIVE_PATH_TO_OBJECT_DIR } from '../constants';
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
  path: string;
  name: string;
  mode: FileMode;
  children: Map<string, TreeNode>;
  hash?: string;
  entryCount: number;
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
