import { ChildProcessWithoutNullStreams, execSync, spawn } from 'child_process';
import path from 'path';

describe('Testing normal command execution', () => {
  const inputs = [
    'uniq --count ./tests/10/countries.txt\n',
    'uniq --repeated ./tests/10/test.txt\n',
    'ls\n',
    'cat README.md\n',
    'cat README.md | wc\n',
    'cat README.md | wc | wc\n',
    'pwd\n',
    'cut -f2 -d, ./tests/4/fourchords.csv | uniq | wc -l\n'
  ];

  // File path to the shell.js file relative to this test file
  const filePath = path.join(
    __dirname,
    '..',
    '..',
    'build',
    'src',
    '14',
    'shell.js'
  );

  let shell: ChildProcessWithoutNullStreams;

  beforeEach(() => {
    shell = spawn('node', [filePath]);
    shell.on('error', (error) => {
      console.error(error);
    });
    shell.stderr.on('data', (data) => {
      console.error(data.toString());
    });
  });

  afterEach(() => {
    shell.kill('SIGINT');
  });

  inputs.forEach((input) => {
    test(`Testing ${input}`, (done) => {
      const expectedOutput = execSync(input).toString();

      shell.stdout.on('data', (data) => {
        // The shell might  output some unnecessary characters
        const output = data.toString().replaceAll('ccsh>', '');

        // Checking if this is a prompt
        if (output.length === 0) {
          return;
        }
        expect(output).toBe(expectedOutput);
        done();
      });

      shell.stdin.write(input);
    });
  });
});
