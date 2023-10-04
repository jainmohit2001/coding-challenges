import path from 'path';
import hashObject from './commands/hashObject';
import { RELATIVE_PATH_TO_INDEX_FILE } from './constants';
import { FileStatusCode } from './enums';
import IndexParser from './indexParser';
import { decodeCommit } from './objects/commit';
import { Tree, decodeTree } from './objects/tree';
import { getBranchHeadReference, getFileStats } from './utils';
import fs from 'fs';
import { DiffEntry, FileStatus } from './types';

export function diffCommitWithStaging(
  gitRoot: string,
  branch: string
): DiffEntry[] {
  const index = new IndexParser(gitRoot).parse();
  const files: DiffEntry[] = [];

  // Retrieve the hash of the latest commit for this branch.
  const commitHash = getBranchHeadReference(gitRoot, branch);
  let tree: Tree | undefined = undefined;

  if (commitHash) {
    const commitObject = decodeCommit(gitRoot, commitHash);
    tree = decodeTree(gitRoot, commitObject.treeHash);
  }

  // No previous commit present.
  // Status of all files => 'ADDED'
  if (tree === undefined) {
    index.entries.forEach((e) => {
      files.push({ name: e.name, status: FileStatusCode.ADDED });
    });
    return files;
  }

  // Sort files w.r.t name
  const treeFiles = [...tree.map.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  treeFiles.forEach(([name, node]) => {
    const indexEntry = index.getEntry(name);
    // File present in tree and index
    if (indexEntry) {
      files.push({
        name,
        status:
          indexEntry.hash === node.hash
            ? FileStatusCode.UNMODIFIED
            : FileStatusCode.MODIFIED
      });
    } else {
      // File present in tree but not in index => 'DELETED'
      files.push({
        name,
        status: FileStatusCode.DELETED
      });
    }
    // Remove the file form index entries.
    // Make sure not to save the index to disk.
    // This is required to process the 'ADDED' files.
    index.remove(name);
  });

  // File present in index but not in tree => 'ADDED'
  index.entries.forEach((e) => {
    files.push({ name: e.name, status: FileStatusCode.ADDED });
  });

  return files;
}

export function diffStagingWithWorktree(gitRoot: string): DiffEntry[] {
  const files: DiffEntry[] = [];
  const index = new IndexParser(gitRoot).parse();
  const fileStats = getFileStats(gitRoot);

  index.entries.forEach((e) => {
    const stat = fileStats.get(e.name);
    // File is present in index and Worktree
    if (stat) {
      const hash = hashObject({ gitRoot, write: false, file: e.name });

      files.push({
        name: e.name,
        status:
          e.hash === hash ? FileStatusCode.UNMODIFIED : FileStatusCode.MODIFIED
      });
    } else {
      // File present in index but not in Worktree => 'DELETED'
      files.push({ name: e.name, status: FileStatusCode.DELETED });
    }
    fileStats.delete(e.name);
  });

  // File present in Worktree but not in index => 'UNTRACKED'
  fileStats.forEach((value) => {
    files.push({
      name: value.pathFromGitRoot,
      status: FileStatusCode.UNTRACKED
    });
  });

  return files;
}

/**
 * This function finds the status of the files present in Staging and Worktree.
 * It returns a Map where:
 * - key: the path to the file, and
 * - value: FileStatus object.
 *
 * @export
 * @param {string} gitRoot
 * @returns {Map<string, FileStatus>}
 */
export function getFileStatus(
  gitRoot: string,
  branch: string
): Map<string, FileStatus> {
  const files = new Map<string, FileStatus>();

  // No index file is present. All the files will be set as untracked.
  if (!fs.existsSync(path.join(gitRoot, RELATIVE_PATH_TO_INDEX_FILE))) {
    const fileStats = getFileStats(gitRoot);
    fileStats.forEach((file) => {
      files.set(file.pathFromGitRoot, {
        name: file.pathFromGitRoot,
        staging: FileStatusCode.UNTRACKED,
        worktree: FileStatusCode.UNTRACKED
      });
    });

    return files;
  }

  const diff1 = diffCommitWithStaging(gitRoot, branch);

  // Assuming files present in Staging area have UNMODIFIED worktree status.
  // The worktree status might be updated later on.
  diff1.forEach((value) => {
    const file: FileStatus = {
      name: value.name,
      staging: value.status,
      worktree: FileStatusCode.UNMODIFIED
    };

    files.set(value.name, file);
  });

  const diff2 = diffStagingWithWorktree(gitRoot);

  diff2.forEach((value) => {
    let file = files.get(value.name);

    // file not present in commit or index
    if (file === undefined) {
      file = {
        name: value.name,
        staging: FileStatusCode.UNTRACKED,
        worktree: FileStatusCode.UNTRACKED
      };
    } else {
      file.worktree = value.status;
    }

    files.set(value.name, file);
  });

  return files;
}
