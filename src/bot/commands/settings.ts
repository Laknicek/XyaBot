import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { Command } from '../types';
import { getUser, updateUser } from '../db';

export const data = new SlashCommandBuilder()
    .setName('settings')
    .setDescription('Personalize Xya\'s notifications for you! ♪')
    .addSubcommand(sub =>
        sub.setName('notifications')
            .setDescription('Toggle your DM notification preferences')
            .addStringOption(opt =>
                opt.setName('type')
                    .setDescription('Which notification to toggle?')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Welcome Message', value: 'notify_welcome' },
                        { name: 'XP Gains', value: 'notify_xp' },
                        { name: 'Voice Chat Rewards', value: 'notify_voice' },
                        { name: 'Daily Bonus', value: 'notify_daily' }
                    ))
            .addBooleanOption(opt =>
                opt.setName('enabled')
                    .setDescription('Enable or Disable?')
                    .setRequired(true)));

export const execute: Command['execute'] = async (interaction) => {
    const type = interaction.options.getString('type')!;
    const enabled = interaction.options.getBoolean('enabled')!;
    const user = getUser(interaction.user.id, interaction.user.username);

    const updateData: any = {};
    updateData[type] = enabled ? 1 : 0;
    
    updateUser(interaction.user.id, updateData);

    const friendlyName = type.replace('notify_', '').toUpperCase();
    await interaction.reply({
        content: `✨ **Settings updated!**\nI will ${enabled ? 'now' : 'no longer'} send you DM notifications for **${friendlyName}**. \n(Note: Punishment notifications are always active for safety! ♪)`,
        flags: [MessageFlags.Ephemeral] 
    });
};
