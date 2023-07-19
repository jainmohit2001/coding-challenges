import { main } from '../../src/4/cut';

const { execSync } = require('child_process');

describe('Testing Field command and input file', () => {
  const filenames = ['./tests/4/sample.tsv'];
  filenames.forEach((filename) => {
    const commandOptions = ['-f1', '-f2', '-f3', '-f4', '-f5', '-f6', '-f7'];
    commandOptions.forEach((option) => {
      test(`Testing ${option} on ${filename}`, async () => {
        const expectedOutput = execSync(`cut ${option} ${filename}`)
          .toString()
          .replaceAll('\r', '');
        const options = option.split(' ');
        const argv = ['', '', ...options, filename];
        const result = await main(argv);
        diff2String(result, expectedOutput);
        expect(result.length).toBe(expectedOutput.length);
        expect(result).toBe(expectedOutput);
      });
    });
  });
});

describe('Testing Field command and delimiter command and input file', () => {
  const filenames = ['./tests/4/fourchords.csv'];
  filenames.forEach((filename) => {
    const commandOptions = [
      '-f1 -d,',
      '-f2 -d,',
      '-f3 -d,',
      '-f4 -d,',
      '-f5 -d,',
      '-f6 -d,',
      '-f7 -d,'
    ];
    commandOptions.forEach((option) => {
      test(`Testing ${option} on ${filename}`, async () => {
        const expectedOutput = execSync(`cut ${option} ${filename}`)
          .toString()
          .replaceAll('\r', '');
        const options = option.split(' ');
        const argv = ['', '', ...options, filename];
        const result = await main(argv);
        diff2String(result, expectedOutput);
        expect(result.length).toBe(expectedOutput.length);
        expect(result).toBe(expectedOutput);
      });
    });
  });
});

function diff2String(s1: string, s2: string) {
  const length = Math.min(s1.length, s2.length);
  const errors = [];
  for (let i = 0; i < length; i++) {
    if (s1[i] !== s2[i]) {
      errors.push(`${i} ${s1[i]} ${s2[i]}`);
    }
  }
  if (length < s1.length) {
    for (let i = length; i < s1.length; i++) {
      errors.push(`s1: ${i} ${s1[i]}`);
    }
  }
  if (length < s2.length) {
    for (let i = length; i < s2.length; i++) {
      errors.push(`s2: ${i} ${s2[i]}`);
    }
  }
  if (errors.length > 0) {
    console.error(errors);
  }
}
