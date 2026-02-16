import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { Command } from '../types';
import { getGuildSetting } from '../db';
import { scanAttachment } from '../ai';

export const data = new SlashCommandBuilder()
    .setName('request')
    .setDescription('Request a song for the radio/vibes channel')
    .addStringOption(option =>
        option.setName('url')
            .setDescription('YouTube URL of the song')
            .setRequired(false))
    .addAttachmentOption(option =>
        option.setName('file')
            .setDescription('Upload an audio file (mp3, wav, flac)')
            .setRequired(false));

export const execute: Command['execute'] = async (interaction) => {
    const url = interaction.options.getString('url');
    const file = interaction.options.getAttachment('file');

    if (!url && !file) {
        return interaction.reply({ content: "❌ You must provide either a **URL** or a **File**!", flags: [MessageFlags.Ephemeral] });
    }

    if (url && file) {
        return interaction.reply({ content: "❌ Please provide **only one** (URL or File), not both!", flags: [MessageFlags.Ephemeral] });
    }

    const guildId = interaction.guildId!;
    const settings = getGuildSetting(guildId);

    // Check if request channel is configured
    if (!settings?.requests_channel_id) {
        return interaction.reply({ content: "❌ Song requests are not configured! Ask an admin to run `/setup requests channel`.", flags: [MessageFlags.Ephemeral] });
    }

    const requestChannel = interaction.guild?.channels.cache.get(settings.requests_channel_id);
    if (!requestChannel || !requestChannel.isSendable()) {
        return interaction.reply({ content: "❌ The song request channel is invalid or I can't send messages there.", flags: [MessageFlags.Ephemeral] });
    }

    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    // --- VALIDATION AND SAFETY ---
    let content = '';
    let type = '';
    let safetyCheck = true;
    let safetyReason = '';

    if (url) {
        // YouTube Validation
        const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
        if (!ytRegex.test(url)) {
            return interaction.editReply("❌ **Invalid URL!** Only YouTube links are supported to prevent phishing/malware.");
        }
        content = url;
        type = 'YouTube URL';
    }

    if (file) {
        // File Type Validation
        const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/x-wav', 'audio/mp4', 'audio/ogg'];
        // Also check extension just in case content-type is missing/weird
        const validExts = ['.mp3', '.wav', '.flac', '.ogg', '.m4a'];
        const isExtValid = validExts.some(ext => file.name.toLowerCase().endsWith(ext));

        if (!validTypes.includes(file.contentType || '') && !isExtValid) {
            return interaction.editReply(`❌ **Invalid File Type!**\nSupported: MP3, WAV, FLAC, OGG, M4A.\nReceived: ${file.contentType || 'Unknown'}`);
        }

        content = file.url;
        type = 'Audio File';

        // Scan for malware/bad stuff? (Using our scanAttachment for consistency, though it's mostly image focused. 
        // For audio, we can't really scan deep inside without processing it, but we can check if it's "safe" metadata-wise if we had a tool.
        // For now, simple file type restriction is the main defense against executables.)
    }

    // --- CREATE EMBED ---
    const embed = new EmbedBuilder()
        .setTitle('🎵 New Song Request')
        .setDescription(`**Requester:** <@${interaction.user.id}> (${interaction.user.tag})\n**Type:** ${type}\n**Content:** ${content}`)
        .setColor(0xFFA500) // Orange for Pending
        .setTimestamp()
        .setFooter({ text: 'Status: Pending Approval' });

    // --- BUTTONS ---
    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('approve_song')
                .setLabel('Approve')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅'),
            new ButtonBuilder()
                .setCustomId('decline_song')
                .setLabel('Decline')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('✖️')
        );

    try {
        await requestChannel.send({ embeds: [embed], components: [row] });
        await interaction.editReply("✅ **Request Sent!** Wait for an admin to approve it.");
    } catch (e) {
        console.error("Failed to send song request:", e);
        await interaction.editReply("❌ Failed to send request to the channel.");
    }
};
