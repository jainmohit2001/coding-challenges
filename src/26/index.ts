import { program } from 'commander';
import init from './commands/init';
import hashObject from './commands/hashObject';
import catFile from './commands/catFile';
import fs from 'fs';
import { BaseCommandArgs } from './commands/types';

const DEFAULT_COMMAND_ARGS: BaseCommandArgs = {
  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr
};

function ensureGitRepo() {
  if (!fs.existsSync('./.git')) {
    process.stderr.write(
      'fatal: not a git repository (or any of the parent directories): .git\n'
    );
    process.exit(1);
  }
}

program
  .command('init [directory]')
  .description('Create an empty Git repository or reinitialize an existing one')
  .action((directory: string) => {
    init({ ...DEFAULT_COMMAND_ARGS, directory });
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
    hashObject({
      ...DEFAULT_COMMAND_ARGS,
      type,
      write: w,
      readFromStdin: stdin,
      file
    });
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
    catFile({ object, t, p });
  });

program.parse(process.argv);
