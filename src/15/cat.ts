import fs from 'fs';

/**
 * True if we called with -n flag.
 *
 * @type {boolean}
 */
let numberLines: boolean = false;

/**
 * True if called with -b flag
 *
 * @type {boolean}
 */
let skipBlanks: boolean = false;

// Check for flags
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg === '-n') {
    numberLines = true;
    skipBlanks = false;
  } else if (arg === '-b') {
    numberLines = true;
    skipBlanks = true;
  }
}

// We we need to read from stdin
if (
  process.argv.length === 2 ||
  (process.argv.length === 3 &&
    (process.argv[2] === '-' ||
      process.argv[2] === '-n' ||
      process.argv[2] === '-b'))
) {
  // If simple cat call without line number
  if (!numberLines) {
    process.stdin.on('data', (data) => {
      process.stdout.write(data.toString());
    });
  } else {
    handleInput(fs.readFileSync(0).toString(), true);
  }
}
// Else process files
else {
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (fs.existsSync(arg)) {
      // If simple cat call without line number
      if (!numberLines) {
        process.stdout.write(fs.readFileSync(arg));
      } else {
        handleInput(fs.readFileSync(arg).toString());
      }
    }
  }
  process.exit(0);
}

/**
 * This function handles the cat call when we need to print numbers.
 *
 * @param {string} input
 * @param {boolean} [exit=false] - exit from program after printing
 */
function handleInput(input: string, exit: boolean = false) {
  // Split the data
  const data = input.trim().split(/\n|\r\n/);
  let i = 1;

  // For each line
  data.forEach((line, index) => {
    // If we need to skip blank lines
    if (skipBlanks && line.length === 0) {
      data[index] = `\r\n`;
    } else {
      data[index] = `     ${i}\t${line}\r\n`;
      i++;
    }
  });

  // Write data to output
  process.stdout.write(data.join(''));
  if (exit) {
    process.exit(0);
  }
}
