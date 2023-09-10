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
  /**
   * To perform the operation in-place or not.
   *
   * @type {boolean}
   */
  inPlace: boolean = false;

  /**
   * The path to the file on which the operation needs to be performed.
   *
   * @type {?string}
   */
  filename?: string;

  /**
   * True when `/^$/d` option is passed.
   *
   * @type {boolean}
   */
  stripTrailingBlankLines: boolean = false;

  /**
   * True when `G` option is passed.
   *
   * @type {boolean}
   */
  doubleSpacing: boolean = false;

  /**
   * Used with `-n` option.
   * Output only lines containing a specific pattern.
   *
   * @type {?string}
   */
  pattern?: string;

  /**
   * Output a range of lines from the file
   *
   * @type {?{
      start: number;
      end: number;
    }}
   */
  range?: {
    start: number;
    end: number;
  };

  /**
   * Carrying out a regular expression change to it
   * @date 9/10/2023 - 11:30:02 PM
   *
   * @type {?{
      pattern: string;
      replacement: string;
    }}
   */
  characterReplacement?: {
    pattern: string;
    replacement: string;
  };

  constructor(args: string[]) {
    // Edge case when no args are provided
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
          // -n option support both the pattern and range editing option

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

/**
 * Prints the usage to stdout.
 * Exits the program with status code 1 when `exit = true`.
 *
 * @param {boolean} exit
 */
function printUsage(exit: boolean): void {
  stdout.write(USAGE);
  if (exit) {
    process.exit(1);
  }
}

/**
 * Read a file if exists otherwise output and error and exit the program.
 *
 * @param {string} path
 * @returns {string}
 */
function readFile(path: string): string {
  if (fs.existsSync(path)) {
    return fs.readFileSync(path).toString();
  }
  stderr.write(`Invalid file '${path}'`);
  process.exit(1);
}

/**
 * Read data from STDIN
 *
 * @returns {string}
 */
function readStdin(): string {
  return fs.readFileSync(process.stdin.fd).toString();
}

/**
 * Read content either from the filename or from the STDIN.
 *
 * @param {?string} [filename]
 * @returns {string}
 */
function getContent(filename?: string): string {
  return filename ? readFile(filename) : readStdin();
}

/**
 * Replace the regex `pattern` with `replacement` in `content`.
 *
 * @param {string} pattern
 * @param {string} replacement
 * @param {string} content
 * @returns {string}
 */
function handleCharacterReplacement(
  pattern: string,
  replacement: string,
  content: string
): string {
  return content.replace(new RegExp(pattern, 'g'), replacement);
}

/**
 * Return lines from `start` to `end` including both from `content`
 *
 * @param {number} start
 * @param {number} end
 * @param {string} content
 * @returns {string}
 */
function handleRangeOfLines(
  start: number,
  end: number,
  content: string
): string {
  const lines = content.split(/\r\n|\n/);
  return lines.slice(start, end + 1).join('\r\n');
}

/**
 * Returns the only lines containing the pattern provided.
 *
 * @param {string} pattern
 * @param {string} content
 * @returns {string}
 */
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

/**
 * Replaces single end of lines with double end of lines.
 *
 * @param {string} content
 * @returns {string}
 */
function handleDoubleSpacing(content: string): string {
  return content.replaceAll(/\r\n|\n/g, '\r\n\r\n');
}

/**
 * Removes the trailing empty lines from given content.
 *
 * @param {string} content
 * @returns {string}
 */
function handleRemoveTrailingEmptyLines(content: string): string {
  return content.trimEnd();
}

/**
 * Performs the in place editing as follows:
 *
 * 1. Creates a new temp file with the provided content in it.
 * 2. Copy the temp file to the path provided.
 * 3. Delete the temp file.
 *
 * @param {string} content
 * @param {string} filepath
 */
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

/**
 * The main entry point to the sed command line tool.
 */
function unixSed() {
  // Parse the args
  const args = new SedInput(process.argv.slice(2, process.argv.length));

  // Read the file or get content from stdin
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
