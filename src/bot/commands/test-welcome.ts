import { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder, TextChannel, EmbedBuilder, MessageFlags } from 'discord.js';
import { Command } from '../types';
import { getGuildSetting } from '../db';
import { generateWelcomeImage } from '../utils/welcomeGen';
import { getAestheticWelcomeMessage, getAestheticDM } from '../utils/welcomeUtils';

export const data = new SlashCommandBuilder()
    .setName('test-welcome')
    .setDescription('Manually trigger a welcome message test (Admins Only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export const execute: Command['execute'] = async (interaction) => {
    const settings = getGuildSetting(interaction.guildId!);
    
    if (!settings || !settings.welcome_channel) {
        await interaction.reply({ content: "Oh my, you haven't set up the welcome system yet! Use `/setup-welcome` first. ♪", flags: [MessageFlags.Ephemeral] });
        return;
    }

    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const channel = interaction.guild?.channels.cache.get(settings.welcome_channel) as TextChannel;
    if (!channel || !channel.isSendable()) {
        await interaction.editReply("Xya couldn't find the welcome channel or cannot send messages there! >_<\n");
        return;
    }

    try {
        // 1. Generate Image for the user who ran the command
        const buffer = await generateWelcomeImage(interaction.user.username, interaction.user.displayAvatarURL({ extension: 'png' }));
        const attachment = new AttachmentBuilder(buffer, { name: 'welcome_test.png' });

        // 2. Format Message
        const welcomeText = getAestheticWelcomeMessage(interaction.user.id);
        const memberCount = interaction.guild?.memberCount || 0;

        const embed = new EmbedBuilder()
            .setColor(0xF8BBD0)
            .setDescription(welcomeText)
            .setImage('attachment://welcome_test.png')
            .setFooter({ text: `Member #${memberCount} • Sen Nightcore Community` });

        // 3. Send to Channel
        await channel.send({ 
            content: `🌸 **[TEST MODE]** Welcome, <@${interaction.user.id}>! ♪`, 
            embeds: [embed], 
            files: [attachment] 
        });

        // 4. Try sending DM
        try {
            await interaction.user.send({ content: `**[Welcome Test DM]**\n${getAestheticDM(interaction.guild?.name || 'Sen Nightcore')}` });
        } catch (err) {
            console.warn("Could not send test DM:", err);
        }

        await interaction.editReply(`✨ **Test complete!** Check <#${channel.id}> to see how it looks!`);
    } catch (error) {
        console.error("Test Welcome Error:", error);
        await interaction.editReply("Oh no, something went wrong while generating the test! >_<\n");
    }
};
