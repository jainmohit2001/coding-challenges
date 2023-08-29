# Challenge 4 - Write Your Own cut Tool

This challenge corresponds to the fourth part of the Coding Challenges series by John Crickett https://codingchallenges.fyi/challenges/challenge-cut.

## Description

The CUT tool is written in `cut.ts` file and the `index.ts` is the command line version of the tool.

## Usage

You can use `ts-node` to run the tool as follows:

```bash
# Print out the second field from each line of the file
npx ts-node index.ts -f2 filename
```

The cut tool supports the following options:

- Single Field index support
  - Example: `npx ts-node index.ts -f1 filename`: prints out the first field
- Delimiter support
  - Example: `npx ts-node index.ts -f1 -d, filename`: use delimiter `,` to separate fields and print out the first field
- Field list support
  - Example: `npx ts-node index.ts -f1,2`: prints out the first and second fields
- Standard Input support
  - Example: `cat test.csv | npx ts-node index.ts -d, -f"1 2"`: prints out the first and second fields from the standard input delimited by `,`

## Run tests

To run the tests for the CUTtool, go to the root directory of this repository and run the following command:

```bash
npm run test tests/4/
```

The tests are located in the `tests/4/` directory. All the tests are made for **LINUX** environment only. If you want to run the tests in Windows environment, you can use the Git Bash terminal or Windows Subsystem for Linux (WSL).
