// https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain

import fs from 'fs';
import path from 'path';
import { BaseCommandArgs } from './types';

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

interface InitCommandArgs extends BaseCommandArgs {
  directory?: string;
}

function init({ directory, stdout = process.stdout }: InitCommandArgs): void {
  let gitDir = path.join(process.cwd(), '.git');

  if (directory) {
    if (path.isAbsolute(directory)) {
      gitDir = path.join(directory, '.git');
    } else {
      gitDir = path.join(process.cwd(), directory, '.git');
    }
  }

  if (fs.existsSync(gitDir)) {
    stdout.write(reinitializeText + gitDir + '\r\n');
    return;
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

  stdout.write(`Initialized empty repository in ${gitDir}\r\n`);
}

export default init;
