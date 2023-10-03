import fs from 'fs';
import {
  ColorReset,
  FgGreen,
  FgRed,
  RELATIVE_PATH_TO_INDEX_FILE
} from '../constants';
import IndexParser from '../indexParser';
import path from 'path';
import hashObject from './hashObject';
import {
  getBranchHeadReference,
  getCurrentBranchName,
  getFileStats
} from '../utils';
import { decodeCommit } from '../objects/commit';
import { Tree, decodeTree } from '../objects/tree';
import { FileStatusCode } from '../enums';

interface FileStatus {
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

interface DiffEntry {
  name: string;
  status: FileStatusCode;
}

function diffCommitWithStaging(gitRoot: string, branch: string): DiffEntry[] {
  const index = new IndexParser(gitRoot).parse();
  const files: DiffEntry[] = [];
  const commitHash = getBranchHeadReference(gitRoot, branch);
  let tree: Tree | undefined = undefined;

  if (commitHash) {
    const commitObject = decodeCommit(gitRoot, commitHash);
    tree = decodeTree(gitRoot, commitObject.treeHash);
  }

  // No previous commit present => 'ADDED'
  if (tree === undefined) {
    index.entries.forEach((e) => {
      files.push({ name: e.name, status: FileStatusCode.ADDED });
    });
    return files;
  }

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
    // This is required to process the 'ADDED' files.
    index.remove(name);
  });

  // File present in index but not in tree => 'ADDED'
  index.entries.forEach((e) => {
    files.push({ name: e.name, status: FileStatusCode.ADDED });
  });

  return files;
}

function diffStagingWithWorktree(gitRoot: string): DiffEntry[] {
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
 * Prepares a human readable output from a list of FileStatus objects.
 *
 * @param {string} gitRoot
 * @param {string} branch
 * @param {FileStatus[]} files
 * @returns {string}
 */
function prepareOutput(
  gitRoot: string,
  branch: string,
  files: Map<string, FileStatus>
): string {
  const cwd = path.relative(gitRoot, process.cwd());
  const arr = [...files.values()].sort((a, b) => a.name.localeCompare(b.name));
  let str = `On branch ${branch}`;
  let changesToBeCommitted = '';
  let changesNotStaged = '';
  let untrackedFiles = '';

  arr.forEach((e) => {
    const name = path.relative(cwd, e.name);

    switch (e.worktree) {
      case FileStatusCode.UNMODIFIED:
        break;
      case FileStatusCode.UNTRACKED:
        untrackedFiles += `\t${name}\r\n`;
        break;
      case FileStatusCode.DELETED:
        changesNotStaged += `\tdeleted:    ${name}\r\n`;
        break;
      case FileStatusCode.MODIFIED:
        changesNotStaged += `\tmodified:   ${name}\r\n`;
        break;
      default:
        throw new Error(`Invalid worktree status ${e}`);
    }

    switch (e.staging) {
      case FileStatusCode.ADDED:
        changesToBeCommitted += `\tnew file:   ${name}\r\n`;
        break;
      case FileStatusCode.DELETED:
        changesToBeCommitted += `\tdeleted:    ${name}\r\n`;
        break;
      case FileStatusCode.MODIFIED:
        changesToBeCommitted += `\tmodified:   ${name}\r\n`;
        break;
      case FileStatusCode.UNMODIFIED:
      case FileStatusCode.UNTRACKED:
        break;
    }
  });

  if (changesToBeCommitted.length > 0) {
    str += `\r\nChanges to be committed:\r\n${FgGreen}${changesToBeCommitted}${ColorReset}`;
  }
  if (changesNotStaged.length > 0) {
    str += `\r\nChanges not staged for commit:\r\n${FgRed}${changesNotStaged}${ColorReset}`;
  }
  if (untrackedFiles.length > 0) {
    str += `\r\nUntracked files:\r\n${FgRed}${untrackedFiles}${ColorReset}`;
  }

  if (changesToBeCommitted.length === 0) {
    if (untrackedFiles.length === 0 && changesNotStaged.length === 0) {
      str += '\r\nnothing to commit, working tree clean';
    } else {
      str += '\r\nno changes added to commit';
    }
  }
  return str;
}

/**
 * Main function that handles the `status` command.
 *
 * @param {string} gitRoot
 * @returns {string}
 */
function status(gitRoot: string): string {
  const files = new Map<string, FileStatus>();
  const branch = getCurrentBranchName(gitRoot);

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

    return prepareOutput(gitRoot, branch, files);
  }

  const diff1 = diffCommitWithStaging(gitRoot, branch);

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

  return prepareOutput(gitRoot, branch, files);
}

export default status;
