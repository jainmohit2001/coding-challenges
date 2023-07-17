enum NumberToken {
  ZERO = '0',
  ONE = '1',
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  MINUS = '-',
  DOT = '.',
  SMALL_EXPONENT = 'e',
  CAPITAL_EXPONENT = 'E',
  PLUS = '+'
}

enum EscapeToken {
  QUOTE = '"',
  REVERSE_SOLIDUS = '\\',
  SOLIDUS = '/',
  BACKSPACE = 'b',
  FORM_FEED = 'f',
  LINE_FEED = 'n',
  CAR_RETURN = 'r',
  HORIZONTAL_TAB = 't',
  HEX = 'u'
}

enum Token {
  BEGIN_OBJECT = '{',
  END_OBJECT = '}',
  BEGIN_TRUE = 't',
  BEGIN_FALSE = 'f',
  BEGIN_NULL = 'n',
  BEGIN_ARRAY = '[',
  END_ARRAY = ']',
  COMMA = ',',
  QUOTE = '"',
  MINUS = '-',
  SEMI_COLON = ':',
  ESCAPE = '\\',
  BACKSPACE = '\b',
  FORM_FEED = '\f',
  LINE_FEED = '\n',
  CAR_RETURN = '\r',
  HORIZONTAL_TAB = '\t',
  HEX = 'u'
}

export { Token, NumberToken, EscapeToken };
