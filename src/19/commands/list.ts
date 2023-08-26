import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder
} from 'discord.js';
import Storage from '../challenges';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('list')
    .setDescription('Get the list of available challenges'),
  async execute(interaction: ChatInputCommandInteraction<CacheType>) {
    await interaction.reply(Storage.listChallenges().join('\n'));
  }
};
