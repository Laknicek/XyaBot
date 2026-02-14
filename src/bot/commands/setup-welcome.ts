import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } from 'discord.js';
import { Command } from '../types';
import { setGuildSetting } from '../db';

export const data = new SlashCommandBuilder()

    .setName('setup-welcome')

    .setDescription('Configure the welcome system (Admins Only)')

    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addChannelOption(option => 

        option.setName('channel')

            .setDescription('The channel where welcome messages will be sent')

            .addChannelTypes(ChannelType.GuildText)

            .setRequired(true));



export const execute: Command['execute'] = async (interaction) => {

    const channel = interaction.options.getChannel('channel')!;



    setGuildSetting(interaction.guildId!, {

        welcome_channel: channel.id,

        welcome_message: 'AESTHETIC_SYSTEM', // Flag to use the utility

        welcome_dm: 'ENABLED'

    });



    await interaction.reply({

        content: `✨ **Sen Nightcore Welcome System Activated!**\nChannel: <#${channel.id}>\n\nXya will now greet all new friends with the stylized portal layout and send them the server information via DM! ♪`,

        flags: [MessageFlags.Ephemeral] 

    });

};
