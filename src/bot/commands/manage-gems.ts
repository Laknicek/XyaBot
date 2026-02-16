import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { Command } from '../types';
import { getUser, updateUser } from '../db';

export const data = new SlashCommandBuilder()
    .setName('manage-gems')
    .setDescription('Manage user gems (Admin Only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
        sub.setName('add')
            .setDescription('Add gems to a user')
            .addUserOption(opt => opt.setName('user').setDescription('The user').setRequired(true))
            .addIntegerOption(opt => opt.setName('amount').setDescription('Amount to add').setRequired(true).setMinValue(1)))
    .addSubcommand(sub =>
        sub.setName('remove')
            .setDescription('Remove gems from a user')
            .addUserOption(opt => opt.setName('user').setDescription('The user').setRequired(true))
            .addIntegerOption(opt => opt.setName('amount').setDescription('Amount to remove').setRequired(true).setMinValue(1)))
    .addSubcommand(sub =>
        sub.setName('set')
            .setDescription('Set a user\'s gems to a specific amount')
            .addUserOption(opt => opt.setName('user').setDescription('The user').setRequired(true))
            .addIntegerOption(opt => opt.setName('amount').setDescription('The exact amount').setRequired(true).setMinValue(0)));

export const execute: Command['execute'] = async (interaction) => {
    const subcommand = interaction.options.getSubcommand();
    const targetUser = interaction.options.getUser('user')!;
    const amount = interaction.options.getInteger('amount')!;

    // Get user data
    const user = getUser(targetUser.id, targetUser.username);
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

    updateUser(targetUser.id, { currency: newBalance });

    await interaction.reply({
        content: `✅ **Updated Gems for ${targetUser.username}**\n\n` +
            `Previous Balance: 💎 ${user.currency.toLocaleString()}\n` +
            `New Balance: 💎 ${newBalance.toLocaleString()}`,
        flags: [MessageFlags.Ephemeral]
    });
};
