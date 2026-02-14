import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../types';

export const data = new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flip a coin!');

export const execute: Command['execute'] = async (interaction) => {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    const icon = result === 'Heads' ? '🪙' : '🪙'; // Could use different icons if available
    
    const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle('✨ Coin Flip!')
        .setDescription(`The coin spins in the air... and lands on...`)
        .addFields({ name: 'Result', value: `**${icon} ${result.toUpperCase()}**` })
        .setThumbnail(interaction.user.displayAvatarURL())
        .setFooter({ text: 'Xya loves a good toss! ♪' });

    await interaction.reply({ embeds: [embed] });
};
