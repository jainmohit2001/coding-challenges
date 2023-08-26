import { config } from 'dotenv';
import { Client, Events, GatewayIntentBits, Message } from 'discord.js';

config({ path: './.env' });

if (!process.env.DISCORD_TOKEN) {
  console.error('Missing env DISCORD_TOKEN');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ]
});

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

client.login(process.env.DISCORD_TOKEN);
