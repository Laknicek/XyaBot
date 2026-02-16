import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, TextChannel } from 'discord.js';
import { Command } from '../types';
import { getGuildSetting } from '../db';

export const data = new SlashCommandBuilder()
    .setName('debug-event')
    .setDescription('Trigger a mock event (Debug)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export const execute: Command['execute'] = async (interaction) => {
    if (!interaction.guild) return;

    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    try {
        const settings = getGuildSetting(interaction.guild.id);
        const targetChannelId = settings?.events_channel_id;

        let channel;
        let source = "Auto-Detection";

        if (targetChannelId) {
            channel = interaction.guild.channels.cache.get(targetChannelId);
            source = "Configured Channel";
        }

        if (!channel) {
            channel = interaction.guild.channels.cache.find((c: any) => c.isTextBased() && c.permissionsFor?.(interaction.guild!.members.me!)?.has('SendMessages'));
            source = "Fallback (First Available)";
        }

        if (channel && channel.isSendable()) {
            await (channel as TextChannel).send(`🎉 **DEBUG EVENT!**\nThis is a test event triggered by ${interaction.user.username}.\nSource: **${source}**`);
            await interaction.editReply(`✅ Event sent to ${channel} (${source})`);
        } else {
            await interaction.editReply(`❌ Could not find a suitable channel to send the event.`);
        }

    } catch (e: any) {
        console.error(e);
        await interaction.editReply(`❌ Error: ${e.message}`);
    }
};
