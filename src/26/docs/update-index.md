## Command: `update-index` / `add`

## Usage

Using `update-index` command

```bash
# Using ts-node
npx ts-node <path/to/git.ts> update-index <files...>

# Using node
node <path/to/git.js> update-index <files...>
```

Using `add` command

```bash
# Using ts-node
npx ts-node <path/to/git.ts> add <files...>

# Using node
node <path/to/git.js> add <files...>
```

**Note**: In theory, both the commands are different.
The `add` command is a **Porcelain** command while the `update-index` command is a **Plumbing** command.
For the sake of this distinction, I added support for both of them, even though they perform the same operations in the context of my codebase.

### Options

- `files`

  Files to act on. These can also include directories. If you want to add all the files to the index use `update-index .`.

## Description

Register file contents in the working tree to the index.

## Approach

1. First find the path of all the files relative to the root of the Git repo. Since we need to support directories, I leveraged the [glob](https://www.npmjs.com/package/glob) package to list files while also excluding the files present in the `.gitignore` file. The function that performs this is `getFiles()` present in [utils.ts](../utils.ts) file.

2. If there is no previous `.git/index` file present, then we create a new one and add the Index Entries to it using the [Index class](../objects/index.ts). Otherwise we first remove the file from the index and then insert it again.

View [this](https://github.com/git/git/blob/867b1c1bf68363bcfd17667d6d4b9031fa6a1300/Documentation/technical/index-format) official doc to know more about index format.
