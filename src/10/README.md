# Challenge 10 - Write Your Own uniq Tool

This challenge corresponds to the tenth part of the Coding Challenges series by John Crickett https://codingchallenges.fyi/challenges/challenge-uniq.

## Description

The uniq tool is written in `uniq.ts` file and the `uniq.index.ts` is the command line version of the tool.

## Usage

You can use `ts-node` to run the tool as follows:

```bash
# Using input file
npx ts-node uniq.index.ts [-option] <path/to/input-file>

# Using standard input
cat filename | npx ts-node uniq.index.ts [-option] -

# Using output with input file
npx ts-node uniq.index.ts [-option] <path/to/input-file> <path/to/output-file>

# Using output with standard input
cat filename | npx ts-node uniq.index.ts [-option] - <path/to/output-file>
```

The following options are supported:

- `-c` or `--count`: prefix lines by the number of occurrences
- `-d` or `--repeated`: only print duplicate lines
- `-u`: only print unique lines
- `-`: read from standard input

## Run tests

To run the tests for the uniq tool, go to the root directory of this repository and run the following command:

```bash
npm run test tests/10/
```

The tests are located in the `tests/10/` directory. All the tests are made for **LINUX** environment only. If you want to run the tests in Windows environment, you can use the Git Bash terminal or Windows Subsystem for Linux (WSL).
