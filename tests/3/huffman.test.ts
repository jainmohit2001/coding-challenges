import { packBitString, readFile, unpack } from '../../src/3/utils';
import HuffManTree from '../../src/3/huffman';
import fs from 'fs';

describe('Verify frequency table', () => {
  const filename = './tests/3/test_files/test1.txt';
  const text = readFile(filename);

  test(`Test -  ${filename}`, () => {
    const huffmanTree = new HuffManTree();
    const table = huffmanTree.createFrequencyTable(text);

    expect(table.get('X')).toBe(333);
    expect(table.get('t')).toBe(223000);
  });
});

describe('Verify Huffman tree creation', () => {
  test('Tree example 1 ', () => {
    // https://opendsa-server.cs.vt.edu/ODSA/Books/CS3/html/Huffman.html#freqexamp
    const table = new Map<string, number>();
    table.set('C', 32);
    table.set('D', 42);
    table.set('E', 120);
    table.set('K', 7);
    table.set('L', 42);
    table.set('M', 24);
    table.set('U', 37);
    table.set('Z', 2);

    const huffmanTree = new HuffManTree();
    const tree = huffmanTree.buildHuffmanTree(table);
    expect(tree.weight).toBe(306);
  });
});

describe('Verify whole process', () => {
  const dir = './tests/3/test_files/';
  const filenames = fs.readdirSync(dir);
  filenames.forEach((filename) => {
    const text = fs.readFileSync(dir + filename, 'utf-8').toString();
    test(`Testing ${filename} `, () => {
      const huffmanTree = new HuffManTree();
      const [compressedText, padding] = huffmanTree.compress(text);
      const decompressedText = huffmanTree.decompress(compressedText, padding);
      expect(decompressedText.length).toBe(text.length);
      expect(decompressedText).toBe(text);
    });
  });
});

describe('Test packing and unpacking', () => {
  const binaryStrings = [
    '',
    '0',
    '00',
    '000',
    '0001',
    '00110',
    '010100',
    '0100101',
    '01000010',
    '000100010'
  ];
  binaryStrings.forEach((text) => {
    test(`Testing ${text}`, () => {
      const [packed, padding] = packBitString(text);
      const unpacked = unpack(packed, padding);
      expect(unpacked).toBe(text);
    });
  });
});
