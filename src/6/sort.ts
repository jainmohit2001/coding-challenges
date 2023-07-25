import fs from 'fs';
import { Algorithm } from './enum';
import { mergeSort } from './merge_sort';
import { radixSort } from './radix_sort';

function unixSort(
  filename: string,
  unique: boolean = false,
  algorithm?: Algorithm
): string[] {
  if (!fs.existsSync(filename)) {
    throw new Error('File does not exists');
  }
  const fileContents = fs.readFileSync(filename).toString().trimEnd();
  let arr = fileContents.split(/\n|\r|\r\n/);
  if (unique) {
    arr = [...new Set(arr)];
  }
  if (algorithm !== undefined) {
    switch (algorithm) {
      case Algorithm.RADIX_SORT:
        return radixSort(arr);
      case Algorithm.MERGE_SORT:
        return mergeSort(arr);
      default:
        return arr.sort();
    }
  }
  return arr.sort();
}

export { unixSort };
