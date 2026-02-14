"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = require("discord.js");
const voice_1 = require("@discordjs/voice");
const voiceReceiver_1 = require("../utils/voiceReceiver");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('join')
    .setDescription('Ask Xya to join your voice channel');
const execute = async (interaction) => {
    const member = interaction.guild?.members.cache.get(interaction.user.id);
    const voiceChannel = member?.voice.channel;
    if (!voiceChannel) {
        await interaction.reply({ content: "You need to be in a voice channel first, silly! *giggles*", flags: [discord_js_1.MessageFlags.Ephemeral] });
        return;
    }
    const existingConnection = (0, voice_1.getVoiceConnection)(voiceChannel.guild.id);
    if (existingConnection && existingConnection.joinConfig.channelId === voiceChannel.id) {
        await interaction.reply(`I'm already here with you in **${voiceChannel.name}**! ♪`);
        return;
    }
    try {
        const connection = (0, voice_1.joinVoiceChannel)({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
        });
        connection.on(voice_1.VoiceConnectionStatus.Ready, () => {
            console.log('The connection has entered the Ready state - ready to play audio!');
            (0, voiceReceiver_1.setupVoiceListening)(connection, interaction.client);
        });
        await interaction.reply(`I've joined **${voiceChannel.name}**! Let's hang out! ♪`);
    }
    catch (error) {
        console.error(error);
        await interaction.reply({ content: "I had a little trouble joining... sorry!", flags: [discord_js_1.MessageFlags.Ephemeral] });
    }
};
exports.execute = execute;
