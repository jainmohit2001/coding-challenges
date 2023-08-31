# Challenge 7 - Write Your Own Calculator

This challenge corresponds to the seventh part of the Coding Challenges series by John Crickett https://codingchallenges.fyi/challenges/challenge-calculator.

## Description

The aim of the challenge is to write a calculator that can perform basic arithmetic operations on numbers (floating point numbers are also supported).
The calculator supports the following operators:

- `+`: Addition
- `-`: Subtraction
- `*`: Multiplication
- `/`: Division
- `^`: Exponentiation

The calculator also support parentheses `(` and `)` to group operations.

No support for functions such as `sin` or `cos` is currently provided.

**IMP**: The input string should have operators and operands always separated by a space.

The calculator first converts the input string into a postfix expression using [Shunting Yard algorithm](https://en.wikipedia.org/wiki/Shunting_yard_algorithm#The_algorithm_in_detail), and then evaluates the expression to get the result. It will throw an Error if the input string is invalid.

## Usage

You can directly import the Calculator class from the `calculator.ts` file and use it in your code as follows:

```typescript
import { Calculator } from 'path/to/calculator';
const str = '1 + 1';
const value = new Calculator(str).calculate(); // value = 2
```

## Run tests

To run the tests for the Calculator tool, go to the root directory of this repository and run the following command:

```bash
npm run test tests/7/
```

The tests are located in the `tests/7/` directory.
