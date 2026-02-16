import { setupClient } from './client';
import { startServer } from '../server';
import { deployCommands } from './deploy-commands';
import dotenv from 'dotenv';
import { getUser, updateUser, db, getDueReminders, deleteReminder, getTodayBirthdays, getWeeklyHighlights, updateBotStartTime, getGuildSetting } from './db';
import { startTTSServer } from './utils/startTts';
import { cleanupAudioFolder } from './utils/voiceUtils';
import { checkOllamaHealth, getCurrentMood } from './ai';
import { eventSystem } from './events/EventSystem';

dotenv.config();

const main = async () => {
    // 0. Clean up temp audio files
    cleanupAudioFolder();

    // 1. Start Dashboard Server
    startServer();

    // 2. Start Local TTS Server (PocketTTS)
    await startTTSServer();

    // 3. Check Local AI (Ollama)
    const aiHealthy = await checkOllamaHealth();
    if (!aiHealthy) {
        console.warn("⚠️  AI WARNING: Ollama is not running or Gemma3 is missing. Chat will not work.");
    }

    // 4. Start Discord Bot
    const client = setupClient();
    const token = process.env.DISCORD_TOKEN;
    if (!token) {
        console.error("❌ Fatal: DISCORD_TOKEN is missing in .env");
        return;
    }

    try {
        await client.login(token);
        // Commands are auto-refreshed (PUT) which cleans up stale commands
        await deployCommands();

        // Record bot start time for uptime tracking
        updateBotStartTime();

        // === TIMER SYSTEMS ===

        // --- Reminder Checker (every 30s) ---
        setInterval(async () => {
            try {
                const dueReminders = getDueReminders();
                for (const reminder of dueReminders) {
                    try {
                        const channel = await client.channels.fetch(reminder.channel_id);
                        if (channel?.isSendable()) {
                            await channel.send(`⏰ hey <@${reminder.user_id}>! you asked me to remind you: **${reminder.message}** 💕`);
                        }
                    } catch (e) {
                        console.error(`[Reminder] Failed to deliver reminder ${reminder.id}:`, e);
                    }
                    deleteReminder(reminder.id);
                }
            } catch (e) {
                console.error("[Reminder] Error checking reminders:", e);
            }
        }, 30 * 1000);

        // --- Birthday Checker (every hour) ---
        let lastBirthdayCheck = '';
        setInterval(async () => {
            const now = new Date();
            const dateKey = `${now.getMonth() + 1}-${now.getDate()}`;
            if (dateKey === lastBirthdayCheck) return;
            lastBirthdayCheck = dateKey;

            try {
                const birthdays = getTodayBirthdays(now.getMonth() + 1, now.getDate());
                for (const bday of birthdays) {
                    try {
                        const guild = client.guilds.cache.get(bday.guild_id);
                        if (!guild) continue;
                        const channel = guild.channels.cache.find((c: any) => c.isTextBased() && c.permissionsFor?.(guild.members.me!)?.has('SendMessages'));
                        if (channel?.isSendable()) {
                            await channel.send(`🎂🎉 **HAPPY BIRTHDAY** <@${bday.user_id}>!! 🥳🎶\nXya is singing just for you today!! You're amazing and I hope your day is as wonderful as you are 💕✨🎵`);
                        }
                    } catch (e) {
                        console.error(`[Birthday] Error announcing for ${bday.user_id}:`, e);
                    }
                }
            } catch (e) {
                console.error("[Birthday] Error checking birthdays:", e);
            }
        }, 60 * 60 * 1000);

        // --- Server Events (Managed by EventSystem) ---
        eventSystem.init(client);

        // --- Scheduler (Daily WYR, etc) ---
        const { initScheduler } = await import('./utils/scheduler');
        initScheduler(client);

        // --- Weekly Highlights (every Sunday at noon) ---
        setInterval(async () => {
            const now = new Date();
            if (now.getDay() !== 0 || now.getHours() !== 12) return;

            try {
                for (const guild of client.guilds.cache.values()) {
                    const highlights = getWeeklyHighlights(guild.id);
                    if (highlights.totalMessages === 0) continue;

                    let highlightText = `📊 **Weekly Highlights!** 🎉\n\n`;
                    highlightText += `Total messages this week: **${highlights.totalMessages}**\n\n`;

                    if (highlights.topChatters.length > 0) {
                        highlightText += `💬 **Top Chatters:**\n`;
                        for (let i = 0; i < highlights.topChatters.length; i++) {
                            const c = highlights.topChatters[i];
                            const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                            highlightText += `${medals[i]} <@${c.user_id}> — ${c.msg_count} messages\n`;
                        }
                    }

                    if (highlights.topVoice.length > 0) {
                        highlightText += `\n🎤 **Top Voice Users:**\n`;
                        for (let i = 0; i < highlights.topVoice.length; i++) {
                            const v = highlights.topVoice[i];
                            const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                            highlightText += `${medals[i]} <@${v.user_id}> — ${v.total_mins} minutes\n`;
                        }
                    }

                    highlightText += `\nyou guys are amazing, keep it up!! 💕✨ — Xya`;

                    highlightText += `\nyou guys are amazing, keep it up!! 💕✨ — Xya`;

                    const settings = getGuildSetting(guild.id);
                    let channel;

                    if (settings?.events_channel_id) {
                        channel = guild.channels.cache.get(settings.events_channel_id);
                    }

                    if (!channel) {
                        channel = guild.channels.cache.find((c: any) => c.isTextBased() && c.permissionsFor?.(guild.members.me!)?.has('SendMessages'));
                    }

                    if (channel?.isSendable()) {
                        await channel.send(highlightText);
                    }
                }
            } catch (e) {
                console.error("[Highlights] Error:", e);
            }
        }, 60 * 60 * 1000); // Check every hour

        // --- Weekly Kindest User Award ---
        setInterval(async () => {
            const now = Date.now();
            console.log("Checking for weekly kindest user...");
            try {
                const kindest = db.prepare(`
                    SELECT user_id, username, COUNT(*) as count 
                    FROM interactions 
                    WHERE sentiment = 'Kind' AND timestamp > ? 
                    GROUP BY user_id 
                    ORDER BY count DESC 
                    LIMIT 1
                `).get(now - (7 * 24 * 60 * 60 * 1000)) as any;

                if (kindest) {
                    console.log(`Rewarding ${kindest.username} with 500 Gems!`);
                    const user = getUser(kindest.user_id, kindest.username);
                    updateUser(kindest.user_id, { currency: (user.currency || 0) + 500 });
                }
            } catch (e) {
                console.error("Error in weekly reward:", e);
            }
        }, 24 * 60 * 60 * 1000);

        // --- Mood Log (every 30 min) ---
        setInterval(() => {
            const mood = getCurrentMood();
            console.log(`[Mood] ${mood.emoji} Xya's current mood: ${mood.mood} — ${mood.effect}`);
        }, 30 * 60 * 1000);

        const mood = getCurrentMood();
        console.log(`[Mood] ${mood.emoji} Xya started with mood: ${mood.mood}`);

    } catch (error) {
        console.error("Failed to start bot:", error);
    }
};

main();