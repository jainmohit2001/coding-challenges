import fs from 'fs';
import readline from 'readline';

function processLine(text: string, delimiter: string = '\t'): string[] {
  return text.split(delimiter);
}

function getElement(arr: string[], index: number): string | null {
  if (arr.length > index) {
    return arr[index];
  }
  return null;
}

function getElements(
  arr: string[],
  indices: number[],
  delimiter: string = '\t'
): string {
  const text: string[] = [];
  let i = 0;
  for (i; i < indices.length; i++) {
    const elem = getElement(arr, indices[i]);
    if (elem !== null) {
      text.push(elem);
    }
  }
  return text.join(delimiter);
}

async function handleFieldsCommand(
  arg: string,
  filename: string | number,
  delimiter: string = '\t'
): Promise<string> {
  const fields: string[] = arg.split(',');
  const args: number[] = [];

  fields.forEach((field) => {
    args.push(Math.max(0, parseInt(field) - 1));
  });

  return new Promise((res, rej) => {
    let fileStream;
    if (typeof filename === 'number') {
      fileStream = process.stdin;
    } else {
      try {
        fileStream = fs.createReadStream(filename);
      } catch (err) {
        rej(err);
        return;
      }
    }

    if (fileStream === undefined) {
      rej('Invalid stream');
      return;
    }

    const rl = readline.createInterface({
      input: fileStream,
      output: undefined
    });
    let output = '';

    rl.on('line', (line: string) => {
      output +=
        getElements(processLine(line, delimiter), args, delimiter) + '\n';
    });
    rl.on('close', () => {
      res(output);
    });
  });
}

async function processCommand(
  command: string,
  filename: string | number,
  delimiter: string = '\t'
): Promise<string> {
  const commandType = command.substring(0, 2);
  const commandArg = command.substring(2);
  switch (commandType) {
    case '-f':
      return handleFieldsCommand(commandArg, filename, delimiter);
    default:
      printUsage(true);
      return '';
  }
}

function printUsage(exit: boolean = false) {
  const text = `
    Usage
        node cut.js [commandType] <filename>
    `;
  console.log(text);
  if (exit) {
    process.exit(1);
  }
}

function parseFieldListString(str: string) {
  return str.replaceAll('"', '').replaceAll(' ', ',');
}

function unixCut(argv: string[] = process.argv): Promise<string> {
  let delimiter = '\t';
  let command = null;
  let filename = null;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].indexOf('-d') >= 0) {
      delimiter = argv[i].substring(2);
    } else if (argv[i].substring(0, 2) === '-f') {
      // If the field list is whitespace separated list of fields
      if (argv[i].length === 2) {
        command = argv[i];
        command += parseFieldListString(argv[i + 1]);
        i++;
      }
      // If the field list is a comma separated list of fields
      // This also covers the normal case when only 1 field is present
      else {
        command = argv[i];
      }
    } else {
      filename = argv[i];
    }
  }
  if (command === null) {
    console.error('Invalid command %s', command);
    process.exit(1);
  }
  if (filename === null || filename === '-') {
    filename = 0;
  } else if (!fs.existsSync(filename)) {
    console.error('File does not exists!');
    process.exit(1);
  }

  return processCommand(command, filename, delimiter);
}
export { unixCut };
