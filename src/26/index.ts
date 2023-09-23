import { program } from 'commander';
import init from './commands/init';

program
  .command('init [directory]')
  .description('Create an empty Git repository or reinitialize an existing one')
  .action((directory: string) => {
    init(directory);
  });

program.parse(process.argv);
