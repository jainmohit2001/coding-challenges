import { program } from 'commander';
import init from './commands/init';
import hashObject from './commands/hashObject';
import catFile from './commands/catFile';
import fs from 'fs';
import updateIndex from './commands/updateIndex';

function ensureGitRepo() {
  if (!fs.existsSync('./.git')) {
    process.stderr.write(
      'fatal: not a git repository (or any of the parent directories): .git\n'
    );
    process.exit(1);
  }
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
    ensureGitRepo();
    wrapper(
      () =>
        hashObject({
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
    ensureGitRepo();
    wrapper(() => catFile({ object, t, p }), t);
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
    ensureGitRepo();
    wrapper(() => updateIndex({ add, files: files }));
  });

program.parse(process.argv);
