import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder
} from 'discord.js';
import Storage from '../challenges';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('challenge')
    .setDescription(
      'Get a random challenge from Coding Challenges back catalogue'
    ),
  async execute(interaction: ChatInputCommandInteraction<CacheType>) {
    await interaction.reply(Storage.getRandomChallenge());
  }
};
