import fs from 'fs';

/**
 * This function runs the GREP functionality on a given file.
 * Returns null if no match found in the file.
 *
 * @param {string} expression
 * @param {string} filePath
 * @param {boolean} [prependFilePath=false] - Used when we are recursively searching in a dir.
 * @param {boolean} [exclude=false] - Represents the -v option
 * @param {boolean} [caseInsensitive=false] - Represents the -i option
 * @returns {(string | null)}
 */
function grepFile(
  expression: string,
  filePath: string,
  prependFilePath: boolean = false,
  exclude: boolean = false,
  caseInsensitive: boolean = false
): string | null {
  const input = fs.readFileSync(filePath).toString();
  if (expression === '') {
    return input;
  }
  // Split the lines into input
  const lines = input.split(/\r|\r\n|\n/);
  const output: string[] = [];

  // Generate the RegExp based on the inputs
  let regExp: RegExp;
  if (caseInsensitive) {
    regExp = new RegExp(expression, 'i');
  } else {
    regExp = new RegExp(expression);
  }

  // For each line test the RegExp and include/exclude based on the inputs.
  lines.forEach((line) => {
    const matches = regExp.exec(line);
    if (exclude && matches === null) {
      output.push(line);
    } else if (!exclude && matches !== null) {
      if (prependFilePath) {
        output.push(filePath + ':' + line);
      } else {
        output.push(line);
      }
    }
  });

  if (output.length > 0) {
    return output.join('\n');
  }
  return null;
}

/**
 * Helper function to recursively traverse a DIR.
 *
 * @param {string} path
 * @param {string[]} [arr=[]]
 * @returns {string[]}
 */
function getFiles(path: string, arr: string[] = []): string[] {
  const files = fs.readdirSync(path);

  files.forEach((file) => {
    if (fs.statSync(path + '/' + file).isDirectory()) {
      arr = getFiles(path + '/' + file, arr);
    } else {
      arr.push(path + '/' + file);
    }
  });

  return arr;
}

/**
 * Main grep function that performs the GREP operation.
 * Returns null if no match found
 *
 * @param {string} expression
 * @param {string} path
 * @param {boolean} [exclude=false] - Represents the -v option
 * @param {boolean} [caseInsensitive=false] - Represents the -i option
 * @returns {(string | null)}
 */
function grep(
  expression: string,
  path: string,
  exclude: boolean = false,
  caseInsensitive: boolean = false
): string | null {
  const stats = fs.statSync(path);
  if (stats.isFile()) {
    return grepFile(expression, path, false, exclude, caseInsensitive);
  }
  const output: string[] = [];

  if (stats.isDirectory()) {
    const files = getFiles(path);

    files.forEach((file) => {
      const fileOutput = grepFile(
        expression,
        file,
        true,
        exclude,
        caseInsensitive
      );
      if (fileOutput != null) {
        output.push(fileOutput);
      }
    });
  }
  if (output.length > 0) {
    return output.join('\n');
  }
  return null;
}

export { grep };
