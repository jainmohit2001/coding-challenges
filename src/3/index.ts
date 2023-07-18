import HuffManTree from './huffman';
import {
  getHeaderSection,
  readFile,
  readOutputFile,
  writeToFile
} from './utils';
import fs from 'fs';

if (process.argv.length < 3) {
  console.error('Invalid use');
  printUsage();
  process.exit(1);
}

const command = process.argv[2];
if (command === '--compress') {
  if (process.argv.length !== 5) {
    console.error('Please provide input and output file for compression');
    printUsage();
    process.exit(1);
  }

  performCompression();
} else if (command === '--decompress') {
  if (process.argv.length !== 5) {
    console.error('Please provide valid input file decompression');
    printUsage();
    process.exit(1);
  }

  performDecompression();
} else {
  console.error('Invalid option provided.');
  printUsage();
  process.exit(1);
}

/**
 * Prints the information about to use this command line tool.
 */
function printUsage() {
  const text = `

  Usage
    compress
        node index.js --compress <input_file> <output_file>
    decompress
        node index.js --decompress <compressed_file> <output_file>

`;
  console.log(text);
}

function performCompression() {
  const inputFile = process.argv[3];
  const outputFile = process.argv[4];

  const text = readFile(inputFile);

  const huffmanTree = new HuffManTree();
  const [compressedText, padding] = huffmanTree.compress(text);
  const freqTable = huffmanTree.getFrequencyTable()!;

  const headerText = getHeaderSection(freqTable);
  writeToFile(outputFile, headerText, compressedText, padding);
  const inSize = fs.statSync(inputFile).size;
  const outSize = fs.statSync(outputFile).size;
  console.log('Input file size ' + inSize);
  console.log('Output file size ' + outSize);
  console.log('Compression ratio achieved %s', inSize / outSize);
  process.exit(0);
}

function performDecompression() {
  const filename = process.argv[3];
  const outFile = process.argv[4];
  const fileContents = fs.readFileSync(filename);
  const [freqTable, compressedTextBuffer, padding] =
    readOutputFile(fileContents);
  const huffmanTree = new HuffManTree();
  huffmanTree.buildHuffmanTree(freqTable);
  const decompressedText = huffmanTree.decompress(
    compressedTextBuffer,
    padding
  );
  fs.writeFileSync(outFile, decompressedText);
  process.exit(0);
}
