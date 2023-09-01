# Challenge 15 - Write Your Own cat Tool

This challenge corresponds to the fifteenth part of the Coding Challenges series by John Crickett https://codingchallenges.fyi/challenges/challenge-cat.

## Description

The cat utility reads files sequentially, writing them to the standard output.
The file operands are processed in command-line order. If file is a single dash (`-`) or absent, cat reads from the standard input.

## Usage

You can use `ts-node` to run the tool as follows:

```bash
# Using file
npx ts-node cat.ts [-option] [filename]

# Using stdin
cat test.txt | npx ts-node cat.ts [-option]
```

The following options are supported:

- `-n`: number the lines are they are printed out
- `-b`: number the lines excluding blank lines

## Run tests

To run the tests for the cat tool, go to the root directory of this repository and run the following command:

```bash
npm test src/15/
```

All the tests are made for **LINUX** environment only. If you want to run the tests in Windows environment, you can use the Git Bash terminal or Windows Subsystem for Linux (WSL).
