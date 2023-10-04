## Usage

```bash
# Using ts-node
npx ts-node <path-to-git.ts> init [directory]

# Using node
node <path-to-git.js> init [directory]
```

## Description

This command created an empty Git repository or reinitialize an existing one.

The optional `directory` argument specifies the directory where the init command will be executed. If this directory does not exist, it will be created.

Refer to [this](https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain) official doc for more information about the `.git` directory.

## Approach

1. Added support for the command through [git.ts](../git.ts). The code for init command is present in [init.ts](../commands/init.ts).

2. Created a separate folder [default-file](../default-files/) that contains some of the files required as per the Git protocol. The contents of these files are copied to the `.git` directory. To ensure that these folder is also copied to the build dir, I updated the build script present in [package.json](/package.json)
