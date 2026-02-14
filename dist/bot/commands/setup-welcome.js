"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = require("discord.js");
const db_1 = require("../db");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('setup-welcome')
    .setDescription('Configure the welcome system (Admins Only)')
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
    .addChannelOption(option => option.setName('channel')
    .setDescription('The channel where welcome messages will be sent')
    .addChannelTypes(discord_js_1.ChannelType.GuildText)
    .setRequired(true));
const execute = async (interaction) => {
    const channel = interaction.options.getChannel('channel');
    (0, db_1.setGuildSetting)(interaction.guildId, {
        welcome_channel: channel.id,
        welcome_message: 'AESTHETIC_SYSTEM', // Flag to use the utility
        welcome_dm: 'ENABLED'
    });
    await interaction.reply({
        content: `✨ **Sen Nightcore Welcome System Activated!**\nChannel: <#${channel.id}>\n\nXya will now greet all new friends with the stylized portal layout and send them the server information via DM! ♪`,
        flags: [discord_js_1.MessageFlags.Ephemeral]
    });
};
exports.execute = execute;
