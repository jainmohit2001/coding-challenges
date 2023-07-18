import { PriorityQueue } from '@datastructures-js/priority-queue';
import { HuffmanNode, IHuffmanNode, compareNode } from './huffman_tree_node';
import { packBitString, unpack } from './utils';

export default class HuffManTree {
  private table?: Map<string, number>;
  private huffmanTree?: HuffmanNode;

  public getHuffmanTree() {
    return this.huffmanTree;
  }

  public getFrequencyTable() {
    return this.table;
  }

  public createFrequencyTable(text: string): Map<string, number> {
    const table = new Map<string, number>();
    let i = 0;
    for (i; i < text.length; i++) {
      const key = text.charAt(i);
      table.set(key, (table.get(key) ?? 0) + 1);
    }
    this.table = table;
    return table;
  }

  public buildHuffmanTree(table: Map<string, number>): HuffmanNode {
    const queue = new PriorityQueue<IHuffmanNode>(compareNode);
    table.forEach((value, key) => {
      const node = new HuffmanNode(value, key, null, null);
      queue.enqueue(node);
    });

    while (queue.size() > 1) {
      const right = queue.dequeue();
      const left = queue.dequeue();
      const node = new HuffmanNode(
        right.weight + left.weight,
        null,
        left,
        right
      );
      queue.enqueue(node);
    }
    const tree = queue.dequeue();
    this.huffmanTree = tree;
    return tree;
  }

  public parseHuffmanTree(
    root: HuffmanNode,
    prefix: string = '',
    map: Map<string, string> = new Map()
  ): Map<string, string> {
    const left = root.left;
    const right = root.right;
    if (root.value) {
      map.set(root.value, prefix);
    }
    if (left) {
      this.parseHuffmanTree(left, prefix + '0', map);
    }
    if (right) {
      this.parseHuffmanTree(right, prefix + '1', map);
    }
    return map;
  }

  public compress(text: string): [Uint8Array, number] {
    const table = this.createFrequencyTable(text);
    const tree = this.buildHuffmanTree(table);
    const codes = this.parseHuffmanTree(tree);
    const compressedString = text
      .split('')
      .map((char) => codes.get(char))
      .join('');

    return packBitString(compressedString);
  }

  public decompress(
    uint8array: Uint8Array,
    padding: number,
    tree?: HuffmanNode
  ): string {
    const compressedText = unpack(uint8array, padding);
    if (tree !== undefined) {
      this.huffmanTree = tree;
    }
    if (this.huffmanTree === undefined) {
      throw new Error('No Huffman Tree ro use!');
    }
    const root = this.huffmanTree;
    let text = '';
    let currNode = root;
    for (const i of compressedText) {
      currNode = i === '0' ? currNode.left! : currNode.right!;
      if (currNode.value !== null) {
        text += currNode.value;
        currNode = root;
      }
    }
    return text;
  }
}
