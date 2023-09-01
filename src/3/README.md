# Challenge 3 - Write Your Own Compression Tool

This challenge corresponds to the third part of the Coding Challenges series by John Crickett https://codingchallenges.fyi/challenges/challenge-huffman.

## Description

This is a command line tool used to compress a given file using the [Huffman coding algorithm](https://en.wikipedia.org/wiki/Huffman_coding).

- `huffman_tree_node.ts` - This file contains the class definition for the Huffman tree node. Each internal node has a left child, a right child and a weight. Each leaf node has a weight, and a value determining the character.

- `utils.ts` - This file contains some utility functions used by the Huffman coding algorithm.

- `huffman.ts` - This file contains the class definition for the Huffman coding algorithm. All the compression and decompression logic is implemented in this file.

- `index.ts` - This file contains the main function which is the entry point of the command line tool.

## Usage

You can use ts-node to run the command line tool as follows

```bash
# To compress a file
npx ts-node index.ts --compress <input-file> <output-file>
```

Where the `input-file` corresponds to the file to be compressed and the `output-file` corresponds to the compressed file.

```bash
# To decompress a file
npx ts-node index.ts --decompress <compressed-file> <output-file>
```

Where the `compressed-file` corresponds to the compressed input file and the `output-file` corresponds to the decompressed file.

## Run tests

To run the tests for the compression tool, go to the root directory of this repository and run the following command:

```bash
npm test src/3/
```
