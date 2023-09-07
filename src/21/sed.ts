import fs from 'fs';

const stdout = process.stdout;
const stderr = process.stderr;

function printUsage(exit: boolean) {
  stdout.write(
    'Usage: node sed.js s/<this>/<that>/g <filename>\n\nSubstitute `this` for `that` everywhere `this` appears in the file `filename`'
  );
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
  if (!match) {
    stderr.write(`Invalid pattern ${str}`);
    process.exit(1);
  }
  return {
    pattern: match[1],
    replacement: match[2]
  };
}

if (process.argv.length !== 4) {
  printUsage(true);
}

const { pattern, replacement } = parsePattern(process.argv[2]);

const filename = process.argv[3];

const content = readFile(filename);

const newContent = content.replace(new RegExp(pattern, 'g'), replacement);
stdout.write(newContent);
