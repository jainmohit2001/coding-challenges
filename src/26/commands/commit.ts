import path from 'path';
import { getBranchHeadReference, getCurrentBranchName } from '../utils';
import commitTree from './commitTree';
import writeTree from './writeTree';
import { RELATIVE_PATH_TO_REF_HEADS_DIR } from '../constants';
import fs from 'fs';

function commit(gitRoot: string, message: string): string {
  if (message.length === 0) {
    throw new Error('Please provide a valid message');
  }

  // Get current branch name and a ref to the parent hash if present.
  const branch = getCurrentBranchName(gitRoot);
  const ref = getBranchHeadReference(gitRoot, branch);
  const parents: string[] = [];
  if (ref !== undefined) {
    parents.push(ref);
  }

  // Create the tree object from the index
  const treeHash = writeTree(gitRoot);

  // Create the commit object
  const hash = commitTree({ gitRoot, treeHash, message, parents });

  // Update the head for the current branch
  const pathToRef = path.join(gitRoot, RELATIVE_PATH_TO_REF_HEADS_DIR, branch);
  fs.writeFileSync(pathToRef, hash + '\n');

  // Create the output string
  let str = '';
  if (parents.length === 0) {
    // First commit of this branch
    str += `[${branch} (root-commit) ${hash.substring(0, 7)} ${message} \r\n`;
  } else {
    str += `[${branch} ${hash.substring(0, 7)}] ${message}\r\n`;
  }
  // TODO: Show number of files changed, total insertions and deletions

  return str;
}

export default commit;
