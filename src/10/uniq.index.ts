import fs from 'fs';
import { uniq } from './uniq';

async function main() {
  let inFile: string | undefined = undefined;
  let outFile: string | undefined = undefined;
  const inStream = process.stdin;
  const outStream = process.stdout;
  let count = false;
  let repeated = false;
  let unique = false;

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];

    // Check for -c, -d
    if (arg === '-c' || arg === '--count') {
      count = true;
      continue;
    } else if (arg === '-d' || arg === '--repeated') {
      repeated = true;
      continue;
    } else if (arg === '-u') {
      unique = true;
      continue;
    }

    // If no input file is provided
    if (arg === '-') {
      inFile = undefined;

      // Check for output file
      if (i < process.argv.length - 1) {
        outFile = process.argv[i + 1];
      }
      break;
    }

    // Case when input file is provided
    inFile = arg;
    // Check if output file is provided
    if (i < process.argv.length - 1) {
      outFile = process.argv[i + 1];
    }
    break;
  }

  if (inFile !== undefined) {
    if (!fs.existsSync(inFile)) {
      console.error('File does not exists');
      process.exit(1);
    }
  }
  const output = await uniq({
    path: inFile,
    inStream: inStream,
    count: count,
    repeated: repeated,
    unique: unique
  });

  if (outFile !== undefined) {
    fs.writeFileSync(outFile, output);
    process.exit(0);
  }
  outStream.write(output);
  process.exit(0);
}

main();
