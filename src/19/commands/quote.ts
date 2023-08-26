import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder
} from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quote')
    .setDescription('Get a random quote from the internet'),
  async execute(interaction: ChatInputCommandInteraction<CacheType>) {
    // Get a random quote from the API
    const res = await fetch('https://dummyjson.com/quotes/random');
    const data = await res.json();

    await interaction.reply(data['quote']);
  }
};
