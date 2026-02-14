import Discord from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import { playTTS } from '../utils/voiceUtils';
import { Command } from '../types';

const SONG_SNIPPETS = [
    "La la la, singing just for you, my favorite person in the world",
    "Twinkle twinkle little star, you're amazing just the way you are",
    "Do re mi fa sol la ti, music is my destiny",
    "Every day I wake up and I smile, cuz you make everything worthwhile",
    "Dancing in the moonlight, everything feels so right tonight",
];

export const data = new Discord.SlashCommandBuilder()
    .setName('sing')
    .setDescription('Ask Xya to sing for you in voice chat!')
    .addStringOption(opt =>
        opt.setName('lyrics')
            .setDescription('What lyrics should Xya sing? (optional)')
            .setRequired(false)
    );

export const execute: Command['execute'] = async (interaction) => {
    const connection = getVoiceConnection(interaction.guildId!);
    if (!connection) {
        return interaction.reply({ content: "im not in vc rn! use /join first 🎤", flags: Discord.MessageFlags.Ephemeral });
    }

    const customLyrics = interaction.options.getString('lyrics');
    const lyrics = customLyrics || SONG_SNIPPETS[Math.floor(Math.random() * SONG_SNIPPETS.length)];

    await interaction.reply(`🎵 *clears throat* okay here goes... 🎤`);

    try {
        await playTTS(`♪ ${lyrics} ♪`, connection, 'en');
    } catch (error) {
        console.error('[Sing] TTS error:', error);
    }
};
