"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = require("discord.js");
const voice_1 = require("@discordjs/voice");
const voiceUtils_1 = require("../utils/voiceUtils");
// Ensure yt-dlp binary exists (keep this check)
// Ensure yt-dlp binary exists (keep this check)
// const ytDlpPath = path.resolve(__dirname, '../../../yt-dlp.exe');
// We don't strictly need YTDlpWrap here if play-dl handles it, but keeping for safety if used elsewhere or for init
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('radio')
    .setDescription('Play Xya\'s Nightcore Radio! 📻');
const execute = async (interaction) => {
    const member = interaction.guild?.members.cache.get(interaction.user.id);
    const voiceChannel = member?.voice.channel;
    if (!voiceChannel) {
        await interaction.reply({ content: "Join a voice channel first, silly! ♪", flags: [discord_js_1.MessageFlags.Ephemeral] });
        return;
    }
    await interaction.deferReply();
    try {
        const guildId = voiceChannel.guild.id;
        const connection = (0, voice_1.joinVoiceChannel)({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });
        // Default Radio Mode
        const playlistUrl = 'https://www.youtube.com/watch?v=bcy_-dQq5AQ&list=PLT77p-TV6TxfbB4vsiFnCwO_rS_dTjSuP';
        console.log(`[Radio] Starting default radio...`);
        await (0, voiceUtils_1.playRadio)(guildId, playlistUrl, connection, true); // true = isPlaylist/Radio mode
        await interaction.editReply(`🎶 **Xya's Nightcore Radio** is now live! ✨\nVolume is optimized so I can talk over it! ♪`);
    }
    catch (error) {
        console.error("[Radio] Critical Error:", error);
        await interaction.editReply("Oh my, Xya's radio engine had a little trouble starting... let's try again? >_<\n");
    }
};
exports.execute = execute;
