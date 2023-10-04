## Command: `diff`

## Usage

```bash
# Using ts-node
npx ts-node <path/to/git.ts> diff

# Using node
node <path/to/git.js> diff
```

## Description

Show changes between index and working tree.

## Approach

1. First we retrieve the status of files from current working tree using the function `getFileStatus()` present in [fileStatus.ts](../fileStatus.ts).

2. Then iterate over the files and create a diff string iteratively. Skip files that are not of out interests.

3. To create the diff for a file, I used the function `createTwoFilesPatch()` from the [diff](https://www.npmjs.com/package/diff) package, performed some cleanup and added some text color to match the actual `git diff` command output. This is handled by the function `diffFile()` present in [diff.ts](../commands/diff.ts)

_Note: The output of the original `git diff` command and the diff command implemented here might be slightly different._
