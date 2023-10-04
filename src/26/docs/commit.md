## Command: `commit`

## Usage

```bash
# Using ts-node
npx ts-node <path/to/git.ts> commit <message>

# Using node
node <path/to/git.js> commit <message>
```

### Options

- `message`

  Use the given `message` as the commit message.

## Description

Record changes to the repository.

## Approach

1. First get the current branch name and the reference to the latest commit if present. This is handled by the functions `getCurrentBranchName()` and `getBranchHeadReference()` respectively. The current branch name is stored in the `.git/HEAD` file, and the reference is present at the location `.git/refs/heads/<branch>`. The reference might not be there if there were no previous commits.

2. Next, create and store the Tree object from current state of the index file and get the hash.

3. Next build a store a Commit object using the tree hash from Step 2 and parent hash (if any) from Step 1.

4. Finally update the head reference.
