## Command: `status`

## Usage

```bash
# Using ts-node
npx ts-node <path/to/git.ts> status

# Using node
node <path/to/git.js> status
```

## Description

Show the working tree status.

## Approach

1. The main part of the command lies in finding the status for a given file in the Worktree and Staging area. I created a separated file [fileStatus.ts](../fileStatus.ts) for this, since the same functionality will be needed in the `diff` command as well.

2. First we need to get the information about the latest Commit (if present) and compare the Staging area with the Commit's Tree. This is handled by the function `diffCommitWithStaging()` present in [fileStatus.ts](../fileStatus.ts). The code is quite self explanatory.

   To handle parsing the Commit object and the Tree object, I created the decode function in the [commit.ts](../objects/commit.ts) and [tree.ts](../objects/tree.ts) respectively.

3. Next, we need to compare the Staging area and the Worktree area. This is handled by the function `diffStagingWithWorktree()` also present in [fileStatus.ts](../fileStatus.ts).

4. After combining both the above outputs, we finally prepare a human readable string that shows the status of the Worktree and the Staging area. This is handled by the function `prepareOutput()` present in [status.ts](../commands/status.ts)
