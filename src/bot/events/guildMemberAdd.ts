import { Events, GuildMember, AttachmentBuilder, TextChannel, EmbedBuilder } from 'discord.js';
import { getGuildSetting, getUser } from '../db';
import { generateWelcomeImage } from '../utils/welcomeGen';
import { getAestheticWelcomeMessage, getAestheticDM } from '../utils/welcomeUtils';

export const name = Events.GuildMemberAdd;
export const execute = async (member: GuildMember) => {
    const settings = getGuildSetting(member.guild.id);
    if (!settings || !settings.welcome_channel) return;

    const channel = member.guild.channels.cache.get(settings.welcome_channel) as TextChannel;
    if (!channel || !channel.isSendable()) return;

    try {
        // 1. Generate Image
        const buffer = await generateWelcomeImage(member.user.username, member.user.displayAvatarURL({ extension: 'png' }));
        const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });

        // 2. Format Message (Aesthetic Automated)
        const welcomeText = getAestheticWelcomeMessage(member.id);
        const memberCount = member.guild.memberCount;

        const embed = new EmbedBuilder()
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
        const user = getUser(member.id, member.user.username);
        if (user.notify_welcome !== 0) {
            try {
                await member.send({ content: getAestheticDM(member.guild.name) });
            } catch (err) {
                console.warn(`Could not send welcome DM to ${member.user.tag}:`, err);
            }
        }
    } catch (error) {
        console.error("Welcome Event Error:", error);
    }
};
