import fs from 'fs';

const stdout = process.stdout;
const stderr = process.stderr;

const USAGE = `
Usage:
node sed.js s/<this>/<that>/g <filename>
\tSubstitute <this> for <that> everywhere <this> appears in the file <filename>

node sed.js -n "2,4p" <filename>
\tPrint lines 2 to 4 from file <filename>
`;

function printUsage(exit: boolean) {
  stdout.write(USAGE);
  if (exit) {
    process.exit(1);
  }
}

function readFile(path: string): string {
  if (fs.existsSync(path)) {
    return fs.readFileSync(path).toString();
  }
  stderr.write(`Invalid file ${path}`);
  process.exit(1);
}

function parsePattern(str: string) {
  const regex = /^s\/(.*)\/(.*)\/g?$/;
  const match = regex.exec(str);
  if (match) {
    return {
      pattern: match[1],
      replacement: match[2]
    };
  }
  stderr.write(`Invalid pattern ${str}`);
  process.exit(1);
}

function parseRange(str: string) {
  const regex = /^(\d),(\d)p$/;
  const match = regex.exec(str);
  if (match) {
    return {
      start: parseInt(match[1]),
      end: parseInt(match[2])
    };
  }
  stderr.write(`Invalid range ${str}`);
  process.exit(1);
}

function readStdin(): string {
  return fs.readFileSync(process.stdin.fd).toString();
}

function handleCharacterReplacement() {
  // Make sure a character replacement info string is present
  if (process.argv.length < 3) {
    printUsage(true);
  }

  try {
    let content = '';
    const { pattern, replacement } = parsePattern(process.argv[2]);

    // if filename is provided
    if (process.argv.length === 4) {
      content = readFile(process.argv[3]);
    }
    // No filename present, read from stdin
    else {
      content = readStdin();
    }

    const newContent = content.replace(new RegExp(pattern, 'g'), replacement);
    stdout.write(newContent);
    process.exit(0);
  } catch (e) {
    const err = e as Error;
    stderr.write(err.toString());
    printUsage(true);
  }
}

function handleRangeOfLines() {
  // Make sure a range string is present
  if (process.argv.length < 4) {
    printUsage(true);
  }

  try {
    const range = process.argv[3];
    const { start, end } = parseRange(range);
    let content = '';

    // Filename is present
    if (process.argv.length === 5) {
      content = readFile(process.argv[4]);
    }
    // No filename is present, read from stdin
    else {
      content = readStdin();
    }

    const lines = content.split(/\r\n|\n/);
    stdout.write(lines.slice(start, end + 1).join('\r\n'));
    process.exit(0);
  } catch (e) {
    const err = e as Error;
    stdout.write(err.message);
    printUsage(true);
  }
}

// Handle -n option
if (process.argv[2] === '-n') {
  handleRangeOfLines();
}

// Handle character replacement
handleCharacterReplacement();
