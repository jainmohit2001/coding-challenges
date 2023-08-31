# Challenge 1 - Write your own wc tool

This challenge corresponds to the first part of the Coding Challenges series by John Crickett https://codingchallenges.fyi/challenges/challenge-wc.

## Description

The WC tool is written in `wc.ts` file and the `index.ts` is the command line version of the tool. The tool is used to count the number of words, lines, bytes and characters in a file/stdin.

Check out [this](https://www.notion.so/mohitjain/1-Write-Your-Own-wc-Tool-b289bb2362c14778880029633b76033b) Notion page to understand how I approached this challenge.

## Usage

You can use `ts-node` to run the tool as follows:

```bash
npx ts-node index.ts [option] filename
```

The following options are supported:

- `-w`: prints the number of words in the file
- `-l`: prints the number of lines in the file
- `-c`: prints the number of bytes in the file
- `-m`: prints the number of characters in the file

The tool can also be used in stdin mode as follows:

```bash
cat filename | npx ts-node index.ts [option]
```

## Run tests

To run the tests for the WC tool, go to the root directory of this repository and run the following command:

```bash
npm run test tests/1/
```

The tests are located in the `tests/1/` directory. All the tests are made for **LINUX** environment only. If you want to run the tests in Windows environment, you can use the Git Bash terminal or Windows Subsystem for Linux (WSL).
