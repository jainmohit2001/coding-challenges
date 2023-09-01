# Challenge 9 - Write your own grep

This challenge corresponds to the ninth part of the Coding Challenges series by John Crickett https://codingchallenges.fyi/challenges/challenge-grep.

## Description

The GREP tool is written in `grep.ts` file and the `grep.index.ts` is the command line version of the tool. The tool is used to search for a pattern in a file or a directory and print the matching lines.

The implementation is using the inbuilt `RegExp` class of JavaScript.

## Usage

You can use `ts-node` to run the tool as follows:

```bash
npx ts-node grep.index.ts <expression> [-i] [-v] <path>
```

The following options are supported:

- `-i`: case insensitive search
- `-v`: print lines that do not match the pattern

## Run tests

To run the tests for the grep tool, go to the root directory of this repository and run the following command:

```bash
npm test src/9/
```

All the tests are made for **LINUX** environment only. If you want to run the tests in Windows environment, you can use the Git Bash terminal or Windows Subsystem for Linux (WSL).
