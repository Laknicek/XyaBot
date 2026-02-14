import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { Command } from '../types';
import { getAllUsers } from '../db';
import { generateLeaderboardImage } from '../utils/leaderboardGen';

export const data = new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Shows the top friends by XP and Gems! ✨');

export const execute: Command['execute'] = async (interaction) => {
    await interaction.deferReply();
    
    const users = getAllUsers();
    const top10 = users.slice(0, 10);

    try {
        const buffer = await generateLeaderboardImage(top10);
        const attachment = new AttachmentBuilder(buffer, { name: 'leaderboard.png' });
        
        await interaction.editReply({ files: [attachment] });
    } catch (error) {
        console.error("Leaderboard Gen Error:", error);
        await interaction.editReply("Oh my, Xya couldn't list the friends correctly! >_<");
    }
};
