import fs from 'fs';
import { execSync } from 'child_process';
import { uniq } from '../uniq';
import path from 'path';

function expectLineByLine(buffer: Buffer, output: string) {
  const expectedOutput = buffer
    .toString()
    .replace('\r\n', '\n')
    .trim()
    .split('\n');
  expectedOutput.forEach((text, index) => {
    expectedOutput[index] = text.trim();
  });

  expect(expectedOutput).toStrictEqual(output.trim().split('\n'));
}

describe('Testing with files', () => {
  const files = [
    path.join(__dirname, 'countries.txt'),
    path.join(__dirname, 'test.txt')
  ];

  files.forEach((file) => {
    test(`Handle default behavior ${file}`, async () => {
      const expectedOutput = execSync(`uniq ${file}`)
        .toString()
        .replace('\r\n', '\n')
        .trim();

      const output = (await uniq({ path: file })).trim();

      expect(output).toBe(expectedOutput);
    });

    test(`Testing --count option ${file}`, async () => {
      const output = await uniq({ path: file, count: true });
      expectLineByLine(execSync(`uniq --count ${file}`), output);
    });

    test(`Testing --repeated option ${file}`, async () => {
      const output = await uniq({ path: file, repeated: true });
      expectLineByLine(execSync(`uniq --repeated ${file}`), output);
    });

    test(`Testing -u option ${file}`, async () => {
      const output = await uniq({ path: file, unique: true });
      expectLineByLine(execSync(`uniq -u ${file}`), output);
    });

    test(`Testing -c -d option ${file}`, async () => {
      const output = await uniq({ path: file, count: true, repeated: true });
      expectLineByLine(execSync(`uniq -c -d ${file}`), output);
    });

    test(`Testing -u -c option ${file}`, async () => {
      const output = await uniq({ path: file, unique: true, count: true });
      expectLineByLine(execSync(`uniq -u -c ${file}`), output);
    });
  });
});

describe('Testing with streams', () => {
  const file = path.join(__dirname, 'test.txt');
  const stream = fs.createReadStream(file);

  test(`Handle default behavior ${file}`, async () => {
    const expectedOutput = execSync(`uniq ${file}`)
      .toString()
      .replace('\r\n', '\n')
      .trim();

    const output = (await uniq({ inStream: stream })).trim();

    expect(output).toBe(expectedOutput);
  });

  afterAll(() => {
    stream.close();
  });
});

describe('Invalid tests', () => {
  test('No file and No read Stream provided', () => {
    expect(uniq({})).rejects.toThrow();
  });

  test('Using both -u and -d option', () => {
    expect(uniq({ unique: true, repeated: true })).rejects.toThrow();
  });
});
