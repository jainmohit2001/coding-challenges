import fs from 'fs';
import { FileStatusCode } from './enums';

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

export interface FileStatus {
  /**
   * Path from the gitRoot to the file.
   *
   * @type {string}
   */
  name: string;

  /**
   * Status of the file in the staging area.
   *
   * @type {FileStatusCode}
   */
  staging: FileStatusCode;

  /**
   * Status of the file in the Work Tree.
   *
   * @type {FileStatusCode}
   */
  worktree: FileStatusCode;
}

export interface DiffEntry {
  /**
   * Path from the gitRoot to the file.
   *
   * @type {string}
   */
  name: string;

  /**
   * Status of the file in Staging or WorkTree.
   *
   * @type {FileStatusCode}
   */
  status: FileStatusCode;
}
