## Command: `cat-file`

## Usage

```bash
# Using ts-node
npx ts-node <path/to/git.ts> cat-file [options] <object>

# Using node
node <path/to/git.js> cat-file [options] <object>
```

### Options

- `object`

  The hash of the object to show.

- `-p`

  Pretty-print the contents of `object` based on its type.

- `-t`

  Instead of the content, show the object type identified by `object`.

## Description

Provide content or type information for repository objects.

## Approach

1. First check if the given hash corresponds to a valid object or not. This is done via the helper function [parseObject()](../utils.ts#L252) present in [utils.ts](../utils.ts).

   **Note**: Objects stored in the packfile are not supported. Refer to the JSDOC of the `parseObject` function for more details.

2. The `parseObject` function will given us the `type`, `byteLength` and the `data` in form of the Buffer.

3. The `blob` and `commit` type files can be printed as is. The `tree` type file requires some level of decoding.
