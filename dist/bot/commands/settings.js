"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = require("discord.js");
const db_1 = require("../db");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('settings')
    .setDescription('Personalize Xya\'s notifications for you! ♪')
    .addSubcommand(sub => sub.setName('notifications')
    .setDescription('Toggle your DM notification preferences')
    .addStringOption(opt => opt.setName('type')
    .setDescription('Which notification to toggle?')
    .setRequired(true)
    .addChoices({ name: 'Welcome Message', value: 'notify_welcome' }, { name: 'XP Gains', value: 'notify_xp' }, { name: 'Voice Chat Rewards', value: 'notify_voice' }, { name: 'Daily Bonus', value: 'notify_daily' }))
    .addBooleanOption(opt => opt.setName('enabled')
    .setDescription('Enable or Disable?')
    .setRequired(true)));
const execute = async (interaction) => {
    const type = interaction.options.getString('type');
    const enabled = interaction.options.getBoolean('enabled');
    const user = (0, db_1.getUser)(interaction.user.id, interaction.user.username);
    const updateData = {};
    updateData[type] = enabled ? 1 : 0;
    (0, db_1.updateUser)(interaction.user.id, updateData);
    const friendlyName = type.replace('notify_', '').toUpperCase();
    await interaction.reply({
        content: `✨ **Settings updated!**\nI will ${enabled ? 'now' : 'no longer'} send you DM notifications for **${friendlyName}**. \n(Note: Punishment notifications are always active for safety! ♪)`,
        flags: [discord_js_1.MessageFlags.Ephemeral]
    });
};
exports.execute = execute;
