## Command: `commit-tree`

## Usage

```bash
# Using ts-node
npx ts-node <path/to/git.ts> commit-tree [options] <tree>

# Using node
node <path/to/git.js> commit-tree [options] <tree>
```

### Options

- `-m <message>`

  A paragraph in the commit log message.

- `-p <parents...>`

  List of parent objects

- `tree`

  An existing tree object.

## Description

This command creates a new commit object from the given tree object, message and optional parent objects and displays the hash of the created commit object.

## Approach

1. First verify all the hashes provided in the arguments. This is done by calling the `verifyObject()` function present in [utils.ts](../utils.ts)

2. Next, ensure a valid message is provided by the user via command line arguments, otherwise read from stdin.

3. Next, get the author and committer signature. This is handled by the `getSignature()` method present in [utils.ts](../utils.ts). The details are generally stored in the `.gitconfig` file present in the system. which follows the format of an `ini` file. I used the [ini](https://www.npmjs.com/package/ini) package to do the heavy lifting.

4. Next, we create a commit object and encode it. And, finally we store the commit object in the storage and return the hash. This is handled by the [Commit class](../objects/commit.ts)
