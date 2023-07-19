import { main } from '../../src/4/cut';

const { execSync } = require('child_process');

describe('Testing Field command with input file', () => {
  const filenames = ['./tests/4/sample.tsv'];
  filenames.forEach((filename) => {
    const commandOptions = [
      // ['-f1'],
      ['-f2'],
      ['-f3'],
      ['-f4'],
      ['-f5'],
      ['-f6'],
      ['-f7'],
      ['-f1,2'],
      ['-f1,2,3'],
      ['-f1,5'],
      ['-f2,6'],
      ['-f7,8'],
      ['-f', '"1"'],
      ['-f', '"1 2"'],
      ['-f', '"1 2 3"'],
      ['-f', '"2 6"'],
      ['-f', '"7 8"']
    ];
    commandOptions.forEach((options) => {
      const execOptions = options.join(' ');
      test(`Testing ${execOptions} on ${filename}`, async () => {
        const expectedOutput = execSync(`cut ${execOptions} ${filename}`)
          .toString()
          .replaceAll('\r', '');
        const argv = ['', '', ...options, filename];
        const result = await main(argv);
        expect(result.length).toBe(expectedOutput.length);
        expect(result).toBe(expectedOutput);
      });
    });
  });
});

describe('Testing Field command and delimiter command with input file', () => {
  const filenames = ['./tests/4/fourchords.csv'];
  filenames.forEach((filename) => {
    const commandOptions = [
      ['-f1', '-d,'],
      ['-d,', '-f1'],
      ['-f2', '-d,'],
      ['-f3', '-d,'],
      ['-f4', '-d,'],
      ['-f5', '-d,'],
      ['-f6', '-d,'],
      ['-f7', '-d,'],
      ['-f1,2', '-d,'],
      ['-f1,2,3', '-d,'],
      ['-f1,5', '-d,'],
      ['-f2,6', '-d,'],
      ['-f7,8', '-d,'],
      ['-f', '"1"', '-d,'],
      ['-f', '"1 2"', '-d,'],
      ['-f', '"1 2 3"', '-d,'],
      ['-f', '"2 6"', '-d,'],
      ['-f', '"7 8"', '-d,'],
      ['-d,', '-f', '"7 8"']
    ];
    commandOptions.forEach((options) => {
      const execOptions = options.join(' ');
      test(`Testing ${execOptions} on ${filename}`, async () => {
        const expectedOutput = execSync(`cut ${execOptions} ${filename}`)
          .toString()
          .replaceAll('\r', '');
        const argv = ['', '', ...options, filename];
        const result = await main(argv);
        expect(result.length).toBe(expectedOutput.length);
        expect(result).toBe(expectedOutput);
      });
    });
  });
});
