import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder
} from 'discord.js';
import Storage from '../challenges';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add a new challenge to the database')
    .addStringOption((option) =>
      option
        .setName('url')
        .setDescription('The URL for the new Coding Challenge')
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction<CacheType>) {
    const url = interaction.options.getString('url', true);
    try {
      await interaction.reply(await Storage.addChallenge(url));
    } catch (e) {
      if (e instanceof Error) {
        await interaction.reply(e.message);
        return;
      }
      await interaction.reply(`Unable to add ${url}`);
    }
  }
};
