import fs from 'fs';

function readFile(filename: string): string {
  if (fs.existsSync(filename)) {
    return fs.readFileSync(filename, 'utf-8').toString();
  }
  console.error("Input file doesn't exists!");
  process.exit(1);
}

/**
 * Function to write compressed that along with header
 *
 * @param {string} filename - The output filename
 * @param {string} headerText - relevant information need while decompression
 * @param {Uint8Array} uint8Array - The compressed text
 * @param {number} padding - The padding of the compressed text
 */
function writeToFile(
  filename: string,
  headerText: string,
  uint8Array: Uint8Array,
  padding: number
): void {
  // Converting headerText to Uint8Array.
  // When reading the file again for decompression, input is processed in Buffer
  const headerUint8Array = new TextEncoder().encode(headerText);

  // Creating new file and appending header length to it
  fs.writeFileSync(filename, headerUint8Array.length.toString() + '\n');

  // Follows by the 0 <= padding < 8
  fs.appendFileSync(filename, padding.toString() + '\n');

  // Followed by the headerText
  fs.appendFileSync(filename, headerUint8Array);

  // Finally the compressed data
  fs.appendFileSync(filename, uint8Array);
}

/**
 * Converts frequency table to relevant format for storing in file
 *
 * @param {Map<string, number>} freqTable
 * @returns {string}
 */
function getHeaderSection(freqTable: Map<string, number>): string {
  return JSON.stringify(Array.from(freqTable.entries()));
}

/**
 * Reads compressed file from the given Buffer
 *
 * @param {Buffer} inputBuffer
 * @returns {[Map<string, number>, Uint8Array, number]} - [Frequency Table, Compressed text, padding]
 */
function readOutputFile(
  inputBuffer: Buffer
): [Map<string, number>, Uint8Array, number] {
  // Retrieve Header length
  let headerBufferStartIndex = 0;
  while (inputBuffer[headerBufferStartIndex] !== '\n'.charCodeAt(0)) {
    headerBufferStartIndex++;
  }
  const headerLength = parseInt(
    inputBuffer.subarray(0, headerBufferStartIndex).toString()
  );
  headerBufferStartIndex++; // Move to next line

  // Process padding
  const padding = parseInt(
    inputBuffer
      .subarray(headerBufferStartIndex, headerBufferStartIndex + 1)
      .toString()
  );
  headerBufferStartIndex += 2; // Move to next line

  const headerBufferEndIndex = headerBufferStartIndex + headerLength;

  // Process header
  const headerBuffer = inputBuffer.subarray(
    headerBufferStartIndex,
    headerBufferEndIndex
  );
  const freqTable = new Map<string, number>(
    JSON.parse(headerBuffer.toString())
  );

  // Process the compressed text
  const compressedTextBuffer = inputBuffer.subarray(headerBufferEndIndex);

  return [freqTable, compressedTextBuffer, padding];
}

/**
 * Function to convert bits in string format to bytes in Uint8Array format
 *
 * @param {string} bitString - A string consisting of zeros and ones
 * @returns {[Uint8Array, number]} - [Array of numbers after packing bits to bytes, padded zeros at the end]
 */
function packBitString(bitString: string): [Uint8Array, number] {
  // Add padding if the length of bit string is not a multiple of 8;
  let paddedBitString = bitString;
  while (paddedBitString.length % 8 !== 0) {
    paddedBitString += '0';
  }
  const padding = paddedBitString.length - bitString.length;
  const byteCount = paddedBitString.length / 8;
  const bytes = new Uint8Array(byteCount);

  for (let i = 0; i < byteCount; i++) {
    const start = i * 8;
    const end = start + 8;
    const byte = paddedBitString.slice(start, end);
    bytes[i] = parseInt(byte, 2);
  }
  return [bytes, padding];
}

function unpack(uint8array: Uint8Array, padding: number): string {
  let binaryString = '';

  for (let i = 0; i < uint8array.length; i++) {
    const byte = uint8array[i];
    binaryString += byte.toString(2).padStart(8, '0');
  }
  // Remove padding
  return binaryString.substring(0, binaryString.length - padding);
}
export {
  readFile,
  writeToFile,
  getHeaderSection,
  readOutputFile,
  packBitString,
  unpack
};
