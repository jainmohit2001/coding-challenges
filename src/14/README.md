# Challenge 14 - Write Your Own Shell

This challenge corresponds to the fourteenth part of the Coding Challenges series by John Crickett https://codingchallenges.fyi/challenges/challenge-shell.

## Description

As the name suggests, here we try to build a simple shell using the `child_process` module of Node.js.
The shell supports all the commands (including piped commands) that are available in any standard LINUX shell.

Apart from the builtin commands - `cd`, `pwd`, `exit`, `history` are executed by spawning a new process and passing all the relevant arguments provided by the user.

## Usage

You can use `ts-node` to run the tool as follows:

```bash
npx ts-node shell.ts
```

All the executed commands are stored in a file in the home directory of the user with the name `.ccsh_history`. You can then use the `history` command to see the previously executed commands.

To exit the shell, use the `exit` command.

The `pwd` and `cd` command support is implemented using the inbuilt `cwd()` and `chdir()` function exposed by the process module.

## Run tests

To run the tests for the shell tool, go to the root directory of this repository and run the following command:

```bash
npm test src/14/
```

All the tests are made for **LINUX** environment only. If you want to run the tests in Windows environment, you can use the Git Bash terminal or Windows Subsystem for Linux (WSL).

**Note**: While testing for `pwd` command, the LINUX environment follows the convention of printing the path without a trailing slash. However, the Windows environment prints the path with a trailing slash. So, the tests for pwd will fail in Windows environment. This is an expected behavior and the tests should pass in LINUX environment.
