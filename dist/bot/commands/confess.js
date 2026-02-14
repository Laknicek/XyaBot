"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = __importDefault(require("discord.js"));
const db_1 = require("../db");
exports.data = new discord_js_1.default.SlashCommandBuilder()
    .setName('confess')
    .setDescription('Send an anonymous confession through Xya (Best Friend required: 500+ friendship)')
    .addStringOption(opt => opt.setName('message')
    .setDescription('Your anonymous confession')
    .setRequired(true));
const execute = async (interaction) => {
    const user = (0, db_1.getUser)(interaction.user.id, interaction.user.username);
    // Friendship gate: require 500+ points (Best Friend)
    if ((user.friendship_points || 0) < 500) {
        const points = user.friendship_points || 0;
        return interaction.reply({
            content: `sorry bestie, confessions are only for my best friends 💛\nyou need **500 friendship points** to use this (you have **${points}**)\nkeep chatting with me and we'll get there!! 🥰`,
            flags: discord_js_1.default.MessageFlags.Ephemeral
        });
    }
    const confession = interaction.options.getString('message', true);
    if (confession.length > 1000) {
        return interaction.reply({ content: "thats a bit too long! keep it under 1000 characters 😅", flags: discord_js_1.default.MessageFlags.Ephemeral });
    }
    // Save confession
    (0, db_1.addConfession)(interaction.guildId, confession);
    // Send anonymous confession to the channel
    const embed = new discord_js_1.default.EmbedBuilder()
        .setTitle('🤫 Anonymous Confession')
        .setDescription(confession)
        .setColor(0x9B59B6)
        .setFooter({ text: 'Sent through Xya • Identity protected 💜' })
        .setTimestamp();
    if (interaction.channel?.isSendable()) {
        await interaction.channel.send({ embeds: [embed] });
    }
    // Ephemeral confirmation to the user
    await interaction.reply({ content: "✅ your confession has been sent anonymously! your secret is safe with me 🤫💜", flags: discord_js_1.default.MessageFlags.Ephemeral });
};
exports.execute = execute;
