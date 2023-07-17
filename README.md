# Solutions to John Crickett's Coding Challenges

## About

This repository contains my solutions to John Crickett's Coding Challenges. The challenges are available at [https://codingchallenges.fyi/challenges/intro](https://codingchallenges.fyi/challenges/intro).

Using Typescript as the language throughout the challenges.

Just trying to learn Typescript and improve my problem solving skills.

I am also trying to incorporate testing, documentation and a better GIT control.

## Structure

- `src` - Contains all the source code
- `tests` - Contains all the test files

## Installation

The following command will build all the .ts files present in `src` folder into a new `build` folder.

```bash
npm install
npm run build
```

## Testing

The following command will run all the tests present under the `tests` folder and create the coverage report in `coverage` folder.

All the relevant required test input files are present in tests folder itself.

```bash
npm test
```

To run tests for specific challenge, use the following command:

```bash
# npm test tests/<challenge-number>
npm test tests/2
npm test tests/3
```
