# Challenge 26 - Write Your Own Git

This challenge corresponds to the 26<sup>th</sup> part of the Coding Challenges series by John Crickett https://codingchallenges.fyi/challenges/challenge-git.

## Description

This is a Node.js implementation for the Git protocol.

The code is somewhat inspired from the Go implementation of the Git Client. https://github.com/go-git/go-git

The client currently supports the following commands. More information provided in [docs](docs/) folder.

- [init](docs/init.md)
- [hash-object](docs/hash-object.md)
- [cat-file](docs/cat-file.md)
- update-index
- add
- status
- write-tree
- commit-tree
- commit
- diff

Here is a brief description about some of the files/folders in this project:

- [command/](commands/): Each command has its own implementation file present in this folder.

- [docs/](docs/): Documentation about the usage of each command and how it was implemented.

- [objects/](objects/): This directory contains code for encoding and decoding different types of [objects](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects) supported by the Git protocol along with classes and functions to represent those objects and.

- [git.ts](git.ts): The entry point to the Git cli.

- [fileStatus.ts](fileStatus.ts): This file contains the code to find the status of the files present in the Staging and Worktree area.

- [indexParser.ts](indexParser.ts): A class implementation to decode the `.git/index` file. Currently the parser handles all the index entries, and only the TreeExtension. View [this](https://github.com/git/git/blob/867b1c1bf68363bcfd17667d6d4b9031fa6a1300/Documentation/technical/index-format.txt) official index format for more details.

- [jestHelpers.ts](jestHelpers.ts): Some functions used across the testing.

- [utils.ts](utils.ts): This file contains some helper functions and miscellaneous functions used in different commands and functionalities.

_**Note**: The refactoring that you can see is not achieved from the start. As I kept on developing and incorporating more commands, the refactoring automatically came into place. Most of the times, the code that got refactored was already being used somewhere and the new command/functionality needed the same code._

## Usage

You can use the `ts-node` tool to run the Git client as follows:

```bash
npx ts-node <path-to-git.ts> [options] [command]
```

Use the `--help` option to get more information about how to use the the Git client.
Or refer to the [docs](docs/) folder for usage.

## Run tests

To run the tests for the Git Client, go to the root directory of this repository and run the following command:

```bash
npm test src/26/
```
