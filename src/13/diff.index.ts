import fs from 'fs';
import { diffBetweenFiles } from './diff';

function printUsage() {
  console.log('Usage: \n\tnode diff.index.js <file1> <file2>');
  process.exit(1);
}

const file1 = process.argv[2];
const file2 = process.argv[3];

if (file1 === undefined || file2 === undefined) {
  printUsage();
}

if (!fs.existsSync(file1)) {
  console.error('File not found - ' + file1);
  process.exit(1);
}

if (!fs.existsSync(file2)) {
  console.error('File not found - ' + file2);
  process.exit(1);
}

const output = diffBetweenFiles(file1, file2);
output[1].forEach((line) => {
  console.log(line);
});
process.exit(0);
