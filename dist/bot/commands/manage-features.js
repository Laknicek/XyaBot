"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = require("discord.js");
const db_1 = require("../db");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('manage-features')
    .setDescription('Toggle bot features or maintenance mode (Admins Only)')
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
    .addStringOption(option => option.setName('feature')
    .setDescription('The feature to manage')
    .setRequired(true)
    .addChoices({ name: 'AI Chatting', value: 'disable_chat' }, { name: 'AI Voice', value: 'disable_voice' }, { name: 'Slash Commands', value: 'disable_commands' }, { name: 'Maintenance Mode', value: 'maintenance_mode' }))
    .addBooleanOption(option => option.setName('enabled')
    .setDescription('Should this feature be ACTIVE?')
    .setRequired(true));
const execute = async (interaction) => {
    const feature = interaction.options.getString('feature');
    const isActive = interaction.options.getBoolean('enabled');
    const guildId = interaction.guildId;
    const currentSettings = (0, db_1.getGuildSetting)(guildId) || {};
    // SQLite stores 0 for true (active) if we use "disabled" columns, 
    // but for maintenance_mode 1 means active.
    // Let's normalize: Database stores 1 for "True/Disabled/Active"
    const dbValue = isActive ? 0 : 1;
    // Reverse for maintenance mode (isActive=true means maintenance is ON)
    const finalValue = feature === 'maintenance_mode' ? (isActive ? 1 : 0) : dbValue;
    (0, db_1.setGuildSetting)(guildId, {
        [feature]: finalValue
    });
    const featureName = {
        'disable_chat': 'AI Chatting',
        'disable_voice': 'AI Voice',
        'disable_commands': 'Slash Commands',
        'maintenance_mode': 'Maintenance Mode'
    }[feature];
    const statusText = feature === 'maintenance_mode'
        ? (isActive ? '🔴 ENABLED (Bot Restricted)' : '🟢 DISABLED (Bot Normal)')
        : (isActive ? '🟢 ENABLED' : '🔴 DISABLED');
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(isActive ? 0x00FF00 : 0xFF0000)
        .setTitle('⚙️ Feature Management')
        .setDescription(`**${featureName}** is now **${statusText}** for this server. ♪`)
        .setTimestamp();
    await interaction.reply({ embeds: [embed], flags: [discord_js_1.MessageFlags.Ephemeral] });
};
exports.execute = execute;
