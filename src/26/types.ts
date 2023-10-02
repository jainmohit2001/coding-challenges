import fs from 'fs';

/**
 * Type of files stored in the .git/objects store.
 *
 * @export
 */
export type GitObjectType = 'blob' | 'commit' | 'tree' | 'tag';

export interface GitObject {
  type: GitObjectType;
  length: number;
  data: Buffer;
}

export interface FileStats {
  /**
   * Information about a file.
   *
   * @type {fs.Stats}
   */
  stat: fs.Stats;

  /**
   * Path from the root of the current git repo.
   *
   * @type {string}
   */
  pathFromGitRoot: string;
}

export interface Signature {
  name: string;
  email: string;
  timestamp: Date;
}
