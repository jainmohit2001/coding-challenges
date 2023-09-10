# Challenge 1 - Write Your Own Sed

This challenge corresponds to the 21<sup>st</sup> part of the Coding Challenges series by John Crickett https://codingchallenges.fyi/challenges/challenge-sed.

## Description

The Sed tool is written in `sed.ts`. The tool is used to perform basic text transformations on an input stream (a file or input from stdin).

## Usage

You can use `ts-node` to run the tool as follows:

```bash
# Substitute <this> for <that> everywhere <this> appears in the file <filename>
npx ts-node sed.ts s/<this>/<that>/g <filename>

# Print lines 2 to 4 from file <filename>
npx ts-node sed.ts -n "2,4p" <filename>

# Output only lines containing a specific pattern <pattern> from file <filename>
npx ts-node sed.ts -n /pattern/p <filename>

# Add another line after each line, i.e. double spacing a file.
npx ts-node sed.ts G <filename>

# Edit in-place: Substitute <this> for <that> everywhere <this> appears in the file <filename>
npx ts-node sed.ts -i 's/<this>/<that>/g' <filename>
```

The following options are supported:

- Character replacement
- Range of lines selection
- Output only lines containing a specific pattern
- Double spacing a file using option
- Strip trailing blank lines from a file
- Edit in-place

To use the tool in stdin mode, use the following command:

```bash
cat filename | npx ts-node sed.ts [option]
```

## Run tests

To run the tests for the Sed tool, go to the root directory of this repository and run the following command:

```bash
npm test src/21/
```
