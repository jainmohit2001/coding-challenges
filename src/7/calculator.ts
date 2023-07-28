import { Stack } from '../utils/stack';
import { Postfix } from './postfix';
import { OperatorTokens } from './tokens';

export class Calculator {
  text: string;
  private postfix: Postfix;
  private stack: Stack<number>;

  constructor(text: string) {
    this.text = text;
    this.postfix = new Postfix(text);
    this.stack = new Stack();
  }

  public calculate(): number {
    const queue = this.postfix.parse();

    while (queue.size() > 0) {
      const str = queue.dequeue()!;

      if (OperatorTokens.has(str)) {
        const operator = str;

        const operand2 = this.stack.pop()!;
        const operand1 = this.stack.pop()!;

        let value: number;

        switch (operator) {
          case '^':
            value = operand1 ** operand2;
            break;
          case '/':
            value = operand1 / operand2;
            break;
          case '*':
            value = operand1 * operand2;
            break;
          case '+':
            value = operand1 + operand2;
            break;
          case '-':
            value = operand1 - operand2;
            break;
          default:
            throw new Error(`Invalid operator ${str}`);
        }

        this.stack.push(value);
      } else {
        this.stack.push(parseFloat(str));
      }
    }
    return this.stack.pop()!;
  }
}
