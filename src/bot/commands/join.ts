import { SlashCommandBuilder, ChannelType, MessageFlags } from 'discord.js';
import { joinVoiceChannel, VoiceConnectionStatus, getVoiceConnection } from '@discordjs/voice';
import { Command, ExtendedClient } from '../types';
import { setupVoiceListening } from '../utils/voiceReceiver';

export const data = new SlashCommandBuilder()
    .setName('join')
    .setDescription('Ask Xya to join your voice channel');

export const execute: Command['execute'] = async (interaction) => {
    const member = interaction.guild?.members.cache.get(interaction.user.id);
    const voiceChannel = member?.voice.channel;

    if (!voiceChannel) {
        await interaction.reply({ content: "You need to be in a voice channel first, silly! *giggles*", flags: [MessageFlags.Ephemeral] });
        return;
    }

    const existingConnection = getVoiceConnection(voiceChannel.guild.id);
    if (existingConnection && existingConnection.joinConfig.channelId === voiceChannel.id) {
        await interaction.reply(`I'm already here with you in **${voiceChannel.name}**! ♪`);
        return;
    }

    try {
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
        });

        connection.on(VoiceConnectionStatus.Ready, () => {
            console.log('The connection has entered the Ready state - ready to play audio!');
            setupVoiceListening(connection, interaction.client as ExtendedClient);
        });

        await interaction.reply(`I've joined **${voiceChannel.name}**! Let's hang out! ♪`);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: "I had a little trouble joining... sorry!", flags: [MessageFlags.Ephemeral] });
    }
};
