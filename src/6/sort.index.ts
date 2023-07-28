import { Algorithm } from './enum';
import { unixSort } from './sort';

let unique = false;
let algorithm;

for (let i = 0; i < process.argv.length; i++) {
  const arg = process.argv[i];

  // Represents if the output should contain unique elements
  if (arg === '-u') {
    unique = true;
  }
  if (arg === '--merge-sort') {
    algorithm = Algorithm.MERGE_SORT;
  } else if (arg === '--quick-sort') {
    algorithm = Algorithm.QUICK_SORT;
  } else if (arg === '--heap-sort') {
    algorithm = Algorithm.HEAP_SORT;
  } else if (arg === '--random-sort') {
    algorithm = Algorithm.RANDOM_SORT;
  }
}

const arr = unixSort(process.argv[2], unique, algorithm);
const output = arr.join('\n');
process.stdout.write(output);
