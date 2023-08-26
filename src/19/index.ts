import fs from 'fs';
import { config } from 'dotenv';
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Message,
  REST,
  Routes
} from 'discord.js';
import path from 'path';

config({ path: './.env' });

if (!process.env.DISCORD_TOKEN) {
  console.error('Missing env DISCORD_TOKEN');
  process.exit(1);
}

const commands = [];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

// Grab all the command files
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  } else {
    console.warn(
      `The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// and deploy your commands!
(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    if (!process.env.APP_ID) {
      console.error('Missing env APP_ID');
      process.exit(1);
    }

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationCommands(process.env.APP_ID),
      { body: commands }
    );

    if (data && typeof data === 'object' && 'length' in data) {
      console.log(
        `Successfully reloaded ${data.length} application (/) commands.`
      );
    }
  } catch (error) {
    console.error(error);
  }
})();

client.once(Events.ClientReady, () => {
  console.log('Client ready');
});

client.on(Events.MessageCreate, async (message: Message) => {
  if (message.author.bot) {
    return;
  }

  // Handle `Hello` sent by User
  if (message.content === 'Hello') {
    const name = message.author.displayName;
    await message.channel.send(`Hello ${name}`);
  }
});

// Handle slash commands
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // Check if the command is support by the client
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  // Try to execute the command
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'There was an error while executing this command!',
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
