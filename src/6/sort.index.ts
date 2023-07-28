import { Algorithm } from './enum';
import { unixSort } from './sort';

let unique = false;
let algorithm;

for (let i = 0; i < process.argv.length; i++) {
  if (process.argv[i] === '-u') {
    unique = true;
  }
  if (process.argv[i] === '--merge-sort') {
    algorithm = Algorithm.MERGE_SORT;
  } else if (process.argv[i] === '--quick-sort') {
    algorithm = Algorithm.QUICK_SORT;
  }
}

const arr = unixSort(process.argv[2], unique, algorithm);
const output = arr.join('\n');
process.stdout.write(output);
