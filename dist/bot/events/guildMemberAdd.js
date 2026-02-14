"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.name = void 0;
const discord_js_1 = require("discord.js");
const db_1 = require("../db");
const welcomeGen_1 = require("../utils/welcomeGen");
const welcomeUtils_1 = require("../utils/welcomeUtils");
exports.name = discord_js_1.Events.GuildMemberAdd;
const execute = async (member) => {
    const settings = (0, db_1.getGuildSetting)(member.guild.id);
    if (!settings || !settings.welcome_channel)
        return;
    const channel = member.guild.channels.cache.get(settings.welcome_channel);
    if (!channel || !channel.isSendable())
        return;
    try {
        // 1. Generate Image
        const buffer = await (0, welcomeGen_1.generateWelcomeImage)(member.user.username, member.user.displayAvatarURL({ extension: 'png' }));
        const attachment = new discord_js_1.AttachmentBuilder(buffer, { name: 'welcome.png' });
        // 2. Format Message (Aesthetic Automated)
        const welcomeText = (0, welcomeUtils_1.getAestheticWelcomeMessage)(member.id);
        const memberCount = member.guild.memberCount;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0xF8BBD0) // Soft pink
            .setDescription(welcomeText)
            .setImage('attachment://welcome.png')
            .setFooter({ text: `Member #${memberCount} • Sen Nightcore Community` });
        // 3. Send to Channel
        await channel.send({
            content: `Welcome to the family, <@${member.id}>! ♪`,
            embeds: [embed],
            files: [attachment]
        });
        // 4. Send DM (Stylized Automated)
        const user = (0, db_1.getUser)(member.id, member.user.username);
        if (user.notify_welcome !== 0) {
            try {
                await member.send({ content: (0, welcomeUtils_1.getAestheticDM)(member.guild.name) });
            }
            catch (err) {
                console.warn(`Could not send welcome DM to ${member.user.tag}:`, err);
            }
        }
    }
    catch (error) {
        console.error("Welcome Event Error:", error);
    }
};
exports.execute = execute;
