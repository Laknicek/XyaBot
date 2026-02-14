"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = require("discord.js");
const db_1 = require("../db");
const leaderboardGen_1 = require("../utils/leaderboardGen");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Shows the top friends by XP and Gems! ✨');
const execute = async (interaction) => {
    await interaction.deferReply();
    const users = (0, db_1.getAllUsers)();
    const top10 = users.slice(0, 10);
    try {
        const buffer = await (0, leaderboardGen_1.generateLeaderboardImage)(top10);
        const attachment = new discord_js_1.AttachmentBuilder(buffer, { name: 'leaderboard.png' });
        await interaction.editReply({ files: [attachment] });
    }
    catch (error) {
        console.error("Leaderboard Gen Error:", error);
        await interaction.editReply("Oh my, Xya couldn't list the friends correctly! >_<");
    }
};
exports.execute = execute;
