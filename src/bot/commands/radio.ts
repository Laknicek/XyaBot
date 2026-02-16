import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { joinVoiceChannel } from '@discordjs/voice';
import { Command } from '../types';
import { playRadio } from '../utils/voiceUtils';
import play from 'play-dl';
import fs from 'fs';
import path from 'path';

// Ensure yt-dlp binary exists (keep this check)
// Ensure yt-dlp binary exists (keep this check)
// const ytDlpPath = path.resolve(__dirname, '../../../yt-dlp.exe');
// We don't strictly need YTDlpWrap here if play-dl handles it, but keeping for safety if used elsewhere or for init

export const data = new SlashCommandBuilder()
    .setName('radio')
    .setDescription('Play Xya\'s Nightcore Radio! 📻');

export const execute: Command['execute'] = async (interaction) => {
    const member = interaction.guild?.members.cache.get(interaction.user.id);
    const voiceChannel = member?.voice.channel;

    if (!voiceChannel) {
        await interaction.reply({ content: "Join a voice channel first, silly! ♪", flags: [MessageFlags.Ephemeral] });
        return;
    }

    await interaction.deferReply();

    try {
        const guildId = voiceChannel.guild.id;
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        // Default Radio Mode
        const playlistUrl = 'https://www.youtube.com/watch?v=bcy_-dQq5AQ&list=PLT77p-TV6TxfbB4vsiFnCwO_rS_dTjSuP';
        console.log(`[Radio] Starting default radio...`);

        await playRadio(guildId, playlistUrl, connection, true); // true = isPlaylist/Radio mode

        await interaction.editReply(`🎶 **Xya's Nightcore Radio** is now live! ✨\nVolume is optimized so I can talk over it! ♪`);

    } catch (error) {
        console.error("[Radio] Critical Error:", error);
        await interaction.editReply("Oh my, Xya's radio engine had a little trouble starting... let's try again? >_<\n");
    }
};
