import { GitObjectType } from '../commands/types';
import { FileMode } from '../enums';

export class Tree {
  entries: TreeEntry[];
  hash: string;

  constructor(entries: TreeEntry[], hash: string) {
    this.entries = entries;
    this.hash = hash;
  }
}

export interface TreeEntry {
  mode: FileMode;
  type: GitObjectType;
  name: string;
  hash: string;
}
