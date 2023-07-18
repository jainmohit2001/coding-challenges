import { ICompare } from '@datastructures-js/priority-queue';

interface IHuffmanNode {
  value: string | null;
  weight: number;
  left: IHuffmanNode | null;
  right: IHuffmanNode | null;
  isLeaf(): boolean;
}

class HuffmanNode implements IHuffmanNode {
  public value: string | null;
  public weight: number;
  public left: HuffmanNode | null;
  public right: HuffmanNode | null;

  constructor(
    weight: number,
    value: string | null = null,
    left: HuffmanNode | null = null,
    right: HuffmanNode | null = null
  ) {
    this.value = value;
    this.weight = weight;
    this.left = left;
    this.right = right;
  }

  public isLeaf(): boolean {
    return this.left !== undefined && this.right !== undefined;
  }
}

const compareNode: ICompare<IHuffmanNode> = (
  a: IHuffmanNode,
  b: IHuffmanNode
) => {
  if (a.weight < b.weight) {
    return -1;
  }
  if (a.weight === b.weight) {
    return 0;
  }
  return 1;
};

export { IHuffmanNode, HuffmanNode, compareNode };
