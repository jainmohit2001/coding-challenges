import fs from 'fs';

const stdout = process.stdout;
const stderr = process.stderr;

const USAGE = `
Usage:
node sed.js s/<this>/<that>/g <filename>
\tSubstitute <this> for <that> everywhere <this> appears in the file <filename>

node sed.js -n "2,4p" <filename>
\tPrint lines 2 to 4 from file <filename>

node sed.js -n /pattern/p <filename>
\tOutput only lines containing a specific pattern <pattern> from file <filename>

node G <filename>
\tAdd another line after each line, i.e. double spacing a file.
`;

function printUsage(exit: boolean): void {
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

function parseCharacterReplacementInfo(str: string): {
  pattern: string;
  replacement: string;
} {
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

function parsePattern(str: string): string {
  const regex = /^\/(.*)\/p$/;
  const match = regex.exec(str);
  if (match) {
    return match[1];
  }
  stderr.write(`Invalid pattern ${str}`);
  process.exit(1);
}

function parseRange(str: string): { start: number; end: number } {
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

function getContent(index: number): string {
  // if filename is provided
  if (process.argv.length >= 4) {
    return readFile(process.argv[index]);
  }

  // No filename present, read from stdin
  return readStdin();
}

function handleCharacterReplacement(): void {
  // Make sure a character replacement info string is present
  if (process.argv.length < 3) {
    printUsage(true);
  }

  try {
    const { pattern, replacement } = parseCharacterReplacementInfo(
      process.argv[2]
    );
    const content = getContent(3);

    const newContent = content.replace(new RegExp(pattern, 'g'), replacement);
    stdout.write(newContent);
    process.exit(0);
  } catch (e) {
    const err = e as Error;
    stderr.write(err.toString());
    printUsage(true);
  }
}

function handleRangeOfLines(): void {
  // Make sure a range string is present
  if (process.argv.length < 4) {
    printUsage(true);
  }

  try {
    const range = process.argv[3];
    const { start, end } = parseRange(range);
    const content = getContent(4);

    const lines = content.split(/\r\n|\n/);
    stdout.write(lines.slice(start, end + 1).join('\r\n'));
    process.exit(0);
  } catch (e) {
    const err = e as Error;
    stdout.write(err.toString());
    printUsage(true);
  }
}

function handlePattern(): void {
  try {
    const pattern = parsePattern(process.argv[3]);
    const content = getContent(4);

    const lines = content.split(/\r\n|\n/);
    const output: string[] = [];

    lines.forEach((line) => {
      if (line.indexOf(pattern) >= 0) {
        output.push(line);
      }
    });

    stdout.write(output.join('\r\n'));
    process.exit(0);
  } catch (e) {
    const err = e as Error;
    stderr.write(err.toString());
    printUsage(true);
  }
}

function handleDoubleSpacing() {
  try {
    const content = getContent(3);
    stdout.write(content.replaceAll(/\r\n|\n/g, '\r\n\r\n'));
    process.exit(0);
  } catch (e) {
    const err = e as Error;
    stderr.write(err.toString());
    printUsage(true);
  }
}

function handleRemoveTrailingEmptyLines() {
  try {
    const content = getContent(3);
    stdout.write(content.trimEnd());
    process.exit(0);
  } catch (e) {
    const err = e as Error;
    stderr.write(err.toString());
    printUsage(true);
  }
}

// Check for double spacing
if (process.argv[2] === 'G') {
  handleDoubleSpacing();
}

// Handle -n option
if (process.argv[2] === '-n') {
  // Handle when pattern option is passed
  const regex = /^\/(.*)\/p$/;
  const match = regex.exec(process.argv[3]);
  if (match) {
    handlePattern();
  } else {
    handleRangeOfLines();
  }
}

// Check for /^$/d
if (process.argv[2] === '/^$/d') {
  handleRemoveTrailingEmptyLines();
}

// Handle character replacement
handleCharacterReplacement();
