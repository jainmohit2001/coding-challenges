import fs from 'fs';
import path from 'path';
import os from 'os';
import { randomBytes } from 'crypto';

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

node sed.js G <filename>
\tAdd another line after each line, i.e. double spacing a file.

node sed.js -i 's/<this>/<that>/g' <filename>
\tEdit in-place: Substitute <this> for <that> everywhere <this> appears in the file <filename>
`;

class SedInput {
  inPlace: boolean = false;
  filename?: string;
  stripTrailingBlankLines: boolean = false;
  doubleSpacing: boolean = false;
  pattern?: string;
  range?: {
    start: number;
    end: number;
  };
  characterReplacement?: {
    pattern: string;
    replacement: string;
  };

  constructor(args: string[]) {
    if (args.length === 0) {
      printUsage(true);
    }
    for (let i = 0; i < args.length; i++) {
      switch (args[i]) {
        case 'G':
          if (this.doubleSpacing) {
            printUsage(true);
          }
          this.doubleSpacing = true;
          break;
        case '/^$/d':
          if (this.stripTrailingBlankLines) {
            printUsage(true);
          }
          this.stripTrailingBlankLines = true;
          break;
        case '-i':
          if (this.inPlace) {
            printUsage(true);
          }
          this.inPlace = true;
          break;
        case '-n': {
          if (this.pattern || this.range) {
            printUsage(true);
          }
          // Increment i and get the pattern/range string input
          i++;
          // pattern option
          const patternRegex = /^\/(.*)\/p$/;
          const patternMatch = patternRegex.exec(args[i]);
          if (patternMatch) {
            this.pattern = patternMatch[1];
            break;
          }

          // range option
          const rangeRegex = /^(\d),(\d)p$/;
          const rangeMatch = rangeRegex.exec(args[i]);
          if (rangeMatch) {
            this.range = {
              start: parseInt(rangeMatch[1]),
              end: parseInt(rangeMatch[2])
            };
            break;
          }
          console.error('Invalid pattern or range ' + args[i]);
          printUsage(true);
          break;
        }
        default: {
          // Check if this is a character replacement info string
          const regex = /^s\/(.*)\/(.*)\/g?$/;
          const match = regex.exec(args[i]);
          if (match) {
            if (this.characterReplacement) {
              printUsage(true);
            }
            this.characterReplacement = {
              pattern: match[1],
              replacement: match[2]
            };
            break;
          }

          if (this.filename) {
            printUsage(true);
          }
          // Otherwise it is a file
          this.filename = args[i];
        }
      }
    }

    // Character replacement cannot be provided with -n option
    if ((this.pattern || this.range) && this.characterReplacement) {
      printUsage(true);
    }

    // If in place option is used but no filename is provided
    if (this.inPlace && !this.filename) {
      printUsage(true);
    }
  }
}

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
  stderr.write(`Invalid file '${path}'`);
  process.exit(1);
}

function readStdin(): string {
  return fs.readFileSync(process.stdin.fd).toString();
}

function getContent(filename?: string): string {
  return filename ? readFile(filename) : readStdin();
}

function handleCharacterReplacement(
  pattern: string,
  replacement: string,
  content: string
): string {
  return content.replace(new RegExp(pattern, 'g'), replacement);
}

function handleRangeOfLines(
  start: number,
  end: number,
  content: string
): string {
  const lines = content.split(/\r\n|\n/);
  return lines.slice(start, end + 1).join('\r\n');
}

function handlePattern(pattern: string, content: string): string {
  const lines = content.split(/\r\n|\n/);
  const output: string[] = [];

  lines.forEach((line) => {
    if (line.indexOf(pattern) >= 0) {
      output.push(line);
    }
  });

  return output.join('\r\n');
}

function handleDoubleSpacing(content: string): string {
  return content.replaceAll(/\r\n|\n/g, '\r\n\r\n');
}

function handleRemoveTrailingEmptyLines(content: string): string {
  return content.trimEnd();
}

function handleInPlace(content: string, filepath: string) {
  const tempPath = path.join(
    os.tmpdir(),
    randomBytes(8).toString('hex') + '.txt'
  );
  fs.writeFileSync(tempPath, content);
  fs.copyFile(tempPath, filepath, (err) => {
    if (err) {
      stderr.write(err.toString());
      process.exit(1);
    }
    fs.unlinkSync(tempPath);
    process.exit(0);
  });
}

function unixSed() {
  const args = new SedInput(process.argv.slice(2, process.argv.length));
  let finalContent = getContent(args.filename);

  if (args.doubleSpacing) {
    finalContent = handleDoubleSpacing(finalContent);
  }

  if (args.pattern) {
    finalContent = handlePattern(args.pattern, finalContent);
  }

  if (args.range) {
    finalContent = handleRangeOfLines(
      args.range.start,
      args.range.end,
      finalContent
    );
  }

  if (args.stripTrailingBlankLines) {
    finalContent = handleRemoveTrailingEmptyLines(finalContent);
  }

  if (args.characterReplacement) {
    finalContent = handleCharacterReplacement(
      args.characterReplacement.pattern,
      args.characterReplacement.replacement,
      finalContent
    );
  }
  if (!args.inPlace) {
    stdout.write(finalContent);
    process.exit(0);
  }
  handleInPlace(finalContent, args.filename!);
}

unixSed();
