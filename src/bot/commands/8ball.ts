import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../types';

const RESPONSES = [
    // Positive
    { text: 'yea for sure 💕', color: 0x00FF7F },
    { text: 'omg yes!! absolutely', color: 0x00FF7F },
    { text: 'the vibes say yes ✨', color: 0x00FF7F },
    { text: 'mhm definitely', color: 0x00FF7F },
    { text: 'i mean... obviously lol', color: 0x00FF7F },
    { text: 'signs point to yesss', color: 0x00FF7F },
    { text: 'LMAO yes duh', color: 0x00FF7F },
    // Neutral
    { text: 'hmm honestly idk 🤔', color: 0xFFD700 },
    { text: 'ask me later im busy rn', color: 0xFFD700 },
    { text: 'the vibes are... unclear', color: 0xFFD700 },
    { text: 'ehh could go either way tbh', color: 0xFFD700 },
    { text: 'im not gonna answer that 💀', color: 0xFFD700 },
    // Negative
    { text: 'nahh i dont think so', color: 0xFF4444 },
    { text: 'lol no 😭', color: 0xFF4444 },
    { text: 'the vibes say absolutely not', color: 0xFF4444 },
    { text: 'bestie... no', color: 0xFF4444 },
    { text: 'dont count on it ngl', color: 0xFF4444 },
    { text: 'LMAO nope', color: 0xFF4444 },
    { text: 'im gonna say no on this one 💀', color: 0xFF4444 },
];

export const data = new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask Xya\'s magic 8-ball a question! 🎱')
    .addStringOption(option =>
        option.setName('question')
            .setDescription('Your question for the magic 8-ball')
            .setRequired(true));

export const execute: Command['execute'] = async (interaction) => {
    const question = interaction.options.getString('question')!;
    const response = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];

    const embed = new EmbedBuilder()
        .setColor(response.color)
        .setTitle('🎱 Xya\'s Magic 8-Ball')
        .addFields(
            { name: '❓ Question', value: question },
            { name: '🔮 Answer', value: response.text }
        )
        .setFooter({ text: 'the ball has spoken ✨' });

    await interaction.reply({ embeds: [embed] });
};
