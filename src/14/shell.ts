import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { chdir, cwd, stderr, stdin, stdout } from 'process';
import readline from 'readline';
import fs from 'fs';
import { homedir } from 'os';
import path from 'path';

const HISTORY_FILE_PATH = path.join(homedir(), '.ccsh_history');

const rl = readline.createInterface({
  input: stdin,
  output: stdout
});

const capacity = 1000;
const history = new Array<string>();

function addToHistory(input: string) {
  if (history.length === capacity) {
    history.splice(0, 1);
  }
  history.push(input);
}

if (fs.existsSync(HISTORY_FILE_PATH)) {
  const data = fs.readFileSync(HISTORY_FILE_PATH).toString().split('\n');
  data.forEach((input) => {
    history.push(input);
  });
}

function processCommand(input: string): ChildProcessWithoutNullStreams | null {
  const inputArr = input.split(' ');
  const command = inputArr[0];
  const args = inputArr.slice(1, inputArr.length);

  switch (command) {
    case '': {
      return null;
    }
    case 'history': {
      stdout.write(history.join('\n') + '\n');
      return null;
    }
    case 'pwd': {
      addToHistory(input);
      stdout.write(cwd() + '\n');
      return null;
    }
    case 'cd': {
      try {
        chdir(args[0] ?? '');
        addToHistory(input);
      } catch (e) {
        if (e instanceof Error) {
          stdout.write('No such file or directory ' + args[0] + '\n');
        }
      }
      return null;
    }
    case 'exit': {
      fs.writeFileSync(HISTORY_FILE_PATH, history.join('\n'));
      return process.exit(0);
    }
    default: {
      try {
        const newProcess = spawn(command, args);
        return newProcess;
      } catch (e) {
        stderr.write('No such file or directory (os error 2)\n');
      }
      return null;
    }
  }
}

function processPipedCommand(input: string) {
  const index = input.indexOf('|');
  const input1 = input.substring(0, index).trim();
  const input2 = input.substring(index + 1, input.length).trim();

  const input1Arr = input1.split(' ');
  const command1 = input1Arr[0];
  const args1 = input1Arr.slice(1, input1Arr.length);

  const input2Arr = input2.split(' ');
  const command2 = input2Arr[0];
  const args2 = input2Arr.slice(2, input1Arr.length);

  try {
    const p1 = spawn(command1, args1);
    const p2 = spawn(command2, args2);

    p1.stdout.pipe(p2.stdin);

    p1.on('error', () => {
      stderr.write('No such file or directory (os error 2)\n');
    });

    p1.stderr.on('data', (data) => {
      stderr.write(data.toString());
    });

    return p2;
  } catch (e) {
    stderr.write('No such file or directory (os error 2)\n');
  }

  return null;
}

function checkIfPipeCommand(input: string): boolean {
  return input.indexOf('|') > 0;
}

let childProcess: ChildProcessWithoutNullStreams | null;
process.on('SIGINT', () => {
  if (childProcess && childProcess.connected) {
    childProcess.kill('SIGINT');
    return;
  }

  fs.writeFileSync(HISTORY_FILE_PATH, history.join('\n'));

  process.exit(0);
});

function handleInput(input: string) {
  if (checkIfPipeCommand(input)) {
    childProcess = processPipedCommand(input);
  } else {
    childProcess = processCommand(input);
  }

  if (childProcess !== null) {
    childProcess.on('close', (code, signal) => {
      if (signal === null && code === 0) {
        addToHistory(input);
      }
      promptUser();
    });

    childProcess.stdout.on('data', async (data) => {
      stdout.write(data.toString());
    });

    childProcess.stderr.on('data', (data) => {
      stderr.write(data.toString());
    });

    childProcess.on('error', () => {
      stderr.write('No such file or directory (os error 2)\n');
    });
  } else {
    promptUser();
  }
}

function promptUser() {
  rl.question('ccsh>', (input) => {
    const cleanedInput = input.trim();
    console.log(cleanedInput);
    handleInput(cleanedInput);
  });
}

promptUser();
