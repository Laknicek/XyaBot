"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = require("discord.js");
const db_1 = require("../db");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('debug-event')
    .setDescription('Trigger a mock event (Debug)')
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator);
const execute = async (interaction) => {
    if (!interaction.guild)
        return;
    await interaction.deferReply({ flags: [discord_js_1.MessageFlags.Ephemeral] });
    try {
        const settings = (0, db_1.getGuildSetting)(interaction.guild.id);
        const targetChannelId = settings?.events_channel_id;
        let channel;
        let source = "Auto-Detection";
        if (targetChannelId) {
            channel = interaction.guild.channels.cache.get(targetChannelId);
            source = "Configured Channel";
        }
        if (!channel) {
            channel = interaction.guild.channels.cache.find((c) => c.isTextBased() && c.permissionsFor?.(interaction.guild.members.me)?.has('SendMessages'));
            source = "Fallback (First Available)";
        }
        if (channel && channel.isSendable()) {
            await channel.send(`🎉 **DEBUG EVENT!**\nThis is a test event triggered by ${interaction.user.username}.\nSource: **${source}**`);
            await interaction.editReply(`✅ Event sent to ${channel} (${source})`);
        }
        else {
            await interaction.editReply(`❌ Could not find a suitable channel to send the event.`);
        }
    }
    catch (e) {
        console.error(e);
        await interaction.editReply(`❌ Error: ${e.message}`);
    }
};
exports.execute = execute;
