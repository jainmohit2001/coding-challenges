# Challenge 13 - Write Your Own diff Tool

This challenge corresponds to the thirteenth part of the Coding Challenges series by John Crickett https://codingchallenges.fyi/challenges/challenge-diff.

## Description

The diff tool is written in `diff.ts` file and the `diff.index.ts` is the command line version of the tool.
The diff tool is build using the Longest common subsequence (LCS) problem. We first find the LCS of a pair of strings and extend that to a pair of array of strings.
While finding LCS we also store information about the insertions and deletions required to convert one string to another and use that information to print the differences between the two strings.

## Usage

You can use `ts-node` to run the tool as follows:

```bash
# Using input file
npx ts-node diff.index.ts <file1> <file2>
```

## Run tests

To run the tests for the diff tool, go to the root directory of this repository and run the following command:

```bash
npm test src/13/
```
