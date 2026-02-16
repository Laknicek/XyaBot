"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = require("discord.js");
const db_1 = require("../db");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('manage-gems')
    .setDescription('Manage user gems (Admin Only)')
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
    .addSubcommand(sub => sub.setName('add')
    .setDescription('Add gems to a user')
    .addUserOption(opt => opt.setName('user').setDescription('The user').setRequired(true))
    .addIntegerOption(opt => opt.setName('amount').setDescription('Amount to add').setRequired(true).setMinValue(1)))
    .addSubcommand(sub => sub.setName('remove')
    .setDescription('Remove gems from a user')
    .addUserOption(opt => opt.setName('user').setDescription('The user').setRequired(true))
    .addIntegerOption(opt => opt.setName('amount').setDescription('Amount to remove').setRequired(true).setMinValue(1)))
    .addSubcommand(sub => sub.setName('set')
    .setDescription('Set a user\'s gems to a specific amount')
    .addUserOption(opt => opt.setName('user').setDescription('The user').setRequired(true))
    .addIntegerOption(opt => opt.setName('amount').setDescription('The exact amount').setRequired(true).setMinValue(0)));
const execute = async (interaction) => {
    const subcommand = interaction.options.getSubcommand();
    const targetUser = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    // Get user data
    const user = (0, db_1.getUser)(targetUser.id, targetUser.username);
    let newBalance = user.currency;
    switch (subcommand) {
        case 'add':
            newBalance += amount;
            break;
        case 'remove':
            newBalance = Math.max(0, newBalance - amount);
            break;
        case 'set':
            newBalance = amount;
            break;
    }
    (0, db_1.updateUser)(targetUser.id, { currency: newBalance });
    await interaction.reply({
        content: `✅ **Updated Gems for ${targetUser.username}**\n\n` +
            `Previous Balance: 💎 ${user.currency.toLocaleString()}\n` +
            `New Balance: 💎 ${newBalance.toLocaleString()}`,
        flags: [discord_js_1.MessageFlags.Ephemeral]
    });
};
exports.execute = execute;
