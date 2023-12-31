import { execSync } from 'child_process';
import { unixSort } from '../sort';
import { Algorithm } from '../enum';
import path from 'path';

describe('Test Step 1', () => {
  const filenames = [
    path.join(__dirname, 'words.small.txt'),
    path.join(__dirname, 'words.txt')
  ];

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

    test(`Testing ${filename} with quick sort`, () => {
      const output = unixSort(filename, false, Algorithm.QUICK_SORT);

      expect(output.length).toBe(expectedOutput.length);
      expect(output).toStrictEqual(expectedOutput);
    });

    test(`Testing ${filename} with heap sort`, () => {
      const output = unixSort(filename, false, Algorithm.HEAP_SORT);

      expect(output.length).toBe(expectedOutput.length);
      expect(output).toStrictEqual(expectedOutput);
    });

    test(`Testing ${filename} with random sort`, () => {
      const output = unixSort(filename, false, Algorithm.RANDOM_SORT);

      expect(output.length).toBe(expectedOutput.length);
    });
  });
});

describe('Test Step 2', () => {
  const filenames = [
    path.join(__dirname, 'words.small.txt'),
    path.join(__dirname, 'words.txt')
  ];
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

    test(`Testing ${filename} with unique and quick sort`, () => {
      const output = unixSort(filename, true, Algorithm.QUICK_SORT);

      expect(output.length).toBe(expectedOutput.length);
      expect(output).toStrictEqual(expectedOutput);
    });

    test(`Testing ${filename} with unique and heap sort`, () => {
      const output = unixSort(filename, true, Algorithm.HEAP_SORT);

      expect(output.length).toBe(expectedOutput.length);
      expect(output).toStrictEqual(expectedOutput);
    });

    test(`Testing ${filename} with unique and random sort`, () => {
      const output = unixSort(filename, true, Algorithm.RANDOM_SORT);

      expect(output.length).toBe(expectedOutput.length);
    });
  });
});
