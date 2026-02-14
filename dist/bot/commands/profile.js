"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = require("discord.js");
const db_1 = require("../db");
const imageGen_1 = require("../utils/imageGen");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('profile')
    .setDescription('Shows your or another user\'s profile')
    .addUserOption(option => option.setName('user')
    .setDescription('The user to check')
    .setRequired(false));
const execute = async (interaction) => {
    await interaction.deferReply();
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const userData = (0, db_1.getUser)(targetUser.id, targetUser.username);
    try {
        const buffer = await (0, imageGen_1.generateProfileImage)(userData, targetUser.displayAvatarURL({ extension: 'png' }));
        const attachment = new discord_js_1.AttachmentBuilder(buffer, { name: 'profile.png' });
        await interaction.editReply({ files: [attachment] });
    }
    catch (error) {
        console.error("Profile Gen Error:", error);
        await interaction.editReply("Oh my, I couldn't paint your profile picture correctly! I'm sorry! >_<");
    }
};
exports.execute = execute;
