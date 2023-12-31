import fs from 'fs';
import { Algorithm } from './enum';
import { mergeSort } from './merge_sort';
import { radixSort } from './radix_sort';
import { quicksort } from './quick_sort';
import { heapSort } from './heap_sort';
import { randomSort } from './random_sort';

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
      case Algorithm.QUICK_SORT:
        return quicksort(arr);
      case Algorithm.HEAP_SORT:
        return heapSort(arr);
      case Algorithm.RANDOM_SORT:
        return randomSort(arr);
      default:
        return arr.sort();
    }
  }
  return arr.sort();
}

export { unixSort };
