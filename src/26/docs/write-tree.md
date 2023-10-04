## Command: `write-tree`

## Usage

```bash
# Using ts-node
npx ts-node <path/to/git.ts> write-tree

# Using node
node <path/to/git.js> write-tree
```

## Description

Create a Tree object from the current index and displays the hash for the Tree object.

## Approach

1. First parse the index and get all the files present in the index. We use the [IndexParser class](../indexParser.ts) for this.

2. Create a tree and insert all the files that we got from the previous step. The code for this can be found in [tree.ts](../objects/tree.ts).

   The tree follows the structure of [Patricia Trie](https://www.geeksforgeeks.org/implementing-patricia-trie-in-java/).
   A given `Tree` object consists of `TreeNode` where each node can have multiple children nodes. The leaf node represents a File in the WorkTree while the internal nodes represent the directories.

3. Finally save the tree to the disk and return the hash of the tree created. This is done by calling the `calculateHash()` method on the `Tree` class instance. This function accepts an optional boolean argument `writeToDisk` which tells the function to create new objects for the directories. It also accepts another argument `cachedTree` which stores the entries corresponding to directories and is used while updating the index file.

To learn more how Git uses Tree objects, view [this](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects) : **Tree Objects section**.
