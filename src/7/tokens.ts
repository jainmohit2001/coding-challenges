/**
 * Interface used for comparing operators.
 * Used while converting infix to postfix notation.
 *
 * @interface IToken
 */
interface IToken {
  /**
   * The operator character
   *
   * @type {string}
   */
  char: string;

  /**
   * Precedence of the operator
   *
   * @type {number}
   */
  precedence: number;

  /**
   * Whether the operator is left associative or not
   *
   * @type {boolean}
   */
  isLeftAssociative: boolean;
}

class Token implements IToken {
  char;
  precedence;
  isLeftAssociative;
  constructor(char: string, precedence: number, isLeftAssociative: boolean) {
    this.char = char;
    this.precedence = precedence;
    this.isLeftAssociative = isLeftAssociative;
  }
}

/**
 * All the operators supported by the calculator.
 *
 * @type {Map<string, Token>}
 */
const OperatorTokens: Map<string, Token> = new Map<string, Token>();

OperatorTokens.set('^', new Token('^', 4, false));
OperatorTokens.set('*', new Token('*', 3, true));
OperatorTokens.set('/', new Token('/', 3, true));
OperatorTokens.set('+', new Token('+', 2, true));
OperatorTokens.set('-', new Token('-', 2, true));

export { OperatorTokens };
