interface IToken {
  char: string;
  precedence: number;
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

const OperatorTokens = new Map<string, Token>();

OperatorTokens.set('^', new Token('^', 4, false));
OperatorTokens.set('*', new Token('*', 3, true));
OperatorTokens.set('/', new Token('/', 3, true));
OperatorTokens.set('+', new Token('+', 2, true));
OperatorTokens.set('-', new Token('-', 2, true));

export { OperatorTokens };
