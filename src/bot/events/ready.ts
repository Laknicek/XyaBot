import { Events, Client, ChannelType, TextChannel, PermissionsBitField } from 'discord.js';
import { joinVoiceChannel, VoiceConnectionStatus, getVoiceConnection } from '@discordjs/voice';
import { setupVoiceListening } from '../utils/voiceReceiver';
import { ExtendedClient } from '../types';
import db from '../db';
import { getCurrentMood } from '../ai';
import { ActivityType } from 'discord.js';

// Daily vibe events Xya announces
const VIBE_EVENTS = [
    "🎵 **vibe check** — what song are u listening to rn?? drop it below 👇",
    "✨ **unpopular opinion time** — share ur hottest take and lets see who agrees 🔥",
    "🎨 **show me ur wallpaper** — phone or desktop idc i wanna see 👀",
    "💭 **if u could have any superpower what would it be?** im curious 🦸",
    "🍕 **settle this once and for all** — pineapple on pizza: yes or no? 🍍",
    "📸 **selfie hour** — show ur face or ur pet or ur setup idc 📷",
    "🎮 **what game are u playing rn?** need recs tbh",
    "😴 **how many hours of sleep did u get last night?** be honest 💀",
    "🌙 **whats something nice that happened to u today?** i wanna hear 💕",
    "🎤 **if u could see any artist live who would it be?** mine is obvious lol",
    "📚 **recommend me something** — a show, a song, a game, anything!!",
    "💀 **whats the most embarrassing thing thats happened to u recently?** spill",
];

export const name = Events.ClientReady;
export const once = true;
export const execute = async (client: Client) => {
    console.log(`Ready! Logged in as ${client.user?.tag}`);
    console.log(`Ready! Logged in as ${client.user?.tag}`);

    // --- Dynamic Status based on Mood ---
    const updateStatus = () => {
        const mood = getCurrentMood();
        // e.g. "🌙 Chaotic | /help"
        const statusText = `${mood.emoji} ${mood.mood} | /help`;
        client.user?.setActivity(statusText, { type: ActivityType.Custom });
    };

    updateStatus(); // Initial set
    setInterval(updateStatus, 60 * 1000); // Update every 1 minute

    // --- Guild Restriction Check ---
    // --- Guild Restriction Check ---
    const envIds = process.env.GUILD_IDS || process.env.GUILD_ID || "";
    const ALLOWED_GUILD_IDS = envIds.split(',').map(id => id.trim()).filter(id => id.length > 0);

    if (ALLOWED_GUILD_IDS.length > 0) {
        console.log(`[Security] 🔐 Guild Whitelist ENABLED. Allowed: ${ALLOWED_GUILD_IDS.join(', ')}`);

        for (const [id, guild] of client.guilds.cache) {
            if (!ALLOWED_GUILD_IDS.includes(guild.id)) {
                console.log(`[Security] 🔒 Leaving unauthorized guild: ${guild.name} (${guild.id})`);

                // Try to say goodbye, but don't let it stop us from leaving
                try {
                    const systemChannel = guild.systemChannel || guild.channels.cache.find(c => c.isTextBased() && c.permissionsFor(guild.members.me!)?.has('SendMessages')) as TextChannel;
                    if (systemChannel) {
                        await systemChannel.send("omg sorry!! i need to leave, i'm only allowed in specific servers >.< bye!").catch(() => null);
                    }
                } catch (e) {
                    console.log(`[Security] Could not send goodbye message in ${guild.name}`);
                }

                // Force leave
                try {
                    await guild.leave();
                    console.log(`[Security] 👋 Left guild: ${guild.name}`);
                } catch (e) {
                    console.error(`[Security] ❌ Failed to leave guild ${guild.name}:`, e);
                }
            }
        }
    } else {
        console.log(`[Security] ⚠️ Guild Whitelist DISABLED (No GUILD_IDS or GUILD_ID set). Bot can join any server.`);
    }

    // --- Occasional Voice Join ---
    setInterval(async () => {
        client.guilds.cache.forEach(async (guild) => {
            if (getVoiceConnection(guild.id)) return;

            // Find valid voice channel:
            // 1. Must be a Voice Channel
            // 2. Must have non-bot members
            // 3. Must be viewable by @everyone (Public)
            // 4. Bot must have permission to join/speak
            const activeVC = guild.channels.cache.find(c => {
                if (c.type !== ChannelType.GuildVoice) return false;

                const permissions = c.permissionsFor(guild.roles.everyone);
                const botPermissions = c.permissionsFor(guild.members.me!);

                const isPublic = permissions.has(PermissionsBitField.Flags.ViewChannel) && permissions.has(PermissionsBitField.Flags.Connect);
                const canJoin = botPermissions.has(PermissionsBitField.Flags.Connect) && botPermissions.has(PermissionsBitField.Flags.Speak);
                const hasPeople = c.members.filter(m => !m.user.bot).size > 0;

                return isPublic && canJoin && hasPeople;
            });

            if (activeVC && activeVC.type === ChannelType.GuildVoice) {
                console.log(`[Auto-Join] Found active public VC in ${guild.name}: ${activeVC.name}. Joining...`);
                try {
                    const connection = joinVoiceChannel({
                        channelId: activeVC.id,
                        guildId: guild.id,
                        adapterCreator: guild.voiceAdapterCreator,
                        selfDeaf: false,
                        selfMute: false
                    });

                    connection.on(VoiceConnectionStatus.Ready, () => {
                        console.log(`[Auto-Join] Connected to ${activeVC.name}!`);
                        setupVoiceListening(connection, client as ExtendedClient);
                    });

                    // Auto-disconnect handling is done in voiceStateUpdate now

                } catch (e) {
                    console.error(`[Auto-Join] Failed to join ${activeVC.name}:`, e);
                }
            }
        });
    }, 10 * 60 * 1000); // Every 10 minutes

    // --- Daily Vibe Events (every 6 hours) ---
    setInterval(async () => {
        client.guilds.cache.forEach(async (guild) => {
            // Find the most active text channel (or general)
            const textChannel = guild.channels.cache.find(c =>
                c.type === ChannelType.GuildText && c.name.includes('general')
            ) || guild.channels.cache.find(c =>
                c.type === ChannelType.GuildText
            );

            if (textChannel && textChannel.type === ChannelType.GuildText) {
                const event = VIBE_EVENTS[Math.floor(Math.random() * VIBE_EVENTS.length)];
                try {
                    await (textChannel as TextChannel).send(event);
                    console.log(`[VibeEvent] Posted in ${guild.name}/#${textChannel.name}`);
                } catch (e) {
                    console.error(`[VibeEvent] Failed to post in ${guild.name}:`, e);
                }
            }
        });
    }, 6 * 60 * 60 * 1000); // Every 6 hours

    // --- Passive Disgust Decay (every hour, reduce all disgust by 5%) ---
    setInterval(() => {
        try {
            db.prepare('UPDATE users SET disgust_points = MAX(0, disgust_points - MAX(1, disgust_points / 20)) WHERE disgust_points > 0').run();
            console.log('[Decay] Passive disgust decay applied');
        } catch (e) {
            console.error('[Decay] Failed:', e);
        }
    }, 60 * 60 * 1000); // Every hour
};
