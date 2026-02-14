import { Events, VoiceState, EmbedBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import { getUser, updateUser, startVoiceSession, endVoiceSession, logEconomyTransaction, getMilestoneMultiplier } from '../db';

export const name = Events.VoiceStateUpdate;

const getLevel = (xp: number) => Math.floor(Math.sqrt(xp / 100));

// Store active voice sessions in memory for quick access
const activeVoiceSessions = new Map<string, number>();

export const execute = async (oldState: VoiceState, newState: VoiceState) => {
    if (oldState.member?.user.bot) return;

    const userId = oldState.member?.id || newState.member?.id;
    if (!userId) return;

    const user = getUser(userId, oldState.member?.user.username || newState.member?.user.username || "Unknown User");
    const now = Date.now();

    // User Joined a channel
    if (!oldState.channelId && newState.channelId) {
        updateUser(userId, { voice_join_time: now });

        // Start detailed voice session tracking
        const sessionId = startVoiceSession(
            userId,
            newState.guild.id,
            newState.channelId
        );
        activeVoiceSessions.set(userId, sessionId);

        console.log(`[Voice] ${user.username} joined channel ${newState.channel?.name} in ${newState.guild.name} (Session ID: ${sessionId})`);
    }
    // User Left a channel
    else if (oldState.channelId && !newState.channelId) {
        if (user.voice_join_time > 0) {
            const timeSpent = now - user.voice_join_time;
            const minutes = Math.floor(timeSpent / 60000);

            if (minutes > 0) {
                const multiplier = getMilestoneMultiplier(user.friendship_points || 0);
                const baseXp = minutes * 15;
                const xpGained = Math.floor(baseXp * multiplier);
                const gemsGained = minutes * 2;

                const oldLevel = getLevel(user.xp);
                const newXp = user.xp + xpGained;
                const newCurrency = user.currency + gemsGained;
                const newLevel = getLevel(newXp);

                // End voice session tracking
                const sessionId = activeVoiceSessions.get(userId);
                if (sessionId) {
                    endVoiceSession(sessionId, minutes, xpGained, gemsGained);
                    activeVoiceSessions.delete(userId);
                }

                // Update user stats with detailed voice tracking
                updateUser(userId, {
                    xp: newXp,
                    currency: newCurrency,
                    voice_join_time: 0,
                    total_voice_minutes: (user.total_voice_minutes || 0) + minutes,
                    voice_sessions: (user.voice_sessions || 0) + 1,
                    last_active_time: now
                });

                // Log economy transaction
                logEconomyTransaction(userId, 'voice', gemsGained, 'voice_session', newCurrency);

                console.log(`[Voice] ${user.username} spent ${minutes} minutes in voice. +${xpGained} XP, +${gemsGained} Gems`);

                // Notify user in DM if enabled
                if (user.notify_voice !== 0) {
                    try {
                        await oldState.member?.send(`🌸 **Xya's Voice Reward!**\nYou spent **${minutes} minutes** in voice and earned **${xpGained} XP** and **${gemsGained} Gems**! ♪`);
                    } catch (e) {
                        console.warn(`Could not DM voice rewards to ${user.username}`);
                    }
                }

                // Notify user in a text channel if they leveled up
                if (newLevel > oldLevel) {
                    const embed = new EmbedBuilder()
                        .setColor(0xFF1493)
                        .setTitle('✨ Voice Level Up! ✨')
                        .setDescription(`Wow! While hanging out in voice, ${oldState.member?.user} reached **Level ${newLevel}**!`)
                        .setThumbnail(oldState.member?.user.displayAvatarURL() || null)
                        .setFooter({ text: 'Xya loves hearing your voice! ♪' });

                    // Try to find a channel to send the level up message
                    const channel = newState.guild.systemChannel || newState.guild.channels.cache.find(c => c.isTextBased());
                    if (channel && 'send' in channel) {
                        (channel as any).send({ embeds: [embed] });
                    }
                }
            } else {
                updateUser(userId, { voice_join_time: 0 });
                const sessionId = activeVoiceSessions.get(userId);
                if (sessionId) {
                    endVoiceSession(sessionId, 0, 0, 0);
                    activeVoiceSessions.delete(userId);
                }
            }
        }
    }
    // User moved between channels
    else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        const sessionId = activeVoiceSessions.get(userId);
        if (sessionId) {
            // End current session
            const timeSpent = now - user.voice_join_time;
            const minutes = Math.floor(timeSpent / 60000);

            if (minutes > 0) {
                const multiplier = getMilestoneMultiplier(user.friendship_points || 0);
                const baseXp = minutes * 15;
                const xpGained = Math.floor(baseXp * multiplier);
                const gemsGained = minutes * 2;

                endVoiceSession(sessionId, minutes, xpGained, gemsGained);
                updateUser(userId, {
                    total_voice_minutes: (user.total_voice_minutes || 0) + minutes,
                    voice_sessions: (user.voice_sessions || 0) + 1,
                    xp: user.xp + xpGained,
                    currency: user.currency + gemsGained
                });
                logEconomyTransaction(userId, 'voice_move', gemsGained, 'voice_session', user.currency + gemsGained);
            }

            // Start new session
            const newSessionId = startVoiceSession(userId, newState.guild.id, newState.channelId);
            activeVoiceSessions.set(userId, newSessionId);

            console.log(`[Voice] ${user.username} moved from ${oldState.channel?.name} to ${newState.channel?.name}`);
        }
    }

    // --- Auto-Leave Logic (Empty Channel Check) ---
    // If the channel the BOT is currently in becomes empty (or bot-only), start disconnect timer

    const botId = oldState.client.user.id;
    const botMember = oldState.guild.members.cache.get(botId);

    if (botMember && botMember.voice.channelId) {
        // Only run logic if the change happened in the bot's channel
        if (oldState.channelId === botMember.voice.channelId || newState.channelId === botMember.voice.channelId) {
            const channel = botMember.voice.channel;
            if (channel) {
                const humans = channel.members.filter(m => !m.user.bot);

                if (humans.size === 0) {
                    // Empty channel! Start countdown
                    console.log(`[Voice] Channel ${channel.name} is empty. Starting auto-leave timer...`);

                    // We use a small timeout to avoid instant leaves on quick rejoins
                    setTimeout(async () => {
                        // Re-check after 30 seconds
                        const freshChannel = await channel.fetch().catch(() => null);
                        if (freshChannel && freshChannel.members.filter(m => !m.user.bot).size === 0) {
                            if (freshChannel.members.has(botId)) {
                                console.log(`[Voice] Auto-leaving empty channel ${freshChannel.name}`);
                                const connection = getVoiceConnection(freshChannel.guild.id);
                                if (connection) connection.destroy();
                            }
                        } else {
                            console.log(`[Voice] Auto-leave cancelled. Someone joined!`);
                        }
                    }, 30_000);
                }
            }
        }
    }
};