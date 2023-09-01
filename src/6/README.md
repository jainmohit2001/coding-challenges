# Challenge 6 - Write Your Own Sort Tool

This challenge corresponds to the sixth part of the Coding Challenges series by John Crickett https://codingchallenges.fyi/challenges/challenge-sort.

## Description

The SORT tool is written in `sort.ts` file and the `sort.index.ts` is the command line version of the tool to sort data present in a file.
The rest of files correspond to the different types of algorithms used to sort the data.

## Usage

You can use `ts-node` to run the tool as follows:

```bash
npx ts-node sort.index.ts filename [-u] [--algorithm]
```

The SORT tool supports the following options:

- `-u`: Unique. Suppresses duplicate lines.
- `--algorithm`: The algorithm to use to sort the data. The available algorithms are:

  - `--merge-sort`: Merge sort algorithm.
  - `--quick-sort`: Quick sort algorithm.
  - `--heap-sort`: Heap sort algorithm.
  - `--random-sort`: Random sort algorithm.

    If no algorithm is specified, the sorting is done using the inbuilt `sort()` method.

## Run tests

To run the tests for the SORT tool, go to the root directory of this repository and run the following command:

```bash
npm test src/6/
```

All the tests are made for **LINUX** environment only. If you want to run the tests in Windows environment, you can use the Git Bash terminal or Windows Subsystem for Linux (WSL).
