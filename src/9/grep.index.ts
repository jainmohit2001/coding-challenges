import { grep } from './grep';

let exclude = false;
let caseInsensitive = false;
let expression = '';

const path = process.argv[Math.max(2, process.argv.length - 1)];

if (path == null) {
  console.error('Please provide a file to process');
  process.exit(1);
}

for (let i = 2; i < process.argv.length - 1; i++) {
  const option = process.argv[i];
  if (option == '-i') {
    caseInsensitive = true;
  } else if (option == '-v') {
    exclude = true;
  } else if (expression == '') {
    expression = process.argv[i];
  }
}

console.log(grep(expression, path, exclude, caseInsensitive));
