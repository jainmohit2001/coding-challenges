import { program } from 'commander';
import init from './commands/init';
import hashObject from './commands/hashObject';
import catFile from './commands/catFile';
import fs from 'fs';
import updateIndex from './commands/updateIndex';
import status from './commands/status';
import writeTree from './commands/writeTree';
import path from 'path';

function ensureGitRepo(): string {
  let root = process.cwd();

  while (path.dirname(root) !== '/' || root !== '/') {
    const pathToGit = path.join(root, '.git');
    if (fs.existsSync(pathToGit)) {
      return root;
    }
    root = path.dirname(root);
  }

  process.stderr.write(
    'fatal: not a git repository (or any of the parent directories): .git\n'
  );
  process.exit(1);
}

function wrapper(cb: () => string, newLine: boolean = true) {
  try {
    const output = cb();
    process.stdout.write(output + (newLine ? '\r\n' : ''));
    process.exit(0);
  } catch (e) {
    const err = e as Error;
    console.error(err);
    process.exit(1);
  }
}

program
  .command('init [directory]')
  .description('Create an empty Git repository or reinitialize an existing one')
  .action((directory: string) => {
    wrapper(() => init(directory));
  });

program
  .command('hash-object')
  .description('Compute object ID and optionally create an object from a file')
  .option('-t <type>', 'Type of object to be created', 'blob')
  .option('-w', '--write', 'Actually write the object into the object database')
  .option(
    '--stdin',
    'Read the object from standard input instead of from a file.'
  )
  .argument('[file]', 'File path in case stdin is not provided')
  .action((file, { w, stdin, type }) => {
    const gitRoot = ensureGitRepo();
    wrapper(
      () =>
        hashObject({
          gitRoot,
          type,
          write: w,
          readFromStdin: stdin,
          file,
          stdin: process.stdin
        }),
      true
    );
  });

program
  .command('cat-file')
  .description('Provide content or type information for repository objects')
  .argument('<object>', 'The name of the object to show.')
  .option(
    '-t',
    'Instead of the content, show the object type identified by <object>'
  )
  .option('-p', 'Pretty-print the contents of <object> based on its type')
  .action((object, { t, p }) => {
    const gitRoot = ensureGitRepo();
    wrapper(() => catFile({ gitRoot, object, t, p }), t);
  });

program
  .command('update-index')
  .description('Register file contents in the working tree to the index')
  .argument('<files...>', 'Files to act on')
  .option(
    '--add',
    "If a specified file isn't in the index already then it's added. Default behaviour is to ignore new files.",
    false
  )
  .action((files, { add }) => {
    const gitRoot = ensureGitRepo();
    wrapper(() => updateIndex({ gitRoot, add, files: files }), false);
  });

program
  .command('add')
  .description('Add file contents to the index')
  .argument('<files...>', 'File to add content from')
  .action((files) => {
    const gitRoot = ensureGitRepo();
    wrapper(() => updateIndex({ gitRoot, add: true, files: files }), false);
  });

program
  .command('status')
  .description('Show the working tree status')
  .action(() => {
    const gitRoot = ensureGitRepo();
    wrapper(() => status(gitRoot));
  });

program
  .command('write-tree')
  .description(' Create a tree object from the current index')
  .action(() => {
    const gitRoot = ensureGitRepo();
    wrapper(() => writeTree(gitRoot));
  });

program.parse(process.argv);
