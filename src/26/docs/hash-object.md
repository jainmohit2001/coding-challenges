## Command: `hash-object`

## Usage

```bash
# Using ts-node
npx ts-node <path/to/git.ts> hash-object [options] [file]

# Using node
node <path/to/git.js> hash-object [options] [file]
```

### Options

- `-t <type>`

  Type of object to be created, default: `blob`. Possible values: `blob`, `commit`, `tree`, `tag`.

- `-w, --write`

  Actually write the object into the object database.

- `--stdin`

  Read the object from standard input instead of from a file.

- `file`

  File path in case stdin is not provided.

## Description

This command computes the Object ID used in the Git storage system for the provided file/text.
Optionally creates an object from a file.

Source doc - https://git-scm.com/book/en/v2/Git-Internals-Git-Objects : **Object Storage** section.
