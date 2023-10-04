// https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain

import fs from 'fs';
import path from 'path';

const reinitializeText = 'Reinitialized existing Git repository in ';
const DEFAULT_CONFIG = fs.readFileSync(
  path.join(__dirname, '..', 'default-files', 'default-config')
);
const DEFAULT_DESCRIPTION = fs.readFileSync(
  path.join(__dirname, '..', 'default-files', 'default-description')
);
const DEFAULT_EXCLUDE = fs.readFileSync(
  path.join(__dirname, '..', 'default-files', 'default-exclude')
);
const DEFAULT_HEAD = fs.readFileSync(
  path.join(__dirname, '..', 'default-files', 'default-HEAD')
);

/**
 * Main function that performs the initialization of a git repo.
 *
 * @param {?string} [directory] path where the git repo should be initialized
 * @returns {string}
 */
function init(directory?: string): string {
  let gitDir = path.join(process.cwd(), '.git');

  if (directory) {
    if (path.isAbsolute(directory)) {
      gitDir = path.join(directory, '.git');
    } else {
      gitDir = path.join(process.cwd(), directory, '.git');
    }
  }

  if (fs.existsSync(gitDir)) {
    return reinitializeText + gitDir;
  }

  fs.mkdirSync(gitDir, { recursive: true });

  fs.writeFileSync(path.join(gitDir, 'HEAD'), DEFAULT_HEAD);
  fs.writeFileSync(path.join(gitDir, 'config'), DEFAULT_CONFIG);
  fs.writeFileSync(path.join(gitDir, 'description'), DEFAULT_DESCRIPTION);
  fs.mkdirSync(path.join(gitDir, 'hooks'));
  fs.mkdirSync(path.join(gitDir, 'info'));
  fs.writeFileSync(path.join(gitDir, 'info', 'exclude'), DEFAULT_EXCLUDE);
  fs.mkdirSync(path.join(gitDir, 'objects'));
  fs.mkdirSync(path.join(gitDir, 'objects', 'info'));
  fs.mkdirSync(path.join(gitDir, 'objects', 'pack'));
  fs.mkdirSync(path.join(gitDir, 'refs'));

  return `Initialized empty repository in ${gitDir}`;
}

export default init;
