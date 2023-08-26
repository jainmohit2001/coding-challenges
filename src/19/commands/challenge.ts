import { randomInt } from 'crypto';
import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder
} from 'discord.js';

const data = {
  challenges: [
    {
      name: 'Write Your Own wc Tool',
      url: 'https://codingchallenges.fyi/challenges/challenge-wc'
    },
    {
      name: 'Write Your Own JSON Parser',
      url: 'https://codingchallenges.fyi/challenges/challenge-json-parser'
    },
    {
      name: 'Write Your Own Compression Tool',
      url: 'https://codingchallenges.fyi/challenges/challenge-huffman'
    },
    {
      name: 'Write Your Own cut Tool',
      url: 'https://codingchallenges.fyi/challenges/challenge-cut'
    },
    {
      name: 'Write You Own Load Balancer',
      url: 'https://codingchallenges.fyi/challenges/challenge-load-balancer'
    },
    {
      name: 'Write Your Own Sort Tool',
      url: 'https://codingchallenges.fyi/challenges/challenge-sort'
    },
    {
      name: 'Write Your Own Calculator',
      url: 'https://codingchallenges.fyi/challenges/challenge-calculator'
    },
    {
      name: 'Write Your Own Redis Server',
      url: 'https://codingchallenges.fyi/challenges/challenge-redis'
    },
    {
      name: 'Write Your Own grep',
      url: 'https://codingchallenges.fyi/challenges/challenge-grep'
    },
    {
      name: 'Write Your Own uniq Tool',
      url: 'https://codingchallenges.fyi/challenges/challenge-uniq'
    },
    {
      name: 'Write Your Own Web Server',
      url: 'https://codingchallenges.fyi/challenges/challenge-webserver'
    },
    {
      name: 'Write Your Own URL Shortener',
      url: 'https://codingchallenges.fyi/challenges/challenge-url-shortener'
    },
    {
      name: 'Write Your Own diff Tool',
      url: 'https://codingchallenges.fyi/challenges/challenge-diff'
    },
    {
      name: 'Write Your Own Shell',
      url: 'https://codingchallenges.fyi/challenges/challenge-shell'
    },
    {
      name: 'Write Your Own cat Tool',
      url: 'https://codingchallenges.fyi/challenges/challenge-cat'
    },
    {
      name: 'Write Your Own IRC Client',
      url: 'https://codingchallenges.fyi/challenges/challenge-irc'
    },
    {
      name: 'Write Your Own Memcached Server',
      url: 'https://codingchallenges.fyi/challenges/challenge-memcached'
    },
    {
      name: 'Write Your Own Spotify Client',
      url: 'https://codingchallenges.fyi/challenges/challenge-spotify'
    }
  ]
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('challenge')
    .setDescription(
      'Get a random challenge from Coding Challenges back catalogue'
    ),
  async execute(interaction: ChatInputCommandInteraction<CacheType>) {
    const challengesLength = data.challenges.length;
    const randomChallenge = data.challenges[randomInt(challengesLength)];
    await interaction.reply(randomChallenge.name + ' ' + randomChallenge.url);
  }
};
