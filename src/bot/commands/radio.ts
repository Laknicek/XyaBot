import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { joinVoiceChannel } from '@discordjs/voice';
import { Command } from '../types';
import { playRadio } from '../utils/voiceUtils';
import play from 'play-dl';
import fs from 'fs';
import path from 'path';

// Ensure yt-dlp binary exists (keep this check)
const ytDlpPath = path.resolve(__dirname, '../../../yt-dlp.exe');
// We don't strictly need YTDlpWrap here if play-dl handles it, but keeping for safety if used elsewhere or for init

export const data = new SlashCommandBuilder()
    .setName('radio')
    .setDescription('Play music or Xya\'s Nightcore Radio! 📻')
    .addStringOption(option =>
        option.setName('query')
            .setDescription('Song name or URL (leave empty for Nightcore Radio)')
            .setRequired(false)
    );

export const execute: Command['execute'] = async (interaction) => {
    const member = interaction.guild?.members.cache.get(interaction.user.id);
    const voiceChannel = member?.voice.channel;
    const query = interaction.options.getString('query');

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

        if (query) {
            // Search mode
            console.log(`[Radio] Searching for: ${query}`);

            // Validate URL if it is one
            if (query.startsWith('http')) {
                if (!play.yt_validate(query) && !query.includes('spotify')) { // Basic check
                    await interaction.editReply("Hmm, that link looks weird... I can only play YouTube or Spotify links! >_<");
                    return;
                }
            }

            try {
                // Determine what to play
                let playUrl = query;
                let title = "Music";

                if (!query.startsWith('http')) {
                    const search = await play.search(query, { limit: 1 });
                    if (search && search.length > 0) {
                        playUrl = search[0].url;
                        title = search[0].title || query;
                    } else {
                        await interaction.editReply("I couldn't find anything for that! 😭");
                        return;
                    }
                }

                await playRadio(guildId, playUrl, connection);
                await interaction.editReply(`🎶 Now playing: **${title}**! \n(Use \`/stop\` to stop)`);

            } catch (err: any) {
                console.error(`[Radio] Search Error:`, err);
                await interaction.editReply("I couldn't play that... maybe it's restricted? 😔");
            }

        } else {
            // Default Radio Mode
            const playlistUrl = 'https://www.youtube.com/watch?v=bcy_-dQq5AQ&list=PLT77p-TV6TxfbB4vsiFnCwO_rS_dTjSuP';
            console.log(`[Radio] Starting default radio...`);

            await playRadio(guildId, playlistUrl, connection, true); // true = isPlaylist/Radio mode

            await interaction.editReply(`🎶 **Xya's Nightcore Radio** is now live! ✨\nVolume is optimized so I can talk over it! ♪`);
        }

    } catch (error) {
        console.error("[Radio] Critical Error:", error);
        await interaction.editReply("Oh my, Xya's radio engine had a little trouble starting... let's try again? >_<\n");
    }
};
