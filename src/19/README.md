# Challenge 19 - Write Your Own Discord Bot

This challenge corresponds to the nineteenth part of the Coding Challenges series by John Crickett https://codingchallenges.fyi/challenges/challenge-discord.

## Description

This is a simple implementation of a Discord bot written in Node.js using the [discord.js](https://old.discordjs.dev/#/docs/discord.js/main/general/welcome) module.

The bot supports the following functionalities and slash commands:

- After the bot is added to a server and hosted, it will send to a `Hello` message sent by the client with the message `Hello <user-display-name>`.
- Slash commands: These commands are implemented in the `commands` directory.

  - `add`: This command takes a URL as an argument and adds a new coding challenge to the bot's DB.
  - `challenge`: Suggests a random challenge.
  - `list`: Lists all the challenges available.
  - `quote`: Fetch a random quote using https://dummyjson.com/quotes/random

More information about the files present in this directory:

- `challenge.ts`: This file exposes a storage class that is used by the bot to interact with the file based DB.
- `index.ts`: Entry point of the bot.

## Usage

Create a `.env` file at the root directory of this repository and add the following environment variables:

```bash
APP_ID='app-id'
DISCORD_TOKEN='discord-token'
PUBLIC_KEY='public-key'
```

To change the above behavior of reading the environment variables, go to `index.ts` and change the following line as per your needs.

```typescript
config({ path: './.env' });
```

Go to the root directory of this repository and run the following command to start the discord bot:

```bash
# Using ts-node
npx ts-node ./src/19/index.ts

# Using node
node ./build/19/index.js
```
