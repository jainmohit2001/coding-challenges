const fs = require('fs');
const readline = require('readline');

function processLine(text: string, delimiter: string = '\t'): string[] {
  return text.split(delimiter);
}

function getElement(arr: string[], index: number): string {
  if (arr.length > index) {
    return arr[index];
  }
  return '';
}

async function handleField(
  arg: number,
  filename: string,
  delimiter: string = '\t'
): Promise<string> {
  arg = Math.max(0, arg - 1);
  return new Promise((res, rej) => {
    const fileStream = fs.createReadStream(filename);
    const rl = readline.createInterface({
      input: fileStream,
      output: null,
      console: false
    });
    let output = '';

    rl.on('line', (line: string) => {
      output += getElement(processLine(line, delimiter), arg) + '\n';
    });
    rl.on('close', () => {
      res(output);
    });
  });
}

async function processCommand(
  command: string,
  filename: string,
  delimiter: string = '\t'
): Promise<string> {
  const commandType = command.substring(0, 2);
  const commandArg = command.substring(2);
  switch (commandType) {
    case '-f':
      return handleField(parseInt(commandArg), filename, delimiter);
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

function main(argv: string[] = process.argv): Promise<string> {
  let delimiter = '\t';
  let command = null;
  const filename = argv[argv.length - 1];
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].indexOf('-d') >= 0) {
      delimiter = argv[i].substring(2);
    } else if (argv[i][0] === '-') {
      command = argv[i];
    }
  }
  if (command === null || filename === null) {
    console.error('Invalid command %s or filename %s', command, filename);
    process.exit(1);
  }

  if (!fs.existsSync(filename)) {
    console.error('File does not exists!');
    process.exit(1);
  }

  return processCommand(command, filename, delimiter);
}
export { main };
