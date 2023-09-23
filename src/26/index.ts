import { program } from 'commander';
import init from './commands/init';
import { HashObjectArgs, hashObject } from './commands/hashObject';

program
  .command('init [directory]')
  .description('Create an empty Git repository or reinitialize an existing one')
  .action((directory: string) => {
    init(directory);
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
    const args: HashObjectArgs = {
      type: type,
      write: w,
      readFromStdin: stdin,
      file: file
    };
    hashObject(args);
  });

program.parse(process.argv);
