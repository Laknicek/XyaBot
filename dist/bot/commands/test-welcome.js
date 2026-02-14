"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = require("discord.js");
const db_1 = require("../db");
const welcomeGen_1 = require("../utils/welcomeGen");
const welcomeUtils_1 = require("../utils/welcomeUtils");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('test-welcome')
    .setDescription('Manually trigger a welcome message test (Admins Only)')
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator);
const execute = async (interaction) => {
    const settings = (0, db_1.getGuildSetting)(interaction.guildId);
    if (!settings || !settings.welcome_channel) {
        await interaction.reply({ content: "Oh my, you haven't set up the welcome system yet! Use `/setup-welcome` first. ♪", flags: [discord_js_1.MessageFlags.Ephemeral] });
        return;
    }
    await interaction.deferReply({ flags: [discord_js_1.MessageFlags.Ephemeral] });
    const channel = interaction.guild?.channels.cache.get(settings.welcome_channel);
    if (!channel || !channel.isSendable()) {
        await interaction.editReply("Xya couldn't find the welcome channel or cannot send messages there! >_<\n");
        return;
    }
    try {
        // 1. Generate Image for the user who ran the command
        const buffer = await (0, welcomeGen_1.generateWelcomeImage)(interaction.user.username, interaction.user.displayAvatarURL({ extension: 'png' }));
        const attachment = new discord_js_1.AttachmentBuilder(buffer, { name: 'welcome_test.png' });
        // 2. Format Message
        const welcomeText = (0, welcomeUtils_1.getAestheticWelcomeMessage)(interaction.user.id);
        const memberCount = interaction.guild?.memberCount || 0;
        const embed = new discord_js_1.EmbedBuilder()
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
            await interaction.user.send({ content: `**[Welcome Test DM]**\n${(0, welcomeUtils_1.getAestheticDM)(interaction.guild?.name || 'Sen Nightcore')}` });
        }
        catch (err) {
            console.warn("Could not send test DM:", err);
        }
        await interaction.editReply(`✨ **Test complete!** Check <#${channel.id}> to see how it looks!`);
    }
    catch (error) {
        console.error("Test Welcome Error:", error);
        await interaction.editReply("Oh no, something went wrong while generating the test! >_<\n");
    }
};
exports.execute = execute;
