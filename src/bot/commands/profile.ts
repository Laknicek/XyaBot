import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { Command } from '../types';
import { getUser } from '../db';
import { generateProfileImage } from '../utils/imageGen';

export const data = new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Shows your or another user\'s profile')
    .addUserOption(option => 
        option.setName('user')
            .setDescription('The user to check')
            .setRequired(false));

export const execute: Command['execute'] = async (interaction) => {
    await interaction.deferReply();
    
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const userData = getUser(targetUser.id, targetUser.username);

    try {
        const buffer = await generateProfileImage(userData, targetUser.displayAvatarURL({ extension: 'png' }));
        const attachment = new AttachmentBuilder(buffer, { name: 'profile.png' });
        
        await interaction.editReply({ files: [attachment] });
    } catch (error) {
        console.error("Profile Gen Error:", error);
        await interaction.editReply("Oh my, I couldn't paint your profile picture correctly! I'm sorry! >_<");
    }
};