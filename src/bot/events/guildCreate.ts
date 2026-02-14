import { Events, Guild, TextChannel } from 'discord.js';

console.log('[System] Loading guildCreate event file...');

export const name = Events.GuildCreate;
export const execute = async (guild: Guild) => {
    // Support both GUILD_IDS (comma separated) and legacy GUILD_ID
    const envIds = process.env.GUILD_IDS || process.env.GUILD_ID || "";
    const ALLOWED_GUILD_IDS = envIds.split(',').map(id => id.trim()).filter(id => id.length > 0);

    console.log(`[Security] 🛡️ Processing guild join for: ${guild.name} (${guild.id})`);
    console.log(`[Security] 📜 Allowed Whitelist: ${ALLOWED_GUILD_IDS.length > 0 ? ALLOWED_GUILD_IDS.join(', ') : 'ALL (disabled)'}`);

    if (ALLOWED_GUILD_IDS.length > 0 && !ALLOWED_GUILD_IDS.includes(guild.id)) {
        console.log(`[Security] 🔒 Auto-leaving unauthorized guild: ${guild.name} (${guild.id})`);

        // Try to say goodbye
        try {
            const systemChannel = guild.systemChannel || guild.channels.cache.find(c => c.isTextBased() && c.permissionsFor(guild.members.me!)?.has('SendMessages')) as TextChannel;

            if (systemChannel) {
                await systemChannel.send("omg thanks for the invite but i can't stay! my creator said no :( bye!").catch(() => null);
            }
        } catch (e) {
            console.log(`[Security] Could not send goodbye message in ${guild.name}`);
        }

        // Force leave
        try {
            await guild.leave();
            console.log(`[Security] 👋 Left guild: ${guild.name}`);
        } catch (e) {
            console.error(`[Security] Failed to leave guild ${guild.name}:`, e);
        }
    }
};
