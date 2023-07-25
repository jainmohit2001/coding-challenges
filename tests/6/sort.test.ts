import { execSync } from 'child_process';
import { unixSort } from '../../src/6/sort';
import { Algorithm } from '../../src/6/enum';

describe('Test Step 1', () => {
  const filenames = ['./tests/6/words.small.txt', './tests/6/words.txt'];
  filenames.forEach((filename) => {
    const expectedOutput = execSync(`sort ${filename}`)
      .toString()
      .trimEnd()
      .split('\n');

    test(`Testing ${filename}`, () => {
      const output = unixSort(filename, false);

      expect(output.length).toBe(expectedOutput.length);
      expect(output).toStrictEqual(expectedOutput);
    });

    test(`Testing ${filename} with merge sort`, () => {
      const output = unixSort(filename, false, Algorithm.MERGE_SORT);

      expect(output.length).toBe(expectedOutput.length);
      expect(output).toStrictEqual(expectedOutput);
    });

    test(`Testing ${filename} with radix sort`, () => {
      const output = unixSort(filename, false, Algorithm.RADIX_SORT);

      expect(output.length).toBe(expectedOutput.length);
      expect(output).toStrictEqual(expectedOutput);
    });
  });
});

describe('Test Step 2', () => {
  const filenames = ['./tests/6/words.small.txt', './tests/6/words.txt'];
  filenames.forEach((filename) => {
    const expectedOutput = execSync(`sort -u ${filename}`)
      .toString()
      .trimEnd()
      .split('\n');

    test(`Testing ${filename} with unique`, () => {
      const output = unixSort(filename, true);

      expect(output.length).toBe(expectedOutput.length);
      expect(output).toStrictEqual(expectedOutput);
    });

    test(`Testing ${filename} with unique and merge sort`, () => {
      const output = unixSort(filename, true, Algorithm.MERGE_SORT);

      expect(output.length).toBe(expectedOutput.length);
      expect(output).toStrictEqual(expectedOutput);
    });

    test(`Testing ${filename} with unique and radix sort`, () => {
      const output = unixSort(filename, true, Algorithm.RADIX_SORT);

      expect(output.length).toBe(expectedOutput.length);
      expect(output).toStrictEqual(expectedOutput);
    });
  });
});
