import { Stack } from '../utils/stack';
import { Postfix } from './postfix';
import { OperatorTokens } from './tokens';

export class Calculator {
  /**
   * The input provided by the user
   *
   * @type {string}
   */
  text: string;

  /**
   * The Postfix class instance
   *
   * @private
   * @type {Postfix}
   */
  private postfix: Postfix;

  /**
   * Stack used after infix to postfix conversion.
   * Used for calculating the value of the expression.
   *
   * @private
   * @type {Stack<number>}
   */
  private stack: Stack<number>;

  constructor(text: string) {
    this.text = text;
    this.postfix = new Postfix(text);
    this.stack = new Stack();
  }

  public calculate(): number {
    // First convert the infix notation to postfix notation.
    const queue = this.postfix.parse();

    while (queue.size() > 0) {
      // Get the next token from the queue.
      const str = queue.dequeue()!;

      // If the token is an operator, pop two values from the stack,
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

        // Perform the operation and push the result to the stack.
        this.stack.push(value);
      } else {
        // If the token is an operand, push it to the stack.
        this.stack.push(parseFloat(str));
      }
    }
    return this.stack.pop()!;
  }
}
